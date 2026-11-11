import { useEffect, useMemo, useState } from 'react'
import { loadStoreApps } from './lib/github'
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronDown,
  Command,
  ExternalLink,
  Github,
  Menu,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react'

type StoreApp = {
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
}

const categories = ['All apps', 'Entertainment', 'Productivity', 'Tools']

function App() {
  const [apps, setApps] = useState<StoreApp[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    loadStoreApps()
      .then((loadedApps) => { if (active) setApps(loadedApps) })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Could not load apps from GitHub.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const [category, setCategory] = useState('All apps')
  const [menuOpen, setMenuOpen] = useState(false)

  const visibleApps = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return apps.filter((app) => {
      const matchesCategory = category === 'All apps' || app.category === category
      const matchesQuery =
        !normalized ||
        app.name.toLowerCase().includes(normalized) ||
        app.tagline.toLowerCase().includes(normalized) ||
        app.description.toLowerCase().includes(normalized)
      return matchesCategory && matchesQuery
    })
  }, [query, category])

  return (
    <div className="site-shell">
      <div className="announcement">
        <Sparkles size={14} />
        <span>A home for apps built by Nexarion</span>
        <span className="announcement-dot">·</span>
        <span className="announcement-muted">Independent. Simple. Useful.</span>
      </div>

      <header className="topbar">
        <a className="brand" href="#" aria-label="NexaStore home">
          <span className="brand-mark"><Command size={20} strokeWidth={2.5} /></span>
          <span>Nexa<span className="brand-light">Store</span></span>
        </a>

        <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'}>
          <a href="#apps" onClick={() => setMenuOpen(false)}>Explore apps</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="https://github.com/nexarion666-png/NexaStore" target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>
            GitHub <ExternalLink size={13} />
          </a>
        </nav>

        <a className="nav-cta" href="#apps">Browse store <ArrowRight size={15} /></a>
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="hero-content">
            <div className="eyebrow"><span className="eyebrow-line" /> THE NEXARION ECOSYSTEM</div>
            <h1>Good apps.<br /><span>One home.</span></h1>
            <p className="hero-copy">
              Discover a growing collection of apps made to be useful.
              Explore what is available, get the details, and download directly.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#apps">Explore apps <ArrowDownToLine size={17} /></a>
              <a className="button button-quiet" href="#about">About NexaStore <ArrowRight size={16} /></a>
            </div>
            <div className="hero-proof">
              <span><ShieldCheck size={15} /> Direct release links</span>
              <span><Smartphone size={15} /> Android apps</span>
            </div>
          </div>

          <div className="hero-art" aria-label="NexaStore app collection illustration">
            <div className="orbit orbit-outer" />
            <div className="orbit orbit-inner" />
            <div className="float-card float-card-top"><span className="mini-icon mini-violet">N</span><span><b>Nexvio</b><small>Entertainment</small></span><Check size={15} className="float-check" /></div>
            <div className="store-tile">
              <div className="tile-shine" />
              <div className="tile-icon"><Command size={43} strokeWidth={2.2} /></div>
              <div className="tile-name">Nexa<span>Store</span></div>
              <div className="tile-caption">A little more useful.</div>
              <div className="tile-dots"><i /><i /><i /></div>
            </div>
            <div className="float-card float-card-bottom"><span className="live-dot" /><span><b>Growing collection</b><small>More apps on the way</small></span></div>
            <div className="spark spark-a">✳</div><div className="spark spark-b">✦</div>
          </div>
          <div className="hero-bottom-label"><span>01</span> / DISCOVER SOMETHING NEW</div>
        </section>

        <section className="stats-strip" aria-label="Store highlights">
          <div><strong>{apps.length.toString().padStart(2, '0')}</strong><span>APP AVAILABLE</span></div>
          <div><strong>01</strong><span>DEVELOPER</span></div>
          <div><strong>∞</strong><span>IDEAS IN PROGRESS</span></div>
          <p>Small beginnings. Big plans.</p>
        </section>

        <section className="apps-section" id="apps">
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> THE COLLECTION</div>
              <h2>Explore <span>apps.</span></h2>
              <p>Find something worth installing.</p>
            </div>
            <div className="search-box">
              <Search size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps..." aria-label="Search apps" />
              {query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button>}
              <kbd>⌘ K</kbd>
            </div>
          </div>

          <div className="filter-row">
            <div className="category-tabs" role="group" aria-label="Filter by category">
              {categories.map((item) => (
                <button key={item} className={category === item ? 'category-tab active' : 'category-tab'} onClick={() => setCategory(item)}>
                  {item}
                </button>
              ))}
            </div>
            <span className="result-count">{visibleApps.length} {visibleApps.length === 1 ? 'APP' : 'APPS'}</span>
          </div>

          {loading ? (
            <div className="empty-state"><Sparkles size={25} /><h3>Loading the collection</h3><p>Checking the latest app releases on GitHub…</p></div>
          ) : loadError ? (
            <div className="empty-state"><Github size={25} /><h3>Store catalogue unavailable</h3><p>{loadError}</p><button className="text-button" onClick={() => window.location.reload()}>Try again <ArrowRight size={15} /></button></div>
          ) : visibleApps.length > 0 ? (
            <div className="app-grid">
              {visibleApps.map((app) => (
                <article className="app-card" key={app.name}>
                  <div className="app-card-top">
                    <div className={'app-icon app-icon-' + app.accent}>{app.initials}</div>
                    <span className="available-label"><i /> {app.status}</span>
                  </div>
                  <div className="app-card-info">
                    <div className="app-category">{app.category}</div>
                    <h3>{app.name}</h3>
                    <p className="app-tagline">{app.tagline}</p>
                    <p className="app-description">{app.description}</p>
                  </div>
                  <div className="app-meta">
                    <span>VERSION <b>{app.version}</b></span>
                    <span>PLATFORM <b>{app.platform}</b></span>
                  </div>
                  <div className="app-card-actions">
                    {app.downloadUrl ? (
                      <a className="button button-primary download-button" href={app.downloadUrl}>
                        Download APK <ArrowDownToLine size={16} />
                      </a>
                    ) : (
                      <button className="button button-disabled" disabled>Coming soon</button>
                    )}
                    {app.repoUrl && <a className="icon-link" href={app.repoUrl} target="_blank" rel="noreferrer" aria-label={'View ' + app.name + ' source on GitHub'}><Github size={18} /></a>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={25} />
              <h3>{apps.length === 0 ? 'No released apps found' : 'No apps found'}</h3>
              <p>{apps.length === 0 ? 'Publish a GitHub Release in an app repository and attach a downloadable file to it. The store will discover it automatically.' : 'Try another search or choose a different category.'}</p>
              <button className="text-button" onClick={() => { setQuery(''); setCategory('All apps') }}>Clear filters <ArrowRight size={15} /></button>
            </div>
          )}

          <div className="coming-banner">
            <div className="coming-symbol"><Sparkles size={22} /></div>
            <div><strong>More is in the works.</strong><p>New Nexarion projects will show up here as they are released.</p></div>
            <span className="coming-status"><i /> IN DEVELOPMENT</span>
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-mark"><Command size={30} /></div>
          <div className="about-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> BUILT WITH INTENTION</div>
            <h2>Made by Nexarion.<br /><span>Made to be useful.</span></h2>
            <p>NexaStore is the home for applications created and maintained by Nexarion. Each listing links to its release so you can find the right app and get it from its source.</p>
            <a className="text-button" href="https://github.com/nexarion666-png" target="_blank" rel="noreferrer">Meet the developer <ArrowRight size={16} /></a>
          </div>
          <div className="about-side-note"><span>NX / 001</span><p>BUILD<br />WHAT'S<br />NEXT.</p></div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#"><span className="brand-mark"><Command size={18} /></span><span>Nexa<span className="brand-light">Store</span></span></a>
        <span>© {new Date().getFullYear()} Nexarion. Built independently.</span>
        <a href="https://github.com/nexarion666-png/NexaStore" target="_blank" rel="noreferrer">Source on GitHub <ArrowRight size={14} /></a>
      </footer>
    </div>
  )
}

export default App
