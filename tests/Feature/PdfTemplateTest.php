<?php

use App\Models\PdfTemplate;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('non-admin users cannot manage pdf templates', function () {
    $user = User::factory()->create(['role' => 'user']);
    $template = PdfTemplate::create([
        'name' => 'Test Template',
        'content' => '<h1>Hello {{name}}</h1>',
        'variables' => ['name' => ['type' => 'text']],
    ]);

    // Test list is allowed
    $this->actingAs($user)->get('/pdf-templates')->assertStatus(200);

    // Test create is blocked
    $this->actingAs($user)->get('/pdf-templates/create')->assertStatus(403);
    $this->actingAs($user)->post('/pdf-templates', [
        'name' => 'New',
        'content' => 'Content',
    ])->assertStatus(403);

    // Test edit/update is blocked
    $this->actingAs($user)->get("/pdf-templates/{$template->id}/edit")->assertStatus(403);
    $this->actingAs($user)->put("/pdf-templates/{$template->id}", [
        'name' => 'Updated',
        'content' => 'Content',
    ])->assertStatus(403);

    // Test delete is blocked
    $this->actingAs($user)->delete("/pdf-templates/{$template->id}")->assertStatus(403);
});

test('admin users can manage pdf templates', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    // Test create
    $response = $this->actingAs($admin)->post('/pdf-templates', [
        'name' => 'Invoice Template',
        'content' => '<h1>Invoice for {{client_name}}</h1>',
        'variables' => ['client_name' => ['type' => 'text']],
    ]);

    $response->assertRedirect('/pdf-templates?category=uncategory');
    $this->assertDatabaseHas('pdf_templates', ['name' => 'Invoice Template']);

    $template = PdfTemplate::where('name', 'Invoice Template')->first();

    // Test edit
    $this->actingAs($admin)->get("/pdf-templates/{$template->id}/edit")->assertStatus(200);

    // Test update
    $response = $this->actingAs($admin)->put("/pdf-templates/{$template->id}", [
        'name' => 'Updated Invoice Template',
        'content' => '<h1>Invoice for {{client_name}} and {{project}}</h1>',
        'variables' => [
            'client_name' => ['type' => 'text'],
            'project' => ['type' => 'text'],
        ],
    ]);

    $response->assertRedirect('/pdf-templates?category=uncategory');
    $this->assertDatabaseHas('pdf_templates', ['name' => 'Updated Invoice Template']);

    // Test delete
    $this->actingAs($admin)->delete("/pdf-templates/{$template->id}")->assertRedirect('/pdf-templates');
    $this->assertDatabaseMissing('pdf_templates', ['id' => $template->id]);
});

test('all authenticated users can fill and generate pdf', function () {
    $user = User::factory()->create(['role' => 'user']);
    $template = PdfTemplate::create([
        'name' => 'Invoice Template',
        'content' => '<h1>Invoice for {{client_name}}</h1>',
        'variables' => ['client_name' => ['type' => 'text']],
    ]);

    // Test access fill form
    $this->actingAs($user)->get("/pdf-templates/{$template->id}/fill")->assertStatus(200);

    // Test generate PDF download
    $response = $this->actingAs($user)->post("/pdf-templates/{$template->id}/generate", [
        'client_name' => 'Acme Corp',
    ]);

    $response->assertStatus(200);
    $response->assertHeader('content-type', 'application/pdf');
    $response->assertHeader('content-disposition');
});

test('admin can upload image for templates', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    
    Storage::fake('public');
    $file = UploadedFile::fake()->image('document_logo.jpg');

    $response = $this->actingAs($admin)->post('/pdf-templates/upload-image', [
        'file' => $file,
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure(['location']);
    
    $location = $response->json('location');
    $this->assertStringContainsString('/uploads/', $location);
    
    $basename = basename($location);
    $this->assertFileExists(public_path('uploads/' . $basename));
    
    // Clean up file
    @unlink(public_path('uploads/' . $basename));
});

test('admin can request dynamic template visual preview', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->post('/pdf-templates/preview', [
        'content' => '<h1>Previewing {{placeholder}}</h1>',
    ]);

    $response->assertStatus(200);
    $response->assertHeader('content-type', 'application/pdf');
});

