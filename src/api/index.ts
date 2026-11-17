import type { CareCircleApi } from './contract'
import { mockApi } from './mockApi'

/**
 * The one place the app chooses its backend.
 * Backend team: create e.g. `httpApi.ts` implementing CareCircleApi and
 * export it here (optionally behind `import.meta.env.VITE_API_URL`).
 */
export const api: CareCircleApi = mockApi
export const isMockBackend = api === mockApi

export * from './contract'
