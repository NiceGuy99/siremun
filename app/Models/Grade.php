<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Grade extends Model
{
    protected $guarded = [];

    protected $casts = [
        'nilai_grade' => 'decimal:2',
        'status' => 'boolean',
    ];

    public function pegawais(): HasMany
    {
        return $this->hasMany(Pegawai::class);
    }
}