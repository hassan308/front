import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smidra - Din väg till drömjobbet',
  description: 'Hitta ditt nästa jobb och skapa professionella ansökningshandlingar med AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}