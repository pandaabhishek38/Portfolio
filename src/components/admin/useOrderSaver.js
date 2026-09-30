'use client'

import { useCallback, useRef, useState } from 'react'

/** Move one item in a list (returns a new array). */
export function moveItem(list, from, to) {
  if (to < 0 || to >= list.length || from === to) return list

  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/**
 * Persists an admin ordering change.
 *
 * - applies the new order optimistically, reverts it on failure
 * - ignores new requests while one is in flight
 * - exposes { saving, status } for disabled states and feedback
 */
export default function useOrderSaver() {
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'success' | 'error', message }
  const savingRef = useRef(false)

  const saveOrder = useCallback(
    async ({ path, body, apply, revert, successMessage }) => {
      if (savingRef.current) return null

      savingRef.current = true
      setSaving(true)
      setStatus(null)
      apply()

      try {
        const token = localStorage.getItem('token')
        const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
        const res = await fetch(`${baseURL}${path}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        })

        let data = null
        try {
          data = await res.json()
        } catch {
          data = null
        }

        if (!res.ok) {
          throw new Error(
            typeof data?.error === 'string' ? data.error : 'Failed to save order'
          )
        }

        setStatus({ type: 'success', message: successMessage })
        return data
      } catch (err) {
        console.error('Order save failed:', err)
        revert()
        setStatus({
          type: 'error',
          message: `${err.message || 'Failed to save order'}. The previous order was restored.`,
        })
        return null
      } finally {
        savingRef.current = false
        setSaving(false)
      }
    },
    []
  )

  return { saving, status, saveOrder }
}

/** Polite live-region feedback for order saves. */
export function OrderStatus({ status, saving }) {
  return (
    <p
      className={`admin-order-status${
        status ? ` admin-order-status--${status.type}` : ''
      }`}
      role="status"
      aria-live="polite"
    >
      {saving ? 'Saving order...' : status?.message || ''}
    </p>
  )
}
