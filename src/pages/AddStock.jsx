import { useEffect, useMemo, useState } from 'react'

const emptyForm = {
  farmerId: '',
  customerName: '',
  customerPhone: '',
  stockDate: '',
  beforeDryWeight: '',
  afterDryWeight: '',
  whatsappConsent: false,
  smsConsent: false,
}

function AddStock({ onSave, editItem, onCancelEdit, canManage, farmerOptions = [], t = (value) => value }) {
  const normalizePhone = (value) => value.replace(/\D/g, '').slice(0, 10)

  const formatRatio = (value) => {
    const fixed = value.toFixed(3)
    return fixed.endsWith('0') ? fixed.slice(0, -1) : fixed
  }

  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!editItem) {
      setForm(emptyForm)
      return
    }

    setForm({
      farmerId: editItem.farmerId ?? '',
      customerName: editItem.customerName,
      customerPhone: editItem.customerPhone ?? '',
      stockDate: editItem.stockDate,
      beforeDryWeight: String(editItem.beforeDryWeight),
      afterDryWeight: String(editItem.afterDryWeight),
      whatsappConsent: editItem.whatsappConsent ?? false,
      smsConsent: editItem.smsConsent ?? false,
    })
  }, [editItem])

  const beforeDry = Number(form.beforeDryWeight)
  const afterDry = Number(form.afterDryWeight)
  const ratio = useMemo(() => {
    if (!beforeDry || beforeDry <= 0 || !afterDry || afterDry <= 0) {
      return 0
    }
    return beforeDry / afterDry
  }, [afterDry, beforeDry])

  const handleChange = (field) => (event) => {
    const value = field === 'customerPhone' ? normalizePhone(event.target.value) : event.target.value

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const isPhoneValid = /^\d{10}$/.test(form.customerPhone)

    if (
      !form.customerName.trim() ||
      !form.customerPhone.trim() ||
      !isPhoneValid ||
      !form.stockDate ||
      beforeDry <= 0 ||
      afterDry <= 0
    ) {
      return
    }

    onSave({
      farmerId: form.farmerId || null,
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      stockDate: form.stockDate,
      beforeDryWeight: beforeDry,
      afterDryWeight: afterDry,
      dryingRatio: ratio,
      whatsappConsent: form.whatsappConsent,
      smsConsent: form.smsConsent,
    })

    setForm(emptyForm)
  }

  return (
    <section className="panel">
      <h2>{editItem ? t('editStock') : t('addCardamomStock')}</h2>
      {!canManage ? <p className="permission-note">{t('adminOnlyStockNote')}</p> : null}
      <form className="stock-form" onSubmit={handleSubmit}>
        <fieldset className="form-fieldset" disabled={!canManage}>
        {farmerOptions.length > 0 ? (
          <label>
            {t('customerName')}
            <select
              value={form.farmerId}
              onChange={(event) => {
                const selected = farmerOptions.find((farmer) => farmer.id === event.target.value)
                setForm((previous) => ({
                  ...previous,
                  farmerId: event.target.value,
                  customerName: selected?.name || '',
                  customerPhone: selected?.phone || '',
                  whatsappConsent: Boolean(selected?.whatsappConsent),
                  smsConsent: Boolean(selected?.smsConsent),
                }))
              }}
            >
              <option value="">Select farmer</option>
              {farmerOptions.map((farmer) => (
                <option key={farmer.id} value={farmer.id}>
                  {farmer.name} ({farmer.phone || '-'})
                </option>
              ))}
            </select>
          </label>
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
            placeholder="8270153291"
            inputMode="numeric"
            maxLength={10}
          />
        </label>
        {!/^\d{10}$/.test(form.customerPhone) && form.customerPhone ? (
          <p className="auth-message">{t('phoneValidation')}</p>
        ) : null}

        <label>
          {t('date')}
          <input
            type="date"
            value={form.stockDate}
            onChange={handleChange('stockDate')}
          />
        </label>

        <label>
          {t('beforeDryWeight')}
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.beforeDryWeight}
            onChange={handleChange('beforeDryWeight')}
            placeholder="120"
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
            placeholder="82"
          />
        </label>

        <p className="ratio-text">{t('dryedRatio')}: {formatRatio(ratio)}</p>

        <div className="actions">
          <button type="submit">{editItem ? t('updateStock') : t('saveStock')}</button>
          {editItem ? (
            <button type="button" className="secondary" onClick={onCancelEdit}>
              {t('cancel')}
            </button>
          ) : null}
        </div>
        </fieldset>
      </form>
    </section>
  )
}

export default AddStock