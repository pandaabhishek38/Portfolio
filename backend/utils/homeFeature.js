/*
 * Home-page selection for Projects and Skills (featuredOnHome +
 * homeDisplayOrder). Independent of the full-page displayOrder.
 */

// Featured items on Home: Home order first, id keeps ties stable.
export const HOME_ORDER = [{ homeDisplayOrder: 'asc' }, { id: 'asc' }]

export const HOME_ORDER_MAX = 9999

export function wantsHomeFeatured(query) {
  return query?.featured === 'home'
}

/**
 * Validate { featuredOnHome?, homeDisplayOrder? } from a request body.
 * Returns { data } with only the provided, valid fields, or { error }.
 */
export function parseHomeFeature(body) {
  const data = {}

  if (body?.featuredOnHome !== undefined) {
    if (typeof body.featuredOnHome !== 'boolean') {
      return { error: 'featuredOnHome must be true or false' }
    }
    data.featuredOnHome = body.featuredOnHome
  }

  if (body?.homeDisplayOrder !== undefined) {
    const order = body.homeDisplayOrder
    if (!Number.isInteger(order) || order < 0 || order > HOME_ORDER_MAX) {
      return {
        error: `homeDisplayOrder must be a whole number between 0 and ${HOME_ORDER_MAX}`,
      }
    }
    data.homeDisplayOrder = order
  }

  if (Object.keys(data).length === 0) {
    return { error: 'Provide featuredOnHome and/or homeDisplayOrder' }
  }

  return { data }
}

export function parseId(value) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}
