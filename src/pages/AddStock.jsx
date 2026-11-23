import { useEffect, useMemo, useState } from 'react'
import FarmerSelect from '../components/FarmerSelect'

const emptyForm = {
  farmerId: '',
  customerName: '',
  customerPhone: '',
  stockDate: '',
  beforeDryBags: '',
  beforeDryWeight: '',
  afterDryBags: '',
  afterDryWeight: '',
  whatsappConsent: false,
  smsConsent: false,
}

function AddStock({ onSave, editItem, onCancelEdit, canManage, farmerOptions = [], t = (value) => value }) {
  const normalizePhone = (value) => value.replace(/\D/g, '').slice(0, 10)
  const [allowPhoneOverride, setAllowPhoneOverride] = useState(false)

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
      farmerId: editItem.farmerId ?? editItem.ownerId ?? '',
      customerName: editItem.customerName,
      customerPhone: editItem.customerPhone ?? '',
      stockDate: editItem.stockDate,
      beforeDryBags: editItem.beforeDryBags == null ? '' : String(editItem.beforeDryBags),
      beforeDryWeight: editItem.beforeDryWeight == null ? '' : String(editItem.beforeDryWeight),
      afterDryBags: editItem.afterDryBags == null ? '' : String(editItem.afterDryBags),
      afterDryWeight: editItem.afterDryWeight == null ? '' : String(editItem.afterDryWeight),
      whatsappConsent: editItem.whatsappConsent ?? false,
      smsConsent: editItem.smsConsent ?? false,
    })
    setAllowPhoneOverride(false)
  }, [editItem])

  const beforeDry = Number(form.beforeDryWeight)
  const afterDry = Number(form.afterDryWeight)
  const ratio = useMemo(() => {
    if (!beforeDry || beforeDry <= 0 || !afterDry || afterDry <= 0) {
      return 0
    }
    return (afterDry / beforeDry) * 100
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
    const beforeBagCount = form.beforeDryBags === '' ? null : Number(form.beforeDryBags)
    const beforeWeight = form.beforeDryWeight === '' ? null : Number(form.beforeDryWeight)
    const afterBagCount = form.afterDryBags === '' ? null : Number(form.afterDryBags)
    const afterWeight = form.afterDryWeight === '' ? null : Number(form.afterDryWeight)

    const validBags = (bags) => bags === null || (Number.isInteger(bags) && bags >= 0)
    const paired = (bags, weight) =>
      (bags === null && weight === null) ||
      (bags !== null && weight !== null && Number.isFinite(weight) && weight >= 0)

    const beforeProvided = beforeBagCount !== null || beforeWeight !== null
    const afterProvided = afterBagCount !== null || afterWeight !== null

    if (
      !form.customerName.trim() ||
      !form.customerPhone.trim() ||
      !isPhoneValid ||
      !form.stockDate ||
      (!beforeProvided && !afterProvided) ||
      !validBags(beforeBagCount) ||
      !validBags(afterBagCount) ||
      !paired(beforeBagCount, beforeWeight) ||
      !paired(afterBagCount, afterWeight)
    ) {
      return
    }

    onSave({
      farmerId: form.farmerId || null,
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      stockDate: form.stockDate,
      beforeDryBags: beforeBagCount,
      beforeDryWeight: beforeWeight,
      afterDryBags: afterBagCount,
      afterDryWeight: afterWeight,
      dryingRatio: beforeWeight > 0 && afterWeight !== null ? (afterWeight / beforeWeight) * 100 : 0,
      whatsappConsent: form.whatsappConsent,
      smsConsent: form.smsConsent,
    })

    setForm(emptyForm)
    setAllowPhoneOverride(false)
  }

  return (
    <section className="panel">
      <h2>{editItem ? t('editStock') : t('addCardamomStock')}</h2>
      {!canManage ? <p className="permission-note">{t('adminOnlyStockNote')}</p> : null}
      <form className="stock-form" onSubmit={handleSubmit}>
        <fieldset className="form-fieldset" disabled={!canManage}>
        {farmerOptions.length > 0 ? (
          <FarmerSelect
            key={form.farmerId || 'add-farmer'}
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
                placeholder="8270153291"
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
                placeholder="8270153291"
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
          <input
            type="date"
            value={form.stockDate}
            onChange={handleChange('stockDate')}
          />
        </label>

        <fieldset className="bag-weight-section">
          <legend>Before Dry</legend>
          <label>
            Number of Bags
            <input
              type="number"
              min="0"
              step="1"
              value={form.beforeDryBags}
              onChange={handleChange('beforeDryBags')}
              placeholder="10"
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
        </fieldset>

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

        <p className="ratio-text">{t('dryedRatio')}: {Number.isFinite(ratio) ? `${formatRatio(ratio)}%` : '0%'}</p>

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