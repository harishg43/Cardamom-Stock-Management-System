function StockList({
  items,
  onEdit,
  onDelete,
  sortConfig,
  onSortChange,
  canManage,
  t = (value) => value,
  formatCustomerName = (value) => value,
  showAvailableStock = true,
}) {
  const formatRatio = (value) => {
    const fixed = value.toFixed(3)
    return fixed.endsWith('0') ? fixed.slice(0, -1) : fixed
  }

  const formatDate = (value) => {
    if (!value) {
      return '-'
    }

    return new Date(value).toLocaleDateString('en-GB')
  }

  const isStockOutRecord = (item) => Boolean(String(item.stockReason ?? '').trim()) || item.afterDryWeight < 0

  return (
    <section className="panel">
      <h2>{t('stockList')}</h2>

      {items.length === 0 ? (
        <p className="empty-state">{t('noStockRecords')}</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  <button
                    type="button"
                    className="sort-button"
                    onClick={() => onSortChange('customerName')}
                  >
                    {t('name')}
                    {sortConfig.key === 'customerName'
                      ? sortConfig.direction === 'asc'
                        ? ' ▲'
                        : ' ▼'
                      : ''}
                  </button>
                </th>
                <th>{t('phoneNumber')}</th>
                <th>
                  <button type="button" className="sort-button" onClick={() => onSortChange('stockDate')}>
                    {t('date')}
                    {sortConfig.key === 'stockDate'
                      ? sortConfig.direction === 'asc'
                        ? ' ▲'
                        : ' ▼'
                      : ''}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="sort-button"
                    onClick={() => onSortChange('beforeDryWeight')}
                  >
                    {t('beforeDryColumn')}
                    {sortConfig.key === 'beforeDryWeight'
                      ? sortConfig.direction === 'asc'
                        ? ' ▲'
                        : ' ▼'
                      : ''}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="sort-button"
                    onClick={() => onSortChange('afterDryWeight')}
                  >
                    {t('afterDryColumn')}
                    {sortConfig.key === 'afterDryWeight'
                      ? sortConfig.direction === 'asc'
                        ? ' ▲'
                        : ' ▼'
                      : ''}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="sort-button"
                    onClick={() => onSortChange('dryingRatio')}
                  >
                    {t('dryedRatio')}
                    {sortConfig.key === 'dryingRatio'
                      ? sortConfig.direction === 'asc'
                        ? ' ▲'
                        : ' ▼'
                      : ''}
                  </button>
                </th>
                {showAvailableStock ? (
                  <th>
                    <button
                      type="button"
                      className="sort-button"
                      onClick={() => onSortChange('availableStock')}
                    >
                      {t('availableStockColumn')}
                      {sortConfig.key === 'availableStock'
                        ? sortConfig.direction === 'asc'
                          ? ' ▲'
                          : ' ▼'
                        : ''}
                    </button>
                  </th>
                ) : null}
                <th>{t('movementType')}</th>
                {canManage ? <th>{t('actions')}</th> : null}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={isStockOutRecord(item) ? 'stock-out-row' : 'stock-in-row'}>
                  <td>{formatCustomerName(item.customerName)}</td>
                  <td>{item.customerPhone ?? '-'}</td>
                  <td>{formatDate(item.stockDate)}</td>
                  <td>{item.beforeDryWeight.toFixed(2)}</td>
                  <td>{item.afterDryWeight.toFixed(2)}</td>
                  <td>{formatRatio(item.dryingRatio)}</td>
                  {showAvailableStock ? <td>{item.availableStock.toFixed(2)}</td> : null}
                  <td>{isStockOutRecord(item) ? t('stockOut') : t('stockIn')}</td>
                  {canManage ? (
                    <td className="row-actions">
                      <button type="button" className="secondary" onClick={() => onEdit(item.id)}>
                        {t('edit')}
                      </button>
                      <button type="button" className="danger" onClick={() => onDelete(item.id)}>
                        {t('delete')}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default StockList
