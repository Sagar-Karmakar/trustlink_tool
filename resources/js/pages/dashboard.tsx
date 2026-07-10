import { Head, Link, usePage } from '@inertiajs/react';
import {
    Share2,
    FileText,
    Users,
    ArrowRight,
    Calendar,
    Clock,
    Shield,
    LayoutGrid,
    Settings,
    PlusCircle,
    User,
    ChevronRight,
    Image as ImageIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface RecentShare {
    id: number;
    title: string;
    image_path: string | null;
    created_at: string;
}

interface RecentTemplate {
    id: number;
    name: string;
    created_at: string;
    category?: {
        id: number;
        name: string;
        slug: string;
    } | null;
}

interface DashboardProps {
    stats: {
        shares_count: number;
        templates_count: number;
        users_count?: number;
    };
    recentShares: RecentShare[];
    recentTemplates: RecentTemplate[];
}

export default function Dashboard({
    stats,
    recentShares,
    recentTemplates,
}: DashboardProps) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth?.user?.role === 'admin';
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            );
            setCurrentDate(
                now.toLocaleDateString([], {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                }),
            );
        };
        updateDateTime();
        const interval = setInterval(updateDateTime, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl bg-slate-950/5 p-4 text-slate-900 sm:p-6 dark:text-zinc-100">
            <Head title="Dashboard" />

            {/* Ambient Background Glowing Blobs */}
            <div
                className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 animate-pulse rounded-full bg-blue-600/15 blur-3xl sm:h-96 sm:w-96 dark:bg-blue-600/10"
                style={{ animationDuration: '8s' }}
            />
            <div
                className="pointer-events-none absolute top-1/2 -right-16 h-64 w-64 animate-pulse rounded-full bg-sky-500/15 blur-3xl sm:h-96 sm:w-96 dark:bg-sky-500/10"
                style={{ animationDuration: '6s' }}
            />
            <div
                className="pointer-events-none absolute -bottom-16 left-1/3 h-56 w-56 animate-pulse rounded-full bg-indigo-900/15 blur-3xl sm:h-80 sm:w-80 dark:bg-indigo-900/10"
                style={{ animationDuration: '10s' }}
            />

            <div className="relative z-10 mx-auto max-w-7xl space-y-6">
                {/* Greeting Panel */}
                <div className="relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8 dark:border-zinc-800/40 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950">
                    {/* Glowing Mesh Inside Header */}
                    <div className="pointer-events-none absolute top-0 right-0 h-full w-[400px] rounded-full bg-sky-400/20 blur-3xl dark:bg-blue-500/5" />

                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge className="border-0 bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase hover:bg-white/35">
                                {isAdmin
                                    ? 'Administrator Portal'
                                    : 'User Workspace'}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                            Welcome back, {auth.user.name}!
                        </h1>
                        <p className="text-sm font-medium text-blue-100 dark:text-zinc-400">
                            Here is a quick overview of your TrustGenie Portal
                            operations today.
                        </p>
                    </div>

                    {/* Date/Time widget */}
                    <div className="dark:bg-zinc-850/40 relative z-10 flex shrink-0 items-center gap-3 self-start rounded-xl border border-white/10 bg-black/10 p-3 backdrop-blur-md sm:gap-4 sm:self-center sm:p-4 dark:border-zinc-800/60">
                        <div className="rounded-lg bg-white/10 p-2.5 dark:bg-zinc-800/60">
                            <Calendar className="h-5 w-5 text-sky-200 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold tracking-wide text-white">
                                {currentDate || 'Loading...'}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-blue-100 dark:text-zinc-400">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{currentTime || '--:--'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Operations Stats Section */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Stat Card 1: Quick Shares */}
                    <Card className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/45 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 dark:border-zinc-800/40 dark:bg-zinc-950/45">
                        <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:bg-blue-500/15" />
                        <CardHeader className="p-5 pb-2">
                            <CardDescription className="dark:text-zinc-450 flex items-center justify-between text-xs font-bold tracking-wider text-slate-500 uppercase">
                                <span>Social Distribution</span>
                                <Share2 className="h-4.5 w-4.5 text-blue-500" />
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 pt-0">
                            <div className="origin-left text-3xl font-extrabold text-slate-900 transition-transform duration-300 group-hover:scale-105 dark:text-zinc-50">
                                {stats.shares_count}
                            </div>
                            <div className="mt-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
                                Available Quick Share templates
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stat Card 2: PDF Templates */}
                    <Card className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/45 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 dark:border-zinc-800/40 dark:bg-zinc-950/45">
                        <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl transition-all group-hover:bg-indigo-500/15" />
                        <CardHeader className="p-5 pb-2">
                            <CardDescription className="dark:text-zinc-450 flex items-center justify-between text-xs font-bold tracking-wider text-slate-500 uppercase">
                                <span>Quick Docx</span>
                                <FileText className="h-4.5 w-4.5 text-indigo-500" />
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 pt-0">
                            <div className="origin-left text-3xl font-extrabold text-slate-900 transition-transform duration-300 group-hover:scale-105 dark:text-zinc-50">
                                {stats.templates_count}
                            </div>
                            <div className="mt-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
                                Active A4 template forms
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stat Card 3: Users (Admin Only) or Role Info (User Only) */}
                    {isAdmin ? (
                        <Card className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/45 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 dark:border-zinc-800/40 dark:bg-zinc-950/45">
                            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/15" />
                            <CardHeader className="p-5 pb-2">
                                <CardDescription className="dark:text-zinc-450 flex items-center justify-between text-xs font-bold tracking-wider text-slate-500 uppercase">
                                    <span>Portal Access</span>
                                    <Users className="h-4.5 w-4.5 text-emerald-500" />
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                                <div className="origin-left text-3xl font-extrabold text-slate-900 transition-transform duration-300 group-hover:scale-105 dark:text-zinc-50">
                                    {stats.users_count}
                                </div>
                                <div className="mt-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
                                    Registered user accounts
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/45 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 dark:border-zinc-800/40 dark:bg-zinc-950/45">
                            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/15" />
                            <CardHeader className="p-5 pb-2">
                                <CardDescription className="dark:text-zinc-450 flex items-center justify-between text-xs font-bold tracking-wider text-slate-500 uppercase">
                                    <span>User Privileges</span>
                                    <Shield className="h-4.5 w-4.5 text-emerald-500" />
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                                <div className="flex items-center gap-1.5 py-1 text-xl font-extrabold text-slate-900 dark:text-zinc-50">
                                    Standard Account
                                </div>
                                <div className="mt-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
                                    Access to Quick Docx & Quick Share templates
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Lists Columns Section */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Column A: Recent Quick Shares */}
                    <Card className="flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/45 shadow-lg backdrop-blur-xl dark:border-zinc-800/40 dark:bg-zinc-950/45">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-200/50 bg-zinc-500/5 p-5 pb-3 dark:border-zinc-800/40">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-zinc-100">
                                    <Share2 className="h-4 w-4 text-blue-500" />
                                    Recent Quick Shares
                                </CardTitle>
                                <CardDescription className="mt-0.5 text-xs">
                                    Quickly share or copy recent promotional
                                    posts.
                                </CardDescription>
                            </div>
                            <Link href="/contents">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-600/10 dark:text-blue-400"
                                >
                                    Browse All{' '}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="flex-1 divide-y divide-zinc-200/40 p-5 dark:divide-zinc-800/30">
                            {recentShares.length > 0 ? (
                                recentShares.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.image_path ? (
                                                <img
                                                    src={item.image_path}
                                                    alt={item.title}
                                                    className="h-10 w-10 rounded-lg border border-zinc-200 object-cover shadow-sm dark:border-zinc-800"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">
                                                    <ImageIcon className="h-4 w-4" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="line-clamp-1 text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                                                    {item.title}
                                                </div>
                                                <div className="mt-0.5 text-[10px] text-slate-400 dark:text-zinc-500">
                                                    Created{' '}
                                                    {new Date(
                                                        item.created_at,
                                                    ).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/contents/${item.id}`}>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 gap-1 rounded-lg px-2.5 text-xs text-slate-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                                            >
                                                Share{' '}
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-xs font-medium text-slate-500 dark:text-zinc-500">
                                    No Quick Share templates available.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Column B: Recent PDF Templates */}
                    <Card className="flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/45 shadow-lg backdrop-blur-xl dark:border-zinc-800/40 dark:bg-zinc-950/45">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-200/50 bg-zinc-500/5 p-5 pb-3 dark:border-zinc-800/40">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-zinc-100">
                                    <FileText className="h-4 w-4 text-indigo-500" />
                                    Recent Quick Docx
                                </CardTitle>
                                <CardDescription className="mt-0.5 text-xs">
                                    Fill details and generate dynamic print
                                    documents.
                                </CardDescription>
                            </div>
                            <Link href="/pdf-templates">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-600/10 dark:text-indigo-400"
                                >
                                    Browse All{' '}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="flex-1 divide-y divide-zinc-200/40 p-5 dark:divide-zinc-800/30">
                            {recentTemplates.length > 0 ? (
                                recentTemplates.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-indigo-500/10 p-2.5 text-indigo-600 dark:text-indigo-400">
                                                <FileText className="h-4.5 w-4.5" />
                                            </div>
                                            <div>
                                                <div className="line-clamp-1 text-sm font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                                                    {item.name}
                                                </div>
                                                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 dark:text-zinc-500">
                                                    {item.category && (
                                                        <Badge className="rounded-md border border-indigo-500/10 bg-indigo-500/10 px-1.5 py-0 text-[9px] font-semibold tracking-wide text-indigo-700 uppercase dark:text-indigo-400">
                                                            {item.category.name}
                                                        </Badge>
                                                    )}
                                                    <span>
                                                        Created{' '}
                                                        {new Date(
                                                            item.created_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/pdf-templates/${item.id}/fill`}
                                        >
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 gap-1 rounded-lg px-2.5 text-xs text-slate-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                                            >
                                                Fill Form{' '}
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-xs font-medium text-slate-500 dark:text-zinc-500">
                                    No Quick Docx templates available.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions Panel */}
                <div className="space-y-4 rounded-2xl border border-white/20 bg-white/45 p-4 shadow-lg backdrop-blur-xl sm:p-6 dark:border-zinc-800/40 dark:bg-zinc-950/45">
                    <h2 className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-500 uppercase dark:text-zinc-400">
                        <LayoutGrid className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                        Portal Quick Actions
                    </h2>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {/* Action 1: Browse shares */}
                        <Link
                            href="/contents"
                            className="dark:border-zinc-850 group block rounded-xl border border-zinc-200/50 bg-zinc-500/5 p-4 transition-all hover:bg-zinc-500/10 hover:shadow dark:hover:bg-zinc-900/50"
                        >
                            <Share2 className="h-5 w-5 text-blue-600 transition-transform duration-200 group-hover:scale-110 dark:text-blue-400" />
                            <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-zinc-200">
                                Quick Share
                            </div>
                            <div className="mt-0.5 text-[10px] text-slate-400 dark:text-zinc-500">
                                Find & share content
                            </div>
                        </Link>

                        {/* Action 2: PDF templates */}
                        <Link
                            href="/pdf-templates"
                            className="dark:border-zinc-850 group block rounded-xl border border-zinc-200/50 bg-zinc-500/5 p-4 transition-all hover:bg-zinc-500/10 hover:shadow dark:hover:bg-zinc-900/50"
                        >
                            <FileText className="h-5 w-5 text-indigo-600 transition-transform duration-200 group-hover:scale-110 dark:text-indigo-400" />
                            <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-zinc-200">
                                Quick Docx
                            </div>
                            <div className="mt-0.5 text-[10px] text-slate-400 dark:text-zinc-500">
                                Fill & generate documents
                            </div>
                        </Link>

                        {/* Action 3: Manage quick shares (Admin Only) or Account security */}
                        {isAdmin ? (
                            <Link
                                href="/shareable-contents"
                                className="dark:border-zinc-850 group block rounded-xl border border-zinc-200/50 bg-zinc-500/5 p-4 transition-all hover:bg-zinc-500/10 hover:shadow dark:hover:bg-zinc-900/50"
                            >
                                <PlusCircle className="h-5 w-5 text-emerald-600 transition-transform duration-200 group-hover:scale-110 dark:text-emerald-400" />
                                <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-zinc-200">
                                    Manage Shares
                                </div>
                                <div className="mt-0.5 text-[10px] text-slate-400 dark:text-zinc-500">
                                    CRUD quick shares
                                </div>
                            </Link>
                        ) : (
                            <Link
                                href="/settings/profile"
                                className="dark:border-zinc-850 group block rounded-xl border border-zinc-200/50 bg-zinc-500/5 p-4 transition-all hover:bg-zinc-500/10 hover:shadow dark:hover:bg-zinc-900/50"
                            >
                                <User className="h-5 w-5 text-emerald-600 transition-transform duration-200 group-hover:scale-110 dark:text-emerald-400" />
                                <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-zinc-200">
                                    My Profile
                                </div>
                                <div className="mt-0.5 text-[10px] text-slate-400 dark:text-zinc-500">
                                    Manage personal info
                                </div>
                            </Link>
                        )}

                        {/* Action 4: Users management (Admin Only) or Security Settings */}
                        {isAdmin ? (
                            <Link
                                href="/users"
                                className="dark:border-zinc-850 group block rounded-xl border border-zinc-200/50 bg-zinc-500/5 p-4 transition-all hover:bg-zinc-500/10 hover:shadow dark:hover:bg-zinc-900/50"
                            >
                                <Users className="h-5 w-5 text-amber-600 transition-transform duration-200 group-hover:scale-110 dark:text-amber-400" />
                                <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-zinc-200">
                                    Users Directory
                                </div>
                                <div className="mt-0.5 text-[10px] text-slate-400 dark:text-zinc-500">
                                    Manage user access
                                </div>
                            </Link>
                        ) : (
                            <Link
                                href="/settings/security"
                                className="dark:border-zinc-850 group block rounded-xl border border-zinc-200/50 bg-zinc-500/5 p-4 transition-all hover:bg-zinc-500/10 hover:shadow dark:hover:bg-zinc-900/50"
                            >
                                <Settings className="h-5 w-5 text-amber-600 transition-transform duration-200 group-hover:scale-110 dark:text-amber-400" />
                                <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-zinc-200">
                                    Security Hub
                                </div>
                                <div className="mt-0.5 text-[10px] text-slate-400 dark:text-zinc-500">
                                    Update passkeys & pass
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};
