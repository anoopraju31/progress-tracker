import type { ReactNode } from "react";

import "./globals.css";

type Props = {
  children: ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <html
      lang="en"
      className='h-full antialiased'
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
