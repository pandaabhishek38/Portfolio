import { randomUUID } from 'crypto'

/*
 * Supabase Storage helper for portfolio assets (server-side only).
 *
 * Uses the Storage REST API directly (the same endpoints/headers as the
 * official client) so it runs on any Node version with fetch and needs
 * no extra dependency.
 *
 * Environment (Cloud Run):
 *   SUPABASE_URL            https://<project-ref>.supabase.co
 *   SUPABASE_SECRET_KEY     secret / service_role key (never sent to browsers)
 *   SUPABASE_ASSETS_BUCKET  public bucket name, default "portfolio-assets"
 *
 * Objects get server-generated, never-reused names, so they can be cached
 * for a year and a replaced asset never shows a stale copy.
 */

const ONE_YEAR_SECONDS = 31536000

function getConfig() {
  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '')
  const key = (process.env.SUPABASE_SECRET_KEY || '').trim()
  const bucket = (process.env.SUPABASE_ASSETS_BUCKET || 'portfolio-assets').trim()

  if (!url || !key || !bucket) return null
  return { url, key, bucket }
}

export function isStorageConfigured() {
  return getConfig() !== null
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super('Image storage is not configured on the server.')
    this.name = 'StorageNotConfiguredError'
  }
}

function requireConfig() {
  const config = getConfig()
  if (!config) throw new StorageNotConfiguredError()
  return config
}

function authHeaders(key) {
  return { apikey: key, Authorization: `Bearer ${key}` }
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/')
}

function publicPrefix({ url, bucket }) {
  return `${url}/storage/v1/object/public/${encodeURIComponent(bucket)}/`
}

/**
 * Upload a validated image buffer under `folder/`.
 * Returns { path, url } where url is the public URL to store in the DB.
 */
export async function uploadPublicImage({ folder, buffer, contentType, extension }) {
  const config = requireConfig()
  const path = `${folder}/${randomUUID()}.${extension}`

  const res = await fetch(
    `${config.url}/storage/v1/object/${encodeURIComponent(config.bucket)}/${encodePath(path)}`,
    {
      method: 'POST',
      headers: {
        ...authHeaders(config.key),
        'Content-Type': contentType,
        'cache-control': `max-age=${ONE_YEAR_SECONDS}`,
        'x-upsert': 'false',
      },
      body: buffer,
    }
  )

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Storage upload failed (${res.status}): ${detail.slice(0, 200)}`)
  }

  return { path, url: publicPrefix(config) + encodePath(path) }
}

/**
 * The object path for a public URL in our bucket (optionally limited to
 * a folder), or null for anything else (external URLs, legacy /logos paths).
 */
export function managedObjectPath(url, folder) {
  const config = getConfig()
  if (!config || typeof url !== 'string') return null

  const prefix = publicPrefix(config)
  if (!url.startsWith(prefix)) return null

  let path
  try {
    path = decodeURIComponent(url.slice(prefix.length).split(/[?#]/)[0])
  } catch {
    return null
  }

  if (!path || path.includes('..')) return null
  if (folder && !path.startsWith(`${folder}/`)) return null

  return path
}

/** Delete one object in our bucket by its public URL. Returns true if deleted. */
export async function deleteManagedObject(url, folder) {
  const path = managedObjectPath(url, folder)
  if (!path) return false

  const config = requireConfig()
  const res = await fetch(
    `${config.url}/storage/v1/object/${encodeURIComponent(config.bucket)}`,
    {
      method: 'DELETE',
      headers: { ...authHeaders(config.key), 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefixes: [path] }),
    }
  )

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Storage delete failed (${res.status}): ${detail.slice(0, 200)}`)
  }

  return true
}
