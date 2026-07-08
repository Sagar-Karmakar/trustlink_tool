import { Link } from '@inertiajs/react';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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
            initial[varName] = config.type === 'dropdown' && config.options ? config.options[0] : '';
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
        setFormData(prev => ({ ...prev, [varName]: value }));
    };

    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    };

    const handlePreview = async () => {
        setIsPreviewLoading(true);
        try {
            const token = getCsrfToken();
            const response = await fetch(`/pdf-templates/${template.id}/preview-filled`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf, application/json',
                    'X-CSRF-TOKEN': token,
                },
                body: JSON.stringify(formData),
                credentials: 'same-origin'
            });

            if (!response.ok) throw new Error('Failed to generate preview.');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            // Revoke any old URL to avoid memory leaks
            if (previewUrl) window.URL.revokeObjectURL(previewUrl);
            setPreviewUrl(url);
            setShowPreview(true);
        } catch (err) {
            console.error(err);
            setErrors(prev => ({ ...prev, general: 'Failed to generate PDF preview.' }));
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
            const response = await fetch(`/pdf-templates/${template.id}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf, application/json',
                    'X-CSRF-TOKEN': token,
                },
                body: JSON.stringify(formData),
                credentials: 'same-origin'
            });

            if (!response.ok) {
                const errData = await response.json();
                if (errData.errors) {
                    const mappedErrors: Record<string, string> = {};
                    Object.entries(errData.errors).forEach(([field, msgs]) => {
                        mappedErrors[field] = Array.isArray(msgs) ? msgs[0] : String(msgs);
                    });
                    setErrors(mappedErrors);
                } else {
                    setErrors({ general: errData.message || 'Failed to generate PDF.' });
                }
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const safeName = template.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
            link.setAttribute('download', `${safeName}_${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            setErrors({ general: 'An unexpected error occurred while generating the PDF.' });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl p-4 sm:p-6 bg-slate-950/5 text-slate-900 dark:text-zinc-100">
            {/* Ambient blobs */}
            <div className="absolute -top-16 -left-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-blue-600/15 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 -right-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-sky-500/15 dark:bg-sky-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-2xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/pdf-templates"
                        className="p-2 rounded-xl bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-sky-500 dark:from-blue-400 dark:to-sky-400 bg-clip-text text-transparent">
                            Fill Template
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Enter variable details for <span className="font-semibold">{template.name}</span> to generate your PDF.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-4 sm:p-6 rounded-2xl shadow-lg">
                    {errors.general && (
                        <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {Object.keys(variablesDef).length === 0 ? (
                            <div className="py-6 text-center text-sm text-slate-500 dark:text-zinc-400">
                                This template does not contain any variables. You can download it directly.
                            </div>
                        ) : (
                            Object.entries(variablesDef).map(([varName, config]) => (
                                <div key={varName} className="grid gap-2">
                                    <Label htmlFor={varName} className="text-slate-700 dark:text-zinc-300 font-semibold capitalize">
                                        {varName.replace(/_/g, ' ')}
                                    </Label>

                                    {config.type === 'textarea' ? (
                                        <textarea
                                            id={varName}
                                            value={formData[varName] || ''}
                                            onChange={(e) => handleInputChange(varName, e.target.value)}
                                            required
                                            rows={4}
                                            placeholder={`Enter ${varName.replace(/_/g, ' ')}`}
                                            className="w-full px-3 py-2 text-sm bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-slate-900 dark:text-zinc-100 min-h-[100px]"
                                        />
                                    ) : config.type === 'dropdown' ? (
                                        <select
                                            id={varName}
                                            value={formData[varName] || ''}
                                            onChange={(e) => handleInputChange(varName, e.target.value)}
                                            required
                                            className="w-full px-3 py-2.5 text-sm bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-slate-900 dark:text-zinc-100"
                                        >
                                            {config.options?.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input
                                            id={varName}
                                            type="text"
                                            value={formData[varName] || ''}
                                            onChange={(e) => handleInputChange(varName, e.target.value)}
                                            required
                                            placeholder={`Enter ${varName.replace(/_/g, ' ')}`}
                                            className="bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/60 rounded-xl focus-visible:ring-sky-500/50"
                                        />
                                    )}
                                    <InputError message={errors[varName]} />
                                </div>
                            ))
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/40">
                            <Link href="/pdf-templates">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full sm:w-auto rounded-xl border-zinc-200/60 dark:border-zinc-800/60"
                                >
                                    Cancel
                                </Button>
                            </Link>

                            <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:justify-end">
                                {/* Preview button */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePreview}
                                    disabled={isPreviewLoading}
                                    className="rounded-xl border-zinc-200/60 dark:border-zinc-800/60 gap-1.5 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/20 font-semibold"
                                >
                                    <Eye className="h-4 w-4" />
                                    {isPreviewLoading ? 'Loading Preview...' : 'Preview PDF'}
                                </Button>

                                {/* Download button */}
                                <Button
                                    type="submit"
                                    disabled={isGenerating}
                                    className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 rounded-xl border-0 px-5 gap-1.5"
                                >
                                    <Download className="h-4 w-4" />
                                    {isGenerating ? 'Generating PDF...' : 'Download PDF'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Glassmorphic PDF Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={(open) => { if (!open) setShowPreview(false); }}>
                <DialogContent className="w-[95vw] max-w-4xl h-[80vh] sm:h-[88vh] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-xl font-bold text-slate-900 dark:text-zinc-100 pr-6 truncate">
                            PDF Preview — <span className="text-blue-600 dark:text-blue-400">{template.name}</span>
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 -mt-1">
                        Unfilled variables are shown in <span className="text-blue-600 font-semibold">[blue]</span>. Fill in all fields and generate to download the final document.
                    </p>
                    <div className="flex-1 mt-3 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 min-h-0">
                        {previewUrl && (
                            <iframe
                                src={previewUrl}
                                className="w-full h-full border-0"
                                title="PDF Preview"
                            />
                        )}
                    </div>
                    <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
                        <p className="text-xs text-slate-400 dark:text-zinc-500">
                            This is an A4 preview of the final output.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            {previewUrl && (
                                <Button 
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.open(previewUrl, '_blank')}
                                    className="rounded-xl w-full sm:w-auto border-zinc-200/60 dark:border-zinc-800/60"
                                >
                                    Open in New Tab
                                </Button>
                            )}
                            <Button type="button" onClick={() => setShowPreview(false)} className="rounded-xl w-full sm:w-auto">
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
