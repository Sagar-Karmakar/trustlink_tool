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
    HelpCircle,
    Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

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

export default function Dashboard({ stats, recentShares, recentTemplates }: DashboardProps) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth?.user?.role === 'admin';
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            setCurrentDate(now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }));
        };
        updateDateTime();
        const interval = setInterval(updateDateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl p-4 sm:p-6 bg-slate-950/5 text-slate-900 dark:text-zinc-100">
            <Head title="Dashboard" />

            {/* Ambient Background Glowing Blobs */}
            <div className="absolute -top-16 -left-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-blue-600/15 dark:bg-blue-600/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute top-1/2 -right-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-sky-500/15 dark:bg-sky-500/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute -bottom-16 left-1/3 w-56 sm:w-80 h-56 sm:h-80 rounded-full bg-indigo-900/15 dark:bg-indigo-900/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />

            <div className="relative z-10 mx-auto max-w-7xl space-y-6">
                
                {/* Greeting Panel */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 p-6 sm:p-8 rounded-2xl border border-white/10 dark:border-zinc-800/40 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 text-white">
                    {/* Glowing Mesh Inside Header */}
                    <div className="absolute top-0 right-0 w-[400px] h-full rounded-full bg-sky-400/20 dark:bg-blue-500/5 blur-3xl pointer-events-none" />
                    
                    <div className="space-y-2 relative z-10">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-white/20 hover:bg-white/35 text-white border-0 text-[10px] font-semibold uppercase tracking-wider py-0.5 px-2">
                                {isAdmin ? 'Administrator Portal' : 'User Workspace'}
                            </Badge>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Welcome back, {auth.user.name}!
                        </h1>
                        <p className="text-sm text-blue-100 dark:text-zinc-400 font-medium">
                            Here is a quick overview of your Trustlink Portal operations today.
                        </p>
                    </div>

                    {/* Date/Time widget */}
                    <div className="flex items-center gap-3 sm:gap-4 bg-black/10 dark:bg-zinc-850/40 border border-white/10 dark:border-zinc-800/60 p-3 sm:p-4 rounded-xl backdrop-blur-md relative z-10 self-start sm:self-center shrink-0">
                        <div className="p-2.5 rounded-lg bg-white/10 dark:bg-zinc-800/60">
                            <Calendar className="h-5 w-5 text-sky-200 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold tracking-wide text-white">{currentDate || 'Loading...'}</div>
                            <div className="text-xs text-blue-100 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{currentTime || '--:--'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Operations Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Stat Card 1: Quick Shares */}
                    <Card className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/15 transition-all" />
                        <CardHeader className="p-5 pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-450 flex items-center justify-between">
                                <span>Social Distribution</span>
                                <Share2 className="h-4.5 w-4.5 text-blue-500" />
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 pt-0">
                            <div className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50 group-hover:scale-105 origin-left transition-transform duration-300">
                                {stats.shares_count}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
                                Available Quick Share templates
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stat Card 2: PDF Templates */}
                    <Card className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/15 transition-all" />
                        <CardHeader className="p-5 pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-450 flex items-center justify-between">
                                <span>PDF Generators</span>
                                <FileText className="h-4.5 w-4.5 text-indigo-500" />
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 pt-0">
                            <div className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50 group-hover:scale-105 origin-left transition-transform duration-300">
                                {stats.templates_count}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
                                Active A4 PDF form templates
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stat Card 3: Users (Admin Only) or Role Info (User Only) */}
                    {isAdmin ? (
                        <Card className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all" />
                            <CardHeader className="p-5 pb-2">
                                <CardDescription className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-450 flex items-center justify-between">
                                    <span>Portal Access</span>
                                    <Users className="h-4.5 w-4.5 text-emerald-500" />
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                                <div className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50 group-hover:scale-105 origin-left transition-transform duration-300">
                                    {stats.users_count}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
                                    Registered user accounts
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all" />
                            <CardHeader className="p-5 pb-2">
                                <CardDescription className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-450 flex items-center justify-between">
                                    <span>User Privileges</span>
                                    <Shield className="h-4.5 w-4.5 text-emerald-500" />
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                                <div className="text-xl font-extrabold text-slate-900 dark:text-zinc-50 flex items-center gap-1.5 py-1">
                                    Standard Account
                                </div>
                                <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-2">
                                    Access to templates & quick shares
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Lists Columns Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Column A: Recent Quick Shares */}
                    <Card className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-2xl shadow-lg overflow-hidden flex flex-col">
                        <CardHeader className="p-5 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/40 flex flex-row items-center justify-between bg-zinc-500/5">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Share2 className="h-4 w-4 text-blue-500" />
                                    Recent Quick Shares
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">Quickly share or copy recent promotional posts.</CardDescription>
                            </div>
                            <Link href="/contents">
                                <Button variant="ghost" size="sm" className="text-xs font-semibold gap-1 text-blue-600 dark:text-blue-400 hover:bg-blue-600/10">
                                    Browse All <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-5 flex-1 divide-y divide-zinc-200/40 dark:divide-zinc-800/30">
                            {recentShares.length > 0 ? (
                                recentShares.map((item) => (
                                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group">
                                        <div className="flex items-center gap-3">
                                            {item.image_path ? (
                                                <img 
                                                    src={item.image_path} 
                                                    alt={item.title} 
                                                    className="h-10 w-10 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400">
                                                    <ImageIcon className="h-4 w-4" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {item.title}
                                                </div>
                                                <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                                                    Created {new Date(item.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/contents/${item.id}`}>
                                            <Button size="sm" variant="ghost" className="h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs px-2.5 gap-1 text-slate-700 dark:text-zinc-300">
                                                Share <ChevronRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-xs text-slate-500 dark:text-zinc-500 font-medium">
                                    No Quick Share templates available.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Column B: Recent PDF Templates */}
                    <Card className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-2xl shadow-lg overflow-hidden flex flex-col">
                        <CardHeader className="p-5 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/40 flex flex-row items-center justify-between bg-zinc-500/5">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-indigo-500" />
                                    Recent PDF Templates
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">Fill details and generate dynamic print PDF files.</CardDescription>
                            </div>
                            <Link href="/pdf-templates">
                                <Button variant="ghost" size="sm" className="text-xs font-semibold gap-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600/10">
                                    Browse All <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-5 flex-1 divide-y divide-zinc-200/40 dark:divide-zinc-800/30">
                            {recentTemplates.length > 0 ? (
                                recentTemplates.map((item) => (
                                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                                <FileText className="h-4.5 w-4.5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {item.name}
                                                </div>
                                                <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                                                    {item.category && (
                                                        <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/10 px-1.5 py-0 rounded-md text-[9px] font-semibold uppercase tracking-wide">
                                                            {item.category.name}
                                                        </Badge>
                                                    )}
                                                    <span>Created {new Date(item.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/pdf-templates/${item.id}/fill`}>
                                            <Button size="sm" variant="ghost" className="h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs px-2.5 gap-1 text-slate-700 dark:text-zinc-300">
                                                Fill Form <ChevronRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-xs text-slate-500 dark:text-zinc-500 font-medium">
                                    No PDF templates available.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions Panel */}
                <div className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-4 sm:p-6 rounded-2xl shadow-lg space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                        <LayoutGrid className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                        Portal Quick Actions
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Action 1: Browse shares */}
                        <Link href="/contents" className="block p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850 bg-zinc-500/5 hover:bg-zinc-500/10 dark:hover:bg-zinc-900/50 hover:shadow transition-all group">
                            <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200" />
                            <div className="font-semibold text-sm text-slate-800 dark:text-zinc-200 mt-2">Quick Shares</div>
                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Find & share content</div>
                        </Link>

                        {/* Action 2: PDF templates */}
                        <Link href="/pdf-templates" className="block p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850 bg-zinc-500/5 hover:bg-zinc-500/10 dark:hover:bg-zinc-900/50 hover:shadow transition-all group">
                            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-200" />
                            <div className="font-semibold text-sm text-slate-800 dark:text-zinc-200 mt-2">PDF Templates</div>
                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Fill & generate documents</div>
                        </Link>

                        {/* Action 3: Manage quick shares (Admin Only) or Account security */}
                        {isAdmin ? (
                            <Link href="/shareable-contents" className="block p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850 bg-zinc-500/5 hover:bg-zinc-500/10 dark:hover:bg-zinc-900/50 hover:shadow transition-all group">
                                <PlusCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
                                <div className="font-semibold text-sm text-slate-800 dark:text-zinc-200 mt-2">Manage Shares</div>
                                <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">CRUD quick shares</div>
                            </Link>
                        ) : (
                            <Link href="/settings/profile" className="block p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850 bg-zinc-500/5 hover:bg-zinc-500/10 dark:hover:bg-zinc-900/50 hover:shadow transition-all group">
                                <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
                                <div className="font-semibold text-sm text-slate-800 dark:text-zinc-200 mt-2">My Profile</div>
                                <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Manage personal info</div>
                            </Link>
                        )}

                        {/* Action 4: Users management (Admin Only) or Security Settings */}
                        {isAdmin ? (
                            <Link href="/users" className="block p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850 bg-zinc-500/5 hover:bg-zinc-500/10 dark:hover:bg-zinc-900/50 hover:shadow transition-all group">
                                <Users className="h-5 w-5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-200" />
                                <div className="font-semibold text-sm text-slate-800 dark:text-zinc-200 mt-2">Users Directory</div>
                                <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Manage user access</div>
                            </Link>
                        ) : (
                            <Link href="/settings/security" className="block p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850 bg-zinc-500/5 hover:bg-zinc-500/10 dark:hover:bg-zinc-900/50 hover:shadow transition-all group">
                                <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-200" />
                                <div className="font-semibold text-sm text-slate-800 dark:text-zinc-200 mt-2">Security Hub</div>
                                <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">Update passkeys & pass</div>
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
