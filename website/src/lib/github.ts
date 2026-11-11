export type StoreApp = {
  name: string
  tagline: string
  description: string
  category: string
  version: string
  platform: string
  status: 'Available' | 'Coming soon'
  initials: string
  accent: string
  downloadUrl?: string
  repoUrl?: string
  iconUrl?: string
}

export async function loadStoreApps(): Promise<StoreApp[]> {
  const response = await fetch('/api/apps')
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('The store catalogue is temporarily busy. Please try again shortly.')
    }
    throw new Error('Could not load app releases from GitHub. Please try again later.')
  }
  return response.json() as Promise<StoreApp[]>
}
