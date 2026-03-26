import { useEffect, useRef, useState } from 'react'

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', once = true } = options
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(element)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return { ref, isVisible }
}

// Pre-built animation class combinations
export const animations = {
  fadeUp:    (visible: boolean, delay = 0) =>
    `transition-all duration-700 ease-out ${delay ? `delay-[${delay}ms]` : ''} ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`,
  fadeIn:    (visible: boolean, delay = 0) =>
    `transition-all duration-700 ease-out ${delay ? `delay-[${delay}ms]` : ''} ${
      visible ? 'opacity-100' : 'opacity-0'
    }`,
  fadeLeft:  (visible: boolean, delay = 0) =>
    `transition-all duration-700 ease-out ${delay ? `delay-[${delay}ms]` : ''} ${
      visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
    }`,
  fadeRight: (visible: boolean, delay = 0) =>
    `transition-all duration-700 ease-out ${delay ? `delay-[${delay}ms]` : ''} ${
      visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
    }`,
  scaleUp:   (visible: boolean, delay = 0) =>
    `transition-all duration-700 ease-out ${delay ? `delay-[${delay}ms]` : ''} ${
      visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    }`,
}
