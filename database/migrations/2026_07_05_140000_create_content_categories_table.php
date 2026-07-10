<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Drop existing category_id relationship from shareable_contents if it exists
        if (Schema::hasColumn('shareable_contents', 'category_id')) {
            Schema::table('shareable_contents', function (Blueprint $table) {
                // Check if foreign key exists before dropping
                try {
                    $table->dropForeign(['category_id']);
                } catch (Exception $e) {
                    // Ignore if constraint doesn't exist
                }
                $table->dropColumn('category_id');
            });
        }

        // 2. Create content_categories table
        Schema::create('content_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // 3. Insert default category 'uncategory' for content
        $uncatId = DB::table('content_categories')->insertGetId([
            'name' => 'uncategory',
            'slug' => 'uncategory',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 4. Add category_id foreign key referencing content_categories table
        Schema::table('shareable_contents', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('id')->constrained('content_categories')->nullOnDelete();
        });

        // 5. Update existing shareable contents to point to default uncategory
        DB::table('shareable_contents')->update(['category_id' => $uncatId]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shareable_contents', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });

        Schema::dropIfExists('content_categories');
    }
};
