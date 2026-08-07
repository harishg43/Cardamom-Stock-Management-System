import { useState } from 'react'

const initialMovement = {
  customerName: '',
  customerPhone: '',
  stockDate: '',
  movementType: 'in',
  afterDryWeight: '',
  reason: '',
}

function StockMovement({ canManage, onSubmit, t = (value) => value }) {
  const [form, setForm] = useState(initialMovement)

  const normalizePhone = (value) => value.replace(/\D/g, '').slice(0, 10)

  const handleChange = (field) => (event) => {
    const value = field === 'customerPhone' ? normalizePhone(event.target.value) : event.target.value
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const afterDryWeight = Number(form.afterDryWeight)
    if (
      !form.customerName.trim() ||
      !/^\d{10}$/.test(form.customerPhone) ||
      !form.stockDate ||
      !Number.isFinite(afterDryWeight) ||
      afterDryWeight <= 0 ||
      (form.movementType === 'out' && !form.reason.trim())
    ) {
      return
    }

    onSubmit({
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone,
      stockDate: form.stockDate,
      movementType: form.movementType,
      afterDryWeight,
      reason: form.reason.trim(),
    })

    setForm(initialMovement)
  }

  return (
    <form className="stock-form" onSubmit={handleSubmit}>
      {!canManage ? <p className="permission-note">{t('adminOnlyStockNote')}</p> : null}
      <fieldset className="form-fieldset" disabled={!canManage}>
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

        <div className="actions">
          <button type="submit">{t('submitMovement')}</button>
        </div>
      </fieldset>
    </form>
  )
}

export default StockMovement
