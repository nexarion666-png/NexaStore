type GitHubRepository = {
  name: string
  full_name: string
  html_url: string
  description: string | null
  topics?: string[]
}

type GitHubRelease = {
  name: string | null
  tag_name: string
  body: string | null
  assets: Array<{
    name: string
    browser_download_url: string
    size: number
  }>
}

type StoreApp = {
  name: string
  tagline: string
  description: string
  category: string
  version: string
  platform: string
  status: 'Available'
  initials: string
  accent: string
  downloadUrl: string
  repoUrl: string
  iconUrl?: string
}

type Request = { method?: string }
type Response = {
  setHeader(name: string, value: string): void
  status(code: number): Response
  json(value: unknown): void
}

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

async function githubJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(\`GitHub API request failed: \${response.status}\`)
  }
  return response.json() as Promise<T>
}

function cleanText(markdown: string | null, fallback: string): string {
  if (!markdown) return fallback
  const plain = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/[#>*_\`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.slice(0, 220) || fallback
}

function categoryFromTopics(topics: string[] = []): string {
  const values = topics.map((topic) => topic.toLowerCase())
  if (values.some((topic) => ['entertainment', 'media', 'streaming'].includes(topic))) return 'Entertainment'
  if (values.some((topic) => ['productivity', 'education', 'learning'].includes(topic))) return 'Productivity'
  return 'Tools'
}

function platformFromAsset(filename: string): string {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.apk') || lower.endsWith('.aab')) return 'Android'
  if (lower.endsWith('.exe') || lower.endsWith('.msi')) return 'Windows'
  if (lower.endsWith('.dmg') || lower.endsWith('.pkg')) return 'macOS'
  if (lower.endsWith('.ipa')) return 'iOS'
  return 'Multiple platforms'
}

function initialsFromName(name: string): string {
  return name
    .split(/[\s-_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'N'
}

async function findRepositoryIcon(repository: GitHubRepository): Promise<string | undefined> {
  try {
    const tree = await githubJson<{ tree?: Array<{ path: string; type: string }> }>(
      `https://api.github.com/repos/${repository.full_name}/git/trees/HEAD?recursive=1`,
    )
    const imageFiles = (tree.tree || []).filter((item) => {
      if (item.type !== 'blob' || !/\\.(png|jpe?g|webp|svg)$/i.test(item.path)) return false
      const path = item.path.toLowerCase()
      if (path.includes('/mipmap') || path.includes('/drawable') || path.includes('/screenshots/')) return false
      return /(^|\\/)(app[-_]?icon|icon|logo)([-_./]|$)/i.test(path)
    })
    const score = (path: string) => {
      const value = path.toLowerCase()
      if (/^app[-_]?icon\\.(png|webp)$/i.test(value.split('/').pop() || '')) return 0
      if (/^icon\\.(png|webp)$/i.test(value.split('/').pop() || '')) return 1
      if (/^logo\\.(png|webp|svg)$/i.test(value.split('/').pop() || '')) return 2
      if (value.includes('/assets/')) return 3
      return 4
    }
    const candidate = imageFiles.sort((a, b) => score(a.path) - score(b.path))[0]
    if (!candidate) return undefined
    const encodedPath = candidate.path.split('/').map(encodeURIComponent).join('/')
    return `https://raw.githubusercontent.com/${repository.full_name}/HEAD/${encodedPath}`
  } catch {
    return undefined
  }
}

async function loadRepositoryApp(repository: GitHubRepository): Promise<StoreApp | null> {
  try {
    const release = await githubJson<GitHubRelease>(
      \`https://api.github.com/repos/\${repository.full_name}/releases/latest\`,
    )
    const asset = [...release.assets].sort((a, b) => {
      const aApk = a.name.toLowerCase().endsWith('.apk') ? 1 : 0
      const bApk = b.name.toLowerCase().endsWith('.apk') ? 1 : 0
      return bApk - aApk
    }).find((item) => item.size > 0)

    if (!asset) return null

    const [iconUrl] = await Promise.all([findRepositoryIcon(repository)])
    const name = release.name?.trim() || repository.name.replace(/[-_]+/g, ' ')
    const fallbackDescription = repository.description || \`\${name} is available from its GitHub release.\`
    return {
      name,
      tagline: repository.description || 'A Nexarion application.',
      description: cleanText(release.body, fallbackDescription),
      category: categoryFromTopics(repository.topics),
      version: release.tag_name,
      platform: platformFromAsset(asset.name),
      status: 'Available',
      initials: initialsFromName(name),
      accent: 'violet',
      downloadUrl: asset.browser_download_url,
      repoUrl: repository.html_url,
      iconUrl,
    }
  } catch (error) {
    // A repository without a published stable release is normal; other errors should surface.
    if (error instanceof Error && error.message.includes('404')) return null
    throw error
  }
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const search = await githubJson<{ items: GitHubRepository[] }>(
      'https://api.github.com/search/repositories?q=user%3Anexarion666-png&sort=updated&per_page=100',
    )
    const repositories = search.items.slice(0, 20)
    const apps: StoreApp[] = []

    for (let index = 0; index < repositories.length; index += 4) {
      const batch = repositories.slice(index, index + 4)
      const results = await Promise.all(batch.map(loadRepositoryApp))
      apps.push(...results.filter((item): item is StoreApp => item !== null))
    }

    return res.status(200).json(apps.sort((a, b) => a.name.localeCompare(b.name)))
  } catch {
    return res.status(502).json({ error: 'GitHub is temporarily unavailable. Please try again later.' })
  }
}
