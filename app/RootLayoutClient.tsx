'use client'

import { ThemeProvider } from './context/ThemeContext'

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body className="transition-colors duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
