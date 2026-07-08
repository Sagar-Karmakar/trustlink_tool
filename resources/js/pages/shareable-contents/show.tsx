import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    Copy, 
    Check, 
    Share2, 
    Download, 
    ArrowLeft, 
    Image as ImageIcon,
    MessageSquare,
    Link as LinkIcon,
    AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface ShowProps {
    contentItem: ShareableContent;
    isPublic: boolean;
}

export default function ShareableContentShow({ contentItem, isPublic }: ShowProps) {
    const [isCopying, setIsCopying] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // Helper to strip HTML tags for plain text copies
    const stripHtml = (html: string | null) => {
        if (!html) return '';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const fallbackCopyText = (text: string, successMsg?: string) => {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            
            textArea.style.position = "fixed";
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.width = "2em";
            textArea.style.height = "2em";
            textArea.style.padding = "0";
            textArea.style.border = "none";
            textArea.style.outline = "none";
            textArea.style.boxShadow = "none";
            textArea.style.background = "transparent";
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                toast.success(successMsg || "Copied to clipboard!");
            } else {
                toast.error("Failed to copy to clipboard.");
            }
        } catch (err) {
            console.error("Fallback copy failed:", err);
            toast.error("Failed to copy to clipboard.");
        }
    };

    const fallbackCopyHtml = (htmlContent: string, plainText: string, successMsg?: string) => {
        try {
            const div = document.createElement("div");
            div.innerHTML = htmlContent;
            
            // Hide the element offscreen
            div.style.position = "fixed";
            div.style.pointerEvents = "none";
            div.style.opacity = "0";
            div.style.left = "-9999px";
            
            document.body.appendChild(div);
            
            // Select the div contents
            const range = document.createRange();
            range.selectNodeContents(div);
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
                
                const successful = document.execCommand('copy');
                selection.removeAllRanges();
                
                document.body.removeChild(div);
                
                if (successful) {
                    toast.success(successMsg || "Copied formatted text to clipboard!");
                } else {
                    fallbackCopyText(plainText, "Copied text template!");
                }
            } else {
                fallbackCopyText(plainText, "Copied text template!");
            }
        } catch (err) {
            console.error("Fallback HTML copy failed:", err);
            fallbackCopyText(plainText, "Copied text template!");
        }
    };

    const handleCopyAllForWhatsApp = async () => {
        const plainText = stripHtml(contentItem.content);
        const htmlText = contentItem.content || '';

        // For WhatsApp share, copy the PNG image and plain-text (without rich HTML format)
        if (navigator.clipboard && window.isSecureContext) {
            try {
                if (!contentItem.image_path) {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            'text/plain': new Blob([plainText], { type: 'text/plain' })
                        })
                    ]);
                    return;
                }

                const response = await fetch(contentItem.image_path);
                if (!response.ok) throw new Error("Failed to fetch image");
                const originalBlob = await response.blob();

                let pngBlob = originalBlob;
                if (originalBlob.type !== 'image/png') {
                    pngBlob = await new Promise<Blob>((resolve, reject) => {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = img.naturalWidth;
                            canvas.height = img.naturalHeight;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                                ctx.drawImage(img, 0, 0);
                                canvas.toBlob((blob) => {
                                    if (blob) resolve(blob);
                                    else reject(new Error('Canvas conversion to PNG failed'));
                                }, 'image/png');
                            } else {
                                reject(new Error('Failed to get canvas context'));
                            }
                        };
                        img.onerror = () => reject(new Error('Failed to load image for conversion'));
                        img.src = contentItem.image_path!;
                    });
                }

                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': pngBlob,
                        'text/plain': new Blob([plainText], { type: 'text/plain' })
                    })
                ]);
                return;
            } catch (err) {
                console.warn('Clipboard write failed for WhatsApp share helper, trying fallback...', err);
            }
        }

        // Fallback: Copy plain text
        fallbackCopyText(plainText);
    };

    const handleCopyImageOnly = async () => {
        if (!contentItem.image_path) {
            toast.error("No image available to copy.");
            return;
        }

        setIsCopying(true);
        if (navigator.clipboard && window.isSecureContext) {
            try {
                const response = await fetch(contentItem.image_path);
                if (!response.ok) throw new Error("Failed to fetch image");
                const originalBlob = await response.blob();

                let pngBlob = originalBlob;
                if (originalBlob.type !== 'image/png') {
                    pngBlob = await new Promise<Blob>((resolve, reject) => {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = img.naturalWidth;
                            canvas.height = img.naturalHeight;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                                ctx.drawImage(img, 0, 0);
                                canvas.toBlob((blob) => {
                                    if (blob) resolve(blob);
                                    else reject(new Error('Canvas conversion to PNG failed'));
                                }, 'image/png');
                            } else {
                                reject(new Error('Failed to get canvas context'));
                            }
                        };
                        img.onerror = () => reject(new Error('Failed to load image for conversion'));
                        img.src = contentItem.image_path!;
                    });
                }

                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': pngBlob
                    })
                ]);

                toast.success("Copied image to clipboard!");
                setIsCopying(false);
                return;
            } catch (err) {
                console.warn('Clipboard image write failed:', err);
                toast.error("Failed to copy image to clipboard.");
            }
        } else {
            toast.error("Image copying is only supported over HTTPS or localhost secure connections. Please use 'Download Image' instead.");
        }
        setIsCopying(false);
    };

    const handleCopyTextOnly = async () => {
        const plainText = stripHtml(contentItem.content);
        const htmlText = contentItem.content || '';

        // Copy formatted (HTML) + plain text representation
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'text/plain': new Blob([plainText], { type: 'text/plain' }),
                        'text/html': new Blob([htmlText], { type: 'text/html' })
                    })
                ]);
                toast.success("Copied formatted text to clipboard!");
                return;
            } catch (err) {
                console.warn('Clipboard write failed for formatted text, trying fallback copy...', err);
            }
        }

        // Fallback: copy using selection range to preserve styling (pasted in rich editors)
        fallbackCopyHtml(htmlText, plainText, "Copied formatted text to clipboard!");
    };

    const handleDownloadImage = () => {
        if (!contentItem.image_path) return;
        const link = document.createElement('a');
        link.href = contentItem.image_path;
        link.download = `${contentItem.title.replace(/\s+/g, '_')}_image`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Image download started!");
    };

    const getShareUrl = () => {
        return `${window.location.origin}/share/${contentItem.id}`;
    };

    const handleCopyShareLink = () => {
        const shareUrl = getShareUrl();
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(shareUrl)
                .then(() => {
                    setCopiedLink(true);
                    toast.success("Copied shareable link to clipboard!");
                    setTimeout(() => setCopiedLink(false), 2050);
                })
                .catch(() => {
                    fallbackCopyText(shareUrl, "Copied shareable link to clipboard!");
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2050);
                });
        } else {
            fallbackCopyText(shareUrl, "Copied shareable link to clipboard!");
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2050);
        }
    };

    const handleShareWhatsApp = async () => {
        // Attempt plain-text + image copy operation (no HTML formatting)
        await handleCopyAllForWhatsApp();
        
        const plainText = stripHtml(contentItem.content);
        const textMessage = `${contentItem.title}\n\n${plainText}\n\nView details: ${getShareUrl()}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMessage)}`;
        
        window.open(whatsappUrl, '_blank');
    };

    // Dark theme inline style overrides to force pasted HTML contents (like Word pastes)
    // to strip backgrounds and dark colors, making them display beautifully.
    const darkThemeStyleOverride = (
        <style dangerouslySetInnerHTML={{ __html: `
            .dark .rich-text-content,
            .dark .rich-text-content * {
                background-color: transparent !important;
                background: transparent !important;
                color: #e4e4e7 !important; /* zinc-200 */
                border-color: #27272a !important; /* zinc-800 */
            }
            /* Ensure images inside rich text content still follow responsive layouts */
            .rich-text-content img {
                max-width: 100%;
                height: auto;
                border-radius: 0.5rem;
            }
        `}} />
    );

    if (isPublic) {
        // Guest public view: centered card displaying ONLY the image and the content text (no other dashboard boilerplate)
        return (
            <div className="min-h-screen w-full bg-slate-950 text-zinc-150 flex items-center justify-center p-4 relative overflow-hidden selection:bg-blue-600/40">
                <Head title={contentItem.title} />
                {darkThemeStyleOverride}

                {/* Ambient Background Glowing Blobs */}
                <div className="absolute -top-16 -left-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 w-full max-w-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            {contentItem.title}
                        </h1>
                        {contentItem.category && (
                            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-lg text-xs font-semibold capitalize tracking-wide">
                                {contentItem.category.name}
                            </Badge>
                        )}
                    </div>

                    {/* Image */}
                    {contentItem.image_path && (
                        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black/40 max-h-[420px] flex items-center justify-center">
                            <img 
                                src={contentItem.image_path} 
                                alt={contentItem.title} 
                                className="max-h-[420px] w-auto object-contain mx-auto"
                            />
                        </div>
                    )}

                    {/* Styled Text Content */}
                    <div 
                        className="prose prose-invert max-w-none text-zinc-300 leading-relaxed break-words rich-text-content"
                        dangerouslySetInnerHTML={{ __html: contentItem.content || '' }}
                    />
                </div>
            </div>
        );
    }

    // Authenticated Dashboard view
    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl p-4 sm:p-6 bg-slate-950/5 text-slate-900 dark:text-zinc-100">
            <Head title={`Share: ${contentItem.title}`} />
            {darkThemeStyleOverride}

            {/* Ambient Background Glowing Blobs */}
            <div className="absolute -top-16 -left-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-blue-600/15 dark:bg-blue-600/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute top-1/2 -right-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-sky-500/15 dark:bg-sky-500/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />

            <div className="relative z-10 mx-auto max-w-6xl space-y-6">
                
                {/* Back link & title header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-4 sm:p-6 rounded-2xl shadow-lg gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link href="/contents">
                            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-zinc-200 dark:border-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-900 shrink-0">
                                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                        </Link>
                        <div className="min-w-0">
                            <span className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 dark:bg-blue-500/20 px-2 py-0.5 rounded">Quick Share view</span>
                            <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 mt-1 truncate">
                                {contentItem.title}
                            </h1>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <Button 
                            onClick={handleCopyShareLink}
                            variant="outline"
                            className="w-full sm:w-auto bg-white/50 dark:bg-zinc-900/50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 gap-2 text-sm"
                        >
                            {copiedLink ? <Check className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4" />}
                            Copy Public Link
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Post Card Preview */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-855 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                            <CardHeader className="p-6 pb-4 border-b border-zinc-200/50 dark:border-zinc-850 bg-zinc-500/5 dark:bg-zinc-900/20">
                                <div className="flex items-center justify-between gap-2">
                                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                                        Post Preview
                                    </CardTitle>
                                    {contentItem.category && (
                                        <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/10 px-1.5 py-0.5 rounded-lg text-[9px] font-semibold capitalize shrink-0 tracking-wide">
                                            {contentItem.category.name}
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription className="text-xs text-slate-500 dark:text-zinc-500">
                                    This is how the shared content looks. Use the action panel to copy or share the details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6 flex-1 bg-white dark:bg-zinc-950">
                                {/* Main Image */}
                                {contentItem.image_path && (
                                    <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-850 max-h-[380px] bg-zinc-100 dark:bg-zinc-900/40 flex items-center justify-center shadow-inner">
                                        <img 
                                            src={contentItem.image_path} 
                                            alt={contentItem.title} 
                                            className="max-h-[380px] w-auto object-contain mx-auto"
                                        />
                                    </div>
                                )}

                                {/* Styled text content */}
                                <div 
                                    className="prose dark:prose-invert max-w-none text-slate-800 dark:text-zinc-350 min-h-[100px] leading-relaxed break-words rich-text-content"
                                    dangerouslySetInnerHTML={{ __html: contentItem.content || '<p className="text-slate-400 italic">No text content.</p>' }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Sharing Panel */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-4 sm:p-6 rounded-2xl shadow-lg space-y-6">
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Share Actions</h2>
                                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">Copy assets individually or post directly.</p>
                            </div>

                            {/* 4 Action Buttons requested by user */}
                            <div className="space-y-3">
                                {/* 1. Copy Text */}
                                <Button 
                                    onClick={handleCopyTextOnly}
                                    variant="outline"
                                    className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:text-slate-900 dark:hover:text-white font-semibold py-6 text-sm gap-2 rounded-xl transition-all duration-200 shadow-sm"
                                >
                                    <Copy className="h-4.5 w-4.5" />
                                    Copy Text
                                </Button>

                                {/* 2. Copy Image */}
                                <Button 
                                    onClick={handleCopyImageOnly}
                                    disabled={isCopying || !contentItem.image_path}
                                    variant="outline"
                                    className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:text-slate-900 dark:hover:text-white font-semibold py-6 text-sm gap-2 rounded-xl transition-all duration-200 shadow-sm"
                                >
                                    <ImageIcon className="h-4.5 w-4.5" />
                                    {isCopying ? 'Copying...' : 'Copy Image'}
                                </Button>

                                {/* 3. Download Image */}
                                <Button 
                                    onClick={handleDownloadImage}
                                    disabled={!contentItem.image_path}
                                    variant="outline"
                                    className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:text-slate-900 dark:hover:text-white font-semibold py-6 text-sm gap-2 rounded-xl transition-all duration-200 shadow-sm"
                                >
                                    <Download className="h-4.5 w-4.5" />
                                    Download Image
                                </Button>

                                {/* 4. Share on WhatsApp */}
                                <Button 
                                    onClick={handleShareWhatsApp}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl py-6 transition-all shadow-md shadow-green-500/10 dark:shadow-green-950/20 font-semibold gap-2 border-0 text-sm active:scale-98 transform duration-200"
                                >
                                    <MessageSquare className="h-4.5 w-4.5 fill-white" />
                                    Share to WhatsApp
                                </Button>
                            </div>

                            {/* WhatsApp Web Tip Callout */}
                            <div className="p-3 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-550/20 rounded-xl flex items-start gap-2.5 text-xs text-blue-700 dark:text-blue-400 leading-normal">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <div>
                                    <span className="font-semibold">WhatsApp Web Tip:</span> Sharing to WhatsApp pre-fills the plain text content. You can paste (<kbd className="bg-blue-500/10 dark:bg-blue-500/20 px-1 rounded font-mono text-[10px]">Ctrl+V</kbd>) directly inside the opened chat window to attach the image as well.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Layout configuration for dashboard integration
ShareableContentShow.layout = {
    breadcrumbs: [
        {
            title: 'Quick Share',
            href: '/contents',
        },
        {
            title: 'View',
            href: '',
        },
    ],
};
