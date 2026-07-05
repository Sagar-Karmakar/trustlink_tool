<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
#[Fillable(['name', 'slug'])]
class Category extends Model
{
    use HasFactory;

    /**
     * Get the templates for the category.
     */
    public function pdfTemplates(): HasMany
    {
        return $this->hasMany(PdfTemplate::class);
    }

}
