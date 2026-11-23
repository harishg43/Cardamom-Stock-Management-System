import { useEffect, useMemo, useRef, useState } from 'react'

function FarmerSelect({ farmerOptions = [], value, onChange, label, placeholder = 'Search and select farmer', disabled = false }) {
  const uniqueFarmers = useMemo(() => {
    const map = new Map()
    farmerOptions.forEach((farmer) => {
      const name = String(farmer.name ?? '').trim()
      const phone = String(farmer.phone ?? '').trim()
      if (!name) return
      const key = `${name.toLocaleLowerCase()}::${phone}`
      if (!map.has(key)) map.set(key, { ...farmer, name, phone })
    })
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [farmerOptions])

  const selected = uniqueFarmers.find((farmer) => farmer.id === value)
  const [query, setQuery] = useState(selected?.name ?? '')
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const matches = useMemo(() => {
    const search = query.trim().toLocaleLowerCase()
    if (!search) return uniqueFarmers
    return uniqueFarmers.filter((farmer) =>
      farmer.name.toLocaleLowerCase().includes(search) ||
      farmer.phone.includes(search),
    )
  }, [query, uniqueFarmers])

  return (
    <div className="farmer-select" ref={rootRef}>
      <label>
        {label}
        <input
          type="text"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="farmer-select-options"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
            if (!event.target.value.trim()) onChange('')
          }}
        />
      </label>
      {open && !disabled ? (
        <div className="farmer-select-options" id="farmer-select-options" role="listbox">
          {matches.length ? matches.map((farmer) => (
            <button
              type="button"
              role="option"
              aria-selected={farmer.id === value}
              key={farmer.id}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(farmer)
                setQuery(farmer.name)
                setOpen(false)
              }}
            >
              <strong>{farmer.name}</strong>
              <span>{farmer.phone || 'Mobile number missing'}</span>
            </button>
          )) : (
            <p>No matching registered farmers</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default FarmerSelect