test('non-admin cannot access image upload or preview', function () {
    $user = User::factory()->create(['role' => 'user']);
    $file = UploadedFile::fake()->image('unauthorized.jpg');

    $this->actingAs($user)->post('/pdf-templates/upload-image', [
        'file' => $file,
    ])->assertStatus(403);

    $this->actingAs($user)->post('/pdf-templates/preview', [
        'content' => '<h1>Preview</h1>',
    ])->assertStatus(403);
});

test('creating template with category name registers or links it correctly', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    // 1. Create with new category
    $response = $this->actingAs($admin)->post('/pdf-templates', [
        'name' => 'Invoice ABC',
        'content' => '<h1>Invoice for {{client}}</h1>',
        'variables' => ['client' => ['type' => 'text']],
        'category_name' => 'Invoices Billing',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('categories', ['name' => 'Invoices Billing', 'slug' => 'invoices-billing']);
    $this->assertDatabaseHas('pdf_templates', ['name' => 'Invoice ABC']);

    $template = PdfTemplate::where('name', 'Invoice ABC')->first();
    $this->assertEquals('Invoices Billing', $template->category->name);

    // 2. Create with existing category (reuse)
    $response2 = $this->actingAs($admin)->post('/pdf-templates', [
        'name' => 'Invoice XYZ',
        'content' => '<h1>Invoice for {{client}}</h1>',
        'variables' => ['client' => ['type' => 'text']],
        'category_name' => 'Invoices Billing',
    ]);

    $template2 = PdfTemplate::where('name', 'Invoice XYZ')->first();
    $this->assertEquals($template->category_id, $template2->category_id);

    // 3. Create without category defaults to uncategory
    $response3 = $this->actingAs($admin)->post('/pdf-templates', [
        'name' => 'Invoice Uncat',
        'content' => '<h1>Invoice for {{client}}</h1>',
        'variables' => ['client' => ['type' => 'text']],
    ]);

    $template3 = PdfTemplate::where('name', 'Invoice Uncat')->first();
    $this->assertEquals('uncategory', $template3->category->name);
});

test('searching categories returns correct autocomplete suggestions', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['role' => 'user']);
    
    // Create test categories
    \App\Models\Category::firstOrCreate(['name' => 'Financial Invoices', 'slug' => 'financial-invoices']);
    \App\Models\Category::firstOrCreate(['name' => 'Legal Contracts', 'slug' => 'legal-contracts']);

    // Admin can search when query >= 3 chars
    $response = $this->actingAs($admin)->get('/pdf-templates/categories/search?query=Fin');
    $response->assertStatus(200);
    $response->assertJsonFragment(['Financial Invoices']);

    // Under 3 chars returns empty
    $responseShort = $this->actingAs($admin)->get('/pdf-templates/categories/search?query=Fi');
    $responseShort->assertExactJson([]);

    // Non-admin blocked
    $this->actingAs($user)->get('/pdf-templates/categories/search?query=Fin')->assertStatus(403);
});

test('listing templates under specific category', function () {
    $user = User::factory()->create(['role' => 'user']);
    $category = \App\Models\Category::firstOrCreate(['name' => 'Contracts', 'slug' => 'contracts']);
    $template = PdfTemplate::create([
        'name' => 'NDAs Template',
        'content' => '<h1>NDA</h1>',
        'variables' => [],
        'category_id' => $category->id
    ]);

    // View categories landing page
    $responseList = $this->actingAs($user)->get('/pdf-templates');
    $responseList->assertStatus(200);

    // Filter by specific category slug
    $responseFilter = $this->actingAs($user)->get('/pdf-templates?category=contracts');
    $responseFilter->assertStatus(200);
});

