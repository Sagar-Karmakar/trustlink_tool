import { Head, Link } from '@inertiajs/react';
import {
    Copy,
    Check,
    Download,
    ArrowLeft,
    Image as ImageIcon,
    MessageSquare,
    Link as LinkIcon,
    AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

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

export default function ShareableContentShow({
    contentItem,
    isPublic,
}: ShowProps) {
    const [isCopying, setIsCopying] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedWhatsAppText, setCopiedWhatsAppText] = useState(false);

    // Helper to strip HTML tags for plain text copies
    const stripHtml = (html: string | null) => {
        if (!html) {
return '';
}

        const doc = new DOMParser().parseFromString(html, 'text/html');

        return doc.body.textContent || '';
    };

    // Helper to convert rich HTML text to WhatsApp markdown styling
    const htmlToWhatsApp = (html: string | null): string => {
        if (!html) {
return '';
}

        console.log('[htmlToWhatsApp] Parsing input HTML:', html);

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const blockTags = [
            'body',
            'div',
            'p',
            'blockquote',
            'ul',
            'ol',
            'li',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
        ];

        const convertNode = (
            node: Node,
            listState: { type: 'ul' | 'ol' | null; index: number } = {
                type: null,
                index: 0,
            },
        ): string => {
            if (node.nodeType === 3) {
                // TEXT_NODE
                const text = node.textContent || '';
                const parentName =
                    node.parentNode?.nodeName.toLowerCase() || '';

                // Filter out formatting whitespace newlines between block elements
                if (blockTags.includes(parentName) && !text.trim()) {
                    return '';
                }

                return text;
            }

            if (node.nodeType === 1) {
                // ELEMENT_NODE
                const element = node as Element;
                const tagName = element.tagName.toLowerCase();

                let childrenText = '';
                let currentListState = listState;

                if (tagName === 'ul' || tagName === 'ol') {
                    currentListState = {
                        type: tagName as 'ul' | 'ol',
                        index: 0,
                    };
                }

                element.childNodes.forEach((child) => {
                    // Ignore whitespace text nodes directly inside list wrappers
                    if (
                        (tagName === 'ul' || tagName === 'ol') &&
                        child.nodeType === 3 &&
                        !child.textContent?.trim()
                    ) {
                        return;
                    }

                    if (tagName === 'ol' && child.nodeType === 1) {
                        currentListState = {
                            type: 'ol',
                            index: currentListState.index + 1,
                        };
                    }

                    childrenText += convertNode(child, currentListState);
                });

                switch (tagName) {
                    // Inline bold, italic, strikethrough, code
                    case 'strong':
                    case 'b':
                        return childrenText.trim()
                            ? `*${childrenText.trim()}*`
                            : '';
                    case 'em':
                    case 'i':
                        return childrenText.trim()
                            ? `_${childrenText.trim()}_`
                            : '';
                    case 'strike':
                    case 'del':
                    case 's':
                        return childrenText.trim()
                            ? `~${childrenText.trim()}~`
                            : '';
                    case 'code':
                        return childrenText.trim()
                            ? `\`${childrenText.trim()}\``
                            : '';
                    case 'pre':
                        return childrenText.trim()
                            ? `\`\`\`\n${childrenText}\n\`\`\``
                            : '';

                    // Lists
                    case 'li':
                        if (listState.type === 'ol') {
                            return `${listState.index}. ${childrenText.trim()}\n`;
                        }

                        return `- ${childrenText.trim()}\n`;
                    case 'ul':
                    case 'ol':
                        return `\n${childrenText.trim()}\n`;

                    // Block breaks
                    case 'p':
                    case 'div':
                        return `\n${childrenText}\n`;
                    case 'h1':
                    case 'h2':
                    case 'h3':
                    case 'h4':
                    case 'h5':
                    case 'h6':
                        return `\n*${childrenText.trim()}*\n`;
                    case 'br':
                        return '\n';
                    case 'blockquote':
                        return `\n${childrenText
                            .split('\n')
                            .map((line) => line.trim())
                            .filter(Boolean)
                            .map((line) => `> ${line}`)
                            .join('\n')}\n`;

                    default:
                        return childrenText;
                }
            }

            return '';
        };

        let result = '';
        doc.body.childNodes.forEach((child) => {
            result += convertNode(child);
        });

        const formattedResult = result
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        console.log('[htmlToWhatsApp] Output Markdown:', formattedResult);

        return formattedResult;
    };

    const fallbackCopyText = (text: string, successMsg?: string) => {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;

            textArea.style.position = 'fixed';
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.width = '2em';
            textArea.style.height = '2em';
            textArea.style.padding = '0';
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';
            textArea.style.background = 'transparent';

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                toast.success(successMsg || 'Copied to clipboard!');
            } else {
                toast.error('Failed to copy to clipboard.');
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            toast.error('Failed to copy to clipboard.');
        }
    };

    const fallbackCopyHtml = (
        htmlContent: string,
        plainText: string,
        successMsg?: string,
    ) => {
        try {
            const div = document.createElement('div');
            div.innerHTML = htmlContent;

            // Hide the element offscreen
            div.style.position = 'fixed';
            div.style.pointerEvents = 'none';
            div.style.opacity = '0';
            div.style.left = '-9999px';

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
                    toast.success(
                        successMsg || 'Copied formatted text to clipboard!',
                    );
                } else {
                    fallbackCopyText(plainText, 'Copied text template!');
                }
            } else {
                fallbackCopyText(plainText, 'Copied text template!');
            }
        } catch (err) {
            console.error('Fallback HTML copy failed:', err);
            fallbackCopyText(plainText, 'Copied text template!');
        }
    };



    const handleCopyImageOnly = async () => {
        if (!contentItem.image_path) {
            toast.error('No image available to copy.');

            return;
        }

        setIsCopying(true);

        if (navigator.clipboard && window.isSecureContext) {
            try {
                const response = await fetch(contentItem.image_path);

                if (!response.ok) {
throw new Error('Failed to fetch image');
}

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
                                    if (blob) {
resolve(blob);
} else {
reject(
                                            new Error(
                                                'Canvas conversion to PNG failed',
                                            ),
                                        );
}
                                }, 'image/png');
                            } else {
                                reject(
                                    new Error('Failed to get canvas context'),
                                );
                            }
                        };
                        img.onerror = () =>
                            reject(
                                new Error(
                                    'Failed to load image for conversion',
                                ),
                            );
                        img.src = contentItem.image_path!;
                    });
                }

                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': pngBlob,
                    }),
                ]);

                toast.success('Copied image to clipboard!');
                setIsCopying(false);

                return;
            } catch (err) {
                console.warn('Clipboard image write failed:', err);
                toast.error('Failed to copy image to clipboard.');
            }
        } else {
            toast.error(
                "Image copying is only supported over HTTPS or localhost secure connections. Please use 'Download Image' instead.",
            );
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
                        'text/plain': new Blob([plainText], {
                            type: 'text/plain',
                        }),
                        'text/html': new Blob([htmlText], {
                            type: 'text/html',
                        }),
                    }),
                ]);
                toast.success('Copied formatted text to clipboard!');

                return;
            } catch (err) {
                console.warn(
                    'Clipboard write failed for formatted text, trying fallback copy...',
                    err,
                );
            }
        }

        // Fallback: copy using selection range to preserve styling (pasted in rich editors)
        fallbackCopyHtml(
            htmlText,
            plainText,
            'Copied formatted text to clipboard!',
        );
    };

    const handleDownloadImage = () => {
        if (!contentItem.image_path) {
return;
}

        const link = document.createElement('a');
        link.href = contentItem.image_path;
        link.download = `${contentItem.title.replace(/\s+/g, '_')}_image`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Image download started!');
    };

    const getShareUrl = () => {
        return `${window.location.origin}/share/${contentItem.id}`;
    };

    const handleCopyShareLink = () => {
        const shareUrl = getShareUrl();

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard
                .writeText(shareUrl)
                .then(() => {
                    setCopiedLink(true);
                    toast.success('Copied shareable link to clipboard!');
                    setTimeout(() => setCopiedLink(false), 2050);
                })
                .catch(() => {
                    fallbackCopyText(
                        shareUrl,
                        'Copied shareable link to clipboard!',
                    );
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2050);
                });
        } else {
            fallbackCopyText(shareUrl, 'Copied shareable link to clipboard!');
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2050);
        }
    };

    const handleShareWhatsApp = async () => {
        const plainText = htmlToWhatsApp(contentItem.content);
        const textMessage = `${contentItem.title}\n\n${plainText}\n\nView details: ${getShareUrl()}`;

        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(textMessage);
                toast.success('WhatsApp formatted text copied!');
                setCopiedWhatsAppText(true);
                setTimeout(() => setCopiedWhatsAppText(false), 2050);

                return;
            } catch (err) {
                console.error('Failed to copy WhatsApp text:', err);
            }
        }

        fallbackCopyText(textMessage, 'WhatsApp formatted text copied!');
        setCopiedWhatsAppText(true);
        setTimeout(() => setCopiedWhatsAppText(false), 2050);
    };

    // Dark theme inline style overrides to force pasted HTML contents (like Word pastes)
    // to strip backgrounds and dark colors, making them display beautifully.
    const darkThemeStyleOverride = (
        <style
            dangerouslySetInnerHTML={{
                __html: `
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
        `,
            }}
        />
    );

    if (isPublic) {
        // Guest public view: centered card displaying ONLY the image and the content text (no other dashboard boilerplate)
        return (
            <div className="text-zinc-150 relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 p-4 selection:bg-blue-600/40">
                <Head title={contentItem.title} />
                {darkThemeStyleOverride}

                {/* Ambient Background Glowing Blobs */}
                <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl sm:h-96 sm:w-96" />
                <div className="pointer-events-none absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full bg-sky-500/10 blur-3xl" />

                <div className="relative z-10 w-full max-w-2xl space-y-6 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            {contentItem.title}
                        </h1>
                        {contentItem.category && (
                            <Badge className="rounded-lg border border-blue-500/30 bg-blue-500/20 px-2 py-0.5 text-xs font-semibold tracking-wide text-blue-300 capitalize">
                                {contentItem.category.name}
                            </Badge>
                        )}
                    </div>

                    {/* Image */}
                    {contentItem.image_path && (
                        <div className="flex max-h-[420px] items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-black/40">
                            <img
                                src={contentItem.image_path}
                                alt={contentItem.title}
                                className="mx-auto max-h-[420px] w-auto object-contain"
                            />
                        </div>
                    )}

                    {/* Styled Text Content */}
                    <div
                        className="prose prose-invert rich-text-content max-w-none leading-relaxed break-words text-zinc-300"
                        dangerouslySetInnerHTML={{
                            __html: contentItem.content || '',
                        }}
                    />
                </div>
            </div>
        );
    }

    // Authenticated Dashboard view
    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl bg-slate-950/5 p-4 text-slate-900 sm:p-6 dark:text-zinc-100">
            <Head title={`Share: ${contentItem.title}`} />
            {darkThemeStyleOverride}

            {/* Ambient Background Glowing Blobs */}
            <div
                className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 animate-pulse rounded-full bg-blue-600/15 blur-3xl sm:h-96 sm:w-96 dark:bg-blue-600/10"
                style={{ animationDuration: '8s' }}
            />
            <div
                className="pointer-events-none absolute top-1/2 -right-16 h-64 w-64 animate-pulse rounded-full bg-sky-500/15 blur-3xl sm:h-96 sm:w-96 dark:bg-sky-500/10"
                style={{ animationDuration: '6s' }}
            />

            <div className="relative z-10 mx-auto max-w-6xl space-y-6">
                {/* Back link & title header */}
                <div className="flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/45 p-4 shadow-lg backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-6 dark:border-zinc-800/40 dark:bg-zinc-950/45">
                    <div className="flex min-w-0 items-center gap-3">
                        <Link href="/contents">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0 rounded-xl border border-zinc-200 hover:bg-zinc-100 sm:h-10 sm:w-10 dark:border-zinc-800/60 dark:hover:bg-zinc-900"
                            >
                                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                        </Link>
                        <div className="min-w-0">
                            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                Quick Share view
                            </span>
                            <h1 className="mt-1 truncate text-base font-bold tracking-tight text-slate-900 sm:text-xl dark:text-zinc-100">
                                {contentItem.title}
                            </h1>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <Button
                            onClick={handleCopyShareLink}
                            variant="outline"
                            className="w-full gap-2 rounded-xl border-zinc-200 bg-white/50 text-sm hover:bg-zinc-100 sm:w-auto dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
                        >
                            {copiedLink ? (
                                <Check className="h-4 w-4 text-green-500" />
                            ) : (
                                <LinkIcon className="h-4 w-4" />
                            )}
                            Copy Public Link
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Left Column: Post Card Preview */}
                    <div className="space-y-6 md:col-span-2">
                        <Card className="border-zinc-250 dark:border-zinc-855 flex flex-col overflow-hidden rounded-2xl border bg-white shadow-xl dark:bg-zinc-950">
                            <CardHeader className="dark:border-zinc-850 border-b border-zinc-200/50 bg-zinc-500/5 p-6 pb-4 dark:bg-zinc-900/20">
                                <div className="flex items-center justify-between gap-2">
                                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                                        Post Preview
                                    </CardTitle>
                                    {contentItem.category && (
                                        <Badge className="shrink-0 rounded-lg border border-blue-500/10 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-blue-700 capitalize dark:text-blue-400">
                                            {contentItem.category.name}
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription className="text-xs text-slate-500 dark:text-zinc-500">
                                    This is how the shared content looks. Use
                                    the action panel to copy or share the
                                    details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-6 bg-white p-6 dark:bg-zinc-950">
                                {/* Main Image */}
                                {contentItem.image_path && (
                                    <div className="dark:border-zinc-850 relative flex max-h-[380px] items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-inner dark:bg-zinc-900/40">
                                        <img
                                            src={contentItem.image_path}
                                            alt={contentItem.title}
                                            className="mx-auto max-h-[380px] w-auto object-contain"
                                        />
                                    </div>
                                )}

                                {/* Styled text content */}
                                <div
                                    className="prose dark:prose-invert dark:text-zinc-350 rich-text-content min-h-[100px] max-w-none leading-relaxed break-words text-slate-800"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            contentItem.content ||
                                            '<p className="text-slate-400 italic">No text content.</p>',
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Sharing Panel */}
                    <div className="space-y-6 md:col-span-1">
                        <div className="space-y-6 rounded-2xl border border-white/20 bg-white/45 p-4 shadow-lg backdrop-blur-xl sm:p-6 dark:border-zinc-800/40 dark:bg-zinc-950/45">
                            <div>
                                <h2 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-zinc-400">
                                    Share Actions
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-400 dark:text-zinc-500">
                                    Copy assets individually or post directly.
                                </p>
                            </div>

                            {/* 4 Action Buttons requested by user */}
                            <div className="space-y-3">
                                {/* 1. Copy Text */}
                                <Button
                                    onClick={handleCopyTextOnly}
                                    variant="outline"
                                    className="dark:hover:bg-zinc-850 w-full gap-2 rounded-xl border-zinc-200 bg-white py-6 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-zinc-50 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                                >
                                    <Copy className="h-4.5 w-4.5" />
                                    Copy Text
                                </Button>

                                {/* 2. Copy Image */}
                                <Button
                                    onClick={handleCopyImageOnly}
                                    disabled={
                                        isCopying || !contentItem.image_path
                                    }
                                    variant="outline"
                                    className="dark:hover:bg-zinc-850 w-full gap-2 rounded-xl border-zinc-200 bg-white py-6 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-zinc-50 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                                >
                                    <ImageIcon className="h-4.5 w-4.5" />
                                    {isCopying ? 'Copying...' : 'Copy Image'}
                                </Button>

                                {/* 3. Download Image */}
                                <Button
                                    onClick={handleDownloadImage}
                                    disabled={!contentItem.image_path}
                                    variant="outline"
                                    className="dark:hover:bg-zinc-850 w-full gap-2 rounded-xl border-zinc-200 bg-white py-6 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-zinc-50 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                                >
                                    <Download className="h-4.5 w-4.5" />
                                    Download Image
                                </Button>

                                {/* 4. Share on WhatsApp */}
                                <Button
                                    onClick={handleShareWhatsApp}
                                    className="w-full transform gap-2 rounded-xl border-0 bg-gradient-to-r from-green-600 to-emerald-600 py-6 text-sm font-semibold text-white shadow-md shadow-green-500/10 transition-all duration-200 hover:from-green-500 hover:to-emerald-500 active:scale-98 dark:shadow-green-950/20"
                                >
                                    {copiedWhatsAppText ? (
                                        <Check className="h-4.5 w-4.5" />
                                    ) : (
                                        <MessageSquare className="h-4.5 w-4.5 fill-white" />
                                    )}
                                    {copiedWhatsAppText ? 'Copied WhatsApp Text!' : 'Copy WhatsApp Text'}
                                </Button>
                            </div>

                            {/* WhatsApp Tip Callout */}
                            <div className="dark:border-blue-550/20 flex items-start gap-2.5 rounded-xl border border-blue-500/10 bg-blue-500/5 p-3 text-xs leading-normal text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <div>
                                    <span className="font-semibold">
                                        WhatsApp Tip:
                                    </span>{' '}
                                    Copies the text with bold/italic formatting tags directly to your clipboard. You can paste (<kbd className="rounded bg-blue-500/10 px-1 font-mono text-[10px] dark:bg-blue-500/20">Ctrl+V</kbd>) inside WhatsApp to share it.
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
