import Link from 'next/link'
import { useRouter } from 'next/router'
import { forwardRef, useRef } from 'react'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'
import clsx from 'clsx'

const NavItem = forwardRef(({ href, children, isActive, isPublished, fallbackHref }, ref) => {
  return (
    <li ref={ref} data-active={isActive ? 'true' : undefined}>
      <Link href={isPublished ? href : fallbackHref}>
        <a
          className={clsx('block border-l pl-4 -ml-px', {
            'text-sky-500 border-current font-semibold dark:text-sky-400': isActive,
            'border-transparent hover:border-slate-400 dark:hover:border-slate-500': !isActive,
            'text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300':
              !isActive && isPublished,
            'text-slate-400': !isActive && !isPublished
          })}
        >
          {children}
        </a>
      </Link>
    </li>
  )
})

/**
 * Find the nearst scrollable ancestor (or self if scrollable)
 *
 * Code adapted and simplified from the smoothscroll polyfill
 *
 *
 * @param {Element} el
 */
function nearestScrollableContainer(el) {
  /**
   * indicates if an element can be scrolled
   *
   * @param {Node} el
   */
  function isScrollable(el) {
    const style = window.getComputedStyle(el)
    const overflowX = style['overflowX']
    const overflowY = style['overflowY']
    const canScrollY = el.clientHeight < el.scrollHeight
    const canScrollX = el.clientWidth < el.scrollWidth

    const isScrollableY = canScrollY && (overflowY === 'auto' || overflowY === 'scroll')
    const isScrollableX = canScrollX && (overflowX === 'auto' || overflowX === 'scroll')

    return isScrollableY || isScrollableX
  }

  while (el !== document.body && isScrollable(el) === false) {
    el = el.parentNode || el.host
  }

  return el
}

function Nav({ nav, children, fallbackHref, mobile = false }) {
  const router = useRouter()
  const activeItemRef = useRef()
  const previousActiveItemRef = useRef()
  const scrollRef = useRef()

  useIsomorphicLayoutEffect(() => {
    function updatePreviousRef() {
      previousActiveItemRef.current = activeItemRef.current
    }

    if (activeItemRef.current) {
      if (activeItemRef.current === previousActiveItemRef.current) {
        updatePreviousRef()
        return
      }

      updatePreviousRef()

      const scrollable = nearestScrollableContainer(scrollRef.current)

      const scrollRect = scrollable.getBoundingClientRect()
      const activeItemRect = activeItemRef.current.getBoundingClientRect()

      const top = activeItemRef.current.offsetTop
      const bottom = top - scrollRect.height + activeItemRect.height

      if (scrollable.scrollTop > top || scrollable.scrollTop < bottom) {
        scrollable.scrollTop = top - scrollRect.height / 2 + activeItemRect.height / 2
      }
    }
  }, [router.pathname])

  return (
    <nav ref={scrollRef} id="nav" className="lg:text-sm lg:leading-6 relative">
      <div className="sticky top-0 -ml-0.5 pointer-events-none">
        {!mobile && <div className="h-10 bg-white dark:bg-slate-900" />}
        {!mobile && <div className="h-8 bg-gradient-to-b from-white dark:from-slate-900" />}
      </div>
      <ul>
        {children}
        {nav &&
          Object.keys(nav)
            .map((category) => {
              let publishedItems = nav[category].filter((item) => item.published !== false)
              if (publishedItems.length === 0 && !fallbackHref) return null
              return (
                <li key={category} className="mt-12 lg:mt-8">
                  <h5
                    className={clsx('mb-8 lg:mb-3 font-semibold', {
                      'text-slate-900 dark:text-slate-200': publishedItems.length > 0,
                      'text-slate-400': publishedItems.length === 0
                    })}
                  >
                    {category}
                  </h5>
                  <ul
                    className={clsx(
                      'space-y-6 lg:space-y-2 border-l border-slate-100',
                      mobile ? 'dark:border-slate-700' : 'dark:border-slate-800'
                    )}
                  >
                    {(fallbackHref ? nav[category] : publishedItems).map((item, i) => {
                      let isActive = item.match
                        ? item.match.test(router.pathname)
                        : item.href === router.pathname
                      return (
                        <NavItem
                          key={i}
                          href={item.href}
                          isActive={isActive}
                          ref={isActive ? activeItemRef : undefined}
                          isPublished={item.published !== false}
                          fallbackHref={fallbackHref}
                        >
                          {item.shortTitle || item.title}
                        </NavItem>
                      )
                    })}
                  </ul>
                </li>
              )
            })
            .filter(Boolean)}
      </ul>
    </nav>
  )
}

function Wrapper({ allowOverflow, children }) {
  return <div className={allowOverflow ? undefined : 'overflow-hidden'}>{children}</div>
}

export function SidebarLayout({ children, nav, sidebar, fallbackHref }) {
  return (
    <Wrapper allowOverflow={allowOverflow}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="hidden lg:block fixed z-20 inset-0 top-[3.8125rem] left-[max(0px,calc(50%-45rem))] right-auto w-[19.5rem] pb-10 px-8 overflow-y-auto">
          <Nav nav={nav} fallbackHref={fallbackHref}>
            {sidebar}
          </Nav>
        </div>
        <div className="lg:pl-[19.5rem]">{children}</div>
      </div>
    </Wrapper>
  )
}
