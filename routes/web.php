<?php

use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

// Redirect welcome page to dashboard so they must log in
Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

// Public guest sharing route for Quick Shares
Route::get('/share/{shareable_content}', [\App\Http\Controllers\ShareableContentController::class, 'publicShow'])->name('shareable-contents.public-show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $stats = [
            'shares_count' => \App\Models\ShareableContent::count(),
            'templates_count' => \App\Models\PdfTemplate::count(),
        ];
        
        if (auth()->user()->isAdmin()) {
            $stats['users_count'] = \App\Models\User::count();
        }
        
        $recentShares = \App\Models\ShareableContent::latest()->limit(3)->get();
        $recentTemplates = \App\Models\PdfTemplate::with('category')->latest()->limit(3)->get();
        
        return Inertia\Inertia::render('dashboard', [
            'stats' => $stats,
            'recentShares' => $recentShares,
            'recentTemplates' => $recentTemplates,
        ]);
    })->name('dashboard');

    // Quick Shares routes (accessible by all authenticated users)
    Route::get('contents', [\App\Http\Controllers\ShareableContentController::class, 'publicIndex'])->name('shareable-contents.public-index');
    Route::get('contents/{shareable_content}', [\App\Http\Controllers\ShareableContentController::class, 'show'])->name('shareable-contents.show');

    // Admin-only User Management CRUD routes
    Route::middleware([EnsureUserIsAdmin::class])->group(function () {
        Route::resource('users', UserController::class);
        Route::patch('users/{user}/suspend', [UserController::class, 'suspend'])->name('users.suspend');
        
        // Admin-only Quick Shares CRUD management
        Route::get('shareable-contents/categories/search', [\App\Http\Controllers\ShareableContentController::class, 'searchCategories'])->name('shareable-contents.categories.search');
        Route::resource('shareable-contents', \App\Http\Controllers\ShareableContentController::class)->except(['show']);
    });

    // PDF Templates routes (accessible by all authenticated users)
    Route::get('pdf-templates', [\App\Http\Controllers\PdfTemplateController::class, 'index'])->name('pdf-templates.index');
    Route::get('pdf-templates/{pdf_template}/fill', [\App\Http\Controllers\PdfTemplateController::class, 'fillForm'])->name('pdf-templates.fill-form');
    Route::post('pdf-templates/{pdf_template}/generate', [\App\Http\Controllers\PdfTemplateController::class, 'generatePdf'])->name('pdf-templates.generate');
    Route::post('pdf-templates/{pdf_template}/preview-filled', [\App\Http\Controllers\PdfTemplateController::class, 'previewFilled'])->name('pdf-templates.preview-filled');

    // Admin-only PDF Template management
    Route::middleware([EnsureUserIsAdmin::class])->group(function () {
        Route::get('pdf-templates/categories/search', [\App\Http\Controllers\PdfTemplateController::class, 'searchCategories'])->name('pdf-templates.categories.search');
        Route::get('pdf-templates/create', [\App\Http\Controllers\PdfTemplateController::class, 'create'])->name('pdf-templates.create');
        Route::post('pdf-templates', [\App\Http\Controllers\PdfTemplateController::class, 'store'])->name('pdf-templates.store');
        Route::get('pdf-templates/{pdf_template}/edit', [\App\Http\Controllers\PdfTemplateController::class, 'edit'])->name('pdf-templates.edit');
        Route::put('pdf-templates/{pdf_template}', [\App\Http\Controllers\PdfTemplateController::class, 'update'])->name('pdf-templates.update');
        Route::delete('pdf-templates/{pdf_template}', [\App\Http\Controllers\PdfTemplateController::class, 'destroy'])->name('pdf-templates.destroy');
        Route::post('pdf-templates/upload-image', [\App\Http\Controllers\PdfTemplateController::class, 'uploadImage'])->name('pdf-templates.upload-image');
        Route::post('pdf-templates/preview', [\App\Http\Controllers\PdfTemplateController::class, 'preview'])->name('pdf-templates.preview');
    });
});

require __DIR__.'/settings.php';
