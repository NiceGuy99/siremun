<?php

namespace App\Http\Controllers\Admin;

use App\Models\Jabatan;

class JabatanController extends ResourceController
{
    protected string $resourceKey = 'jabatan';
    protected string $resourceName = 'Jabatan';
    protected string $modelClass = Jabatan::class;

    protected function getColumns(): array
    {
        return [
            ['key' => 'nama', 'label' => 'Nama Jabatan', 'searchable' => true, 'sortable' => true],
            ['key' => 'jenis_jabatan', 'label' => 'Jenis Jabatan', 'searchable' => true, 'sortable' => true],
            ['key' => 'status', 'label' => 'Status Aktif', 'searchable' => false, 'sortable' => true, 'type' => 'boolean'],
        ];
    }

    protected function getFields(): array
    {
        return [
            ['name' => 'nama', 'label' => 'Nama Jabatan', 'type' => 'text', 'required' => true],
            ['name' => 'jenis_jabatan', 'label' => 'Jenis Jabatan', 'type' => 'text', 'required' => false],
            ['name' => 'status', 'label' => 'Status Aktif', 'type' => 'toggle', 'required' => true, 'default' => true],
        ];
    }

    protected function getStoreRules(): array
    {
        return [
            'nama' => 'required|string',
            'jenis_jabatan' => 'nullable|string',
            'status' => 'required|boolean',
        ];
    }

    protected function getUpdateRules($id): array
    {
        return $this->getStoreRules();
    }
}
