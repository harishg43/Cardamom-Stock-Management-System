import { useState } from 'react'
import FarmerSelect from '../components/FarmerSelect'

const initialMovement = {
  farmerId: '',
  customerName: '',
  customerPhone: '',
  stockDate: '',
  movementType: 'in',
  afterDryBags: '',
  afterDryWeight: '',
  reason: '',
  whatsappConsent: false,
  smsConsent: false,
}

function StockMovement({ canManage, onSubmit, farmerOptions = [], t = (value) => value }) {
  const [form, setForm] = useState(initialMovement)
  const [allowPhoneOverride, setAllowPhoneOverride] = useState(false)

  const normalizePhone = (value) => value.replace(/\D/g, '').slice(0, 10)

  const handleChange = (field) => (event) => {
    const value = field === 'customerPhone' ? normalizePhone(event.target.value) : event.target.value
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const afterDryWeight = Number(form.afterDryWeight)
    const afterDryBags = form.afterDryBags === '' ? null : Number(form.afterDryBags)
    const hasValidBags =
      afterDryBags === null ||
      (Number.isInteger(afterDryBags) && afterDryBags >= 0)
    if (
      !form.customerName.trim() ||
      !/^\d{10}$/.test(form.customerPhone) ||
      !form.stockDate ||
      !Number.isFinite(afterDryWeight) ||
      afterDryWeight <= 0 ||
      !hasValidBags ||
      (afterDryBags !== null && afterDryWeight <= 0) ||
      (form.movementType === 'out' && !form.reason.trim())
    ) {
      return
    }

    onSubmit({
      farmerId: form.farmerId || null,
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone,
      stockDate: form.stockDate,
      movementType: form.movementType,
      afterDryBags,
      afterDryWeight,
      reason: form.reason.trim(),
      whatsappConsent: form.whatsappConsent,
      smsConsent: form.smsConsent,
    })

    setForm(initialMovement)
    setAllowPhoneOverride(false)
  }

  return (
    <form className="stock-form" onSubmit={handleSubmit}>
      {!canManage ? <p className="permission-note">{t('adminOnlyStockNote')}</p> : null}
      <fieldset className="form-fieldset" disabled={!canManage}>
        {farmerOptions.length > 0 ? (
          <FarmerSelect
            key={form.farmerId || 'movement-farmer'}
            farmerOptions={farmerOptions}
            value={form.farmerId}
            label={t('customerName')}
            onChange={(selected) => {
              setAllowPhoneOverride(false)
              setForm((previous) => ({
                ...previous,
                farmerId: typeof selected === 'object' ? selected.id : '',
                customerName: typeof selected === 'object' ? selected.name : '',
                customerPhone: typeof selected === 'object' ? selected.phone : '',
                whatsappConsent: typeof selected === 'object' ? Boolean(selected.whatsappConsent) : false,
                smsConsent: typeof selected === 'object' ? Boolean(selected.smsConsent) : false,
              }))
            }}
            disabled={!canManage}
          />
        ) : null}
        {farmerOptions.length === 0 ? (
          <>
            <label>
              {t('customerName')}
              <input
                type="text"
                value={form.customerName}
                onChange={handleChange('customerName')}
                placeholder={t('customerName')}
              />
            </label>
            <label>
              {t('phoneNumber')}
              <input
                type="text"
                value={form.customerPhone}
                onChange={handleChange('customerPhone')}
                placeholder="9876543210"
                inputMode="numeric"
                maxLength={10}
              />
            </label>
          </>
        ) : null}
        {farmerOptions.length > 0 ? (
          <>
            <label>
              <input
                type="checkbox"
                checked={form.whatsappConsent}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, whatsappConsent: event.target.checked }))
                }
              />
              WhatsApp consent
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.smsConsent}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, smsConsent: event.target.checked }))
                }
              />
              SMS consent
            </label>
          </>
        ) : null}
        {farmerOptions.length > 0 ? (
          <>
            <label>
              {t('phoneNumber')}
              <input
                type="text"
                value={form.customerPhone}
                onChange={handleChange('customerPhone')}
                placeholder="9876543210"
                inputMode="numeric"
                maxLength={10}
                readOnly={!allowPhoneOverride || !form.farmerId}
              />
            </label>
            {form.farmerId ? (
              <label className="phone-override-toggle">
                <input
                  type="checkbox"
                  checked={allowPhoneOverride}
                  onChange={(event) => setAllowPhoneOverride(event.target.checked)}
                />
                Edit this stock's phone number only
              </label>
            ) : null}
          </>
        ) : null}

        {!/^\d{10}$/.test(form.customerPhone) && form.customerPhone ? (
          <p className="auth-message">{t('phoneValidation')}</p>
        ) : null}

        <label>
          {t('date')}
          <input type="date" value={form.stockDate} onChange={handleChange('stockDate')} />
        </label>

        <label>
          {t('movementType')}
          <select value={form.movementType} onChange={handleChange('movementType')}>
            <option value="in">{t('stockIn')}</option>
            <option value="out">{t('stockOut')}</option>
          </select>
        </label>

        {form.movementType === 'out' ? (
          <label>
            {t('reason')}
            <textarea
              value={form.reason}
              onChange={handleChange('reason')}
              placeholder={t('reasonPlaceholder')}
              rows={3}
            />
          </label>
        ) : null}

        {form.movementType === 'out' && !form.reason.trim() ? (
          <p className="auth-message">{t('reasonRequired')}</p>
        ) : null}

        <fieldset className="bag-weight-section">
          <legend>After Dry</legend>
          <label>
            Number of Bags
            <input
              type="number"
              min="0"
              step="1"
              value={form.afterDryBags}
              onChange={handleChange('afterDryBags')}
              placeholder="4"
            />
          </label>
          <label>
            {t('afterDryWeight')}
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.afterDryWeight}
              onChange={handleChange('afterDryWeight')}
              placeholder="25"
            />
          </label>
        </fieldset>

        <div className="actions">
          <button type="submit">{t('submitMovement')}</button>
        </div>
      </fieldset>
    </form>
  )
}

export default StockMovement
