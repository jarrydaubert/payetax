import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata = {
  title: 'ToolHubX | Free UK Tax Calculators',
  description: 'ToolHubX provides free, HMRC-compliant tax calculators for UK limited companies, self-employed individuals, and personal taxes. Simplify your financial planning today.',
  keywords: 'UK tax calculators, limited company tax, self-employed tax, percentage calculator, HMRC, ToolHubX',
  robots: 'index, follow',
};

export const generateViewport = () => ({
  width: 'device-width',
  initialScale: 1,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="keywords" content={metadata.keywords} />
        <meta name="description" content={metadata.description} />
        <meta name="robots" content={metadata.robots} />
        <link rel="canonical" href="https://toolhubx.uk/" />
        <script
          src="https://kit.fontawesome.com/5461afae46.js"
          crossOrigin="anonymous"
          async
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-99DW6ZQWMT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-99DW6ZQWMT');
          `}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col bg-gray-800">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}