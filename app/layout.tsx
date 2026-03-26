// Root layout required by Next.js App Router.
// The actual HTML structure (html, body, providers) lives in app/[locale]/layout.tsx
// which is served for all locale-prefixed routes (the middleware ensures all
// requests are redirected to a locale-prefixed path).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
