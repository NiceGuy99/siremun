<?php

namespace App\Http\Controllers\Admin;

use App\Models\Grade;

class GradeController extends ResourceController
{
    protected string $resourceKey = 'grade';
    protected string $resourceName = 'Grade';
    protected string $modelClass = Grade::class;

    protected function getColumns(): array
    {
        return [
            ['key' => 'kode', 'label' => 'Kode Grade', 'searchable' => true, 'sortable' => true],
            ['key' => 'nama', 'label' => 'Nama Grade', 'searchable' => true, 'sortable' => true],
            ['key' => 'nilai_grade', 'label' => 'Nilai Grade', 'searchable' => false, 'sortable' => true, 'type' => 'number'],
            ['key' => 'status', 'label' => 'Status Aktif', 'searchable' => false, 'sortable' => true, 'type' => 'boolean'],
        ];
    }

    protected function getFields(): array
    {
        return [
            ['name' => 'kode', 'label' => 'Kode Grade', 'type' => 'text', 'required' => false],
            ['name' => 'nama', 'label' => 'Nama Grade', 'type' => 'text', 'required' => true],
            ['name' => 'nilai_grade', 'label' => 'Nilai Grade', 'type' => 'number', 'required' => true, 'default' => 0.0],
            ['name' => 'status', 'label' => 'Status Aktif', 'type' => 'toggle', 'required' => true, 'default' => true],
        ];
    }

    protected function getStoreRules(): array
    {
        return [
            'kode' => 'nullable|string',
            'nama' => 'required|string',
            'nilai_grade' => 'required|numeric',
            'status' => 'required|boolean',
        ];
    }

    protected function getUpdateRules($id): array
    {
        return $this->getStoreRules();
    }
}
