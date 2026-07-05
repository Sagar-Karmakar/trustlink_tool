<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug'])]
class ContentCategory extends Model
{
    use HasFactory;

    /**
     * Get the quick shares for the category.
     */
    public function shareableContents(): HasMany
    {
        return $this->hasMany(ShareableContent::class, 'category_id');
    }
}
