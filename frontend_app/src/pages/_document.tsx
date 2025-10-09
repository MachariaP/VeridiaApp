/**
 * Custom Document
 * Loads config.js BEFORE main application script
 * This ensures window.VERIDIA_CONFIG is available at runtime
 */
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Load runtime configuration BEFORE main script */}
        <script src="/config.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
