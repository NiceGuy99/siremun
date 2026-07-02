<?php

namespace App\Console\Commands;

use App\Models\External\MasterPegawai;
use App\Models\Pegawai;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

class SyncPegawaiFromMaster extends Command
{
    protected $signature = 'siremun:sync-pegawai
                            {--include-non-pegawai : Ikutkan data NON_PEGAWAI = 1}
                            {--include-inactive : Ikutkan data STATUS != 1}';

    protected $description = 'Sinkronisasi data pegawai dari database master.pegawai ke database lokal SIREMUN';

    public function handle(): int
    {
        $this->info('Mulai sinkronisasi pegawai dari master.pegawai...');

        $query = MasterPegawai::query()
            ->select([
                'ID',
                'NIP',
                'NAMA',
                'PANGGILAN',
                'GELAR_DEPAN',
                'GELAR_BELAKANG',
                'TEMPAT_LAHIR',
                'TANGGAL_LAHIR',
                'JENIS_KELAMIN',
                'PROFESI',
                'SMF',
                'ALAMAT',
                'RT',
                'RW',
                'KODEPOS',
                'WILAYAH',
                'NON_PEGAWAI',
                'STATUS',
                'TANGGAL',
            ]);

        if (! $this->option('include-non-pegawai')) {
            $query->where('NON_PEGAWAI', 0);
        }

        if (! $this->option('include-inactive')) {
            $query->where('STATUS', 1);
        }

        $total = (clone $query)->count();

        if ($total === 0) {
            $this->warn('Tidak ada data pegawai yang ditemukan.');
            return self::SUCCESS;
        }

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $created = 0;
        $updated = 0;
        $failed = 0;

        $query->orderBy('ID')
            ->chunk(100, function ($rows) use ($bar, &$created, &$updated, &$failed) {
                foreach ($rows as $row) {
                    try {
                        DB::transaction(function () use ($row, &$created, &$updated) {
                            $pegawai = Pegawai::updateOrCreate(
                                [
                                    'source_pegawai_id' => $row->ID,
                                ],
                                [
                                    'nip' => trim((string) $row->NIP),
                                    'nama' => trim((string) $row->NAMA),
                                    'panggilan' => $row->PANGGILAN,

                                    'gelar_depan' => $row->GELAR_DEPAN,
                                    'gelar_belakang' => $row->GELAR_BELAKANG,

                                    'tempat_lahir' => $row->TEMPAT_LAHIR,
                                    'tanggal_lahir' => $row->TANGGAL_LAHIR,

                                    'jenis_kelamin' => (int) $row->JENIS_KELAMIN,
                                    'profesi' => $row->PROFESI,
                                    'smf' => $row->SMF,

                                    'alamat' => $row->ALAMAT,
                                    'rt' => $row->RT,
                                    'rw' => $row->RW,
                                    'kodepos' => $row->KODEPOS,
                                    'wilayah' => $row->WILAYAH,

                                    'non_pegawai' => (int) $row->NON_PEGAWAI === 1,
                                    'status_aktif' => (int) $row->STATUS === 1,

                                    'source_updated_at' => $row->TANGGAL,
                                ]
                            );

                            if ($pegawai->wasRecentlyCreated) {
                                $created++;
                            } else {
                                $updated++;
                            }
                        });
                    } catch (Throwable $e) {
                        $failed++;

                        report($e);

                        $this->newLine();
                        $this->error("Gagal sync ID {$row->ID} / NIP {$row->NIP}: {$e->getMessage()}");
                    }

                    $bar->advance();
                }
            });

        $bar->finish();
        $this->newLine(2);

        $this->info('Sinkronisasi selesai.');
        $this->line("Total sumber    : {$total}");
        $this->line("Data baru       : {$created}");
        $this->line("Data diperbarui : {$updated}");
        $this->line("Data gagal      : {$failed}");

        activity()
            ->withProperties([
                'total' => $total,
                'created' => $created,
                'updated' => $updated,
                'failed' => $failed,
            ])
            ->log('Sinkronisasi pegawai dari master.pegawai');

        return self::SUCCESS;
    }
}