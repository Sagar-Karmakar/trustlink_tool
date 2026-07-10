import { Head, Link, router } from '@inertiajs/react';
import {
    Edit,
    Search,
    Trash2,
    Megaphone,
    PlusCircle,
    ExternalLink,
    Image,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export default function ShareableContentsIndex({
    contents,
}: {
    contents: ShareableContent[];
}) {
    const [search, setSearch] = useState('');
    const [deleteItem, setDeleteItem] = useState<ShareableContent | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredContents = useMemo(() => {
        return contents.filter(
            (item) =>
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                (item.content &&
                    item.content.toLowerCase().includes(search.toLowerCase())),
        );
    }, [contents, search]);

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

    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl bg-slate-950/5 p-4 text-slate-900 sm:p-6 dark:text-zinc-100">
            <Head title="Manage Shares" />

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
                            <div className="rounded-xl bg-blue-600/10 p-2.5 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400">
                                <Megaphone className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:via-blue-300 dark:to-sky-400">
                                    Manage Quick Share
                                </h1>
                                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                                    Create and manage social media post
                                    templates with rich text and images.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Link href="/shareable-contents/create">
                            <Button className="w-full transform gap-2 rounded-xl border-0 bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-500 hover:to-sky-400 hover:shadow-blue-500/40 active:scale-95 sm:w-auto">
                                <PlusCircle className="h-4 w-4" />
                                Add Quick Share
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters & Content Section */}
                <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/45 shadow-lg backdrop-blur-xl dark:border-zinc-800/40 dark:bg-zinc-950/45">
                    {/* Search and count */}
                    <div className="flex flex-col gap-4 border-b border-zinc-200/50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800/40">
                        <div className="relative max-w-md flex-1">
                            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                            <Input
                                type="text"
                                placeholder="Search shares by title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="rounded-xl border border-zinc-200/50 bg-white/30 pl-10 backdrop-blur-md focus-visible:ring-sky-500/50 dark:border-zinc-800/60 dark:bg-zinc-900/30"
                            />
                        </div>
                        <div className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                            Showing {filteredContents.length} of{' '}
                            {contents.length} shares
                        </div>
                    </div>

                    {/* Table View & Responsive Mobile Cards */}
                    <>
                        {/* Desktop/Tablet Table View */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-zinc-200/50 bg-zinc-500/5 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:border-zinc-800/40 dark:text-zinc-400">
                                        <th className="px-6 py-4">Image</th>
                                        <th className="px-6 py-4">Title</th>
                                        <th className="px-6 py-4">
                                            Created At
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200/40 text-sm dark:divide-zinc-800/30">
                                    {filteredContents.length > 0 ? (
                                        filteredContents.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="group transition-colors hover:bg-zinc-500/5"
                                            >
                                                <td className="px-6 py-4">
                                                    {item.image_path ? (
                                                        <img
                                                            src={
                                                                item.image_path
                                                            }
                                                            alt={item.title}
                                                            className="h-12 w-12 rounded-lg border border-zinc-200 object-cover shadow-sm dark:border-zinc-800"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-100 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">
                                                            <Image className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-zinc-100">
                                                    <div>{item.title}</div>
                                                    {item.category && (
                                                        <Badge className="mt-1 rounded border border-blue-500/10 bg-blue-500/10 px-1.5 py-0 text-[10px] font-semibold tracking-wide text-blue-700 capitalize dark:text-blue-400">
                                                            {item.category.name}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-zinc-400">
                                                    {new Date(
                                                        item.created_at,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="space-x-2 px-6 py-4 text-right">
                                                    <Link
                                                        href={`/contents/${item.id}`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-lg hover:bg-blue-600/10 hover:text-blue-600 dark:hover:text-blue-400"
                                                        >
                                                            <ExternalLink className="h-4.5 w-4.5" />
                                                        </Button>
                                                    </Link>
                                                    <Link
                                                        href={`/shareable-contents/${item.id}/edit`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-lg hover:bg-amber-600/10 hover:text-amber-600 dark:hover:text-amber-400"
                                                        >
                                                            <Edit className="h-4.5 w-4.5" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            setDeleteItem(item)
                                                        }
                                                        className="h-9 w-9 rounded-lg hover:bg-rose-600/10 hover:text-rose-600 dark:hover:text-rose-400"
                                                    >
                                                        <Trash2 className="h-4.5 w-4.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="py-12 text-center font-medium text-slate-500 dark:text-zinc-400"
                                            >
                                                No Quick Share posts found.
                                                Click "Add Quick Share" to get
                                                started!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card List View */}
                        <div className="grid grid-cols-1 gap-4 p-5 md:hidden">
                            {filteredContents.length > 0 ? (
                                filteredContents.map((item) => (
                                    <div
                                        key={item.id}
                                        className="space-y-4 rounded-xl border border-zinc-200/50 bg-white/40 p-4 shadow-sm transition-all duration-300 hover:shadow dark:border-zinc-800/40 dark:bg-zinc-900/40"
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.image_path ? (
                                                <img
                                                    src={item.image_path}
                                                    alt={item.title}
                                                    className="h-12 w-12 shrink-0 rounded-lg border border-zinc-200 object-cover shadow-sm dark:border-zinc-800"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-100 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">
                                                    <Image className="h-5 w-5" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-zinc-100">
                                                    {item.title}
                                                </h3>
                                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                                    {item.category && (
                                                        <Badge className="rounded border border-blue-500/10 bg-blue-500/10 px-1.5 py-0 text-[9px] font-semibold tracking-wide text-blue-700 capitalize dark:text-blue-400">
                                                            {item.category.name}
                                                        </Badge>
                                                    )}
                                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                                                        {new Date(
                                                            item.created_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 border-t border-zinc-200/50 pt-2 dark:border-zinc-800/30">
                                            <Link href={`/contents/${item.id}`}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1 rounded-xl border-zinc-200/60 text-xs dark:border-zinc-800/60"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    View Share
                                                </Button>
                                            </Link>
                                            <Link
                                                href={`/shareable-contents/${item.id}/edit`}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="text-slate-655 h-8 w-8 rounded-xl border-zinc-200/60 dark:border-zinc-800/60 dark:text-zinc-400"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    setDeleteItem(item)
                                                }
                                                className="h-8 w-8 rounded-xl border-zinc-200/60 text-rose-600 hover:text-rose-600 dark:border-zinc-800/60"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center font-medium text-slate-500 dark:text-zinc-400">
                                    No Quick Share posts found. Click "Add Quick
                                    Share" to get started!
                                </div>
                            )}
                        </div>
                    </>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteItem !== null}
                onOpenChange={(open) => !open && setDeleteItem(null)}
            >
                <DialogContent className="rounded-2xl border border-zinc-200 bg-white/95 shadow-xl backdrop-blur-xl sm:max-w-md dark:border-zinc-800/80 dark:bg-zinc-950/95">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-zinc-100">
                            Delete Quick Share Content?
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-zinc-400">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                "{deleteItem?.title}"
                            </span>
                            ? This will permanently remove the record and delete
                            the uploaded image file. This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteItem(null)}
                            disabled={isDeleting}
                            className="rounded-xl border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-500"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Content'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
