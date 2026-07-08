import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, RefreshCw, Save, HelpCircle, Eye } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
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

export default function CreateTemplate({ default_category }: { default_category: string }) {
    const { resolvedAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const [name, setName] = useState('');
    const [categoryName, setCategoryName] = useState(default_category || 'uncategory');
    const [content, setContent] = useState('<h1>Document Title</h1><p>Dear {{client_name}},</p><p>Here is your details: {{details}}</p><p>Status: {{status}}</p>');
    const [variables, setVariables] = useState<Record<string, VariableConfig>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isProcessing, setIsProcessing] = useState(false);

    // Autocomplete category state
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Preview state
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    };

    const handleCategoryChange = async (val: string) => {
        setCategoryName(val);
        if (val.trim().length >= 3) {
            try {
                const response = await fetch(`/pdf-templates/categories/search?query=${encodeURIComponent(val)}`);
                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data);
                    setShowSuggestions(data.length > 0);
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleScan = () => {
        const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
        const found: string[] = [];
        let match;
        while ((match = regex.exec(content)) !== null) {
            const varName = match[1];
            if (!found.includes(varName)) {
                found.push(varName);
            }
        }

        const newVars: Record<string, VariableConfig> = {};
        found.forEach(v => {
            newVars[v] = variables[v] || { type: 'text' };
        });
        setVariables(newVars);
    };

    const handleTypeChange = (varName: string, type: 'text' | 'textarea' | 'dropdown') => {
        setVariables(prev => ({
            ...prev,
            [varName]: {
                ...prev[varName],
                type,
                options: type === 'dropdown' ? (prev[varName].options || ['Option 1', 'Option 2']) : undefined
            }
        }));
    };

    const handleOptionsChange = (varName: string, optionsStr: string) => {
        const optionsList = optionsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        setVariables(prev => ({
            ...prev,
            [varName]: {
                ...prev[varName],
                options: optionsList
            }
        }));
    };

    const handlePreview = async () => {
        setIsPreviewLoading(true);
        try {
            const token = getCsrfToken();
            const response = await fetch('/pdf-templates/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf, application/json',
                    'X-CSRF-TOKEN': token,
                },
                body: JSON.stringify({ content }),
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error('Failed to generate preview PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setPreviewUrl(url);
            setShowPreview(true);
        } catch (err) {
            console.error(err);
            alert('Failed to generate PDF preview.');
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setErrors({});

        router.post('/pdf-templates', {
            name,
            content,
            variables,
            category_name: categoryName
        }, {
            onError: (err: any) => {
                setErrors(err);
                setIsProcessing(false);
            },
            onFinish: () => {
                setIsProcessing(false);
            }
        });
    };

    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl p-4 sm:p-6 bg-slate-950/5 text-slate-900 dark:text-zinc-100">
            {/* Ambient Background Glowing Blobs - Navy, Royal, and Sky Blue */}
            <div className="absolute -top-16 -left-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-blue-600/15 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 -right-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-sky-500/15 dark:bg-sky-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-5xl space-y-6">
                {/* Back Button and Heading */}
                <div className="flex items-center gap-4">
                    <Link 
                        href="/pdf-templates"
                        className="p-2 rounded-xl bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-sky-500 dark:from-blue-400 dark:to-sky-400 bg-clip-text text-transparent">
                            Create Quick Docx
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Build a custom document with dynamic `{"{{variable_name}}"}` placeholders.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Editor Panel - Left Column */}
                    <div className="lg:col-span-2 space-y-5 bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-4 sm:p-6 rounded-2xl shadow-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Template Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-slate-700 dark:text-zinc-300 font-semibold">Template Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="Invoice Template, Project Brief, etc."
                                    className="bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/60 rounded-xl focus-visible:ring-sky-500/50"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Category Autocomplete */}
                            <div className="grid gap-2 relative">
                                <Label htmlFor="category_name" className="text-slate-700 dark:text-zinc-300 font-semibold">Category</Label>
                                <Input
                                    id="category_name"
                                    value={categoryName}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    onFocus={() => categoryName.trim().length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    placeholder="Search category or type to create..."
                                    className="bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/60 rounded-xl focus-visible:ring-sky-500/50"
                                />
                                {showSuggestions && (
                                    <ul className="absolute top-[72px] z-50 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-[150px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {suggestions.map((s) => (
                                            <li
                                                key={s}
                                                onMouseDown={() => {
                                                    setCategoryName(s);
                                                    setSuggestions([]);
                                                    setShowSuggestions(false);
                                                }}
                                                className="px-4 py-2 text-sm text-slate-800 dark:text-zinc-200 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors duration-200"
                                            >
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <InputError message={errors.category_name} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-slate-700 dark:text-zinc-300 font-semibold">Document Body</Label>
                                <span className="text-[10px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                                    <HelpCircle className="h-3 w-3" />
                                    Use `{"{{name}}"}` for fields
                                </span>
                            </div>
                            <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                <Editor
                                    key={resolvedAppearance}
                                    tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js"
                                    init={{
                                        height: 450,
                                        menubar: false,
                                        branding: false,
                                        skin: isDark ? 'oxide-dark' : 'oxide',
                                        content_css: isDark ? 'dark' : 'default',
                                        plugins: [
                                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                            'insertdatetime', 'media', 'table', 'code', 'wordcount', 'paste'
                                        ],
                                        toolbar: 'undo redo | blocks | ' +
                                            'bold italic forecolor | alignleft aligncenter ' +
                                            'alignright alignjustify | bullist numlist | ' +
                                            'table image code | removeformat',
                                        content_style: isDark 
                                            ? 'body { font-family:Helvetica,Arial,sans-serif; font-size:13px; color: #e4e4e7; background-color: #09090b; }' 
                                            : 'body { font-family:Helvetica,Arial,sans-serif; font-size:13px; color: #09090b; background-color: #ffffff; }',
                                        automatic_uploads: true,
                                        convert_urls: false,
                                        paste_as_text: false,
                                        paste_word_valid_elements: 'b,strong,i,em,h1,h2,h3,h4,h5,h6,p,ol,ul,li,a,sub,sup,strike,br,del,table,thead,tbody,tr,td,th,span,div,img',
                                        paste_retain_style_values: 'color,background-color,font-size,font-weight,font-style,text-decoration,text-align,width,border,border-collapse,padding,margin,vertical-align',
                                        paste_remove_styles_if_webkit: false,
                                        smart_paste: false,
                                        images_upload_handler: (blobInfo) => new Promise((resolve, reject) => {
                                            const formData = new FormData();
                                            formData.append('file', blobInfo.blob(), blobInfo.filename());

                                            const token = getCsrfToken();
                                            fetch('/pdf-templates/upload-image', {
                                                method: 'POST',
                                                headers: {
                                                    'X-CSRF-TOKEN': token,
                                                    'Accept': 'application/json',
                                                },
                                                body: formData,
                                                credentials: 'same-origin'
                                            })
                                            .then(res => {
                                                if (!res.ok) throw new Error('HTTP Error: ' + res.status);
                                                return res.json();
                                            })
                                            .then(json => {
                                                if (!json || typeof json.location !== 'string') {
                                                    throw new Error('Invalid JSON Response');
                                                }
                                                resolve(json.location);
                                            })
                                            .catch(err => {
                                                reject(err.message);
                                            });
                                         })
                                    }}
                                    value={content}
                                    onEditorChange={(val) => setContent(val)}
                                />
                            </div>
                            <InputError message={errors.content} />
                        </div>
                    </div>

                    {/* Variables Panel - Right Column */}
                    <div className="space-y-5 bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-4 sm:p-6 rounded-2xl shadow-lg flex flex-col h-fit">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Variables Config</h2>
                            <Button 
                                type="button" 
                                onClick={handleScan}
                                size="sm"
                                variant="outline"
                                className="rounded-xl border-zinc-200/60 dark:border-zinc-800/60 gap-1 text-xs"
                            >
                                <RefreshCw className="h-3 w-3" />
                                Scan
                            </Button>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-normal">
                            Click **Scan** to search the editor for variables like `{"{{client_name}}"}` and define how their input form elements will render.
                        </p>

                        <div className="divide-y divide-zinc-200/50 dark:divide-zinc-800/40 max-h-[300px] overflow-y-auto pr-1">
                            {Object.keys(variables).length === 0 ? (
                                <div className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
                                    No variables scanned yet. Write `{"{{variable}}"}` in editor and click Scan.
                                </div>
                            ) : (
                                Object.entries(variables).map(([varName, config]) => (
                                    <div key={varName} className="py-4 space-y-2 first:pt-0 last:pb-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">{varName}</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            <select
                                                value={config.type}
                                                onChange={(e) => handleTypeChange(varName, e.target.value as any)}
                                                className="w-full px-2.5 py-1.5 text-xs bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-zinc-100"
                                            >
                                                <option value="text">Text Input</option>
                                                <option value="textarea">Text Area</option>
                                                <option value="dropdown">Dropdown Select</option>
                                            </select>

                                            {config.type === 'dropdown' && (
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-slate-500 dark:text-zinc-400">Options (comma separated)</Label>
                                                    <Input
                                                        type="text"
                                                        defaultValue={config.options?.join(', ')}
                                                        onChange={(e) => handleOptionsChange(varName, e.target.value)}
                                                        placeholder="Option 1, Option 2"
                                                        className="h-7 text-xs bg-white/30 dark:bg-zinc-900/30 border-zinc-200/50 dark:border-zinc-800/60 rounded-lg focus-visible:ring-sky-500/50"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-800/40 space-y-3">
                            <Button
                                type="button"
                                onClick={handlePreview}
                                disabled={isPreviewLoading}
                                variant="outline"
                                className="w-full rounded-xl border-zinc-200/60 dark:border-zinc-800/60 gap-1.5 text-xs font-semibold hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/20"
                            >
                                <Eye className="h-4 w-4" />
                                {isPreviewLoading ? 'Loading Preview...' : 'Preview Visual PDF'}
                            </Button>

                            <div className="flex items-center gap-3">
                                <Link href="/pdf-templates" className="flex-1">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-full rounded-xl border-zinc-200/60 dark:border-zinc-800/60"
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 rounded-xl border-0 gap-1.5"
                                >
                                    <Save className="h-4 w-4" />
                                    {isProcessing ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Glassmorphic PDF Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={(open) => !open && setShowPreview(false)}>
                <DialogContent className="w-[95vw] max-w-4xl h-[80vh] sm:h-[85vh] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                            PDF Visual Preview
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 mt-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                        {previewUrl && (
                            <iframe 
                                src={previewUrl} 
                                className="w-full h-full border-0" 
                                title="PDF Visual Preview" 
                            />
                        )}
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
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

CreateTemplate.layout = {
    breadcrumbs: [
        {
            title: 'Quick Docx',
            href: '/pdf-templates',
        },
        {
            title: 'Create',
            href: '/pdf-templates/create',
        },
    ],
};
