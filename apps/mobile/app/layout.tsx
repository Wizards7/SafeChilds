import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";
import "@fontsource-variable/inter";
import "@safechilds/ui/app.css";
import "./shell.css";
import { BottomNav } from "../components/BottomNav";
import { DeviceShell } from "../components/DeviceShell";
import { HelpButton } from "../components/HelpButton";
import { Providers } from "../components/Providers";

export const metadata: Metadata = {
  title: "SafeChilds",
  description: "Что-то случилось в интернете? Поможем понять, что делать.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "SafeChilds" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8fafc",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <Providers>
            <DeviceShell>
              {children}
              <HelpButton />
              <BottomNav />
            </DeviceShell>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
