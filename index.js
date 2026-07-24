const rootEl = document.documentElement
const bodyEl = document.body
const headerEl = document.querySelector('.header')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

const getSavedTheme = () => {
  try {
    return localStorage.getItem('theme')
  } catch (error) {
    return null
  }
}

const saveTheme = (theme) => {
  try {
    localStorage.setItem('theme', theme)
  } catch (error) {
    // The selected theme still applies for this visit when storage is blocked.
  }
}

const getThemeToggle = () => {
  const existingToggle = document.querySelector('.theme-toggle')
  if (existingToggle) return existingToggle

  const headerMain = document.querySelector('.header__main')
  const hamMenu = document.querySelector('.header__main-ham-menu-cont')
  if (!headerMain) return null

  const toggle = document.createElement('button')
  toggle.className = 'theme-toggle'
  toggle.type = 'button'
  toggle.title = 'Switch color theme'
  toggle.innerHTML = `
    <svg class="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"></path>
    </svg>
    <svg class="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>
    </svg>`

  headerMain.insertBefore(toggle, hamMenu)
  return toggle
}

const themeToggle = getThemeToggle()
const themeColorMeta = document.querySelector('#theme-color-meta')

const applyTheme = (theme, persist = false) => {
  rootEl.dataset.theme = theme
  if (themeToggle) {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} theme`)
  }
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', theme === 'dark' ? '#121512' : '#f2f3ef')
  }
  if (persist) saveTheme(theme)
}

applyTheme(getSavedTheme() || (prefersDark.matches ? 'dark' : 'light'))

prefersDark.addEventListener('change', (event) => {
  if (!getSavedTheme()) applyTheme(event.matches ? 'dark' : 'light')
})

themeToggle?.addEventListener('click', () => {
  const nextTheme = rootEl.dataset.theme === 'dark' ? 'light' : 'dark'
  const updateTheme = () => applyTheme(nextTheme, true)

  if (document.startViewTransition && !prefersReducedMotion.matches) {
    document.startViewTransition(updateTheme)
  } else {
    updateTheme()
  }
})

// Mobile navigation
const hamMenuButton = document.querySelector('.header__main-ham-menu-cont')
const smallMenu = document.querySelector('.header__sm-menu')
const openMenuIcon = document.querySelector('.header__main-ham-menu')
const closeMenuIcon = document.querySelector('.header__main-ham-menu-close')
const smallMenuLinks = document.querySelectorAll('.header__sm-menu-link a')

const setMobileMenu = (isOpen) => {
  if (!hamMenuButton || !smallMenu) return

  smallMenu.classList.toggle('header__sm-menu--active', isOpen)
  headerEl?.classList.toggle('header--menu-open', isOpen)
  openMenuIcon?.classList.toggle('d-none', isOpen)
  closeMenuIcon?.classList.toggle('d-none', !isOpen)
  hamMenuButton.setAttribute('aria-expanded', String(isOpen))
  hamMenuButton.setAttribute(
    'aria-label',
    isOpen ? 'Close navigation menu' : 'Open navigation menu'
  )
}

hamMenuButton?.setAttribute('aria-expanded', 'false')
hamMenuButton?.addEventListener('click', () => {
  const isOpen = !smallMenu?.classList.contains('header__sm-menu--active')
  setMobileMenu(isOpen)
})

smallMenuLinks.forEach((link) => link.addEventListener('click', () => setMobileMenu(false)))

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMobileMenu(false)
})

window.addEventListener('resize', () => {
  if (window.innerWidth > 1024) setMobileMenu(false)
})

// The case-study pages use a div for the logo; the homepage uses a real link.
const headerLogo = document.querySelector('.header__logo-container')
if (headerLogo && headerLogo.tagName !== 'A') {
  headerLogo.setAttribute('role', 'link')
  headerLogo.setAttribute('tabindex', '0')
  const goHome = () => {
    window.location.href = 'index.html'
  }
  headerLogo.addEventListener('click', goHome)
  headerLogo.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') goHome()
  })
}

// Quick navigation dialog
const commandDialog = document.querySelector('.command-menu')
const commandTrigger = document.querySelector('.command-trigger')
const commandClose = document.querySelector('.command-menu__close')
const commandSearch = document.querySelector('#command-search')
const commandButtons = Array.from(document.querySelectorAll('[data-command]'))
const commandEmpty = document.querySelector('.command-menu__empty')

const openCommandMenu = () => {
  if (!commandDialog) return
  if (typeof commandDialog.showModal === 'function') commandDialog.showModal()
  else commandDialog.setAttribute('open', '')
  if (commandSearch) {
    commandSearch.value = ''
    commandSearch.dispatchEvent(new Event('input'))
    commandSearch.focus()
  }
}

const closeCommandMenu = () => {
  if (!commandDialog) return
  if (typeof commandDialog.close === 'function') commandDialog.close()
  else commandDialog.removeAttribute('open')
}

commandTrigger?.addEventListener('click', openCommandMenu)
commandClose?.addEventListener('click', closeCommandMenu)

commandDialog?.addEventListener('click', (event) => {
  if (event.target === commandDialog) closeCommandMenu()
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && commandDialog?.open) {
    event.preventDefault()
    closeCommandMenu()
    return
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (commandDialog?.open) closeCommandMenu()
    else openCommandMenu()
  }
})

commandSearch?.addEventListener('input', () => {
  const query = commandSearch.value.trim().toLowerCase()
  let visibleCount = 0

  commandButtons.forEach((button) => {
    const isVisible = (button.dataset.search || '').includes(query)
    button.hidden = !isVisible
    if (isVisible) visibleCount += 1
  })

  if (commandEmpty) commandEmpty.hidden = visibleCount !== 0
})

commandButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const destination = button.dataset.command
    closeCommandMenu()
    if (destination) document.querySelector(destination)?.scrollIntoView({ behavior: 'smooth' })
  })
})

// Project filtering
const filterButtons = document.querySelectorAll('[data-filter]')
const projectCards = document.querySelectorAll('[data-categories]')

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter

    filterButtons.forEach((candidate) => {
      const isSelected = candidate === button
      candidate.classList.toggle('is-active', isSelected)
      candidate.setAttribute('aria-pressed', String(isSelected))
    })

    projectCards.forEach((card) => {
      const categories = (card.dataset.categories || '').split(' ')
      card.hidden = filter !== 'all' && !categories.includes(filter)
    })
  })
})

// Local time and current year
const localTime = document.querySelector('[data-local-time]')
const localTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Stockholm',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZoneName: 'short',
})

const updateLocalTime = () => {
  if (localTime) localTime.textContent = localTimeFormatter.format(new Date())
}

updateLocalTime()
if (localTime) window.setInterval(updateLocalTime, 30000)

document.querySelectorAll('[data-current-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear())
})

// Reveal elements only after JS is active, keeping content visible without JS.
const revealSelectors = [
  '.reveal-target',
  '.home-hero__content',
  '.about__content-main',
  '.about__content-skills',
  '.projects__row',
  '.contact__form-container',
  '.project-cs-hero__content',
  '.project-details__showcase-img-cont',
  '.project-details__content-main',
]

const revealTargets = Array.from(
  new Set(document.querySelectorAll(revealSelectors.join(',')))
)

if ('IntersectionObserver' in window && revealTargets.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
  )

  const groupCounters = new Map()
  revealTargets.forEach((target) => {
    target.classList.add('reveal')
    const parent = target.parentElement
    const index = groupCounters.get(parent) || 0
    groupCounters.set(parent, index + 1)
    target.style.transitionDelay = `${Math.min(index, 3) * 70}ms`
    revealObserver.observe(target)
  })
} else {
  revealTargets.forEach((target) => target.classList.add('is-visible'))
}

// Active navigation, header state, progress, and back-to-top share one frame.
const navLinks = Array.from(document.querySelectorAll('.header__link')).filter((link) =>
  (link.getAttribute('href') || '').includes('#')
)
const sectionLinks = navLinks
  .map((link) => {
    const id = (link.getAttribute('href') || '').split('#')[1]
    const section = id ? document.getElementById(id) : null
    return section ? { link, section } : null
  })
  .filter(Boolean)

let backToTop = document.querySelector('.back-to-top')
if (!backToTop) {
  backToTop = document.createElement('button')
  backToTop.className = 'back-to-top'
  backToTop.type = 'button'
  backToTop.setAttribute('aria-label', 'Back to top')
  backToTop.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 20V4M6 10l6-6 6 6"></path>
    </svg>`
  bodyEl.appendChild(backToTop)
}

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' })
})

const progressBar = document.querySelector('.scroll-progress__bar')
let ticking = false

const updateScrollState = () => {
  const scrollTop = window.scrollY
  const scrollableHeight = rootEl.scrollHeight - window.innerHeight
  const progress = scrollableHeight > 0 ? scrollTop / scrollableHeight : 0

  headerEl?.classList.toggle('header--scrolled', scrollTop > 24)
  backToTop.classList.toggle('is-visible', scrollTop > 600)
  if (progressBar) progressBar.style.transform = `scaleX(${Math.min(progress, 1)})`

  if (sectionLinks.length) {
    const marker = scrollTop + window.innerHeight * 0.34
    let activeLink = null

    sectionLinks.forEach(({ link, section }) => {
      if (section.offsetTop <= marker) activeLink = link
    })

    navLinks.forEach((link) => {
      const isActive = link === activeLink
      link.classList.toggle('header__link--active', isActive)
      if (isActive) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  }

  ticking = false
}

window.addEventListener(
  'scroll',
  () => {
    if (ticking) return
    window.requestAnimationFrame(updateScrollState)
    ticking = true
  },
  { passive: true }
)

updateScrollState()