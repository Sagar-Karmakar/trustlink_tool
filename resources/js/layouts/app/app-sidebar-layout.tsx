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
            <AppContent variant="sidebar" className="overflow-x-hidden relative z-10">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
