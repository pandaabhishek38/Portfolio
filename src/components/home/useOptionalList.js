'use client'

import { useEffect, useState } from 'react'
import { fetchJson } from '../../utils/fetchJson'

/**
 * Loads a list for an optional Home section.
 *
 * status: 'loading' | 'ready' | 'hidden'
 * The section is hidden when the request fails or nothing is selected,
 * so a slow or unavailable backend never shows broken UI on Home.
 *
 * `select` must be a stable (module-level) function.
 */
export default function useOptionalList(path, select) {
  const [state, setState] = useState({ status: 'loading', items: [] })

  useEffect(() => {
    let active = true

    fetchJson(path)
      .then((data) => {
        const items = Array.isArray(data) ? select(data) : []

        if (active) {
          setState(
            items.length > 0
              ? { status: 'ready', items }
              : { status: 'hidden', items: [] }
          )
        }
      })
      .catch((err) => {
        console.error(`Home section fetch error (${path}):`, err)

        if (active) {
          setState({ status: 'hidden', items: [] })
        }
      })

    return () => {
      active = false
    }
  }, [path, select])

  return state
}
