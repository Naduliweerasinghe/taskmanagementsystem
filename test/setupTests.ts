import '@testing-library/jest-dom'
import React from 'react'
declare const vi: any

// Mock Next.js modules that are problematic in test environments
vi.mock('next/image', () => ({
  default: (props: any) => {
    const { alt = '', ...rest } = props
    return React.createElement('img', { alt, ...rest })
  }
}))

vi.mock('next/link', () => ({
  default: (props: any) => React.createElement('a', { href: props.href, children: props.children })
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}))
