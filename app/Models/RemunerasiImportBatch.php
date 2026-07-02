<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RemunerasiImportBatch extends Model
{
    protected $guarded = [];

    protected $casts = [
        'imported_at' => 'datetime',
    ];

    public function period(): BelongsTo
    {
        return $this->belongsTo(RemunerasiPeriod::class, 'remunerasi_period_id');
    }

    public function importedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by');
    }

    public function errors(): HasMany
    {
        return $this->hasMany(RemunerasiImportError::class);
    }
}