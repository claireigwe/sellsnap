import type { Metadata } from 'next';
import { Host_Grotesk } from 'next/font/google';
import { Sora } from 'next/font/google';
import './globals.css';

const hostGrotesk = Host_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-host-grotesk',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sora',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'SellSnap',
  description: 'Sell anything in seconds using just a link',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hostGrotesk.variable} ${sora.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="page-background">
          <div className="page-shape page-shape1" />
          <div className="page-shape page-shape2" />
        </div>
        {children}
      </body>
    </html>
  );
}
