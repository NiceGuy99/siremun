<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FarmasiRemunerasiService
{
    /**
     * Call procedure SimpanDataFarmasiRemunerasi (SELECT only)
     * and save/insert data into remunerasi_app.farmasi_remunerasi via web app.
     *
     * @param string $tglAwal  Format: Y-m-d H:i:s
     * @param string $tglAkhir Format: Y-m-d H:i:s
     * @param string|null $ruanganId
     * @param mixed $jaminanId
     * @return array
     */
    public function syncFarmasi(string $tglAwal, string $tglAkhir, ?string $ruanganId = null, $jaminanId = 0): array
    {
        ini_set('memory_limit', '1024M');
        set_time_limit(0);

        Log::info('Starting syncFarmasi via web app', [
            'tgl_awal'   => $tglAwal,
            'tgl_akhir'  => $tglAkhir,
            'ruangan_id' => $ruanganId,
            'jaminan_id' => $jaminanId
        ]);

        $cleanRuangan = !empty($ruanganId) ? $ruanganId : null;
        $cleanJaminan = (!empty($jaminanId) && $jaminanId !== '0') ? (int)$jaminanId : 0;

        // 1. Execute Stored Procedure to SELECT calculated dataset
        $rows = DB::connection('mysql_master')->select(
            'CALL remunerasi_app.SimpanDataFarmasiRemunerasi(?, ?, ?, ?)',
            [
                $tglAwal,
                $tglAkhir,
                $cleanRuangan,
                $cleanJaminan
            ]
        );

        $totalRows = count($rows);
        Log::info('Procedure SimpanDataFarmasiRemunerasi returned rows', ['count' => $totalRows]);

        // 2. Delete existing records in table remunerasi_app.farmasi_remunerasi matching scope
        $deleteQuery = DB::connection('mysql_master')
            ->table('remunerasi_app.farmasi_remunerasi')
            ->whereBetween('TANGGAL', [$tglAwal, $tglAkhir]);

        if (!empty($cleanRuangan)) {
            $deleteQuery->where('ID_RUANGAN', 'like', $cleanRuangan . '%');
        }

        if (!empty($cleanJaminan)) {
            $deleteQuery->where('ID_PENJAMIN', $cleanJaminan);
        }

        $deletedCount = $deleteQuery->delete();
        Log::info('Deleted old records from remunerasi_app.farmasi_remunerasi', ['deleted' => $deletedCount]);

        // 3. Batch insert using streaming memory cleanup
        $chunkSize = 500;
        $insertedCount = 0;
        $chunk = [];

        foreach ($rows as $index => $row) {
            $chunk[] = [
                'TANGGAL'       => $row->TANGGAL ?? null,
                'NORM'          => $row->NORM ?? null,
                'NOPEN'         => $row->NOPEN ?? null,
                'SEP'           => $row->SEP ?? null,
                'ID_PENJAMIN'   => $row->ID_PENJAMIN ?? null,
                'JAMINAN'       => $row->JAMINAN ?? null,
                'NAMA_PASIEN'   => $row->NAMA_PASIEN ?? null,
                'NAMA_DPJP'     => $row->NAMA_DPJP ?? null,
                'JENIS_RINCIAN' => $row->JENIS_RINCIAN ?? null,
                'ID_BARANG'     => $row->ID_BARANG ?? null,
                'NAMA_BARANG'   => $row->NAMA_BARANG ?? null,
                'HARGA_SATUAN'  => $row->HARGA_SATUAN ?? 0,
                'JUMLAH_OBAT'   => $row->JUMLAH_OBAT ?? 0,
                'TOTAL'         => $row->TOTAL ?? 0,
                'ID_RUANGAN'    => $row->ID_RUANGAN ?? null,
                'NAMA_RUANGAN'  => $row->NAMA_RUANGAN ?? null,
            ];

            // Free processed item reference to prevent memory peak
            $rows[$index] = null;

            if (count($chunk) >= $chunkSize) {
                DB::connection('mysql_master')
                    ->table('remunerasi_app.farmasi_remunerasi')
                    ->insert($chunk);
                $insertedCount += count($chunk);
                $chunk = [];
            }
        }

        // Insert remaining rows in final chunk
        if (!empty($chunk)) {
            DB::connection('mysql_master')
                ->table('remunerasi_app.farmasi_remunerasi')
                ->insert($chunk);
            $insertedCount += count($chunk);
            $chunk = [];
        }

        unset($rows);

        Log::info('Finished inserting rows into remunerasi_app.farmasi_remunerasi', ['inserted' => $insertedCount]);

        return [
            'deleted_count'  => $deletedCount,
            'inserted_count' => $insertedCount,
            'dari_tanggal'   => $tglAwal,
            'sampai_tanggal' => $tglAkhir,
        ];
    }
}
