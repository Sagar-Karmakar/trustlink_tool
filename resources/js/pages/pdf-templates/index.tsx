import { Link, router, usePage } from '@inertiajs/react';
import {
    Edit,
    FileText,
    Plus,
    Trash2,
    Download,
    Search,
    ArrowLeft,
    Folder,
    ArrowRight,
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

export default function TemplatesIndex({
    categories,
    templates,
    category,
}: Props) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth?.user?.role === 'admin';
    const [search, setSearch] = useState('');
    const [deleteTemplate, setDeleteTemplate] = useState<PdfTemplate | null>(
        null,
    );
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

    const filteredTemplates = useMemo(() => {
        if (!isFiltered) {
return [];
}

        return templates.filter((t) =>
            t.name.toLowerCase().includes(search.toLowerCase()),
        );
    }, [templates, search, isFiltered]);

    const handleDelete = () => {
        if (!deleteTemplate) {
return;
}

        setIsDeleting(true);
        router.delete(`/pdf-templates/${deleteTemplate.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleteTemplate(null);
                setIsDeleting(false);
            },
        });
    };

    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl bg-slate-950/5 p-4 text-slate-900 sm:p-6 dark:text-zinc-100">
            {/* Ambient Background Glowing Blobs - Navy, Royal, and Sky Blue */}
            <div
                className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 animate-pulse rounded-full bg-blue-600/15 blur-3xl sm:h-96 sm:w-96 dark:bg-blue-600/10"
                style={{ animationDuration: '8s' }}
            />
            <div
                className="pointer-events-none absolute top-1/2 -right-16 h-64 w-64 animate-pulse rounded-full bg-sky-500/15 blur-3xl sm:h-96 sm:w-96 dark:bg-sky-500/10"
                style={{ animationDuration: '6s' }}
            />
            <div className="pointer-events-none absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-indigo-900/15 blur-3xl sm:h-80 sm:w-80 dark:bg-indigo-900/10" />

            <div className="relative z-10 mx-auto max-w-7xl space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 rounded-2xl border border-white/20 bg-white/45 p-4 shadow-lg backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-zinc-800/40 dark:bg-zinc-950/45">
                    <div className="flex items-center gap-3">
                        {isFiltered && (
                            <Link
                                href="/pdf-templates"
                                className="rounded-xl border border-zinc-200/50 bg-white/50 p-2.5 transition-all duration-200 hover:bg-blue-500/10 hover:text-blue-600 dark:border-zinc-800/40 dark:bg-zinc-900/50 dark:hover:text-blue-400"
                                title="Back to Categories"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        )}
                        <div className="rounded-xl bg-blue-600/10 p-2.5 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400">
                            {isFiltered ? (
                                <FileText className="h-6 w-6" />
                            ) : (
                                <Folder className="h-6 w-6" />
                            )}
                        </div>
                        <div>
                            <h1 className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent capitalize dark:from-blue-400 dark:via-blue-300 dark:to-sky-400">
                                {isFiltered
                                    ? `${category.name} Documents`
                                    : 'Quick Docx Categories'}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                                {isFiltered
                                    ? `Browse and fill templates in the ${category.name} category.`
                                    : 'Organize your documents. Select a category below to view templates.'}
                            </p>
                        </div>
                    </div>
                    {isAdmin && (
                        <div>
                            <Link href="/pdf-templates/create">
                                <Button className="w-full transform gap-2 rounded-xl border-0 bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-500 hover:to-sky-400 hover:shadow-blue-500/40 active:scale-95 sm:w-auto">
                                    <Plus className="h-4 w-4" />
                                    New Template
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Filter and Content Section */}
                <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/45 shadow-lg backdrop-blur-xl dark:border-zinc-800/40 dark:bg-zinc-950/45">
                    {/* Search and Quick Filters */}
                    <div className="flex items-center justify-between gap-4 border-b border-zinc-200/50 p-5 dark:border-zinc-800/40">
                        <div className="relative max-w-md flex-1">
                            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                            <Input
                                type="text"
                                placeholder={
                                    isFiltered
                                        ? 'Search templates by name...'
                                        : 'Search categories by name...'
                                }
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="rounded-xl border border-zinc-200/50 bg-white/30 pl-10 backdrop-blur-md focus-visible:ring-sky-500/50 dark:border-zinc-800/60 dark:bg-zinc-900/30"
                            />
                        </div>
                        <div className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                            {isFiltered
                                ? `Showing ${filteredTemplates.length} of ${templates.length} templates`
                                : `Showing ${filteredCategories.length} of ${categories.length} categories`}
                        </div>
                    </div>

                    {/* Content Body */}
                    {!isFiltered ? (
                        /* Categories Grid View */
                        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-3">
                            {filteredCategories.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-slate-400 dark:text-zinc-500">
                                    No categories found matching your search.
                                </div>
                            ) : (
                                filteredCategories.map((c) => (
                                    <Link
                                        key={c.id}
                                        href={`/pdf-templates?category=${c.slug}`}
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
                                                    {c.pdf_templates_count || 0}{' '}
                                                    template
                                                    {c.pdf_templates_count !== 1
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
                    ) : (
                        /* Templates Table & Responsive Mobile Cards (Filtered) */
                        <>
                            {/* Desktop/Tablet Table View */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[800px] border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-200/50 bg-zinc-50/50 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:border-zinc-800/40 dark:bg-zinc-900/30 dark:text-zinc-400">
                                            <th className="px-6 py-4">
                                                Template Name
                                            </th>
                                            <th className="px-6 py-4">
                                                Variables Detected
                                            </th>
                                            <th className="px-6 py-4">
                                                Created Date
                                            </th>
                                            <th className="px-6 py-4 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200/50 text-sm dark:divide-zinc-800/40">
                                        {filteredTemplates.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="py-12 text-center text-slate-400 dark:text-zinc-500"
                                                >
                                                    No Quick Docx templates
                                                    found in this category.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTemplates.map(
                                                (template) => {
                                                    const varCount =
                                                        template.variables
                                                            ? Object.keys(
                                                                  template.variables,
                                                              ).length
                                                            : 0;

                                                    return (
                                                        <tr
                                                            key={template.id}
                                                            className="dark:hover:bg-blue-955/10 transition-colors duration-200 hover:bg-blue-50/20"
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/10">
                                                                        <FileText className="h-5 w-5" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-semibold text-slate-900 dark:text-zinc-100">
                                                                            {
                                                                                template.name
                                                                            }
                                                                        </div>
                                                                        {template.category && (
                                                                            <div className="mt-0.5 text-[10px] text-slate-400 capitalize dark:text-zinc-500">
                                                                                Category:{' '}
                                                                                {
                                                                                    template
                                                                                        .category
                                                                                        .name
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <Badge className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-700 shadow-xs backdrop-blur-sm hover:bg-blue-500/10 dark:text-blue-400">
                                                                    {varCount}{' '}
                                                                    variable
                                                                    {varCount !==
                                                                    1
                                                                        ? 's'
                                                                        : ''}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-6 py-4 text-xs text-slate-500 dark:text-zinc-400">
                                                                {new Date(
                                                                    template.created_at,
                                                                ).toLocaleDateString(
                                                                    undefined,
                                                                    {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                    },
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Link
                                                                        href={`/pdf-templates/${template.id}/fill`}
                                                                    >
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="gap-1.5 rounded-xl border-zinc-200/60 transition-all duration-300 hover:border-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-sky-500 hover:text-white dark:border-zinc-800/60"
                                                                        >
                                                                            <Download className="h-3.5 w-3.5" />
                                                                            Fill
                                                                            &
                                                                            Download
                                                                        </Button>
                                                                    </Link>

                                                                    {isAdmin && (
                                                                        <>
                                                                            <Link
                                                                                href={`/pdf-templates/${template.id}/edit`}
                                                                            >
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="icon"
                                                                                    className="h-9 w-9 rounded-xl border-zinc-200/60 transition-all duration-200 hover:border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-600 dark:border-zinc-800/60 dark:hover:text-blue-400"
                                                                                    title="Edit Template"
                                                                                >
                                                                                    <Edit className="h-4 w-4" />
                                                                                </Button>
                                                                            </Link>

                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                onClick={() =>
                                                                                    setDeleteTemplate(
                                                                                        template,
                                                                                    )
                                                                                }
                                                                                className="h-9 w-9 rounded-xl border-zinc-200/60 transition-all duration-200 hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-600 dark:border-zinc-800/60 dark:hover:text-rose-400"
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
                                                },
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card List View */}
                            <div className="grid grid-cols-1 gap-4 p-5 md:hidden">
                                {filteredTemplates.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400 dark:text-zinc-500">
                                        No Quick Docx templates found in this
                                        category.
                                    </div>
                                ) : (
                                    filteredTemplates.map((template) => {
                                        const varCount = template.variables
                                            ? Object.keys(template.variables)
                                                  .length
                                            : 0;

                                        return (
                                            <div
                                                key={template.id}
                                                className="space-y-4 rounded-xl border border-zinc-200/50 bg-white/40 p-4 shadow-sm transition-all duration-300 hover:shadow dark:border-zinc-800/40 dark:bg-zinc-900/40"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/10">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-zinc-100">
                                                            {template.name}
                                                        </h3>
                                                        {template.category && (
                                                            <div className="mt-0.5 text-[10px] text-slate-400 capitalize dark:text-zinc-500">
                                                                Category:{' '}
                                                                {
                                                                    template
                                                                        .category
                                                                        .name
                                                                }
                                                            </div>
                                                        )}
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <Badge className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-500/10 dark:text-blue-400">
                                                                {varCount}{' '}
                                                                variable
                                                                {varCount !== 1
                                                                    ? 's'
                                                                    : ''}
                                                            </Badge>
                                                            <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                                                                {new Date(
                                                                    template.created_at,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-2 border-t border-zinc-200/50 pt-2 dark:border-zinc-800/30">
                                                    <Link
                                                        href={`/pdf-templates/${template.id}/fill`}
                                                        className="flex-1"
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full gap-1 rounded-xl border-zinc-200/60 text-xs dark:border-zinc-800/60"
                                                        >
                                                            <Download className="h-3 w-3" />
                                                            Fill & Download
                                                        </Button>
                                                    </Link>
                                                    {isAdmin && (
                                                        <div className="flex shrink-0 gap-2">
                                                            <Link
                                                                href={`/pdf-templates/${template.id}/edit`}
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
                                                                    setDeleteTemplate(
                                                                        template,
                                                                    )
                                                                }
                                                                className="h-8 w-8 rounded-xl border-zinc-200/60 text-rose-600 hover:text-rose-600 dark:border-zinc-800/60"
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
            <Dialog
                open={deleteTemplate !== null}
                onOpenChange={(open) => !open && setDeleteTemplate(null)}
            >
                <DialogContent className="w-[95vw] rounded-2xl border border-white/20 bg-white/90 p-6 shadow-2xl backdrop-blur-xl sm:max-w-lg dark:border-zinc-800/40 dark:bg-zinc-950/90">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-zinc-100">
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
                            Are you sure you want to delete template{' '}
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                {deleteTemplate?.name}
                            </span>
                            ? This action is permanent and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTemplate(null)}
                            disabled={isDeleting}
                            className="w-full rounded-xl border-zinc-200/60 sm:w-auto dark:border-zinc-800/60"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full rounded-xl border-0 bg-gradient-to-r from-rose-600 to-red-500 font-semibold text-white shadow-lg shadow-rose-500/20 hover:from-rose-500 hover:to-red-400 hover:shadow-rose-500/45 sm:w-auto"
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
