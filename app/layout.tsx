import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { GOATCOUNTER_SITE_URL } from '@/lib/visits';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ho Quoc Bao — Software Engineer',
  description:
    'The personal portfolio of Ho Quoc Bao, a software engineer building practical products across web, mobile, and AI.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <script
          data-goatcounter={`${GOATCOUNTER_SITE_URL}/count`}
          data-goatcounter-settings='{"path":"/","no_events":true}'
          async
          src="https://gc.zgo.at/count.js"
        />
      </body>
    </html>
  );
}
