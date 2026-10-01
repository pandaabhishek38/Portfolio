'use client'

import { useEffect, useState } from 'react'
import { sortByHomeOrder } from '../../utils/fetchJson'

/** Next free Home position (1-based) among the featured items. */
export function nextHomeOrder(items) {
  const orders = items
    .filter((item) => item.featuredOnHome)
    .map((item) => item.homeDisplayOrder || 0)
  return (orders.length ? Math.max(...orders) : 0) + 1
}

/**
 * "Feature on Home" checkbox + "Home order" number for one Project/Skill.
 * Saves immediately (PUT endpoint) and reports the result inline.
 * Independent of the item's full-page order.
 */
export default function HomeFeatureControls({
  id,
  label,
  featured,
  order,
  suggestedOrder,
  endpoint,
  onSaved,
}) {
  const [orderInput, setOrderInput] = useState(String(order ?? 0))
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'success' | 'error', message }

  // Keep the box in sync after saves elsewhere (e.g. list reload).
  useEffect(() => {
    setOrderInput(String(order ?? 0))
  }, [order])

  const save = async (data) => {
    if (saving) return
    setSaving(true)
    setStatus(null)

    try {
      const token = localStorage.getItem('token')
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${baseURL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token')
        alert('Your admin session has expired. Please log in again.')
        window.location.assign('/admin/login')
        return
      }

      let body = null
      try {
        body = await res.json()
      } catch {
        body = null
      }

      if (!res.ok) {
        throw new Error(
          typeof body?.error === 'string' ? body.error : 'Could not save'
        )
      }

      onSaved(body)
      setStatus({ type: 'success', message: 'Saved' })
    } catch (err) {
      console.error('Home settings save failed:', err)
      setOrderInput(String(order ?? 0))
      setStatus({ type: 'error', message: err.message || 'Could not save' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (event) => {
    const featuredOnHome = event.target.checked
    // Turning on without a position: put it at the end of the Home list.
    const data =
      featuredOnHome && !(order > 0)
        ? { featuredOnHome, homeDisplayOrder: suggestedOrder }
        : { featuredOnHome }
    save(data)
  }

  // Read the value from the input itself: blur/Enter can fire before React
  // re-renders with the latest typed value, so `orderInput` may be stale.
  const commitOrder = (rawValue) => {
    const value = Number(rawValue)
    if (!Number.isInteger(value) || value < 0 || value > 9999) {
      setOrderInput(String(order ?? 0))
      setStatus({ type: 'error', message: 'Use a whole number (1, 2, 3...)' })
      return
    }
    if (value === order) return
    save({ homeDisplayOrder: value })
  }

  return (
    <div className="admin-home-feature">
      <label className="admin-home-feature__toggle">
        <input
          type="checkbox"
          checked={Boolean(featured)}
          onChange={handleToggle}
          disabled={saving}
          aria-label={`Feature ${label} on Home`}
        />
        <span aria-hidden="true">Feature on Home</span>
      </label>

      <label className="admin-home-feature__order" htmlFor={id}>
        <span aria-hidden="true">Home order</span>
        <input
          id={id}
          type="number"
          min={0}
          max={9999}
          step={1}
          inputMode="numeric"
          value={orderInput}
          onChange={(event) => {
            setOrderInput(event.target.value)
            setStatus(null) // an earlier "Saved" must not describe this edit
          }}
          onBlur={(event) => commitOrder(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commitOrder(event.currentTarget.value)
            }
          }}
          disabled={saving || !featured}
          aria-label={`Home order for ${label}`}
        />
      </label>

      <span
        className={`admin-home-feature__status${
          status ? ` admin-home-feature__status--${status.type}` : ''
        }`}
        role="status"
        aria-live="polite"
      >
        {saving ? 'Saving...' : status?.message || ''}
      </span>
    </div>
  )
}

/**
 * One-line summary of what Home will show (first `limit` featured items
 * in Home order), so the effect of the controls is obvious.
 */
export function HomeFeaturedSummary({ items, getName, limit, noun, section }) {
  const featured = sortByHomeOrder(items.filter((item) => item.featuredOnHome))
  const shown = featured.slice(0, limit)
  const extra = featured.length - shown.length

  return (
    <p className="admin-home-summary">
      <strong>Shown on Home</strong> ({section}, first {limit} by Home order):{' '}
      {shown.length > 0
        ? shown
            .map((item) => `${getName(item)} (${item.homeDisplayOrder})`)
            .join(' · ')
        : `none - no ${noun} are featured, so this Home section is hidden`}
      {extra > 0 &&
        ` - ${extra} more featured but not shown (Home displays ${limit})`}
    </p>
  )
}
