// next-app/app/layout.tsx
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactNode } from "react";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/context/SidebarContext";
import { CreatorModeProvider } from "@/context/CreatorModeContext";

import { WagmiProviders } from "./providers/wagmi-provider";

export const metadata = {
  title: "SubHub",
  description: "",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
    
          <SidebarProvider>
            <WagmiProviders>
              <TooltipProvider>
                <Toaster richColors position="bottom-right" />
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  {children}
                </ThemeProvider>
              </TooltipProvider>
            </WagmiProviders>
          </SidebarProvider>
     
      </body>
    </html>
  );
}
