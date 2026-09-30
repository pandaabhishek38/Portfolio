/*
 * Helpers for admin-controlled display ordering.
 */

// Saved order first; id keeps ties (e.g. freshly migrated rows) stable.
export const DISPLAY_ORDER = [{ displayOrder: 'asc' }, { id: 'asc' }]

const MAX_ORDERED_ITEMS = 1000

/**
 * Validate an `orderedIds` payload: a non-empty array of unique
 * positive integers. Returns the ids, or null when invalid.
 */
export function parseOrderedIds(value) {
  if (!Array.isArray(value)) return null
  if (value.length === 0 || value.length > MAX_ORDERED_ITEMS) return null

  const ids = value.map((id) => (typeof id === 'string' ? Number(id) : id))

  if (!ids.every((id) => Number.isInteger(id) && id > 0)) return null
  if (new Set(ids).size !== ids.length) return null

  return ids
}

/**
 * Validate an `orderedTypes` payload: a non-empty array of unique,
 * non-empty strings. Returns the names, or null when invalid.
 */
export function parseOrderedNames(value) {
  if (!Array.isArray(value)) return null
  if (value.length === 0 || value.length > MAX_ORDERED_ITEMS) return null
  if (!value.every((name) => typeof name === 'string' && name.length > 0)) {
    return null
  }
  if (new Set(value).size !== value.length) return null

  return value
}

/** True when both lists contain exactly the same members. */
export function sameMembers(a, b) {
  if (a.length !== b.length) return false

  const set = new Set(a)
  return b.every((item) => set.has(item))
}

/** Next displayOrder value so a new row is appended at the end. */
export async function nextDisplayOrder(delegate, where = {}) {
  const result = await delegate.aggregate({
    where,
    _max: { displayOrder: true },
  })

  return (result._max.displayOrder ?? -1) + 1
}

/** Persist `displayOrder = index` for each id, atomically. */
export function applyDisplayOrder(prisma, delegate, ids) {
  return prisma.$transaction(
    ids.map((id, index) =>
      delegate.update({ where: { id }, data: { displayOrder: index } })
    )
  )
}

/**
 * All skills in display order, each with a `typeOrder` (0-based
 * position of its category).
 *
 * Category order comes from the SkillType table. Categories without a
 * saved order follow, by first appearance (lowest skill id).
 */
export async function getOrderedSkills(prisma) {
  const [skills, savedTypes] = await Promise.all([
    prisma.skill.findMany({ orderBy: DISPLAY_ORDER }),
    prisma.skillType.findMany(),
  ])

  const savedOrder = new Map(
    savedTypes.map((type) => [type.name, type.displayOrder])
  )

  const firstSkillId = new Map()
  for (const skill of skills) {
    const current = firstSkillId.get(skill.type)
    if (current === undefined || skill.id < current) {
      firstSkillId.set(skill.type, skill.id)
    }
  }

  const orderedTypes = [...firstSkillId.keys()].sort((a, b) => {
    const aSaved = savedOrder.has(a)
    const bSaved = savedOrder.has(b)

    if (aSaved && bSaved) {
      return savedOrder.get(a) - savedOrder.get(b) || a.localeCompare(b)
    }
    if (aSaved !== bSaved) return aSaved ? -1 : 1

    return firstSkillId.get(a) - firstSkillId.get(b)
  })

  const typeOrder = new Map(orderedTypes.map((type, index) => [type, index]))

  return skills
    .map((skill) => ({ ...skill, typeOrder: typeOrder.get(skill.type) }))
    .sort(
      (a, b) =>
        a.typeOrder - b.typeOrder ||
        a.displayOrder - b.displayOrder ||
        a.id - b.id
    )
}
