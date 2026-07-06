<?php

namespace App\Console\Commands;

use App\Models\Pegawai;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class GeneratePegawaiUsers extends Command
{
    protected $signature = 'siremun:generate-pegawai-users';

    protected $description = 'Membuat akun user untuk pegawai yang belum memiliki user_id';

    public function handle(): int
    {
        $pegawais = Pegawai::query()
            ->whereNull('user_id')
            ->where('status_aktif', true)
            ->where('non_pegawai', false)
            ->get();

        $created = 0;

        foreach ($pegawais as $pegawai) {
            DB::transaction(function () use ($pegawai, &$created) {
                $email = $pegawai->nip . '@siremun.local';

                $user = User::create([
                    'name' => $pegawai->nama,
                    'email' => $email,
                    'password' => Hash::make($pegawai->nip),
                ]);

                $user->assignRole('user');

                $pegawai->update([
                    'user_id' => $user->id,
                ]);

                $created++;
            });
        }

        $this->info("Akun pegawai berhasil dibuat: {$created}");

        return self::SUCCESS;
    }
}