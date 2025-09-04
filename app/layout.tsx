import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sudoku Solver',
  description:
    'A modern, high-performance Sudoku solver and puzzle generator with optimized algorithms and intelligent hints',
  keywords: [
    'sudoku',
    'solver',
    'puzzle',
    'game',
    'logic',
    'generator',
    'next.js',
  ],
  authors: [{ name: 'Sudoku Solver' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.svg', sizes: '16x16', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
