<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\PdfTemplate;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class PdfTemplateController extends Controller
{
    /**
     * Display a listing of the templates.
     */
    /**
     * Display a listing of the templates.
     */
    public function index(Request $request)
    {
        $categorySlug = $request->query('category');

        if ($categorySlug) {
            $category = Category::where('slug', $categorySlug)->first();
            if (! $category) {
                return to_route('pdf-templates.index');
            }
            $templates = PdfTemplate::with('category')->where('category_id', $category->id)->latest()->get();

            return Inertia::render('pdf-templates/index', [
                'templates' => $templates,
                'category' => $category,
                'categories' => [],
            ]);
        }

        // Default: show categories grid view
        $categories = Category::withCount('pdfTemplates')->get();

        return Inertia::render('pdf-templates/index', [
            'categories' => $categories,
            'templates' => [],
            'category' => null,
        ]);
    }

    /**
     * Show the form for creating a new template.
     */
    public function create(): InertiaResponse
    {
        return Inertia::render('pdf-templates/create', [
            'default_category' => 'uncategory',
        ]);
    }

    /**
     * Store a newly created template in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'variables' => ['nullable', 'array'],
            'category_name' => ['nullable', 'string', 'max:255'],
        ]);

        $categoryName = trim($request->input('category_name', 'uncategory'));
        if (empty($categoryName)) {
            $categoryName = 'uncategory';
        }

        $category = Category::firstOrCreate(
            ['name' => $categoryName],
            ['slug' => Str::slug($categoryName)]
        );

        $validated['category_id'] = $category->id;

        PdfTemplate::create($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('PDF template created successfully.'),
        ]);

        return to_route('pdf-templates.index', ['category' => $category->slug]);
    }

    /**
     * Show the form for editing the specified template.
     */
    public function edit(PdfTemplate $pdfTemplate): InertiaResponse
    {
        $pdfTemplate->load('category');

        return Inertia::render('pdf-templates/edit', [
            'template' => $pdfTemplate,
            'category_name' => $pdfTemplate->category ? $pdfTemplate->category->name : 'uncategory',
        ]);
    }

    /**
     * Update the specified template in storage.
     */
    public function update(Request $request, PdfTemplate $pdfTemplate): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'variables' => ['nullable', 'array'],
            'category_name' => ['nullable', 'string', 'max:255'],
        ]);

        $categoryName = trim($request->input('category_name', 'uncategory'));
        if (empty($categoryName)) {
            $categoryName = 'uncategory';
        }

        $category = Category::firstOrCreate(
            ['name' => $categoryName],
            ['slug' => Str::slug($categoryName)]
        );

        $validated['category_id'] = $category->id;

        $pdfTemplate->update($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('PDF template updated successfully.'),
        ]);

        return to_route('pdf-templates.index', ['category' => $category->slug]);
    }

    /**
     * Search categories for autocomplete query >= 3 characters.
     */
    public function searchCategories(Request $request)
    {
        $query = $request->query('query', '');
        if (strlen($query) < 3) {
            return response()->json([]);
        }

        $categories = Category::where('name', 'like', "%{$query}%")
            ->limit(10)
            ->pluck('name');

        return response()->json($categories);
    }

    /**
     * Remove the specified template from storage.
     */
    public function destroy(PdfTemplate $pdfTemplate): RedirectResponse
    {
        $pdfTemplate->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('PDF template deleted successfully.'),
        ]);

        return to_route('pdf-templates.index');
    }

    /**
     * Show the form to fill up variables.
     */
    public function fillForm(PdfTemplate $pdfTemplate): InertiaResponse
    {
        return Inertia::render('pdf-templates/fill', [
            'template' => $pdfTemplate,
        ]);
    }

    /**
     * Convert image src URLs in HTML to base64 data URIs so Dompdf can embed them.
     * Uses DOMDocument for robust parsing — handles any attribute order TinyMCE produces.
     */
    private function embedImages(string $html): string
    {
        if (empty(trim($html))) {
            return $html;
        }

        $publicDir = public_path();
        $docRoot = $_SERVER['DOCUMENT_ROOT'] ?? null;

        // Establish possible public directory roots to search (useful on Hostinger public_html setups)
        $searchDirs = array_filter([
            $publicDir,
            $docRoot,
            base_path('public_html'),
            base_path('public'),
        ]);

        // Wrap in a div so DOMDocument doesn't add <html>/<body> wrappers
        $wrapped = '<div id="__wrap__">'.$html.'</div>';

        $dom = new \DOMDocument('1.0', 'UTF-8');
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="UTF-8">'.$wrapped, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        foreach ($dom->getElementsByTagName('img') as $img) {
            $src = $img->getAttribute('src');

            // Skip empty or already embedded
            if (empty($src) || str_starts_with($src, 'data:') || str_starts_with($src, 'blob:')) {
                continue;
            }

            // Resolve to local file path using parse_url to ignore host/port differences
            $path = parse_url($src, PHP_URL_PATH);
            if (empty($path)) {
                continue;
            }

            $base64 = null;
            $mimeType = null;

            // 1. Try local filesystem paths across all possible directories
            foreach ($searchDirs as $dir) {
                $filePath = null;
                if (preg_match('/(?:^|\/)uploads\/(.+)$/i', $path, $matches)) {
                    $filePath = $dir.DIRECTORY_SEPARATOR.'uploads'.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $matches[1]);
                } else {
                    $filePath = $dir.DIRECTORY_SEPARATOR.ltrim(str_replace('/', DIRECTORY_SEPARATOR, $path), DIRECTORY_SEPARATOR);
                }
                $filePath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $filePath);

                if (file_exists($filePath) && is_readable($filePath)) {
                    $mimeType = mime_content_type($filePath);
                    $fileData = @file_get_contents($filePath);
                    if ($fileData !== false) {
                        $base64 = base64_encode($fileData);
                        break;
                    }
                }
            }

            // 2. Fallback: If local file not found or unreadable, fetch via HTTP/HTTPS
            if (! $base64) {
                $absoluteUrl = $src;
                // If it's a relative URL, prepend config('app.url')
                if (! str_starts_with($src, 'http://') && ! str_starts_with($src, 'https://')) {
                    $absoluteUrl = rtrim(config('app.url'), '/').'/'.ltrim($src, '/');
                }

                // Fetch remote content with timeout and stream context to avoid blocking indefinitely
                $context = stream_context_create([
                    'http' => ['timeout' => 5],
                    'ssl' => ['verify_peer' => false, 'verify_peer_name' => false], // Ignore self-signed ssl issues on local/staging
                ]);
                $fileData = @file_get_contents($absoluteUrl, false, $context);
                if ($fileData !== false) {
                    $base64 = base64_encode($fileData);
                    // Infer mime type from extension or fallback
                    $ext = strtolower(pathinfo(parse_url($absoluteUrl, PHP_URL_PATH), PATHINFO_EXTENSION));
                    $mimeType = match ($ext) {
                        'png' => 'image/png',
                        'gif' => 'image/gif',
                        'webp' => 'image/webp',
                        default => 'image/jpeg',
                    };
                }
            }

            // If we successfully got base64 data, embed it!
            if ($base64 && $mimeType) {
                $img->setAttribute('src', "data:{$mimeType};base64,{$base64}");
            }

            // Also clear data-mce-src so it doesn't confuse anything
            if ($img->hasAttribute('data-mce-src')) {
                $img->removeAttribute('data-mce-src');
            }
        }

        // Extract just the inner content of our wrapper div
        $wrapNode = $dom->getElementById('__wrap__');
        $result = '';
        if ($wrapNode) {
            foreach ($wrapNode->childNodes as $child) {
                $result .= $dom->saveHTML($child);
            }
        }

        return $result ?: $html;
    }

    /**
     * Shared helper: build the full A4 HTML document string.
     * Includes comprehensive CSS for Word-pasted content and Dompdf-compatible layouts.
     */
    private function buildDocument(string $bodyHtml): string
    {
        // Pre-process: strip CSS properties Dompdf cannot handle to prevent layout corruption.
        // Dompdf does NOT support flexbox or grid - remove them so content flows naturally.
        $bodyHtml = preg_replace('/display\s*:\s*(flex|inline-flex|grid|inline-grid)\s*;?/i', '', $bodyHtml);
        $bodyHtml = preg_replace('/flex(?:-direction|-wrap|-flow|-grow|-shrink|-basis|box)?\s*:[^;";]+;?/i', '', $bodyHtml);
        $bodyHtml = preg_replace('/grid(?:-template|-area|-column|-row|-gap|gap)?\s*:[^;";]+;?/i', '', $bodyHtml);
        $bodyHtml = preg_replace('/align-(?:items|content|self)\s*:[^;";]+;?/i', '', $bodyHtml);
        $bodyHtml = preg_replace('/justify-(?:content|items|self)\s*:[^;";]+;?/i', '', $bodyHtml);

        // Ensure storage/fonts directory exists for Dompdf font cache
        $storageFonts = storage_path('fonts');
        if (! file_exists($storageFonts)) {
            @mkdir($storageFonts, 0755, true);
        }

        // Define local Calibri font paths
        $calibri = str_replace('\\', '/', public_path('fonts/calibri.ttf'));
        $calibriBold = str_replace('\\', '/', public_path('fonts/calibrib.ttf'));
        $calibriItalic = str_replace('\\', '/', public_path('fonts/calibrii.ttf'));
        $calibriBoldItalic = str_replace('\\', '/', public_path('fonts/calibriz.ttf'));
        $calibriLight = str_replace('\\', '/', public_path('fonts/calibril.ttf'));
        $calibriLightItalic = str_replace('\\', '/', public_path('fonts/calibrili.ttf'));

        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                @font-face {
                    font-family: "Calibri";
                    src: url("'.$calibri.'") format("truetype");
                    font-weight: normal;
                    font-style: normal;
                }
                @font-face {
                    font-family: "Calibri";
                    src: url("'.$calibriBold.'") format("truetype");
                    font-weight: bold;
                    font-style: normal;
                }
                @font-face {
                    font-family: "Calibri";
                    src: url("'.$calibriItalic.'") format("truetype");
                    font-weight: normal;
                    font-style: italic;
                }
                @font-face {
                    font-family: "Calibri";
                    src: url("'.$calibriBoldItalic.'") format("truetype");
                    font-weight: bold;
                    font-style: italic;
                }
                @font-face {
                    font-family: "Calibri";
                    src: url("'.$calibriLight.'") format("truetype");
                    font-weight: 300;
                    font-style: normal;
                }
                @font-face {
                    font-family: "Calibri";
                    src: url("'.$calibriLightItalic.'") format("truetype");
                    font-weight: 300;
                    font-style: italic;
                }

                @page {
                    margin: 20mm 18mm 20mm 18mm;
                    size: A4 portrait;
                }

                * {
                    box-sizing: border-box;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }

                body {
                    font-family: "Calibri", "DejaVu Sans", sans-serif;
                    font-size: 11px;
                    line-height: 1.4;
                    color: #000;
                }

                h1, h2, h3, h4, h5, h6 {
                    color: #000;
                    margin: 6px 0;
                    page-break-after: avoid;
                }

                p {
                    margin: 4px 0;
                    orphans: 2;
                    widows: 2;
                }

                /* ── TABLE STYLES ──────────────────────────────────
                   Tables are the ONLY reliable way to do multi-column
                   layouts in Dompdf. Word documents paste as tables
                   and this ensures they render correctly.
                ───────────────────────────────────────────────── */
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 10px;
                    table-layout: auto;
                    page-break-inside: avoid;
                }

                td, th {
                    vertical-align: top;
                    padding: 5px 6px;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }

                /* Borderless tables (layout tables from Word) */
                table[style*="border: none"],
                table[style*="border:none"],
                table[border="0"] {
                    border: none;
                }

                table[style*="border: none"] td,
                table[style*="border: none"] th,
                table[border="0"] td,
                table[border="0"] th {
                    border: none;
                }

                /* Standard bordered tables */
                table:not([border="0"]):not([style*="border: none"]):not([style*="border:none"]) td,
                table:not([border="0"]):not([style*="border: none"]):not([style*="border:none"]) th {
                    border: 1px solid #ccc;
                }

                th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                }

                /* ── IMAGES ────────────────────────────────────── */
                img {
                    max-width: 100%;
                    height: auto;
                }

                /* ── TEXT UTILITIES ────────────────────────────── */
                strong, b { font-weight: bold; }
                em, i     { font-style: italic; }
                u         { text-decoration: underline; }
                s, strike { text-decoration: line-through; }

                ul, ol {
                    margin: 4px 0 4px 18px;
                    padding: 0;
                }

                li { margin-bottom: 2px; }

                /* ── WORD-SPECIFIC OVERRIDES ───────────────────── */
                /* Word pastes often include mso-* styles and class names
                   like MsoNormal, MsoBodyText etc. Neutralise them. */
                .MsoNormal, .MsoBodyText, .MsoListParagraph {
                    margin: 0;
                    line-height: 1.5;
                }

                /* Horizontal rule */
                hr {
                    border: none;
                    border-top: 1px solid #999;
                    margin: 8px 0;
                }

                /* Page-break helpers */
                .page-break { page-break-before: always; }
            </style>
        </head>
        <body>
            '.$bodyHtml.'
        </body>
        </html>
        ';
    }

    /**
     * Generate and download PDF.
     */
    public function generatePdf(Request $request, PdfTemplate $pdfTemplate): SymfonyResponse
    {
        // Get variable definitions
        $variablesDef = $pdfTemplate->variables ?? [];

        // Build validation rules dynamically
        $rules = [];
        foreach ($variablesDef as $varName => $def) {
            $rules[$varName] = ['required', 'string'];
        }

        // Validate request inputs
        $validatedData = $request->validate($rules);

        // Replace placeholders in content
        $htmlContent = $pdfTemplate->content;
        foreach ($validatedData as $varName => $varValue) {
            $type = $variablesDef[$varName]['type'] ?? 'text';
            $formattedValue = $type === 'textarea' ? nl2br(e($varValue)) : e($varValue);
            $htmlContent = preg_replace('/\{\{\s*'.preg_quote($varName, '/').'\s*\}\}/', $formattedValue, $htmlContent);
        }

        // Embed images as base64 so Dompdf can render them
        $htmlContent = $this->embedImages($htmlContent);

        $pdf = Pdf::loadHTML($this->buildDocument($htmlContent))
            ->setPaper('A4', 'portrait')
            ->setOption('isRemoteEnabled', true)
            ->setOption('isHtml5ParserEnabled', true);

        return $pdf->download(slugify($pdfTemplate->name).'_'.time().'.pdf');
    }

    /**
     * Preview PDF with filled variable values (accessible by all auth users).
     */
    public function previewFilled(Request $request, PdfTemplate $pdfTemplate): SymfonyResponse
    {
        $variablesDef = $pdfTemplate->variables ?? [];

        // Accept any string inputs — we just replace what we can
        $htmlContent = $pdfTemplate->content;
        foreach ($variablesDef as $varName => $def) {
            $value = $request->input($varName, '');
            $type = $def['type'] ?? 'text';
            $formattedValue = $type === 'textarea' ? nl2br(e($value)) : e($value);
            $htmlContent = preg_replace('/\{\{\s*'.preg_quote($varName, '/').'\s*\}\}/', $formattedValue, $htmlContent);
        }

        // Highlight any unfilled placeholders in blue
        $htmlContent = preg_replace('/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/', '<span style="color:#2563eb;font-weight:bold;">[$1]</span>', $htmlContent);

        // Embed images as base64
        $htmlContent = $this->embedImages($htmlContent);

        $pdf = Pdf::loadHTML($this->buildDocument($htmlContent))
            ->setPaper('A4', 'portrait')
            ->setOption('isRemoteEnabled', true)
            ->setOption('isHtml5ParserEnabled', true);

        return $pdf->stream('preview.pdf');
    }

    /**
     * Upload an image from TinyMCE.
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'file' => ['required', 'image', 'max:5120'], // Max 5MB
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();

            // Ensure public/uploads directory exists
            if (! file_exists(public_path('uploads'))) {
                mkdir(public_path('uploads'), 0755, true);
            }

            $file->move(public_path('uploads'), $filename);

            return response()->json([
                'location' => asset('uploads/'.$filename),
            ]);
        }

        return response()->json(['error' => 'No file uploaded.'], 400);
    }

    /**
     * Preview the PDF content visual (admin - raw editor HTML with placeholder highlights).
     */
    public function preview(Request $request)
    {
        $request->validate([
            'content' => ['required', 'string'],
        ]);

        $htmlContent = $request->input('content');

        // Log the HTML content for debugging purposes
        file_put_contents(storage_path('logs/paste_debug.html'), $htmlContent);

        // Highlight unfilled placeholders in blue
        $htmlContent = preg_replace('/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/', '<span style="color:#2563eb;font-weight:bold;">[$1]</span>', $htmlContent);

        // Embed images as base64
        $htmlContent = $this->embedImages($htmlContent);

        $pdf = Pdf::loadHTML($this->buildDocument($htmlContent))
            ->setPaper('A4', 'portrait')
            ->setOption('isRemoteEnabled', true)
            ->setOption('isHtml5ParserEnabled', true);

        return $pdf->stream('preview.pdf');
    }
}

// Simple slugify helper
function slugify($text)
{
    // replace non letter or digits by -
    $text = preg_replace('~[^\pL\d]+~u', '_', $text);
    // transliterate
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    // remove unwanted characters
    $text = preg_replace('~[^-\w]+~', '', $text);
    // trim
    $text = trim($text, '_');
    // remove duplicate -
    $text = preg_replace('~-+~', '_', $text);
    // lowercase
    $text = strtolower($text);

    if (empty($text)) {
        return 'n_a';
    }

    return $text;
}
