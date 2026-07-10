<?php

namespace App\Http\Controllers;

use App\Models\ContentCategory;
use App\Models\ShareableContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ShareableContentController extends Controller
{
    /**
     * Display a listing of the resource for admins (CRUD).
     */
    public function index(): Response
    {
        $contents = ShareableContent::with('category')->latest()->get();

        return Inertia::render('shareable-contents/index', [
            'contents' => $contents,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('shareable-contents/form', [
            'contentItem' => null,
            'isEdit' => false,
            'category_name' => 'uncategory',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'image' => ['required', 'image', 'max:5120'], // Max 5MB, required on create
            'content' => ['nullable', 'string'],
            'category_name' => ['nullable', 'string', 'max:255'],
        ]);

        $categoryName = trim($request->input('category_name', 'uncategory'));
        if (empty($categoryName)) {
            $categoryName = 'uncategory';
        }

        $category = ContentCategory::firstOrCreate(
            ['name' => $categoryName],
            ['slug' => Str::slug($categoryName)]
        );

        $validated['category_id'] = $category->id;

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();

            // Ensure public/uploads exists
            if (! file_exists(public_path('uploads'))) {
                mkdir(public_path('uploads'), 0755, true);
            }

            $file->move(public_path('uploads'), $filename);
            $validated['image_path'] = '/uploads/'.$filename;
        }

        ShareableContent::create($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Quick Share content created successfully.'),
        ]);

        return to_route('shareable-contents.public-index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ShareableContent $shareableContent): Response
    {
        $shareableContent->load('category');

        return Inertia::render('shareable-contents/form', [
            'contentItem' => $shareableContent,
            'isEdit' => true,
            'category_name' => $shareableContent->category ? $shareableContent->category->name : 'uncategory',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ShareableContent $shareableContent): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'max:5120'], // Optional on update
            'content' => ['nullable', 'string'],
            'category_name' => ['nullable', 'string', 'max:255'],
        ]);

        $categoryName = trim($request->input('category_name', 'uncategory'));
        if (empty($categoryName)) {
            $categoryName = 'uncategory';
        }

        $category = ContentCategory::firstOrCreate(
            ['name' => $categoryName],
            ['slug' => Str::slug($categoryName)]
        );

        $validated['category_id'] = $category->id;

        if ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($shareableContent->image_path) {
                $oldPath = public_path($shareableContent->image_path);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            $file = $request->file('image');
            $filename = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();

            // Ensure public/uploads exists
            if (! file_exists(public_path('uploads'))) {
                mkdir(public_path('uploads'), 0755, true);
            }

            $file->move(public_path('uploads'), $filename);
            $validated['image_path'] = '/uploads/'.$filename;
        }

        $shareableContent->update($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Quick Share content updated successfully.'),
        ]);

        return to_route('shareable-contents.public-index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ShareableContent $shareableContent): RedirectResponse
    {
        // Delete image file from disk
        if ($shareableContent->image_path) {
            $oldPath = public_path($shareableContent->image_path);
            if (file_exists($oldPath)) {
                @unlink($oldPath);
            }
        }

        $shareableContent->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Quick Share content deleted successfully.'),
        ]);

        return to_route('shareable-contents.public-index');
    }

    /**
     * Display a public-facing grid listing for users.
     */
    public function publicIndex(Request $request): Response
    {
        $categorySlug = $request->query('category');

        if ($categorySlug) {
            $category = ContentCategory::where('slug', $categorySlug)->first();
            if (! $category) {
                return to_route('shareable-contents.public-index');
            }
            $contents = ShareableContent::with('category')->where('category_id', $category->id)->latest()->get();

            return Inertia::render('shareable-contents/public-index', [
                'contents' => $contents,
                'category' => $category,
                'categories' => [],
            ]);
        }

        // Default: show categories grid view
        $categories = ContentCategory::withCount('shareableContents')->get();

        return Inertia::render('shareable-contents/public-index', [
            'categories' => $categories,
            'contents' => [],
            'category' => null,
        ]);
    }

    /**
     * Show the detailed sharing page for logged-in users.
     */
    public function show(ShareableContent $shareableContent): Response
    {
        $shareableContent->load('category');

        return Inertia::render('shareable-contents/show', [
            'contentItem' => $shareableContent,
            'isPublic' => false,
        ]);
    }

    /**
     * Show the detailed sharing page for guest users (public route).
     */
    public function publicShow($id): Response
    {
        $content = ShareableContent::with('category')->findOrFail($id);

        // Prepare clean plain-text description for meta previews
        $plainText = preg_replace('/\s+/', ' ', strip_tags($content->content ?? ''));
        $description = mb_substr($plainText, 0, 160);

        return Inertia::render('shareable-contents/public-show', [
            'contentItem' => $content,
            'isPublic' => true,
        ])->withViewData([
            'ogTitle' => $content->title,
            'ogDescription' => $description,
            'ogImage' => $content->image_path ? asset($content->image_path) : null,
            'ogUrl' => route('shareable-contents.public-show', $content->id),
        ]);
    }

    /**
     * Search category names for autocomplete.
     */
    public function searchCategories(Request $request)
    {
        $query = $request->query('query');
        $categories = ContentCategory::where('name', 'like', "%{$query}%")->pluck('name');

        return response()->json($categories);
    }
}
