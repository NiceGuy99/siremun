<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class RemunerasiDetail extends Model
{
    use LogsActivity;

    protected $guarded = [];

    protected $casts = [
        'gaji' => 'decimal:2',
        'honorarium' => 'decimal:2',
        'tunjangan_tetap' => 'decimal:2',
        'insentif_kerja' => 'decimal:2',
        'jasa_pelayanan' => 'decimal:2',
        'ffs' => 'decimal:2',
        'uang_makan' => 'decimal:2',
        'thr' => 'decimal:2',
        'gaji_13' => 'decimal:2',
        'potongan' => 'decimal:2',
        'pajak' => 'decimal:2',
        'total_bruto' => 'decimal:2',
        'total_potongan' => 'decimal:2',
        'total_diterima' => 'decimal:2',
        'verified_at' => 'datetime',
        'approved_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    public function period(): BelongsTo
    {
        return $this->belongsTo(RemunerasiPeriod::class, 'remunerasi_period_id');
    }

    public function pegawai(): BelongsTo
    {
        return $this->belongsTo(Pegawai::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function hitungTotal(): void
    {
        $this->total_bruto =
            $this->gaji +
            $this->honorarium +
            $this->tunjangan_tetap +
            $this->insentif_kerja +
            $this->jasa_pelayanan +
            $this->ffs +
            $this->uang_makan +
            $this->thr +
            $this->gaji_13;

        $this->total_potongan =
            $this->potongan +
            $this->pajak;

        $this->total_diterima =
            $this->total_bruto -
            $this->total_potongan;
    }

    protected static function booted(): void
    {
        static::saving(function (RemunerasiDetail $detail) {
            $detail->hitungTotal();
        });
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('remunerasi')
            ->logOnly([
                'remunerasi_period_id',
                'pegawai_id',
                'gaji',
                'honorarium',
                'tunjangan_tetap',
                'insentif_kerja',
                'jasa_pelayanan',
                'ffs',
                'uang_makan',
                'thr',
                'gaji_13',
                'potongan',
                'pajak',
                'total_bruto',
                'total_potongan',
                'total_diterima',
                'status',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}