import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.98.0'

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-setup-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const setupSecret = Deno.env.get('FIRST_SUPER_ADMIN_SETUP_SECRET')

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ error: 'Server configuration missing' }, 500)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const action = String(body.action ?? '')
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  if (action === 'setup') {
    if (!setupSecret) return json({ error: 'First-time setup is not configured' }, 403)
    const suppliedSecret = req.headers.get('x-setup-secret') ?? String(body.setup_secret ?? '')
    if (suppliedSecret !== setupSecret) return json({ error: 'Invalid setup secret' }, 403)

    const { data: existingSuperAdmins, error: superAdminError } = await admin
      .from('profiles')
      .select('id')
      .eq('role', 'SUPER_ADMIN')
      .limit(1)
    if (superAdminError) return json({ error: superAdminError.message }, 500)
    if ((existingSuperAdmins ?? []).length > 0) {
      return json({ error: 'First-time setup is disabled because a Super Admin already exists' }, 403)
    }

    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const name = String(body.name ?? '').trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Valid email is required' }, 400)
    if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400)
    if (!name) return json({ error: 'Name is required' }, 400)

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: 'SUPER_ADMIN' },
      user_metadata: { name, role: 'SUPER_ADMIN' },
    })
    if (error) return json({ error: error.message }, 400)
    if (!data.user) return json({ error: 'Super Admin account was not created' }, 500)

    return json({ ok: true, user_id: data.user.id, role: 'SUPER_ADMIN' })
  }

  if (action !== 'create') return json({ error: 'Invalid action' }, 400)

  const authorization = req.headers.get('Authorization')
  if (!authorization) return json({ error: 'Authorization required' }, 401)

  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: authData, error: authError } = await caller.auth.getUser()
  if (authError || !authData.user) return json({ error: 'Unauthorized' }, 401)

  const callerId = authData.user.id
  const { data: callerProfile, error: callerProfileError } = await admin
    .from('profiles')
    .select('id,role,active')
    .eq('id', callerId)
    .maybeSingle()
  if (callerProfileError) return json({ error: callerProfileError.message }, 500)
  if (!callerProfile?.active) return json({ error: 'Account is inactive' }, 403)

  const callerRole = String(callerProfile.role ?? '').toUpperCase()
  if (callerRole !== 'SUPER_ADMIN' && callerRole !== 'ADMIN') {
    return json({ error: 'Forbidden' }, 403)
  }

  const name = String(body.name ?? '').trim()
  const phone = String(body.phone ?? '').replace(/\D/g, '').slice(0, 10)
  const password = String(body.password ?? '')
  const requestedRole = String(body.role ?? 'USER').toUpperCase()

  if (!name) return json({ error: 'Name is required' }, 400)
  if (!/^\d{10}$/.test(phone)) return json({ error: 'Phone number must be exactly 10 digits' }, 400)
  if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400)
  if (requestedRole !== 'ADMIN' && requestedRole !== 'USER') {
    return json({ error: 'Invalid role' }, 400)
  }
  if (requestedRole === 'ADMIN' && callerRole !== 'SUPER_ADMIN') {
    return json({ error: 'Only Super Admin can create Admin accounts' }, 403)
  }

  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('phone', phone)
    .maybeSingle()
  if (existingProfile) return json({ error: `A user account already exists for phone number ${phone}` }, 409)

  const email = `${phone}@user.local`
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: requestedRole },
    user_metadata: {
      name,
      phone,
      role: requestedRole,
      created_by: callerId,
    },
  })
  if (error) return json({ error: error.message }, 400)
  if (!data.user) return json({ error: 'Account was not created' }, 500)

  return json({
    ok: true,
    user_id: data.user.id,
    name,
    phone,
    role: requestedRole,
  })
})
