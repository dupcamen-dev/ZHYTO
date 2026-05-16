export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

export function img(path: string): string {
  if (!BASE_PATH) return path
  if (path.startsWith(BASE_PATH)) return path
  return `${BASE_PATH}${path}`
}
