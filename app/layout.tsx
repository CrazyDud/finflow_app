
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { OnboardingProvider } from "@/components/shared/onboarding/OnboardingProvider";
import { ClientRecalcWatcher } from "@/components/shared/recalc-watcher";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { GlobalAutoTranslate } from "@/components/i18n/auto-translate";

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
          <I18nProvider>
            <OnboardingProvider>
              {children}
              <Toaster />
              <ClientRecalcWatcher />
              <GlobalAutoTranslate />
            </OnboardingProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
