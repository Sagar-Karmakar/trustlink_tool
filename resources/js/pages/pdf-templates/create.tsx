import { Link, router } from '@inertiajs/react';
import { Editor } from '@tinymce/tinymce-react';
import { ArrowLeft, RefreshCw, Save, HelpCircle, Eye } from 'lucide-react';
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
import { useAppearance } from '@/hooks/use-appearance';

type VariableConfig = {
    type: 'text' | 'textarea' | 'dropdown';
    options?: string[];
};

export default function CreateTemplate({
    default_category,
}: {
    default_category: string;
}) {
    const { resolvedAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const [name, setName] = useState('');
    const [categoryName, setCategoryName] = useState(
        default_category || 'uncategory',
    );
    const [content, setContent] = useState(
        '<h1>Document Title</h1><p>Dear {{client_name}},</p><p>Here is your details: {{details}}</p><p>Status: {{status}}</p>',
    );
    const [variables, setVariables] = useState<Record<string, VariableConfig>>(
        {},
    );
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
        return (
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') || ''
        );
    };

    const handleCategoryChange = async (val: string) => {
        setCategoryName(val);

        if (val.trim().length >= 3) {
            try {
                const response = await fetch(
                    `/pdf-templates/categories/search?query=${encodeURIComponent(val)}`,
                );

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
        found.forEach((v) => {
            newVars[v] = variables[v] || { type: 'text' };
        });
        setVariables(newVars);
    };

    const handleTypeChange = (
        varName: string,
        type: 'text' | 'textarea' | 'dropdown',
    ) => {
        setVariables((prev) => ({
            ...prev,
            [varName]: {
                ...prev[varName],
                type,
                options:
                    type === 'dropdown'
                        ? prev[varName].options || ['Option 1', 'Option 2']
                        : undefined,
            },
        }));
    };

    const handleOptionsChange = (varName: string, optionsStr: string) => {
        const optionsList = optionsStr
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        setVariables((prev) => ({
            ...prev,
            [varName]: {
                ...prev[varName],
                options: optionsList,
            },
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
                    Accept: 'application/pdf, application/json',
                    'X-CSRF-TOKEN': token,
                },
                body: JSON.stringify({ content }),
                credentials: 'same-origin',
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

        router.post(
            '/pdf-templates',
            {
                name,
                content,
                variables,
                category_name: categoryName,
            },
            {
                onError: (err: any) => {
                    setErrors(err);
                    setIsProcessing(false);
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl bg-slate-950/5 p-4 text-slate-900 sm:p-6 dark:text-zinc-100">
            {/* Ambient Background Glowing Blobs - Navy, Royal, and Sky Blue */}
            <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl sm:h-96 sm:w-96 dark:bg-blue-600/10" />
            <div className="pointer-events-none absolute top-1/2 -right-16 h-64 w-64 rounded-full bg-sky-500/15 blur-3xl sm:h-96 sm:w-96 dark:bg-sky-500/10" />

            <div className="relative z-10 mx-auto max-w-7xl space-y-6">
                {/* Back Button and Heading */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/pdf-templates"
                        className="rounded-xl border border-white/20 bg-white/40 p-2 text-slate-700 backdrop-blur-xl transition-all duration-200 hover:text-blue-600 dark:border-zinc-800/40 dark:bg-zinc-950/40 dark:text-zinc-300 dark:hover:text-blue-400"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="bg-gradient-to-r from-blue-700 to-sky-500 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-sky-400">
                            Create Quick Docx
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Build a custom document with dynamic `
                            {'{{variable_name}}'}` placeholders.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-6 lg:grid-cols-3"
                >
                    {/* Editor Panel - Left Column */}
                    <div className="space-y-5 rounded-2xl border border-white/20 bg-white/45 p-4 shadow-lg backdrop-blur-xl sm:p-6 lg:col-span-2 dark:border-zinc-800/40 dark:bg-zinc-950/45">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Template Name */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className="font-semibold text-slate-700 dark:text-zinc-300"
                                >
                                    Template Name
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="Invoice Template, Project Brief, etc."
                                    className="rounded-xl border-zinc-200/50 bg-white/30 backdrop-blur-md focus-visible:ring-sky-500/50 dark:border-zinc-800/60 dark:bg-zinc-900/30"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Category Autocomplete */}
                            <div className="relative grid gap-2">
                                <Label
                                    htmlFor="category_name"
                                    className="font-semibold text-slate-700 dark:text-zinc-300"
                                >
                                    Category
                                </Label>
                                <Input
                                    id="category_name"
                                    value={categoryName}
                                    onChange={(e) =>
                                        handleCategoryChange(e.target.value)
                                    }
                                    onFocus={() =>
                                        categoryName.trim().length >= 3 &&
                                        suggestions.length > 0 &&
                                        setShowSuggestions(true)
                                    }
                                    onBlur={() =>
                                        setTimeout(
                                            () => setShowSuggestions(false),
                                            200,
                                        )
                                    }
                                    placeholder="Search category or type to create..."
                                    className="rounded-xl border-zinc-200/50 bg-white/30 backdrop-blur-md focus-visible:ring-sky-500/50 dark:border-zinc-800/60 dark:bg-zinc-900/30"
                                />
                                {showSuggestions && (
                                    <ul className="absolute top-[72px] z-50 max-h-[150px] w-full divide-y divide-zinc-100 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                                        {suggestions.map((s) => (
                                            <li
                                                key={s}
                                                onMouseDown={() => {
                                                    setCategoryName(s);
                                                    setSuggestions([]);
                                                    setShowSuggestions(false);
                                                }}
                                                className="cursor-pointer px-4 py-2 text-sm text-slate-800 transition-colors duration-200 hover:bg-blue-500/10 hover:text-blue-600 dark:text-zinc-200 dark:hover:text-blue-400"
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
                                <Label className="font-semibold text-slate-700 dark:text-zinc-300">
                                    Document Body
                                </Label>
                                <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-zinc-400">
                                    <HelpCircle className="h-3 w-3" />
                                    Use `{'{{name}}'}` for fields
                                </span>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                                <Editor
                                    key={resolvedAppearance}
                                    tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js"
                                    init={{
                                        height: 800,
                                        menubar: false,
                                        branding: false,
                                        skin: isDark ? 'oxide-dark' : 'oxide',
                                        content_css: isDark
                                            ? 'dark'
                                            : 'default',
                                        plugins: [
                                            'advlist',
                                            'autolink',
                                            'lists',
                                            'link',
                                            'image',
                                            'charmap',
                                            'preview',
                                            'anchor',
                                            'searchreplace',
                                            'visualblocks',
                                            'code',
                                            'fullscreen',
                                            'insertdatetime',
                                            'media',
                                            'table',
                                            'code',
                                            'wordcount',
                                            'paste',
                                        ],
                                        toolbar:
                                            'undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | link image table | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent | removeformat code',
                                        font_family_formats: 'Calibri=Calibri; Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; Georgia=georgia,palatino; Helvetica=helvetica; Tahoma=tahoma,arial,helvetica,sans-serif; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva',
                                        font_size_formats: '8px 9px 10px 11px 12px 14px 16px 18px 20px 22px 24px 26px 28px 36px 48px 72px',
                                        content_style: `
                                            @font-face {
                                                font-family: 'Calibri';
                                                src: url('/fonts/calibri.ttf') format('truetype');
                                                font-weight: normal;
                                                font-style: normal;
                                            }
                                            @font-face {
                                                font-family: 'Calibri';
                                                src: url('/fonts/calibrib.ttf') format('truetype');
                                                font-weight: bold;
                                                font-style: normal;
                                            }
                                            @font-face {
                                                font-family: 'Calibri';
                                                src: url('/fonts/calibrii.ttf') format('truetype');
                                                font-weight: normal;
                                                font-style: italic;
                                            }
                                            @font-face {
                                                font-family: 'Calibri';
                                                src: url('/fonts/calibriz.ttf') format('truetype');
                                                font-weight: bold;
                                                font-style: italic;
                                            }
                                            body {
                                                font-family: 'Calibri', Helvetica, Arial, sans-serif;
                                                font-size: 11px;
                                                color: ${isDark ? '#e4e4e7' : '#09090b'};
                                                background-color: ${isDark ? '#18181b' : '#f4f4f5'};
                                                margin: 0;
                                                padding: 12px;
                                            }
                                            .mce-content-body {
                                                max-width: 210mm;
                                                min-height: 297mm;
                                                background-color: ${isDark ? '#09090b' : '#ffffff'} !important;
                                                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                                                margin: 16px auto !important;
                                                padding: 20mm 18mm 20mm 18mm !important;
                                                box-sizing: border-box;
                                                border-radius: 4px;
                                                border: 1px solid ${isDark ? '#27272a' : '#e4e4e7'};
                                            }
                                        `,
                                        automatic_uploads: true,
                                        convert_urls: false,
                                        paste_as_text: false,
                                        paste_word_valid_elements:
                                            'b,strong,i,em,h1,h2,h3,h4,h5,h6,p,ol,ul,li,a,sub,sup,strike,br,del,table,thead,tbody,tr,td,th,span,div,img',
                                        paste_retain_style_values:
                                            'color,background-color,font-size,font-weight,font-style,text-decoration,text-align,width,border,border-collapse,padding,margin,vertical-align',
                                        paste_remove_styles_if_webkit: false,
                                        smart_paste: false,
                                        images_upload_handler: (blobInfo) =>
                                            new Promise((resolve, reject) => {
                                                const formData = new FormData();
                                                formData.append(
                                                    'file',
                                                    blobInfo.blob(),
                                                    blobInfo.filename(),
                                                );

                                                const token = getCsrfToken();
                                                fetch(
                                                    '/pdf-templates/upload-image',
                                                    {
                                                        method: 'POST',
                                                        headers: {
                                                            'X-CSRF-TOKEN':
                                                                token,
                                                            Accept: 'application/json',
                                                        },
                                                        body: formData,
                                                        credentials:
                                                            'same-origin',
                                                    },
                                                )
                                                    .then((res) => {
                                                        if (!res.ok) {
throw new Error(
                                                                'HTTP Error: ' +
                                                                    res.status,
                                                            );
}

                                                        return res.json();
                                                    })
                                                    .then((json) => {
                                                        if (
                                                            !json ||
                                                            typeof json.location !==
                                                                'string'
                                                        ) {
                                                            throw new Error(
                                                                'Invalid JSON Response',
                                                            );
                                                        }

                                                        resolve(json.location);
                                                    })
                                                    .catch((err) => {
                                                        reject(err.message);
                                                    });
                                            }),
                                    }}
                                    value={content}
                                    onEditorChange={(val) => setContent(val)}
                                />
                            </div>
                            <InputError message={errors.content} />
                        </div>
                    </div>

                    {/* Variables Panel - Right Column */}
                    <div className="flex h-fit flex-col space-y-5 rounded-2xl border border-white/20 bg-white/45 p-4 shadow-lg backdrop-blur-xl sm:p-6 dark:border-zinc-800/40 dark:bg-zinc-950/45">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                                Variables Config
                            </h2>
                            <Button
                                type="button"
                                onClick={handleScan}
                                size="sm"
                                variant="outline"
                                className="gap-1 rounded-xl border-zinc-200/60 text-xs dark:border-zinc-800/60"
                            >
                                <RefreshCw className="h-3 w-3" />
                                Scan
                            </Button>
                        </div>

                        <p className="text-xs leading-normal text-slate-500 dark:text-zinc-400">
                            Click **Scan** to search the editor for variables
                            like `{'{{client_name}}'}` and define how their
                            input form elements will render.
                        </p>

                        <div className="max-h-[300px] divide-y divide-zinc-200/50 overflow-y-auto pr-1 dark:divide-zinc-800/40">
                            {Object.keys(variables).length === 0 ? (
                                <div className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
                                    No variables scanned yet. Write `
                                    {'{{variable}}'}` in editor and click Scan.
                                </div>
                            ) : (
                                Object.entries(variables).map(
                                    ([varName, config]) => (
                                        <div
                                            key={varName}
                                            className="space-y-2 py-4 first:pt-0 last:pb-0"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                    {varName}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                <select
                                                    value={config.type}
                                                    onChange={(e) =>
                                                        handleTypeChange(
                                                            varName,
                                                            e.target
                                                                .value as any,
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-zinc-200/50 bg-white/30 px-2.5 py-1.5 text-xs text-slate-900 backdrop-blur-md focus:ring-1 focus:ring-sky-500 focus:outline-none dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:text-zinc-100"
                                                >
                                                    <option value="text">
                                                        Text Input
                                                    </option>
                                                    <option value="textarea">
                                                        Text Area
                                                    </option>
                                                    <option value="dropdown">
                                                        Dropdown Select
                                                    </option>
                                                </select>

                                                {config.type === 'dropdown' && (
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] text-slate-500 dark:text-zinc-400">
                                                            Options (comma
                                                            separated)
                                                        </Label>
                                                        <Input
                                                            type="text"
                                                            defaultValue={config.options?.join(
                                                                ', ',
                                                            )}
                                                            onChange={(e) =>
                                                                handleOptionsChange(
                                                                    varName,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Option 1, Option 2"
                                                            className="h-7 rounded-lg border-zinc-200/50 bg-white/30 text-xs focus-visible:ring-sky-500/50 dark:border-zinc-800/60 dark:bg-zinc-900/30"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ),
                                )
                            )}
                        </div>

                        <div className="space-y-3 border-t border-zinc-200/50 pt-4 dark:border-zinc-800/40">
                            <Button
                                type="button"
                                onClick={handlePreview}
                                disabled={isPreviewLoading}
                                variant="outline"
                                className="w-full gap-1.5 rounded-xl border-zinc-200/60 text-xs font-semibold hover:border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-600 dark:border-zinc-800/60 dark:hover:text-blue-400"
                            >
                                <Eye className="h-4 w-4" />
                                {isPreviewLoading
                                    ? 'Loading Preview...'
                                    : 'Preview Visual PDF'}
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
                                    className="flex-1 gap-1.5 rounded-xl border-0 bg-gradient-to-r from-blue-600 to-sky-500 font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-sky-400 hover:shadow-blue-500/40"
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
            <Dialog
                open={showPreview}
                onOpenChange={(open) => !open && setShowPreview(false)}
            >
                <DialogContent className="flex h-[85vh] w-[95vw] max-w-5xl flex-col rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:h-[90vh] sm:p-6 dark:border-zinc-800/40 dark:bg-zinc-950/95">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-zinc-100">
                            PDF Visual Preview
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 flex-1 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                        {previewUrl && (
                            <iframe
                                src={previewUrl}
                                className="h-full w-full border-0"
                                title="PDF Visual Preview"
                            />
                        )}
                    </div>
                    <div className="mt-4 flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center">
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
