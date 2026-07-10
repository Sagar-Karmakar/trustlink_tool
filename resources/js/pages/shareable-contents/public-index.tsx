import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    Search,
    Share2,
    Image as ImageIcon,
    ExternalLink,
    Folder,
    ArrowRight,
    ArrowLeft,
    Edit,
    Trash2,
    PlusCircle,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

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

export default function PublicIndex({
    categories = [],
    contents = [],
    category = null,
}: Props) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth?.user?.role === 'admin';
    const [search, setSearch] = useState('');

    const [deleteItem, setDeleteItem] = useState<ShareableContent | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isFiltered = category !== null;

    // Filters for categories or templates based on search
    const filteredCategories = useMemo(() => {
        if (isFiltered) {
return [];
}

        return categories.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase()),
        );
    }, [categories, search, isFiltered]);

    const filteredContents = useMemo(() => {
        if (!isFiltered) {
return [];
}

        return contents.filter(
            (item) =>
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                (item.content &&
                    item.content.toLowerCase().includes(search.toLowerCase())),
        );
    }, [contents, search, isFiltered]);

    const handleDelete = () => {
        if (!deleteItem) {
return;
}

        setIsDeleting(true);
        router.delete(`/shareable-contents/${deleteItem.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleteItem(null);
                setIsDeleting(false);
            },
        });
    };

    // Helper to strip HTML tags for text preview
    const stripHtml = (html: string | null) => {
        if (!html) {
return '';
}

        const doc = new DOMParser().parseFromString(html, 'text/html');

        return doc.body.textContent || '';
    };

    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl bg-slate-950/5 p-4 text-slate-900 sm:p-6 dark:text-zinc-100">
            <Head title="Quick Share" />

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
                {/* Header Section */}
                <div className="flex flex-col gap-4 rounded-2xl border border-white/20 bg-white/45 p-4 shadow-lg backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-zinc-800/40 dark:bg-zinc-950/45">
                    <div>
                        <div className="flex items-center gap-3">
                            {isFiltered && (
                                <Link
                                    href="/contents"
                                    className="shrink-0 rounded-xl border border-zinc-200/50 bg-white/50 p-2.5 transition-all duration-200 hover:bg-blue-500/10 hover:text-blue-600 dark:border-zinc-800/40 dark:bg-zinc-900/50 dark:hover:text-blue-400"
                                    title="Back to Categories"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            )}
                            <div className="shrink-0 rounded-xl bg-blue-600/10 p-2.5 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400">
                                {isFiltered ? (
                                    <Share2 className="h-6 w-6" />
                                ) : (
                                    <Folder className="h-6 w-6" />
                                )}
                            </div>
                            <div>
                                <h1 className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent capitalize dark:from-blue-400 dark:via-blue-300 dark:to-sky-400">
                                    {isFiltered
                                        ? `${category.name} Shares`
                                        : 'Quick Share Categories'}
                                </h1>
                                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
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
                                <Button className="w-full transform gap-2 rounded-xl border-0 bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-500 hover:to-sky-400 hover:shadow-blue-500/40 active:scale-95 sm:w-auto">
                                    <PlusCircle className="h-4 w-4" />
                                    Add Quick Share
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/20 bg-white/45 p-5 shadow-md backdrop-blur-xl dark:border-zinc-800/40 dark:bg-zinc-950/45">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                        <Input
                            type="text"
                            placeholder={
                                isFiltered
                                    ? 'Search templates by title...'
                                    : 'Search categories by name...'
                            }
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-xl border border-zinc-200/50 bg-white/30 pl-10 backdrop-blur-md focus-visible:ring-sky-500/50 dark:border-zinc-800/60 dark:bg-zinc-900/30"
                        />
                    </div>
                    <div className="hidden text-xs font-medium text-slate-500 sm:block dark:text-zinc-400">
                        {isFiltered
                            ? `${filteredContents.length} templates available`
                            : `${filteredCategories.length} categories available`}
                    </div>
                </div>

                {/* Cards Grid */}
                {!isFiltered ? (
                    /* Categories Grid View */
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {filteredCategories.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-slate-400 dark:text-zinc-500">
                                No categories found matching your search.
                            </div>
                        ) : (
                            filteredCategories.map((c) => (
                                <Link
                                    key={c.id}
                                    href={`/contents?category=${c.slug}`}
                                    className="group relative flex min-h-[140px] flex-col justify-between overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-5 shadow-md backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800/40 dark:bg-zinc-950/40"
                                >
                                    {/* Ambient glow inside card */}
                                    <div className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl transition-all duration-300 group-hover:bg-blue-500/20" />

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
                                                <Folder className="h-5 w-5" />
                                            </div>
                                            <Badge className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
                                                {c.shareable_contents_count ||
                                                    0}{' '}
                                                share
                                                {c.shareable_contents_count !==
                                                1
                                                    ? 's'
                                                    : ''}
                                            </Badge>
                                        </div>
                                        <h3 className="mt-4 text-lg font-bold text-slate-900 capitalize transition-colors duration-200 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                                            {c.name}
                                        </h3>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-zinc-400">
                                        <span>Open Category</span>
                                        <ArrowRight className="h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                ) : /* Templates Listing (Filtered) */
                filteredContents.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredContents.map((item) => {
                            const plainText = stripHtml(item.content);
                            const excerpt =
                                plainText.length > 120
                                    ? plainText.substring(0, 120) + '...'
                                    : plainText;

                            return (
                                <Card
                                    key={item.id}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/45 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 dark:border-zinc-800/40 dark:bg-zinc-950/45 dark:hover:shadow-blue-500/5"
                                >
                                    {/* Image Preview Container */}
                                    <div className="relative aspect-video w-full overflow-hidden border-b border-zinc-200/50 bg-zinc-100 dark:border-zinc-800/30 dark:bg-zinc-900">
                                        {item.image_path ? (
                                            <img
                                                src={item.image_path}
                                                alt={item.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-zinc-400">
                                                <ImageIcon className="h-8 w-8" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            <span className="flex items-center gap-1 text-xs font-semibold text-white">
                                                Open Share View{' '}
                                                <ExternalLink className="h-3 w-3" />
                                            </span>
                                        </div>
                                    </div>

                                    <CardHeader className="p-5 pb-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <CardTitle className="line-clamp-1 flex-1 text-lg font-bold text-slate-900 dark:text-zinc-100">
                                                {item.title}
                                            </CardTitle>
                                            {item.category && (
                                                <Badge className="shrink-0 rounded-lg border border-blue-500/10 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-blue-700 capitalize dark:text-blue-400">
                                                    {item.category.name}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardDescription className="text-xs text-slate-500 dark:text-zinc-500">
                                            Created{' '}
                                            {new Date(
                                                item.created_at,
                                            ).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex-1 p-5 pt-0 pb-4">
                                        <p className="line-clamp-3 text-sm text-slate-600 dark:text-zinc-400">
                                            {excerpt ||
                                                'No descriptive text template.'}
                                        </p>
                                    </CardContent>

                                    <CardFooter className="flex items-center justify-between gap-2 border-t border-zinc-200/40 bg-zinc-500/5 p-5 pt-0 dark:border-zinc-800/20">
                                        <Link
                                            href={`/contents/${item.id}`}
                                            className="mt-4 flex-1"
                                        >
                                            <Button className="w-full gap-2 rounded-xl border-0 bg-gradient-to-r from-blue-600 to-sky-500 font-semibold text-white shadow-md shadow-blue-500/10 transition-all duration-300 hover:from-blue-500 hover:to-sky-400">
                                                <Share2 className="h-4 w-4" />
                                                Share / Copy
                                            </Button>
                                        </Link>
                                        {isAdmin && (
                                            <div className="mt-4 flex gap-2">
                                                <Link
                                                    href={`/shareable-contents/${item.id}/edit`}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="border-zinc-250 h-9 w-9 shrink-0 rounded-xl border transition-colors duration-200 hover:bg-amber-500/10 hover:text-amber-600 dark:border-zinc-800 dark:hover:text-amber-400"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        setDeleteItem(item)
                                                    }
                                                    className="border-zinc-250 h-9 w-9 shrink-0 rounded-xl border transition-colors duration-200 hover:bg-rose-500/10 hover:text-rose-600 dark:border-zinc-800 dark:hover:text-rose-400"
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
                    <div className="rounded-2xl border border-white/20 bg-white/45 p-12 text-center backdrop-blur-xl dark:border-zinc-800/40 dark:bg-zinc-950/45">
                        <p className="font-medium text-slate-500 dark:text-zinc-400">
                            No Quick Share templates found in this category.
                        </p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteItem !== null}
                onOpenChange={(open) => !open && setDeleteItem(null)}
            >
                <DialogContent className="dark:border-zinc-850 max-w-[95vw] rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl sm:max-w-md dark:bg-zinc-950">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-zinc-100">
                            Delete Quick Share
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-sm text-slate-500 dark:text-zinc-400">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-slate-700 dark:text-zinc-300">
                                "{deleteItem?.title}"
                            </span>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteItem(null)}
                            disabled={isDeleting}
                            className="w-full rounded-xl border border-zinc-200 hover:bg-zinc-100 sm:w-auto dark:border-zinc-800 dark:hover:bg-zinc-900"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-500 sm:w-auto"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Content'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
