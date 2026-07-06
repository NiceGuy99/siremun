<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'view_dashboard',
            'manage_users',
            'manage_roles',
            'manage_pegawai',
            'manage_unit',
            'manage_jabatan',
            'manage_grade',
            'manage_periode',
            'import_remunerasi',
            'verify_remunerasi',
            'approve_remunerasi',
            'publish_remunerasi',
            'view_all_remunerasi',
            'view_own_remunerasi',
            'export_laporan',
            'view_audit_log',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $admin = Role::firstOrCreate(['name' => 'admin']);
        $manajemen = Role::firstOrCreate(['name' => 'manajemen']);
        $petugas = Role::firstOrCreate(['name' => 'petugas']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        $admin->syncPermissions($permissions);

        $manajemen->syncPermissions([
            'view_dashboard',
            'approve_remunerasi',
            'view_all_remunerasi',
            'export_laporan',
        ]);

        $petugas->syncPermissions([
            'view_dashboard',
            'manage_pegawai',
            'manage_periode',
            'import_remunerasi',
            'verify_remunerasi',
            'view_all_remunerasi',
            'export_laporan',
        ]);

        $userRole->syncPermissions([
            'view_own_remunerasi',
        ]);
    }
}