<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pegawai extends Model
{
    protected $guarded = [];

    protected $casts = [
        'tanggal_lahir' => 'datetime',
        'non_pegawai' => 'boolean',
        'status_aktif' => 'boolean',
        'source_updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function jabatan(): BelongsTo
    {
        return $this->belongsTo(Jabatan::class);
    }

    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class);
    }

    public function remunerasiDetails(): HasMany
    {
        return $this->hasMany(RemunerasiDetail::class);
    }

    public function getNamaLengkapAttribute(): string
    {
        return trim(
            collect([
                $this->gelar_depan,
                $this->nama,
                $this->gelar_belakang,
            ])->filter()->implode(' ')
        );
    }

    public function getJenisKelaminLabelAttribute(): string
    {
        return match ((int) $this->jenis_kelamin) {
            1 => 'Laki-laki',
            2 => 'Perempuan',
            default => '-',
        };
    }
}