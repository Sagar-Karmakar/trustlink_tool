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
        <AppShell
            variant="sidebar"
            className="relative min-h-screen w-full overflow-x-hidden"
        >
            {/* Global Ambient Background Glowing Blobs for Glassmorphism */}
            <div className="pointer-events-none absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-600/8 blur-3xl dark:bg-blue-600/4" />
            <div className="pointer-events-none absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-sky-500/8 blur-3xl dark:bg-sky-500/4" />

            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="relative z-10 flex min-h-screen flex-col overflow-x-hidden"
            >
                <div className="flex-1 pb-10">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </div>
                <footer className="mt-auto border-t border-zinc-200/50 bg-white/30 px-6 py-5 text-xs text-slate-500 backdrop-blur-sm dark:border-zinc-800/40 dark:bg-zinc-950/20 dark:text-zinc-500">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
                        <span>
                            &copy; {new Date().getFullYear()} Transource
                            Business Solutions Private Limited. All rights
                            reserved.
                        </span>
                        <span>
                            Built by{' '}
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                Sagar
                            </span>
                        </span>
                    </div>
                </footer>
            </AppContent>
        </AppShell>
    );
}
