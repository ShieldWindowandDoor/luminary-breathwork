import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luminaries",
  description:
    "A breathwork app with guided rhythmic breathing and breath hold tracking.",
};

const themeBoot = `(function(){try{var raw=localStorage.getItem('prana-settings');var theme='night';if(raw){var s=JSON.parse(raw);if(s&&s.theme==='day')theme='day';}document.documentElement.setAttribute('data-theme',theme);}catch(e){document.documentElement.setAttribute('data-theme','night');}})();`;

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" data-theme="night" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

