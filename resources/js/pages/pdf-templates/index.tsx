import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, FileText, Plus, Trash2, Download, Search, ArrowLeft, Folder, ArrowRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Category = {
    id: number;
    name: string;
    slug: string;
    pdf_templates_count?: number;
};

type PdfTemplate = {
    id: number;
    name: string;
    content: string;
    variables: Record<string, { type: string; options?: string[] }> | null;
    category?: Category | null;
    created_at: string;
    updated_at: string;
};

type Props = {
    categories: Category[];
    templates: PdfTemplate[];
    category: Category | null;
};

export default function TemplatesIndex({ categories, templates, category }: Props) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth?.user?.role === 'admin';
    const [search, setSearch] = useState('');
    const [deleteTemplate, setDeleteTemplate] = useState<PdfTemplate | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isFiltered = category !== null;

    // Filters for categories or templates based on search
    const filteredCategories = useMemo(() => {
        if (isFiltered) return [];
        return categories.filter(c => 
            c.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [categories, search, isFiltered]);

    const filteredTemplates = useMemo(() => {
        if (!isFiltered) return [];
        return templates.filter(t => 
            t.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [templates, search, isFiltered]);

    const handleDelete = () => {
        if (!deleteTemplate) return;
        setIsDeleting(true);
        router.delete(`/pdf-templates/${deleteTemplate.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleteTemplate(null);
                setIsDeleting(false);
            }
        });
    };

    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl p-4 sm:p-6 bg-slate-950/5 text-slate-900 dark:text-zinc-100">
            {/* Ambient Background Glowing Blobs - Navy, Royal, and Sky Blue */}
            <div className="absolute -top-16 -left-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-blue-600/15 dark:bg-blue-600/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute top-1/2 -right-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-sky-500/15 dark:bg-sky-500/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute -bottom-16 left-1/3 w-56 sm:w-80 h-56 sm:h-80 rounded-full bg-indigo-900/15 dark:bg-indigo-900/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-7xl space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-4 sm:p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3">
                        {isFiltered && (
                            <Link 
                                href="/pdf-templates"
                                className="p-2.5 rounded-xl bg-white/50 dark:bg-zinc-900/50 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-200/50 dark:border-zinc-800/40 transition-all duration-200"
                                title="Back to Categories"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        )}
                        <div className="p-2.5 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400">
                            {isFiltered ? <FileText className="h-6 w-6" /> : <Folder className="h-6 w-6" />}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 dark:from-blue-400 dark:via-blue-300 dark:to-sky-400 bg-clip-text text-transparent capitalize">
                                {isFiltered ? `${category.name} Documents` : 'Quick Docx Categories'}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                                {isFiltered 
                                    ? `Browse and fill templates in the ${category.name} category.`
                                    : 'Organize your documents. Select a category below to view templates.'}
                            </p>
                        </div>
                    </div>
                    {isAdmin && (
                        <div>
                            <Link href="/pdf-templates/create">
                                <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 rounded-xl px-5 py-2.5 transition-all duration-300 transform active:scale-95 gap-2 border-0">
                                    <Plus className="h-4 w-4" />
                                    New Template
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Filter and Content Section */}
                <div className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-2xl shadow-lg overflow-hidden">
                    {/* Search and Quick Filters */}
                    <div className="p-5 border-b border-zinc-200/50 dark:border-zinc-800/40 flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                            <Input
                                type="text"
                                placeholder={isFiltered ? "Search templates by name..." : "Search categories by name..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/60 rounded-xl focus-visible:ring-sky-500/50"
                            />
                        </div>
                        <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                            {isFiltered 
                                ? `Showing ${filteredTemplates.length} of ${templates.length} templates`
                                : `Showing ${filteredCategories.length} of ${categories.length} categories`}
                        </div>
                    </div>

                    {/* Content Body */}
                    {!isFiltered ? (
                        /* Categories Grid View */
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {filteredCategories.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-slate-400 dark:text-zinc-500">
                                    No categories found matching your search.
                                </div>
                            ) : (
                                filteredCategories.map((c) => (
                                    <Link 
                                        key={c.id} 
                                        href={`/pdf-templates?category=${c.slug}`}
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
                                                    {c.pdf_templates_count || 0} template{c.pdf_templates_count !== 1 ? 's' : ''}
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
                        /* Templates Table & Responsive Mobile Cards (Filtered) */
                        <>
                            {/* Desktop/Tablet Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full min-w-[800px] border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                            <th className="py-4 px-6">Template Name</th>
                                            <th className="py-4 px-6">Variables Detected</th>
                                            <th className="py-4 px-6">Created Date</th>
                                            <th className="py-4 px-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/40 text-sm">
                                        {filteredTemplates.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                                                    No Quick Docx templates found in this category.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTemplates.map((template) => {
                                                const varCount = template.variables ? Object.keys(template.variables).length : 0;
                                                return (
                                                    <tr 
                                                        key={template.id} 
                                                        className="hover:bg-blue-50/20 dark:hover:bg-blue-955/10 transition-colors duration-200"
                                                    >
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/10">
                                                                    <FileText className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-slate-900 dark:text-zinc-100">{template.name}</div>
                                                                    {template.category && (
                                                                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 capitalize">
                                                                            Category: {template.category.name}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <Badge className="bg-blue-500/10 hover:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-lg text-xs font-semibold backdrop-blur-sm shadow-xs">
                                                                {varCount} variable{varCount !== 1 ? 's' : ''}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-4 px-6 text-slate-500 dark:text-zinc-400 text-xs">
                                                            {new Date(template.created_at).toLocaleDateString(undefined, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Link href={`/pdf-templates/${template.id}/fill`}>
                                                                    <Button 
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="rounded-xl border-zinc-200/60 dark:border-zinc-800/60 hover:bg-gradient-to-r hover:from-blue-600 hover:to-sky-500 hover:text-white hover:border-transparent transition-all duration-300 gap-1.5"
                                                                    >
                                                                        <Download className="h-3.5 w-3.5" />
                                                                        Fill & Download
                                                                    </Button>
                                                                </Link>

                                                                {isAdmin && (
                                                                    <>
                                                                        <Link href={`/pdf-templates/${template.id}/edit`}>
                                                                            <Button 
                                                                                variant="outline" 
                                                                                size="icon"
                                                                                className="h-9 w-9 rounded-xl border-zinc-200/60 dark:border-zinc-800/60 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/20 transition-all duration-200"
                                                                                title="Edit Template"
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                        </Link>

                                                                        <Button 
                                                                            variant="outline" 
                                                                            size="icon"
                                                                            onClick={() => setDeleteTemplate(template)}
                                                                            className="h-9 w-9 rounded-xl border-zinc-200/60 dark:border-zinc-800/60 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/20 transition-all duration-200"
                                                                            title="Delete Template"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card List View */}
                            <div className="grid grid-cols-1 gap-4 md:hidden p-5">
                                {filteredTemplates.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 dark:text-zinc-500">
                                        No Quick Docx templates found in this category.
                                    </div>
                                ) : (
                                    filteredTemplates.map((template) => {
                                        const varCount = template.variables ? Object.keys(template.variables).length : 0;
                                        return (
                                            <div key={template.id} className="bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/40 p-4 rounded-xl space-y-4 shadow-sm hover:shadow transition-all duration-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/10">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100 truncate">{template.name}</h3>
                                                        {template.category && (
                                                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 capitalize">
                                                                Category: {template.category.name}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge className="bg-blue-500/10 hover:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-lg text-[10px] font-semibold">
                                                                {varCount} variable{varCount !== 1 ? 's' : ''}
                                                            </Badge>
                                                            <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                                                                {new Date(template.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/30">
                                                    <Link href={`/pdf-templates/${template.id}/fill`} className="flex-1">
                                                        <Button 
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full rounded-xl text-xs gap-1 border-zinc-200/60 dark:border-zinc-800/60"
                                                        >
                                                            <Download className="h-3 w-3" />
                                                            Fill & Download
                                                        </Button>
                                                    </Link>
                                                    {isAdmin && (
                                                        <div className="flex gap-2 shrink-0">
                                                            <Link href={`/pdf-templates/${template.id}/edit`}>
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-xl border-zinc-200/60 dark:border-zinc-800/60 text-slate-655 dark:text-zinc-400"
                                                                >
                                                                    <Edit className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </Link>
                                                            <Button 
                                                                variant="outline" 
                                                                size="icon"
                                                                onClick={() => setDeleteTemplate(template)}
                                                                className="h-8 w-8 rounded-xl border-zinc-200/60 dark:border-zinc-800/60 text-rose-600 hover:text-rose-600"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Glassmorphic Delete Confirmation Dialog */}
            <Dialog open={deleteTemplate !== null} onOpenChange={(open) => !open && setDeleteTemplate(null)}>
                <DialogContent className="w-[95vw] sm:max-w-lg bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-2xl shadow-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500 dark:text-zinc-400 mt-2">
                            Are you sure you want to delete template <span className="font-semibold text-slate-800 dark:text-zinc-200">{deleteTemplate?.name}</span>? This action is permanent and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
                        <Button 
                            variant="outline" 
                            onClick={() => setDeleteTemplate(null)}
                            disabled={isDeleting}
                            className="w-full sm:w-auto rounded-xl border-zinc-200/60 dark:border-zinc-800/60"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-semibold shadow-lg shadow-rose-500/20 hover:shadow-rose-500/45 rounded-xl border-0"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Template'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

TemplatesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Quick Docx',
            href: '/pdf-templates',
        },
    ],
};
