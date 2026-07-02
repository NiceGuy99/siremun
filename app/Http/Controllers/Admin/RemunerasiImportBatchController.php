<?php

namespace App\Http\Controllers\Admin;

use App\Models\RemunerasiImportBatch;
use App\Models\RemunerasiPeriod;

class RemunerasiImportBatchController extends ResourceController
{
    protected string $resourceKey = 'remunerasi-import-batch';
    protected string $resourceName = 'Batch Import Remunerasi';
    protected string $modelClass = RemunerasiImportBatch::class;
    protected array $relationships = ['period'];

    protected function getColumns(): array
    {
        return [
            ['key' => 'filename', 'label' => 'Nama File', 'searchable' => true, 'sortable' => true],
            ['key' => 'period.nama_periode', 'label' => 'Periode', 'searchable' => false, 'sortable' => false, 'relation' => 'period'],
            ['key' => 'total_rows', 'label' => 'Total Baris', 'searchable' => false, 'sortable' => true, 'type' => 'number'],
            ['key' => 'success_rows', 'label' => 'Sukses', 'searchable' => false, 'sortable' => true, 'type' => 'number'],
            ['key' => 'failed_rows', 'label' => 'Gagal', 'searchable' => false, 'sortable' => true, 'type' => 'number'],
            ['key' => 'status', 'label' => 'Status', 'searchable' => true, 'sortable' => true],
        ];
    }

    protected function getFields(): array
    {
        return [
            ['name' => 'remunerasi_period_id', 'label' => 'Periode Remunerasi', 'type' => 'select', 'relationship' => ['model' => RemunerasiPeriod::class, 'label' => 'nama_periode'], 'required' => true],
            ['name' => 'filename', 'label' => 'Nama File', 'type' => 'text', 'required' => true],
            ['name' => 'total_rows', 'label' => 'Total Baris', 'type' => 'number', 'required' => true, 'default' => 0],
            ['name' => 'success_rows', 'label' => 'Baris Sukses', 'type' => 'number', 'required' => true, 'default' => 0],
            ['name' => 'failed_rows', 'label' => 'Baris Gagal', 'type' => 'number', 'required' => true, 'default' => 0],
            ['name' => 'status', 'label' => 'Status', 'type' => 'select', 'options' => [
                ['id' => 'pending', 'name' => 'Pending'],
                ['id' => 'processing', 'name' => 'Processing'],
                ['id' => 'success', 'name' => 'Success'],
                ['id' => 'partial_failed', 'name' => 'Partial Failed'],
                ['id' => 'failed', 'name' => 'Failed'],
                ['id' => 'rolled_back', 'name' => 'Rolled Back'],
            ], 'required' => true, 'default' => 'pending'],
            ['name' => 'imported_at', 'label' => 'Waktu Impor', 'type' => 'datetime', 'required' => false],
        ];
    }

    protected function getStoreRules(): array
    {
        return [
            'remunerasi_period_id' => 'required|exists:remunerasi_periods,id',
            'filename' => 'required|string',
            'total_rows' => 'required|integer',
            'success_rows' => 'required|integer',
            'failed_rows' => 'required|integer',
            'status' => 'required|in:pending,processing,success,partial_failed,failed,rolled_back',
            'imported_at' => 'nullable|date',
        ];
    }

    protected function getUpdateRules($id): array
    {
        return $this->getStoreRules();
    }
}
