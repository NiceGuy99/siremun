<?php

namespace App\Http\Controllers\Admin;

use App\Models\RemunerasiDetail;
use App\Models\Pegawai;
use App\Models\RemunerasiPeriod;

class RemunerasiDetailController extends ResourceController
{
    protected string $resourceKey = 'remunerasi-detail';
    protected string $resourceName = 'Detail Remunerasi';
    protected string $modelClass = RemunerasiDetail::class;
    protected array $relationships = ['pegawai', 'period'];

    protected function getColumns(): array
    {
        return [
            ['key' => 'pegawai.nama', 'label' => 'Pegawai', 'searchable' => false, 'sortable' => false, 'relation' => 'pegawai'],
            ['key' => 'period.nama_periode', 'label' => 'Periode', 'searchable' => false, 'sortable' => false, 'relation' => 'period'],
            ['key' => 'total_bruto', 'label' => 'Total Bruto', 'searchable' => false, 'sortable' => true, 'type' => 'currency'],
            ['key' => 'total_potongan', 'label' => 'Total Potongan', 'searchable' => false, 'sortable' => true, 'type' => 'currency'],
            ['key' => 'total_diterima', 'label' => 'Total Diterima', 'searchable' => false, 'sortable' => true, 'type' => 'currency'],
            ['key' => 'status', 'label' => 'Status', 'searchable' => true, 'sortable' => true],
        ];
    }

    protected function getFields(): array
    {
        return [
            ['name' => 'remunerasi_period_id', 'label' => 'Periode Remunerasi', 'type' => 'select', 'relationship' => ['model' => RemunerasiPeriod::class, 'label' => 'nama_periode'], 'required' => true],
            ['name' => 'pegawai_id', 'label' => 'Pegawai', 'type' => 'select', 'relationship' => ['model' => Pegawai::class, 'label' => 'nama'], 'required' => true],
            ['name' => 'gaji', 'label' => 'Gaji', 'type' => 'number', 'required' => true, 'default' => 0.0],
            ['name' => 'honorarium', 'label' => 'Honorarium', 'type' => 'number', 'required' => true, 'default' => 0.0],
            ['name' => 'tunjangan_tetap', 'label' => 'Tunjangan Tetap', 'type' => 'number', 'required' => true, 'default' => 0.0],
            ['name' => 'insentif_kerja', 'label' => 'Insentif Kerja', 'type' => 'number', 'required' => true, 'default' => 0.0],
            ['name' => 'jasa_pelayanan', 'label' => 'Jasa Pelayanan', 'type' => 'number', 'required' => true, 'default' => 0.0],
            ['name' => 'ffs', 'label' => 'FFS', 'type' => 'number', 'required' => true, 'default' => 0.0],
            ['name' => 'uang_makan', 'label' => 'Uang Makan', 'type' => 'number', 'required' => true, 'default' => 0.0],
            ['name' => 'thr', 'label' => 'THR', 'type' => 'number', 'required' => true, 'default' => 0.0],
            ['name' => 'gaji_13', 'label' => 'Gaji 13', 'type' => 'number', 'required' => true, 'default' => 0.0],
            ['name' => 'potongan', 'label' => 'Potongan', 'type' => 'number', 'required' => true, 'default' => 0.0],
            ['name' => 'pajak', 'label' => 'Pajak', 'type' => 'number', 'required' => true, 'default' => 0.0],
            ['name' => 'keterangan', 'label' => 'Keterangan', 'type' => 'text', 'required' => false],
            ['name' => 'status', 'label' => 'Status', 'type' => 'select', 'options' => [
                ['id' => 'draft', 'name' => 'Draft'],
                ['id' => 'verified', 'name' => 'Verified'],
                ['id' => 'approved', 'name' => 'Approved'],
                ['id' => 'published', 'name' => 'Published'],
                ['id' => 'revised', 'name' => 'Revised'],
            ], 'required' => true, 'default' => 'draft'],
        ];
    }

    protected function getStoreRules(): array
    {
        return [
            'remunerasi_period_id' => 'required|exists:remunerasi_periods,id',
            'pegawai_id' => 'required|exists:pegawais,id',
            'gaji' => 'required|numeric',
            'honorarium' => 'required|numeric',
            'tunjangan_tetap' => 'required|numeric',
            'insentif_kerja' => 'required|numeric',
            'jasa_pelayanan' => 'required|numeric',
            'ffs' => 'required|numeric',
            'uang_makan' => 'required|numeric',
            'thr' => 'required|numeric',
            'gaji_13' => 'required|numeric',
            'potongan' => 'required|numeric',
            'pajak' => 'required|numeric',
            'keterangan' => 'nullable|string',
            'status' => 'required|in:draft,verified,approved,published,revised',
        ];
    }

    protected function getUpdateRules($id): array
    {
        return $this->getStoreRules();
    }
}
