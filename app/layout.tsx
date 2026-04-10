import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TAレベルヘルスチェック v4',
  description: '4カテゴリ・11項目で投資先TAチームの成熟度を診断',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
