<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RemunerasiPeriod extends Model
{
    protected $guarded = [];

    protected $casts = [
        'published_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function details(): HasMany
    {
        return $this->hasMany(RemunerasiDetail::class);
    }

    public function getLabelAttribute(): string
    {
        return $this->nama_periode ?: "{$this->bulan}/{$this->tahun}";
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function isClosed(): bool
    {
        return $this->status === 'closed';
    }
}