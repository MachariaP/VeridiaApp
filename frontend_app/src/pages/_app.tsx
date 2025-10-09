/**
 * Main Application Component
 * Modern, Mobile-First Design
 */
import type { AppProps } from 'next/app'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
