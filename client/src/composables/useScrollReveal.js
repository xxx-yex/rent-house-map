import { nextTick } from 'vue'

export function useScrollReveal(selector, options = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px' } = options

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1'
        e.target.style.transform = 'translateY(0)'
        observer.unobserve(e.target)
      }
    })
  }, { threshold, rootMargin })

  nextTick(() => {
    document.querySelectorAll(selector).forEach(el => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(16px)'
      el.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out'
      observer.observe(el)
    })
  })

  return observer
}
