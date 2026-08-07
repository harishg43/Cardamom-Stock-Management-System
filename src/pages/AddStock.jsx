import { useEffect, useMemo, useState } from 'react'

const emptyForm = {
  customerName: '',
  customerPhone: '',
  stockDate: '',
  beforeDryWeight: '',
  afterDryWeight: '',
}

function AddStock({ onSave, editItem, onCancelEdit, canManage, t = (value) => value }) {
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
      customerName: editItem.customerName,
      customerPhone: editItem.customerPhone ?? '',
      stockDate: editItem.stockDate,
      beforeDryWeight: String(editItem.beforeDryWeight),
      afterDryWeight: String(editItem.afterDryWeight),
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
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      stockDate: form.stockDate,
      beforeDryWeight: beforeDry,
      afterDryWeight: afterDry,
      dryingRatio: ratio,
    })

    setForm(emptyForm)
  }

  return (
    <section className="panel">
      <h2>{editItem ? t('editStock') : t('addCardamomStock')}</h2>
      {!canManage ? <p className="permission-note">{t('adminOnlyStockNote')}</p> : null}
      <form className="stock-form" onSubmit={handleSubmit}>
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