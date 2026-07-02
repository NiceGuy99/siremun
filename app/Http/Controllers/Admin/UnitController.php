<?php

namespace App\Http\Controllers\Admin;

use App\Models\Unit;

class UnitController extends ResourceController
{
    protected string $resourceKey = 'unit';
    protected string $resourceName = 'Unit';
    protected string $modelClass = Unit::class;
    protected array $relationships = ['parent'];

    protected function getColumns(): array
    {
        return [
            ['key' => 'kode', 'label' => 'Kode Unit', 'searchable' => true, 'sortable' => true],
            ['key' => 'nama', 'label' => 'Nama Unit', 'searchable' => true, 'sortable' => true],
            ['key' => 'parent.nama', 'label' => 'Parent Unit', 'searchable' => false, 'sortable' => false, 'relation' => 'parent'],
            ['key' => 'status', 'label' => 'Status Aktif', 'searchable' => false, 'sortable' => true, 'type' => 'boolean'],
        ];
    }

    protected function getFields(): array
    {
        return [
            ['name' => 'kode', 'label' => 'Kode Unit', 'type' => 'text', 'required' => false],
            ['name' => 'nama', 'label' => 'Nama Unit', 'type' => 'text', 'required' => true],
            ['name' => 'parent_id', 'label' => 'Parent Unit', 'type' => 'select', 'relationship' => ['model' => Unit::class, 'label' => 'nama'], 'required' => false],
            ['name' => 'status', 'label' => 'Status Aktif', 'type' => 'toggle', 'required' => true, 'default' => true],
        ];
    }

    protected function getStoreRules(): array
    {
        return [
            'kode' => 'nullable|string',
            'nama' => 'required|string',
            'parent_id' => 'nullable|exists:units,id',
            'status' => 'required|boolean',
        ];
    }

    protected function getUpdateRules($id): array
    {
        return $this->getStoreRules();
    }
}
