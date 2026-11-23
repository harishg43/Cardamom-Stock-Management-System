import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.98.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ error: 'Server configuration missing' }, 500)
  }

  let stockId: number
  let requestedFarmerId: string | null = null
  try {
    const body = await req.json()
    stockId = Number(body.stock_id)
    requestedFarmerId = typeof body.farmer_id === 'string' ? body.farmer_id : null
    if (!Number.isFinite(stockId)) throw new Error('Invalid stock_id')
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Invalid request' }, 400)
  }

  const authorization = req.headers.get('Authorization')
  if (!authorization) return json({ error: 'Authorization required' }, 401)

  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  })
  const { data: authData, error: authError } = await caller.auth.getUser()
  if (authError || !authData.user) return json({ error: 'Unauthorized' }, 401)

  const callerId = authData.user.id
  const { data: callerProfile } = await caller
    .from('profiles')
    .select('id,role')
    .eq('id', callerId)
    .maybeSingle()
  const role = callerProfile?.role?.toUpperCase()
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return json({ error: 'Forbidden' }, 403)
  }

  const { data: stock, error: stockError } = await caller
    .from('stocks')
    .select('id, customer_name, customer_phone, stock_date, before_dry_bags, before_dry_weight, after_dry_bags, after_dry_weight, user_id, owner_id, admin_id, created_by, stock_reason')
    .eq('id', stockId)
    .maybeSingle()

  if (stockError || !stock) return json({ error: 'Stock record not found or forbidden' }, 404)
  if (String(stock.stock_reason ?? '').trim()) return json({ ok: true, skipped: 'stock-out' })

  const resolvedFarmerId = stock.owner_id || stock.user_id
  if (requestedFarmerId && requestedFarmerId !== resolvedFarmerId) {
    return json({ error: 'Selected farmer does not match the stock record' }, 403)
  }

  if (role === 'ADMIN') {
    const { data: permittedFarmer } = await caller
      .from('profiles')
      .select('id')
      .eq('id', resolvedFarmerId)
      .eq('created_by', callerId)
      .maybeSingle()
    if (!permittedFarmer) return json({ error: 'Farmer is not permitted for this admin' }, 403)
  }

  const admin = createClient(supabaseUrl, serviceKey)
  const farmerId = stock.owner_id || stock.user_id
  const adminId = role === 'SUPER_ADMIN'
    ? (stock.admin_id || callerId)
    : callerId

  const { data: farmerProfile } = await admin
    .from('profiles')
    .select('id,name,phone,whatsapp_consent,sms_consent,preferred_language')
    .eq('id', farmerId)
    .maybeSingle()

  const mobile = String(farmerProfile?.phone || stock.customer_phone || '').replace(/\D/g, '').slice(-10)
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    for (const channel of ['WHATSAPP', 'SMS']) {
      await admin.from('message_history').upsert({
        stock_id: stockId,
        farmer_id: farmerId,
        admin_id: adminId,
        message_content: 'Stock notification could not be sent.',
        channel,
        delivery_status: 'failed',
        error_message: 'Invalid or missing Indian mobile number',
      }, { onConflict: 'stock_id,channel' })
    }
    return json({ ok: true, skipped: 'invalid-mobile', stock_id: stockId })
  }

  let { data: settings } = await admin
    .from('notification_settings')
    .select('*')
    .eq('admin_id', adminId)
    .maybeSingle()

  if (!settings) {
    settings = {
      whatsapp_enabled: true,
      sms_enabled: true,
      automatic_stock_notification: true,
      language: farmerProfile?.preferred_language || 'en',
    }
  }

  if (!settings.automatic_stock_notification) {
    return json({ ok: true, skipped: 'automatic-notifications-disabled', stock_id: stockId })
  }

  const language = ['en', 'ta', 'ml'].includes(settings.language)
    ? settings.language
    : 'en'
  const date = new Date(`${stock.stock_date}T00:00:00`).toLocaleDateString('en-GB')
  const farmerName = stock.customer_name || farmerProfile?.name || 'Farmer'
  const beforeQty = stock.before_dry_weight == null ? 'N/A' : Number(stock.before_dry_weight).toFixed(2)
  const afterQty = stock.after_dry_weight == null ? 'N/A' : Number(stock.after_dry_weight).toFixed(2)
  const beforeBags = stock.before_dry_bags == null ? 'N/A' : String(stock.before_dry_bags)
  const afterBags = stock.after_dry_bags == null ? 'N/A' : String(stock.after_dry_bags)

  const templates = await admin
    .from('message_templates')
    .select('channel,language,template_content,provider_template_id')
    .eq('language', language)

  const templateMap = new Map(
    (templates.data || []).map((template) => [`${template.channel}:${template.language}`, template]),
  )

  const renderTemplate = (channel: 'WHATSAPP' | 'SMS', fallback: string) => {
    const template = templateMap.get(`${channel}:${language}`)
    return (template?.template_content || fallback)
      .replaceAll('{{farmer_name}}', farmerName)
      .replaceAll('{{before_drying}}', beforeQty)
      .replaceAll('{{after_drying}}', afterQty)
      .replaceAll('{{before_bags}}', beforeBags)
      .replaceAll('{{after_bags}}', afterBags)
      .replaceAll('{{date}}', date)
  }

  const whatsappFallback =
    language === 'ta'
      ? `GURUSAMY CARDAMOM MANAGEMENT SYSTEM\n\nசரக்கு வெற்றிகரமாக சேர்க்கப்பட்டது!\n\nவிவசாயி பெயர்: ${farmerName}\nஉலர்க்கும்முன்: ${beforeBags} bags / ${beforeQty} KG\nஉலர்த்தியபின்: ${afterBags} bags / ${afterQty} KG\nதேதி: ${date}\n\nஉங்கள் சரக்கு வெற்றிகரமாக பதிவு செய்யப்பட்டது.`
      : language === 'ml'
        ? `GURUSAMY CARDAMOM MANAGEMENT SYSTEM\n\nസ്‌റ്റോക്ക് വിജയകരമായി ചേർത്തു!\n\nകർഷകരുടെ പേര്: ${farmerName}\nഉണക്കുന്നതിന് മുമ്പ്: ${beforeBags} bags / ${beforeQty} KG\nഉണക്കിയ ശേഷം: ${afterBags} bags / ${afterQty} KG\nതീയതി: ${date}\n\nനിങ്ങളുടെ സ്‌റ്റോക്ക് വിജയകരമായി രേഖപ്പെടുത്തിയിരിക്കുന്നു.`
        : `GURUSAMY CARDAMOM MANAGEMENT SYSTEM\n\nStock Added Successfully!\n\nFarmer Name: ${farmerName}\nBefore Drying: ${beforeBags} bags / ${beforeQty} KG\nAfter Drying: ${afterBags} bags / ${afterQty} KG\nDate: ${date}\n\nYour stock entry has been successfully recorded.`

  const smsFallback =
    language === 'ta'
      ? `Gurusamy Cardamom: சரக்கு வெற்றிகரமாக சேர்க்கப்பட்டது. விவசாயி: ${farmerName} | உலர்க்கும்முன்: ${beforeBags} bags / ${beforeQty} KG | உலர்த்தியபின்: ${afterBags} bags / ${afterQty} KG | தேதி: ${date}.`
      : language === 'ml'
        ? `Gurusamy Cardamom: സ്‌റ്റോക്ക് വിജയകരമായി ചേർത്തു. കർഷകന്‍: ${farmerName} | ഉണക്കുന്നതിന് മുമ്പ്: ${beforeBags} bags / ${beforeQty} KG | ഉണക്കിയ ശേഷം: ${afterBags} bags / ${afterQty} KG | തീയതി: ${date}.`
        : `Gurusamy Cardamom: Stock added successfully. Farmer: ${farmerName} | Before Drying: ${beforeBags} bags / ${beforeQty} KG | After Drying: ${afterBags} bags / ${afterQty} KG | Date: ${date}.`

  const results: Record<string, unknown> = {}

  if (settings.whatsapp_enabled && farmerProfile?.whatsapp_consent) {
    const content = renderTemplate('WHATSAPP', whatsappFallback)
    const providerTemplate = templateMap.get(`WHATSAPP:${language}`)
    const record = await admin
      .from('message_history')
      .upsert({
        stock_id: stockId,
        farmer_id: farmerId,
        admin_id: adminId,
        message_content: content,
        channel: 'WHATSAPP',
        delivery_status: 'queued',
        error_message: null,
      }, { onConflict: 'stock_id,channel' })
      .select('id')
      .maybeSingle()

    try {
      const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
      const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
      if (!token || !phoneNumberId) throw new Error('WhatsApp provider is not configured')

      const templateName = providerTemplate?.provider_template_id
      let providerBody: unknown
      if (templateName) {
        providerBody = {
          messaging_product: 'whatsapp',
          to: `91${mobile}`,
          type: 'template',
          template: {
            name: templateName,
            language: { code: language === 'en' ? 'en' : language === 'ta' ? 'ta' : 'ml' },
            components: [{
              type: 'body',
              parameters: [
                { type: 'text', text: farmerName },
                { type: 'text', text: beforeQty },
                { type: 'text', text: afterQty },
                { type: 'text', text: date },
              ],
            }],
          },
        }
      } else {
        providerBody = {
          messaging_product: 'whatsapp',
          to: `91${mobile}`,
          type: 'text',
          text: { body: content },
        }
      }

      const response = await fetch(
        `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(providerBody),
        },
      )
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error?.message || 'WhatsApp provider failure')
      const providerMessageId = payload.messages?.[0]?.id || null
      await admin.from('message_history').update({
        delivery_status: 'sent',
        provider_message_id: providerMessageId,
        delivered_at: null,
      }).eq('id', record.data?.id)
      results.whatsapp = { status: 'sent', provider_message_id: providerMessageId }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'WhatsApp delivery failed'
      await admin.from('message_history').update({
        delivery_status: 'failed',
        error_message: message,
      }).eq('id', record.data?.id)
      results.whatsapp = { status: 'failed', error: message }
    }
  }

  if (settings.sms_enabled && farmerProfile?.sms_consent) {
    const content = renderTemplate('SMS', smsFallback)
    const record = await admin
      .from('message_history')
      .upsert({
        stock_id: stockId,
        farmer_id: farmerId,
        admin_id: adminId,
        message_content: content,
        channel: 'SMS',
        delivery_status: 'queued',
        error_message: null,
      }, { onConflict: 'stock_id,channel' })
      .select('id')
      .maybeSingle()

    try {
      const authKey = Deno.env.get('MSG91_AUTH_KEY')
      const senderId = Deno.env.get('MSG91_SENDER_ID')
      const templateId = Deno.env.get('MSG91_TEMPLATE_ID')
      if (!authKey || !senderId || !templateId) throw new Error('SMS provider is not configured')

      const response = await fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          authkey: authKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: templateId,
          sender: senderId,
          short_url: '0',
          mobiles: `91${mobile}`,
          farmer_name: farmerName,
          before_drying: beforeQty,
          after_drying: afterQty,
          before_bags: beforeBags,
          after_bags: afterBags,
          date,
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.message || 'SMS provider failure')
      const providerMessageId = payload.request_id || payload.message || null
      await admin.from('message_history').update({
        delivery_status: 'sent',
        provider_message_id: String(providerMessageId),
      }).eq('id', record.data?.id)
      results.sms = { status: 'sent', provider_message_id: providerMessageId }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'SMS delivery failed'
      await admin.from('message_history').update({
        delivery_status: 'failed',
        error_message: message,
      }).eq('id', record.data?.id)
      results.sms = { status: 'failed', error: message }
    }
  }

  return json({ ok: true, stock_id: stockId, results })
})
