import { Link } from '@inertiajs/react';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type VariableConfig = {
    type: 'text' | 'textarea' | 'dropdown';
    options?: string[];
};

type PdfTemplate = {
    id: number;
    name: string;
    content: string;
    variables: Record<string, VariableConfig> | null;
    created_at: string;
    updated_at: string;
};

export default function FillTemplate({ template }: { template: PdfTemplate }) {
    const variablesDef = template.variables || {};

    const [formData, setFormData] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        Object.entries(variablesDef).forEach(([varName, config]) => {
            initial[varName] =
                config.type === 'dropdown' && config.options
                    ? config.options[0]
                    : '';
        });

        return initial;
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isGenerating, setIsGenerating] = useState(false);

    // Preview state
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const handleInputChange = (varName: string, value: string) => {
        setFormData((prev) => ({ ...prev, [varName]: value }));
    };

    const getCsrfToken = () => {
        return (
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') || ''
        );
    };

    const handlePreview = async () => {
        setIsPreviewLoading(true);

        try {
            const token = getCsrfToken();
            const response = await fetch(
                `/pdf-templates/${template.id}/preview-filled`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/pdf, application/json',
                        'X-CSRF-TOKEN': token,
                    },
                    body: JSON.stringify(formData),
                    credentials: 'same-origin',
                },
            );

            if (!response.ok) {
throw new Error('Failed to generate preview.');
}

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Revoke any old URL to avoid memory leaks
            if (previewUrl) {
window.URL.revokeObjectURL(previewUrl);
}

            setPreviewUrl(url);
            setShowPreview(true);
        } catch (err) {
            console.error(err);
            setErrors((prev) => ({
                ...prev,
                general: 'Failed to generate PDF preview.',
            }));
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        setErrors({});

        try {
            const token = getCsrfToken();
            const response = await fetch(
                `/pdf-templates/${template.id}/generate`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/pdf, application/json',
                        'X-CSRF-TOKEN': token,
                    },
                    body: JSON.stringify(formData),
                    credentials: 'same-origin',
                },
            );

            if (!response.ok) {
                const errData = await response.json();

                if (errData.errors) {
                    const mappedErrors: Record<string, string> = {};
                    Object.entries(errData.errors).forEach(([field, msgs]) => {
                        mappedErrors[field] = Array.isArray(msgs)
                            ? msgs[0]
                            : String(msgs);
                    });
                    setErrors(mappedErrors);
                } else {
                    setErrors({
                        general: errData.message || 'Failed to generate PDF.',
                    });
                }

                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const safeName = template.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_');
            link.setAttribute('download', `${safeName}_${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            setErrors({
                general:
                    'An unexpected error occurred while generating the PDF.',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl bg-slate-950/5 p-4 text-slate-900 sm:p-6 dark:text-zinc-100">
            {/* Ambient blobs */}
            <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl sm:h-96 sm:w-96 dark:bg-blue-600/10" />
            <div className="pointer-events-none absolute top-1/2 -right-16 h-64 w-64 rounded-full bg-sky-500/15 blur-3xl sm:h-96 sm:w-96 dark:bg-sky-500/10" />

            <div className="relative z-10 mx-auto max-w-2xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/pdf-templates"
                        className="rounded-xl border border-white/20 bg-white/40 p-2 text-slate-700 backdrop-blur-xl transition-all duration-200 hover:text-blue-600 dark:border-zinc-800/40 dark:bg-zinc-950/40 dark:text-zinc-300 dark:hover:text-blue-400"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="bg-gradient-to-r from-blue-700 to-sky-500 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-sky-400">
                            Fill Template
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Enter variable details for{' '}
                            <span className="font-semibold">
                                {template.name}
                            </span>{' '}
                            to generate your PDF.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="rounded-2xl border border-white/20 bg-white/45 p-4 shadow-lg backdrop-blur-xl sm:p-6 dark:border-zinc-800/40 dark:bg-zinc-950/45">
                    {errors.general && (
                        <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {Object.keys(variablesDef).length === 0 ? (
                            <div className="py-6 text-center text-sm text-slate-500 dark:text-zinc-400">
                                This template does not contain any variables.
                                You can download it directly.
                            </div>
                        ) : (
                            Object.entries(variablesDef).map(
                                ([varName, config]) => (
                                    <div key={varName} className="grid gap-2">
                                        <Label
                                            htmlFor={varName}
                                            className="font-semibold text-slate-700 capitalize dark:text-zinc-300"
                                        >
                                            {varName.replace(/_/g, ' ')}
                                        </Label>

                                        {config.type === 'textarea' ? (
                                            <textarea
                                                id={varName}
                                                value={formData[varName] || ''}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        varName,
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                rows={4}
                                                placeholder={`Enter ${varName.replace(/_/g, ' ')}`}
                                                className="min-h-[100px] w-full rounded-xl border border-zinc-200/50 bg-white/30 px-3 py-2 text-sm text-slate-900 backdrop-blur-md focus:ring-2 focus:ring-sky-500/50 focus:outline-none dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:text-zinc-100"
                                            />
                                        ) : config.type === 'dropdown' ? (
                                            <select
                                                id={varName}
                                                value={formData[varName] || ''}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        varName,
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                className="w-full rounded-xl border border-zinc-200/50 bg-white/30 px-3 py-2.5 text-sm text-slate-900 backdrop-blur-md focus:ring-2 focus:ring-sky-500/50 focus:outline-none dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:text-zinc-100"
                                            >
                                                {config.options?.map((opt) => (
                                                    <option
                                                        key={opt}
                                                        value={opt}
                                                    >
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Input
                                                id={varName}
                                                type="text"
                                                value={formData[varName] || ''}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        varName,
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                placeholder={`Enter ${varName.replace(/_/g, ' ')}`}
                                                className="rounded-xl border-zinc-200/50 bg-white/30 backdrop-blur-md focus-visible:ring-sky-500/50 dark:border-zinc-800/60 dark:bg-zinc-900/30"
                                            />
                                        )}
                                        <InputError message={errors[varName]} />
                                    </div>
                                ),
                            )
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col items-stretch gap-3 border-t border-zinc-200/50 pt-2 sm:flex-row sm:items-center dark:border-zinc-800/40">
                            <Link href="/pdf-templates">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full rounded-xl border-zinc-200/60 sm:w-auto dark:border-zinc-800/60"
                                >
                                    Cancel
                                </Button>
                            </Link>

                            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end">
                                {/* Preview button */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePreview}
                                    disabled={isPreviewLoading}
                                    className="gap-1.5 rounded-xl border-zinc-200/60 font-semibold hover:border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-600 dark:border-zinc-800/60 dark:hover:text-blue-400"
                                >
                                    <Eye className="h-4 w-4" />
                                    {isPreviewLoading
                                        ? 'Loading Preview...'
                                        : 'Preview PDF'}
                                </Button>

                                {/* Download button */}
                                <Button
                                    type="submit"
                                    disabled={isGenerating}
                                    className="gap-1.5 rounded-xl border-0 bg-gradient-to-r from-blue-600 to-sky-500 px-5 font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-sky-400 hover:shadow-blue-500/40"
                                >
                                    <Download className="h-4 w-4" />
                                    {isGenerating
                                        ? 'Generating PDF...'
                                        : 'Download PDF'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Glassmorphic PDF Preview Dialog */}
            <Dialog
                open={showPreview}
                onOpenChange={(open) => {
                    if (!open) {
setShowPreview(false);
}
                }}
            >
                <DialogContent className="flex h-[80vh] w-[95vw] max-w-4xl flex-col rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:h-[88vh] sm:p-6 dark:border-zinc-800/40 dark:bg-zinc-950/95">
                    <DialogHeader>
                        <DialogTitle className="truncate pr-6 text-base font-bold text-slate-900 sm:text-xl dark:text-zinc-100">
                            PDF Preview —{' '}
                            <span className="text-blue-600 dark:text-blue-400">
                                {template.name}
                            </span>
                        </DialogTitle>
                    </DialogHeader>
                    <p className="-mt-1 text-xs text-slate-500 dark:text-zinc-400">
                        Unfilled variables are shown in{' '}
                        <span className="font-semibold text-blue-600">
                            [blue]
                        </span>
                        . Fill in all fields and generate to download the final
                        document.
                    </p>
                    <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                        {previewUrl && (
                            <iframe
                                src={previewUrl}
                                className="h-full w-full border-0"
                                title="PDF Preview"
                            />
                        )}
                    </div>
                    <div className="mt-3 flex flex-col items-stretch justify-between gap-2 sm:mt-4 sm:flex-row sm:items-center">
                        <p className="text-xs text-slate-400 dark:text-zinc-500">
                            This is an A4 preview of the final output.
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            {previewUrl && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        window.open(previewUrl, '_blank')
                                    }
                                    className="w-full rounded-xl border-zinc-200/60 sm:w-auto dark:border-zinc-800/60"
                                >
                                    Open in New Tab
                                </Button>
                            )}
                            <Button
                                type="button"
                                onClick={() => setShowPreview(false)}
                                className="w-full rounded-xl sm:w-auto"
                            >
                                Close Preview
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

FillTemplate.layout = {
    breadcrumbs: [
        { title: 'Quick Docx', href: '/pdf-templates' },
        { title: 'Fill', href: '/pdf-templates/fill' },
    ],
};
