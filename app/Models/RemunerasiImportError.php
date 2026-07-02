<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RemunerasiImportError extends Model
{
    protected $guarded = [];

    protected $casts = [
        'raw_data' => 'array',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(RemunerasiImportBatch::class, 'remunerasi_import_batch_id');
    }
}