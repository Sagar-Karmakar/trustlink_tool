import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar" className="relative min-h-screen w-full overflow-x-hidden">
            {/* Global Ambient Background Glowing Blobs for Glassmorphism */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-600/8 dark:bg-blue-600/4 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-sky-500/8 dark:bg-sky-500/4 blur-3xl pointer-events-none" />
            
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden relative z-10 flex flex-col min-h-screen">
                <div className="flex-1 pb-10">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </div>
                <footer className="py-5 px-6 text-xs text-slate-500 dark:text-zinc-500 border-t border-zinc-200/50 dark:border-zinc-800/40 bg-white/30 dark:bg-zinc-950/20 backdrop-blur-sm mt-auto">
                    <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl">
                        <span>
                            &copy; {new Date().getFullYear()} Transource Business Solutions Private Limited. All rights reserved.
                        </span>
                        <span>
                            Built by <span className="font-semibold text-blue-600 dark:text-blue-400">Sagar</span>
                        </span>
                    </div>
                </footer>
            </AppContent>
        </AppShell>
    );
}
