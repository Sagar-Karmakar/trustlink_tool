import { Head, Link, useForm, router } from '@inertiajs/react';
import { Editor } from '@tinymce/tinymce-react';
import { ArrowLeft, Save, Megaphone, Upload, HelpCircle, Image as ImageIcon } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

interface ShareableContent {
    id: number;
    title: string;
    image_path: string | null;
    content: string | null;
}

interface FormProps {
    contentItem: ShareableContent | null;
    isEdit: boolean;
    category_name: string;
}

export default function ShareableContentForm({ contentItem, isEdit, category_name }: FormProps) {
    const { resolvedAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const { data, setData, post, processing, errors } = useForm({
        title: contentItem?.title || '',
        content: contentItem?.content || '',
        image: null as File | null,
        category_name: category_name || 'uncategory',
    });

    const [imagePreview, setImagePreview] = useState<string | null>(contentItem?.image_path || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Autocomplete category state
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const getCsrfToken = () => {
        const name = 'XSRF-TOKEN=';
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    };

    const handleCategoryChange = async (val: string) => {
        setData('category_name', val);
        if (val.trim().length >= 3) {
            try {
                const response = await fetch(`/shareable-contents/categories/search?query=${encodeURIComponent(val)}`);
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('image', file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(contentItem?.image_path || null);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEdit && contentItem) {
            // Spoof PUT request for file uploads in Laravel
            router.post(`/shareable-contents/${contentItem.id}`, {
                _method: 'PUT',
                title: data.title,
                content: data.content,
                image: data.image,
                category_name: data.category_name,
            });
        } else {
            post('/shareable-contents');
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl p-4 sm:p-6 bg-slate-950/5 text-slate-900 dark:text-zinc-100">
            <Head title={isEdit ? 'Edit Quick Share' : 'Create Quick Share'} />

            {/* Ambient Background Glowing Blobs */}
            <div className="absolute -top-16 -left-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-blue-600/15 dark:bg-blue-600/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute top-1/2 -right-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-sky-500/15 dark:bg-sky-500/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />

            <div className="relative z-10 mx-auto max-w-5xl space-y-6">
                {/* Header Panel */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-4 sm:p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3">
                        <Link href="/contents">
                            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-zinc-200 dark:border-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-900 shrink-0">
                                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <Megaphone className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                                    {isEdit ? 'Edit Quick Share Content' : 'Create New Quick Share'}
                                </h1>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                Define the title, upload the primary post image, and format the message text.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Panel: Inputs (Title & Image) */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-4 sm:p-6 rounded-2xl shadow-lg space-y-5">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Content Details</h2>
                            
                            {/* Title Field */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-slate-700 dark:text-zinc-300 font-semibold">Post Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter promotional title..."
                                    className="bg-white/30 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800/60 rounded-xl focus-visible:ring-sky-500/50"
                                    required
                                />
                                <InputError message={errors.title} />
                            </div>

                            {/* Category Autocomplete */}
                            <div className="space-y-2 relative">
                                <Label htmlFor="category_name" className="text-slate-700 dark:text-zinc-300 font-semibold">Category</Label>
                                <Input
                                    id="category_name"
                                    value={data.category_name}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    onFocus={() => data.category_name.trim().length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    placeholder="Search category or type to create..."
                                    className="bg-white/30 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800/60 rounded-xl focus-visible:ring-sky-500/50"
                                />
                                {showSuggestions && (
                                    <ul className="absolute top-[72px] z-50 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-[150px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {suggestions.map((s) => (
                                            <li
                                                key={s}
                                                onMouseDown={() => {
                                                    setData('category_name', s);
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

                            {/* Image Field */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-zinc-300 font-semibold">Post Image</Label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                
                                {/* Upload Button / Preview Area */}
                                <div 
                                    onClick={triggerFileInput}
                                    className="cursor-pointer border-2 border-dashed border-zinc-200 dark:border-zinc-850 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-4 flex flex-col items-center justify-center bg-zinc-500/5 hover:bg-zinc-500/10 transition-all duration-300 min-h-[160px]"
                                >
                                    {imagePreview ? (
                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-2">
                                            <div className="p-3 rounded-full bg-zinc-200/40 dark:bg-zinc-900/40 text-zinc-400 inline-block">
                                                <ImageIcon className="h-6 w-6" />
                                            </div>
                                            <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Click to upload image</div>
                                            <div className="text-[10px] text-slate-400 dark:text-zinc-500">Supports JPG, PNG, WEBP (Max 5MB)</div>
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.image} />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Rich Text Editor */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-4 sm:p-6 rounded-2xl shadow-lg space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-slate-700 dark:text-zinc-300 font-semibold">Post Message Text</Label>
                                <span className="text-[10px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                                    <HelpCircle className="h-3 w-3" />
                                    This text is style-preserving for copies
                                </span>
                            </div>
                            
                            <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                <Editor
                                    key={resolvedAppearance}
                                    tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js"
                                    init={{
                                        height: 380,
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
                                            'bold italic underline forecolor | alignleft aligncenter ' +
                                            'alignright alignjustify | bullist numlist | ' +
                                            'table image code | removeformat',
                                        content_style: isDark 
                                            ? 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; color: #e4e4e7; background-color: #09090b; }' 
                                            : 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; color: #09090b; background-color: #ffffff; }',
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
                                                    'X-XSRF-TOKEN': token,
                                                },
                                                body: formData
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
                                    value={data.content}
                                    onEditorChange={(val) => setData('content', val)}
                                />
                            </div>
                            <InputError message={errors.content} />

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/40">
                                <Link href="/contents">
                                    <Button 
                                        type="button"
                                        variant="ghost" 
                                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 px-5"
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                <Button 
                                    type="submit"
                                    disabled={processing}
                                    className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 rounded-xl px-6 transition-all duration-300 transform active:scale-95 gap-2 border-0"
                                >
                                    <Save className="h-4.5 w-4.5" />
                                    {isEdit ? 'Save Changes' : 'Create Share'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
