<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AkomodasiRemunerasiService
{
    /**
     * Call procedure SimpanDataAkomodasiRemunerasi (SELECT only)
     * and save/insert data into remunerasi_app.akomodasi_remunerasi via web app.
     *
     * @param string $tglAwal  Format: Y-m-d H:i:s
     * @param string $tglAkhir Format: Y-m-d H:i:s
     * @param string|null $ruanganId
     * @param mixed $jaminanId
     * @return array
     */
    public function syncAkomodasi(string $tglAwal, string $tglAkhir, ?string $ruanganId = null, $jaminanId = 0): array
    {
        ini_set('memory_limit', '1024M');
        set_time_limit(0);

        Log::info('Starting syncAkomodasi via web app', [
            'tgl_awal'   => $tglAwal,
            'tgl_akhir'  => $tglAkhir,
            'ruangan_id' => $ruanganId,
            'jaminan_id' => $jaminanId
        ]);

        $cleanRuangan = !empty($ruanganId) ? $ruanganId : null;
        $cleanJaminan = (!empty($jaminanId) && $jaminanId !== '0') ? (int)$jaminanId : 0;

        // 1. Execute Stored Procedure to SELECT calculated dataset
        $rows = DB::connection('mysql_master')->select(
            'CALL remunerasi_app.SimpanDataAkomodasiRemunerasi(?, ?, ?, ?)',
            [
                $tglAwal,
                $tglAkhir,
                $cleanRuangan,
                $cleanJaminan
            ]
        );

        $totalRows = count($rows);
        Log::info('Procedure SimpanDataAkomodasiRemunerasi returned rows', ['count' => $totalRows]);

        // 2. Delete existing records in table remunerasi_app.akomodasi_remunerasi matching scope
        $deleteQuery = DB::connection('mysql_master')
            ->table('remunerasi_app.akomodasi_remunerasi')
            ->whereBetween('TANGGAL', [$tglAwal, $tglAkhir]);

        if (!empty($cleanRuangan)) {
            $deleteQuery->where('ID_RUANGAN', 'like', $cleanRuangan . '%');
        }

        if (!empty($cleanJaminan)) {
            $deleteQuery->where('ID_PENJAMIN', $cleanJaminan);
        }

        $deletedCount = $deleteQuery->delete();
        Log::info('Deleted old records from remunerasi_app.akomodasi_remunerasi', ['deleted' => $deletedCount]);

        // 3. Batch insert using streaming memory cleanup
        $chunkSize = 500;
        $insertedCount = 0;
        $chunk = [];

        foreach ($rows as $index => $row) {
            $chunk[] = [
                'TANGGAL'       => $row->TANGGAL ?? null,
                'NORM'          => $row->NORM ?? null,
                'NOPEN'         => $row->NOPEN ?? null,
                'NO_SEP'        => $row->NO_SEP ?? null,
                'ID_PENJAMIN'   => $row->ID_PENJAMIN ?? null,
                'NAMA_PASIEN'   => $row->NAMA_PASIEN ?? null,
                'NAMA_DPJP'     => $row->NAMA_DPJP ?? null,
                'JAMINAN'       => $row->JAMINAN ?? null,
                'JENIS_RINCIAN' => $row->JENIS_RINCIAN ?? null,
                'TOTAL_HARI'    => $row->TOTAL_HARI ?? 0,
                'ID_RUANGAN'    => $row->ID_RUANGAN ?? null,
                'MASUK'         => $row->MASUK ?? null,
                'KELUAR'        => $row->KELUAR ?? null,
                'NAMA_RUANGAN'  => $row->NAMA_RUANGAN ?? null,
                'TARIF'         => $row->TARIF ?? 0,
                'SUB_TOTAL'     => $row->SUB_TOTAL ?? 0,
            ];

            // Free processed item reference to prevent memory peak
            $rows[$index] = null;

            if (count($chunk) >= $chunkSize) {
                DB::connection('mysql_master')
                    ->table('remunerasi_app.akomodasi_remunerasi')
                    ->insert($chunk);
                $insertedCount += count($chunk);
                $chunk = [];
            }
        }

        // Insert remaining rows in final chunk
        if (!empty($chunk)) {
            DB::connection('mysql_master')
                ->table('remunerasi_app.akomodasi_remunerasi')
                ->insert($chunk);
            $insertedCount += count($chunk);
            $chunk = [];
        }

        unset($rows);

        Log::info('Finished inserting rows into remunerasi_app.akomodasi_remunerasi', ['inserted' => $insertedCount]);

        return [
            'deleted_count'  => $deletedCount,
            'inserted_count' => $insertedCount,
            'dari_tanggal'   => $tglAwal,
            'sampai_tanggal' => $tglAkhir,
        ];
    }
}
