<?php

namespace App\Http\Controllers\Admin;

use App\Models\Pegawai;
use App\Models\User;
use App\Models\Unit;
use App\Models\Jabatan;
use App\Models\Grade;

class PegawaiController extends ResourceController
{
    protected string $resourceKey = 'pegawai';
    protected string $resourceName = 'Pegawai';
    protected string $modelClass = Pegawai::class;
    protected array $relationships = ['user', 'unit', 'jabatan', 'grade'];

    protected function getColumns(): array
    {
        return [
            ['key' => 'nama', 'label' => 'Nama', 'searchable' => true, 'sortable' => true],
            ['key' => 'nip', 'label' => 'NIP', 'searchable' => true, 'sortable' => true],
            ['key' => 'unit.nama', 'label' => 'Unit', 'searchable' => false, 'sortable' => false, 'relation' => 'unit'],
            ['key' => 'jabatan.nama', 'label' => 'Jabatan', 'searchable' => false, 'sortable' => false, 'relation' => 'jabatan'],
            ['key' => 'grade.nama', 'label' => 'Grade', 'searchable' => false, 'sortable' => false, 'relation' => 'grade'],
            ['key' => 'status_aktif', 'label' => 'Status', 'searchable' => false, 'sortable' => true, 'type' => 'boolean'],
        ];
    }

    protected function getFields(): array
    {
        return [
            ['name' => 'nama', 'label' => 'Nama Lengkap', 'type' => 'text', 'required' => true],
            ['name' => 'nip', 'label' => 'NIP', 'type' => 'text', 'required' => true],
            ['name' => 'source_pegawai_id', 'label' => 'Source Pegawai ID', 'type' => 'number', 'required' => true],
            ['name' => 'panggilan', 'label' => 'Panggilan', 'type' => 'text', 'required' => false],
            ['name' => 'gelar_depan', 'label' => 'Gelar Depan', 'type' => 'text', 'required' => false],
            ['name' => 'gelar_belakang', 'label' => 'Gelar Belakang', 'type' => 'text', 'required' => false],
            ['name' => 'tempat_lahir', 'label' => 'Tempat Lahir', 'type' => 'text', 'required' => false],
            ['name' => 'tanggal_lahir', 'label' => 'Tanggal Lahir', 'type' => 'datetime', 'required' => false],
            ['name' => 'jenis_kelamin', 'label' => 'Jenis Kelamin (1: L, 2: P)', 'type' => 'number', 'required' => true, 'default' => 1],
            ['name' => 'user_id', 'label' => 'User Account', 'type' => 'select', 'relationship' => ['model' => User::class, 'label' => 'name'], 'required' => false],
            ['name' => 'unit_id', 'label' => 'Unit', 'type' => 'select', 'relationship' => ['model' => Unit::class, 'label' => 'nama'], 'required' => false],
            ['name' => 'jabatan_id', 'label' => 'Jabatan', 'type' => 'select', 'relationship' => ['model' => Jabatan::class, 'label' => 'nama'], 'required' => false],
            ['name' => 'grade_id', 'label' => 'Grade', 'type' => 'select', 'relationship' => ['model' => Grade::class, 'label' => 'nama'], 'required' => false],
            ['name' => 'status_aktif', 'label' => 'Status Aktif', 'type' => 'toggle', 'required' => true, 'default' => true],
            ['name' => 'non_pegawai', 'label' => 'Non Pegawai', 'type' => 'toggle', 'required' => true, 'default' => false],
            ['name' => 'bank', 'label' => 'Nama Bank', 'type' => 'text', 'required' => false],
            ['name' => 'rekening', 'label' => 'No. Rekening', 'type' => 'text', 'required' => false],
        ];
    }

    protected function getStoreRules(): array
    {
        return [
            'nama' => 'required|string',
            'nip' => 'required|string',
            'source_pegawai_id' => 'required|integer',
            'panggilan' => 'nullable|string',
            'gelar_depan' => 'nullable|string',
            'gelar_belakang' => 'nullable|string',
            'tempat_lahir' => 'nullable|string',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'required|integer',
            'user_id' => 'nullable|exists:users,id',
            'unit_id' => 'nullable|exists:units,id',
            'jabatan_id' => 'nullable|exists:jabatans,id',
            'grade_id' => 'nullable|exists:grades,id',
            'status_aktif' => 'required|boolean',
            'non_pegawai' => 'required|boolean',
            'bank' => 'nullable|string',
            'rekening' => 'nullable|string',
        ];
    }

    protected function getUpdateRules($id): array
    {
        return $this->getStoreRules();
    }
}
