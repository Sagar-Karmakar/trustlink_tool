import { Head, Link, usePage, router } from '@inertiajs/react';
import { Search, Share2, Megaphone, Image as ImageIcon, ExternalLink, Folder, ArrowRight, ArrowLeft, Edit, Trash2, PlusCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ShareableContent {
    id: number;
    title: string;
    image_path: string | null;
    content: string | null;
    category?: {
        id: number;
        name: string;
        slug: string;
    } | null;
    created_at: string;
}

type Category = {
    id: number;
    name: string;
    slug: string;
    shareable_contents_count?: number;
};

interface Props {
    categories: Category[];
    contents: ShareableContent[];
    category: Category | null;
}

export default function PublicIndex({ categories = [], contents = [], category = null }: Props) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth?.user?.role === 'admin';
    const [search, setSearch] = useState('');

    const [deleteItem, setDeleteItem] = useState<ShareableContent | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isFiltered = category !== null;

    // Filters for categories or templates based on search
    const filteredCategories = useMemo(() => {
        if (isFiltered) return [];
        return categories.filter(c => 
            c.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [categories, search, isFiltered]);

    const filteredContents = useMemo(() => {
        if (!isFiltered) return [];
        return contents.filter(item => 
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            (item.content && item.content.toLowerCase().includes(search.toLowerCase()))
        );
    }, [contents, search, isFiltered]);

    const handleDelete = () => {
        if (!deleteItem) return;
        setIsDeleting(true);
        router.delete(`/shareable-contents/${deleteItem.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleteItem(null);
                setIsDeleting(false);
            }
        });
    };

    // Helper to strip HTML tags for text preview
    const stripHtml = (html: string | null) => {
        if (!html) return '';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl p-4 sm:p-6 bg-slate-950/5 text-slate-900 dark:text-zinc-100">
            <Head title="Quick Share" />

            {/* Ambient Background Glowing Blobs */}
            <div className="absolute -top-16 -left-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-blue-600/15 dark:bg-blue-600/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute top-1/2 -right-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-sky-500/15 dark:bg-sky-500/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute -bottom-16 left-1/3 w-56 sm:w-80 h-56 sm:h-80 rounded-full bg-indigo-900/15 dark:bg-indigo-900/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />

            <div className="relative z-10 mx-auto max-w-7xl space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-4 sm:p-6 rounded-2xl shadow-lg">
                    <div>
                        <div className="flex items-center gap-3">
                            {isFiltered && (
                                <Link 
                                    href="/contents"
                                    className="p-2.5 rounded-xl bg-white/50 dark:bg-zinc-900/50 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-200/50 dark:border-zinc-800/40 transition-all duration-200 shrink-0"
                                    title="Back to Categories"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            )}
                            <div className="p-2.5 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 shrink-0">
                                {isFiltered ? <Share2 className="h-6 w-6" /> : <Folder className="h-6 w-6" />}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 dark:from-blue-400 dark:via-blue-300 dark:to-sky-400 bg-clip-text text-transparent capitalize">
                                    {isFiltered ? `${category.name} Shares` : 'Quick Share Categories'}
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                                    {isFiltered 
                                        ? `Browse and copy post templates in the ${category.name} category.`
                                        : 'Organize your posts. Select a category below to view shareable contents.'}
                                </p>
                            </div>
                        </div>
                    </div>
                    {isAdmin && (
                        <div>
                            <Link href="/shareable-contents/create">
                                <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 rounded-xl px-5 py-2.5 transition-all duration-300 transform active:scale-95 gap-2 border-0">
                                    <PlusCircle className="h-4 w-4" />
                                    Add Quick Share
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-4 bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-5 rounded-2xl shadow-md">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                        <Input
                            type="text"
                            placeholder={isFiltered ? "Search templates by title..." : "Search categories by name..."}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/60 rounded-xl focus-visible:ring-sky-500/50"
                        />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium hidden sm:block">
                        {isFiltered 
                            ? `${filteredContents.length} templates available`
                            : `${filteredCategories.length} categories available`}
                    </div>
                </div>

                {/* Cards Grid */}
                {!isFiltered ? (
                    /* Categories Grid View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {filteredCategories.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-slate-400 dark:text-zinc-500">
                                No categories found matching your search.
                            </div>
                        ) : (
                            filteredCategories.map((c) => (
                                <Link 
                                    key={c.id} 
                                    href={`/contents?category=${c.slug}`}
                                    className="group relative overflow-hidden rounded-2xl border border-white/20 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-950/40 p-5 shadow-md backdrop-blur-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[140px]"
                                >
                                    {/* Ambient glow inside card */}
                                    <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 blur-2xl transition-all duration-300 pointer-events-none" />
                                    
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                <Folder className="h-5 w-5" />
                                            </div>
                                            <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-2 rounded-lg text-xs font-semibold">
                                                {c.shareable_contents_count || 0} share{c.shareable_contents_count !== 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                        <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 capitalize">
                                            {c.name}
                                        </h3>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-zinc-400">
                                        <span>Open Category</span>
                                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                ) : (
                    /* Templates Listing (Filtered) */
                    filteredContents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredContents.map((item) => {
                                const plainText = stripHtml(item.content);
                                const excerpt = plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;

                                return (
                                    <Card 
                                        key={item.id} 
                                        className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/5 transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1"
                                    >
                                        {/* Image Preview Container */}
                                        <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200/50 dark:border-zinc-800/30">
                                            {item.image_path ? (
                                                <img 
                                                    src={item.image_path} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                    <ImageIcon className="h-8 w-8" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                                <span className="text-xs font-semibold text-white flex items-center gap-1">
                                                    Open Share View <ExternalLink className="h-3 w-3" />
                                                </span>
                                            </div>
                                        </div>

                                        <CardHeader className="p-5 pb-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <CardTitle className="text-lg font-bold text-slate-900 dark:text-zinc-100 line-clamp-1 flex-1">
                                                    {item.title}
                                                </CardTitle>
                                                {item.category && (
                                                    <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/10 px-1.5 py-0.5 rounded-lg text-[9px] font-semibold capitalize shrink-0 tracking-wide">
                                                        {item.category.name}
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardDescription className="text-xs text-slate-500 dark:text-zinc-500">
                                                Created {new Date(item.created_at).toLocaleDateString()}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="p-5 pt-0 pb-4 flex-1">
                                            <p className="text-sm text-slate-600 dark:text-zinc-400 line-clamp-3">
                                                {excerpt || 'No descriptive text template.'}
                                            </p>
                                        </CardContent>

                                        <CardFooter className="p-5 pt-0 border-t border-zinc-200/40 dark:border-zinc-800/20 bg-zinc-500/5 flex items-center justify-between gap-2">
                                            <Link href={`/contents/${item.id}`} className="flex-1 mt-4">
                                                <Button className="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold shadow-md shadow-blue-500/10 rounded-xl transition-all duration-300 gap-2 border-0">
                                                    <Share2 className="h-4 w-4" />
                                                    Share / Copy
                                                </Button>
                                            </Link>
                                            {isAdmin && (
                                                <div className="flex gap-2 mt-4">
                                                    <Link href={`/shareable-contents/${item.id}/edit`}>
                                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border border-zinc-250 dark:border-zinc-800 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200 shrink-0">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="outline" 
                                                        size="icon" 
                                                        onClick={() => setDeleteItem(item)}
                                                        className="h-9 w-9 rounded-xl border border-zinc-250 dark:border-zinc-800 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-200 shrink-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-12 text-center rounded-2xl">
                            <p className="text-slate-500 dark:text-zinc-400 font-medium">No Quick Share templates found in this category.</p>
                        </div>
                    )
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteItem !== null} onOpenChange={(open) => !open && setDeleteItem(null)}>
                <DialogContent className="max-w-[95vw] sm:max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                            Delete Quick Share
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500 dark:text-zinc-400 pt-2">
                            Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-zinc-300">"{deleteItem?.title}"</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
                        <Button 
                            variant="ghost" 
                            onClick={() => setDeleteItem(null)}
                            disabled={isDeleting}
                            className="w-full sm:w-auto rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Content'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
