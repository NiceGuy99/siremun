<?php

namespace App\Http\Controllers\Admin;

use App\Models\RemunerasiPeriod;

class RemunerasiPeriodController extends ResourceController
{
    protected string $resourceKey = 'remunerasi-period';
    protected string $resourceName = 'Periode Remunerasi';
    protected string $modelClass = RemunerasiPeriod::class;

    protected function getColumns(): array
    {
        return [
            ['key' => 'nama_periode', 'label' => 'Nama Periode', 'searchable' => true, 'sortable' => true],
            ['key' => 'bulan', 'label' => 'Bulan', 'searchable' => false, 'sortable' => true],
            ['key' => 'tahun', 'label' => 'Tahun', 'searchable' => false, 'sortable' => true],
            ['key' => 'status', 'label' => 'Status', 'searchable' => true, 'sortable' => true],
            ['key' => 'published_at', 'label' => 'Dipublikasikan', 'searchable' => false, 'sortable' => true, 'type' => 'datetime'],
            ['key' => 'closed_at', 'label' => 'Ditutup', 'searchable' => false, 'sortable' => true, 'type' => 'datetime'],
        ];
    }

    protected function getFields(): array
    {
        return [
            ['name' => 'nama_periode', 'label' => 'Nama Periode', 'type' => 'text', 'required' => true],
            ['name' => 'bulan', 'label' => 'Bulan (1-12)', 'type' => 'number', 'required' => true],
            ['name' => 'tahun', 'label' => 'Tahun', 'type' => 'number', 'required' => true],
            ['name' => 'status', 'label' => 'Status', 'type' => 'select', 'options' => [
                ['id' => 'draft', 'name' => 'Draft'],
                ['id' => 'imported', 'name' => 'Imported'],
                ['id' => 'verified', 'name' => 'Verified'],
                ['id' => 'approved', 'name' => 'Approved'],
                ['id' => 'published', 'name' => 'Published'],
                ['id' => 'closed', 'name' => 'Closed'],
            ], 'required' => true, 'default' => 'draft'],
            ['name' => 'published_at', 'label' => 'Tanggal Publikasi', 'type' => 'datetime', 'required' => false],
            ['name' => 'closed_at', 'label' => 'Tanggal Ditutup', 'type' => 'datetime', 'required' => false],
        ];
    }

    protected function getStoreRules(): array
    {
        return [
            'nama_periode' => 'required|string',
            'bulan' => 'required|integer|between:1,12',
            'tahun' => 'required|integer',
            'status' => 'required|in:draft,imported,verified,approved,published,closed',
            'published_at' => 'nullable|date',
            'closed_at' => 'nullable|date',
        ];
    }

    protected function getUpdateRules($id): array
    {
        return $this->getStoreRules();
    }
}
