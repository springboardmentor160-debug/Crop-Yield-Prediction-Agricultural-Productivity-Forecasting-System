import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YieldSense AI',
  description: 'Crop yield forecasting and agricultural risk assessment platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
