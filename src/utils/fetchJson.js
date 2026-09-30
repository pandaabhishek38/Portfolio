/**
 * GET a backend endpoint and parse JSON.
 * Throws on network errors and non-2xx responses so callers
 * can fall back gracefully.
 */
export async function fetchJson(path, options) {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
  const res = await fetch(`${baseURL}${path}`, options)

  if (!res.ok) {
    throw new Error(`Request to ${path} failed: ${res.status}`)
  }

  return res.json()
}

function orderValue(row) {
  return Number.isFinite(row?.displayOrder) ? row.displayOrder : 0
}

/**
 * Sort rows by their admin-controlled displayOrder, then id.
 * Rows without displayOrder (older API) fall back to id order.
 */
export function sortByDisplayOrder(rows) {
  return [...rows].sort((a, b) => orderValue(a) - orderValue(b) || a.id - b.id)
}

/**
 * Sort skills by category order (typeOrder), then displayOrder, then id.
 * Without typeOrder (older API), categories keep first-appearance order.
 */
export function sortSkills(rows) {
  const firstIndex = new Map()
  const byId = [...rows].sort((a, b) => a.id - b.id)

  byId.forEach((skill, index) => {
    if (!firstIndex.has(skill.type)) firstIndex.set(skill.type, index)
  })

  const typeValue = (skill) =>
    Number.isFinite(skill?.typeOrder)
      ? skill.typeOrder
      : rows.length + firstIndex.get(skill.type)

  return byId.sort(
    (a, b) =>
      typeValue(a) - typeValue(b) || orderValue(a) - orderValue(b) || a.id - b.id
  )
}
