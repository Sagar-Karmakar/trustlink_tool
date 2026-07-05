import { Head, Link, router } from '@inertiajs/react';
import { Edit, Search, Trash2, Megaphone, PlusCircle, ExternalLink, Image } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function ShareableContentsIndex({ contents }: { contents: ShareableContent[] }) {
    const [search, setSearch] = useState('');
    const [deleteItem, setDeleteItem] = useState<ShareableContent | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredContents = useMemo(() => {
        return contents.filter(item => 
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            (item.content && item.content.toLowerCase().includes(search.toLowerCase()))
        );
    }, [contents, search]);

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

    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl p-4 sm:p-6 bg-slate-950/5 text-slate-900 dark:text-zinc-100">
            <Head title="Manage Shares" />

            {/* Ambient Background Glowing Blobs */}
            <div className="absolute -top-16 -left-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-blue-600/15 dark:bg-blue-600/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute top-1/2 -right-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-sky-500/15 dark:bg-sky-500/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute -bottom-16 left-1/3 w-56 sm:w-80 h-56 sm:h-80 rounded-full bg-indigo-900/15 dark:bg-indigo-900/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />

            <div className="relative z-10 mx-auto max-w-7xl space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-4 sm:p-6 rounded-2xl shadow-lg">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400">
                                <Megaphone className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 dark:from-blue-400 dark:via-blue-300 dark:to-sky-400 bg-clip-text text-transparent">
                                    Manage Quick Shares
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                                    Create and manage social media post templates with rich text and images.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Link href="/shareable-contents/create">
                            <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 rounded-xl px-5 py-2.5 transition-all duration-300 transform active:scale-95 gap-2 border-0">
                                <PlusCircle className="h-4 w-4" />
                                Add Quick Share
                             </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters & Content Section */}
                <div className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-2xl shadow-lg overflow-hidden">
                    {/* Search and count */}
                    <div className="p-5 border-b border-zinc-200/50 dark:border-zinc-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                            <Input
                                type="text"
                                placeholder="Search shares by title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/60 rounded-xl focus-visible:ring-sky-500/50"
                            />
                        </div>
                        <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                            Showing {filteredContents.length} of {contents.length} shares
                        </div>
                    </div>

                    {/* Table View & Responsive Mobile Cards */}
                    <>
                        {/* Desktop/Tablet Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-500/5 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                                        <th className="py-4 px-6">Image</th>
                                        <th className="py-4 px-6">Title</th>
                                        <th className="py-4 px-6">Created At</th>
                                        <th className="py-4 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/30 text-sm">
                                    {filteredContents.length > 0 ? (
                                        filteredContents.map((item) => (
                                            <tr key={item.id} className="hover:bg-zinc-500/5 transition-colors group">
                                                <td className="py-4 px-6">
                                                    {item.image_path ? (
                                                        <img 
                                                            src={item.image_path} 
                                                            alt={item.title} 
                                                            className="h-12 w-12 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-400">
                                                            <Image className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 font-medium text-slate-900 dark:text-zinc-100">
                                                    <div>{item.title}</div>
                                                    {item.category && (
                                                        <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/10 px-1.5 py-0 rounded text-[10px] font-semibold mt-1 capitalize tracking-wide">
                                                            {item.category.name}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-slate-500 dark:text-zinc-400">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-6 text-right space-x-2">
                                                    <Link href={`/contents/${item.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-blue-600/10 hover:text-blue-600 dark:hover:text-blue-400">
                                                            <ExternalLink className="h-4.5 w-4.5" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/shareable-contents/${item.id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-amber-600/10 hover:text-amber-600 dark:hover:text-amber-400">
                                                            <Edit className="h-4.5 w-4.5" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => setDeleteItem(item)}
                                                        className="h-9 w-9 rounded-lg hover:bg-rose-600/10 hover:text-rose-600 dark:hover:text-rose-400"
                                                    >
                                                        <Trash2 className="h-4.5 w-4.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-slate-500 dark:text-zinc-400 font-medium">
                                                No Quick Shares found. Click "Add Quick Share" to get started!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card List View */}
                        <div className="grid grid-cols-1 gap-4 md:hidden p-5">
                            {filteredContents.length > 0 ? (
                                filteredContents.map((item) => (
                                    <div key={item.id} className="bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/40 p-4 rounded-xl space-y-4 shadow-sm hover:shadow transition-all duration-300">
                                        <div className="flex items-center gap-3">
                                            {item.image_path ? (
                                                <img 
                                                    src={item.image_path} 
                                                    alt={item.title} 
                                                    className="h-12 w-12 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm shrink-0"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-400 shrink-0">
                                                    <Image className="h-5 w-5" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100 truncate">{item.title}</h3>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    {item.category && (
                                                        <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/10 px-1.5 py-0 rounded text-[9px] font-semibold capitalize tracking-wide">
                                                            {item.category.name}
                                                        </Badge>
                                                    )}
                                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/30">
                                            <Link href={`/contents/${item.id}`}>
                                                <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1 border-zinc-200/60 dark:border-zinc-800/60">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    View Share
                                                </Button>
                                            </Link>
                                            <Link href={`/shareable-contents/${item.id}/edit`}>
                                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl border-zinc-200/60 dark:border-zinc-800/60 text-slate-655 dark:text-zinc-400">
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="outline" 
                                                size="icon" 
                                                onClick={() => setDeleteItem(item)}
                                                className="h-8 w-8 rounded-xl border-zinc-200/60 dark:border-zinc-800/60 text-rose-600 hover:text-rose-600"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-slate-500 dark:text-zinc-400 font-medium">
                                    No Quick Shares found. Click "Add Quick Share" to get started!
                                </div>
                            )}
                        </div>
                    </>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteItem !== null} onOpenChange={(open) => !open && setDeleteItem(null)}>
                <DialogContent className="sm:max-w-md bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                            Delete Quick Share Content?
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-zinc-400">
                            Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-zinc-200">"{deleteItem?.title}"</span>? This will permanently remove the record and delete the uploaded image file. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button 
                            variant="ghost" 
                            onClick={() => setDeleteItem(null)}
                            disabled={isDeleting}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Content'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
