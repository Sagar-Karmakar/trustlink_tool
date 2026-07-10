<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string|null $image_path
 * @property string|null $content
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['title', 'image_path', 'content', 'category_id'])]
class ShareableContent extends Model
{
    use HasFactory;

    /**
     * Get the category that owns the quick share.
     */
    public function category()
    {
        return $this->belongsTo(ContentCategory::class, 'category_id');
    }
}
