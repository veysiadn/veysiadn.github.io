// ---------------------------------------------------------------------
// Color theme (light / dark) with persistence + system preference
// ---------------------------------------------------------------------
const rootEl = document.documentElement
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

const applyTheme = (theme) => rootEl.setAttribute('data-theme', theme)

applyTheme(localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'light'))

prefersDark.addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light')
})

const headerMain = document.querySelector('.header__main')
const hamMenuCont = document.querySelector('.header__main-ham-menu-cont')

if (headerMain) {
  const themeToggle = document.createElement('button')
  themeToggle.className = 'theme-toggle'
  themeToggle.type = 'button'
  themeToggle.setAttribute('aria-label', 'Toggle color theme')
  themeToggle.title = 'Toggle theme'
  themeToggle.innerHTML = `
    <svg class="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
    <svg class="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5"></circle>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
    </svg>`

  themeToggle.addEventListener('click', () => {
    const next = rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    localStorage.setItem('theme', next)
  })

  headerMain.insertBefore(themeToggle, hamMenuCont)
}

// ---------------------------------------------------------------------
// Mobile hamburger menu
// ---------------------------------------------------------------------
const hamMenuBtn = document.querySelector('.header__main-ham-menu-cont')
const smallMenu = document.querySelector('.header__sm-menu')
const headerHamMenuBtn = document.querySelector('.header__main-ham-menu')
const headerHamMenuCloseBtn = document.querySelector(
  '.header__main-ham-menu-close'
)
const headerSmallMenuLinks = document.querySelectorAll('.header__sm-menu-link')

if (hamMenuBtn) {
  hamMenuBtn.addEventListener('click', () => {
    if (smallMenu.classList.contains('header__sm-menu--active')) {
      smallMenu.classList.remove('header__sm-menu--active')
    } else {
      smallMenu.classList.add('header__sm-menu--active')
    }
    if (headerHamMenuBtn.classList.contains('d-none')) {
      headerHamMenuBtn.classList.remove('d-none')
      headerHamMenuCloseBtn.classList.add('d-none')
    } else {
      headerHamMenuBtn.classList.add('d-none')
      headerHamMenuCloseBtn.classList.remove('d-none')
    }
  })
}

for (let i = 0; i < headerSmallMenuLinks.length; i++) {
  headerSmallMenuLinks[i].addEventListener('click', () => {
    smallMenu.classList.remove('header__sm-menu--active')
    headerHamMenuBtn.classList.remove('d-none')
    headerHamMenuCloseBtn.classList.add('d-none')
  })
}

// ---------------------------------------------------------------------
// Logo click -> home
// ---------------------------------------------------------------------
const headerLogoConatiner = document.querySelector('.header__logo-container')

if (headerLogoConatiner) {
  headerLogoConatiner.addEventListener('click', () => {
    location.href = 'index.html'
  })
}

// ---------------------------------------------------------------------
// Sticky-header elevation on scroll
// ---------------------------------------------------------------------
const headerEl = document.querySelector('.header')

// ---------------------------------------------------------------------
// Scroll-reveal animations
// ---------------------------------------------------------------------
const revealSelectors = [
  '.home-hero__content',
  '.about__content-main',
  '.about__content-skills',
  '.projects__row',
  '.contact__form-container',
  '.project-cs-hero__content',
  '.project-details__showcase-img-cont',
  '.project-details__content-main',
]

const revealTargets = document.querySelectorAll(revealSelectors.join(','))

if ('IntersectionObserver' in window && revealTargets.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )

  const groupCounters = new Map()
  revealTargets.forEach((el) => {
    el.classList.add('reveal')
    // Stagger siblings that share the same parent for a cascading effect.
    const key = el.parentElement
    const index = groupCounters.get(key) || 0
    groupCounters.set(key, index + 1)
    el.style.transitionDelay = `${Math.min(index, 4) * 90}ms`
    revealObserver.observe(el)
  })
} else {
  revealTargets.forEach((el) => el.classList.add('is-visible'))
}

// ---------------------------------------------------------------------
// Active navigation highlighting (in-page sections only)
// ---------------------------------------------------------------------
const navLinks = Array.from(document.querySelectorAll('.header__link')).filter(
  (link) => (link.getAttribute('href') || '').includes('#')
)
const sectionLinks = navLinks
  .map((link) => {
    const id = (link.getAttribute('href') || '').split('#')[1]
    const section = id ? document.getElementById(id) : null
    return section ? { link, section } : null
  })
  .filter(Boolean)

// ---------------------------------------------------------------------
// Back-to-top button
// ---------------------------------------------------------------------
const backToTop = document.createElement('button')
backToTop.className = 'back-to-top'
backToTop.type = 'button'
backToTop.setAttribute('aria-label', 'Back to top')
backToTop.innerHTML = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 19V5M5 12l7-7 7 7"></path>
  </svg>`
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
document.body.appendChild(backToTop)

// ---------------------------------------------------------------------
// Single throttled scroll handler
// ---------------------------------------------------------------------
let ticking = false

const onScroll = () => {
  const y = window.scrollY

  if (headerEl) headerEl.classList.toggle('header--scrolled', y > 20)
  backToTop.classList.toggle('is-visible', y > 500)

  if (sectionLinks.length) {
    const marker = y + window.innerHeight * 0.3
    let active = null
    sectionLinks.forEach(({ link, section }) => {
      if (section.offsetTop <= marker) active = link
    })
    navLinks.forEach((link) =>
      link.classList.toggle('header__link--active', link === active)
    )
  }

  ticking = false
}

window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll)
      ticking = true
    }
  },
  { passive: true }
)

onScroll()
