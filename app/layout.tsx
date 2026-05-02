import { Playfair_Display, Outfit } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { auth } from '@/auth';
import { SalonSidebar } from '@/components/salon/salon-sidebar';
import { SalonHeader } from '@/components/salon/salon-header';
import { TooltipProvider } from '@/components/ui/tooltip';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        'antialiased',
        outfit.variable,
        'font-sans',
        playfair.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
              <SalonSidebar />
              <div className="flex h-screen flex-col">
                <SalonHeader user={session?.user} />
                <main className="flex-1 overflow-auto p-4 lg:p-6">
                  {children}
                </main>
              </div>
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
