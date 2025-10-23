import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Movement Mini App Scaffold',
  description: 'Showcase of Movement Mini App SDK features',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0A0F1E] text-white">{children}</body>
    </html>
  );
}


