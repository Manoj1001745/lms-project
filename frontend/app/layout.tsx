import type { Metadata } from "next";
import { SessionHydrator } from "@/components/auth/session-hydrator";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearningHun LMS",
  description: "Enterprise learning management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <SessionHydrator />
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

