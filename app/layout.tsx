
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ClientRecalcWatcher } from "@/components/shared/recalc-watcher";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinFlow - Personal Finance Manager",
  description: "Streamline your finances with intelligent tracking, smart categorization, and beautiful insights",
  keywords: "finflow, finance, budget, money, tracking, expenses, income, personal finance",
  authors: [{ name: "FinFlow App" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <ClientRecalcWatcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
