<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TindakanRemunerasiService
{
    /**
     * Call procedure SimpanDataTindakanRemunerasi (SELECT only)
     * and save/insert data into remunerasi_app.tindakan_remunerasi via web app.
     *
     * @param string $tglAwal  Format: Y-m-d H:i:s
     * @param string $tglAkhir Format: Y-m-d H:i:s
     * @param string|null $ruanganId
     * @param int|null $jaminanId
     * @return array
     */
    public function syncTindakan(string $tglAwal, string $tglAkhir, ?string $ruanganId = null, $jaminanId = 0): array
    {
        ini_set('memory_limit', '1024M');
        set_time_limit(0);

        Log::info('Starting syncTindakan via web app', [
            'tgl_awal'   => $tglAwal,
            'tgl_akhir'  => $tglAkhir,
            'ruangan_id' => $ruanganId,
            'jaminan_id' => $jaminanId
        ]);

        // 1. Execute Stored Procedure to SELECT calculated dataset
        $rows = DB::connection('mysql_master')->select(
            'CALL remunerasi_app.SimpanDataTindakanRemunerasi(?, ?, ?, ?)',
            [
                $tglAwal,
                $tglAkhir,
                !empty($ruanganId) ? $ruanganId : null,
                !empty($jaminanId) ? (int)$jaminanId : 0
            ]
        );

        $totalRows = count($rows);
        Log::info('Procedure SimpanDataTindakanRemunerasi returned rows', ['count' => $totalRows]);

        // 2. Delete existing records in table remunerasi_app.tindakan_remunerasi matching scope
        $deleteQuery = DB::connection('mysql_master')
            ->table('remunerasi_app.tindakan_remunerasi')
            ->whereBetween('TANGGAL_PEMBAYARAN', [$tglAwal, $tglAkhir]);

        if (!empty($ruanganId)) {
            $deleteQuery->where('ID_RUANGAN', $ruanganId);
        }

        if (!empty($jaminanId) && $jaminanId != 0) {
            $deleteQuery->where('ID_PENJAMIN', $jaminanId);
        }

        $deletedCount = $deleteQuery->delete();
        Log::info('Deleted old records from remunerasi_app.tindakan_remunerasi', ['deleted' => $deletedCount]);

        // 3. Batch insert using streaming memory cleanup
        $chunkSize = 500;
        $insertedCount = 0;
        $chunk = [];

        foreach ($rows as $index => $row) {
            $chunk[] = [
                'TANGGAL_PEMBAYARAN' => $row->TANGGAL_PEMBAYARAN ?? null,
                'NORM'               => $row->NORM ?? null,
                'NOPEN'              => $row->NOPEN ?? null,
                'NO_SEP'             => $row->NO_SEP ?? null,
                'ID_PENJAMIN'        => $row->ID_PENJAMIN ?? null,
                'NAMA_PASIEN'        => $row->NAMA_PASIEN ?? null,
                'DOKTER_DPJP'        => $row->DOKTER_DPJP ?? null,
                'JAMINAN'            => $row->JAMINAN ?? null,
                'JENIS_RINCIAN'      => $row->JENIS_RINCIAN ?? null,
                'TANGGAL_TINDAKAN'   => $row->TANGGAL_TINDAKAN ?? null,
                'ID_TINDAKAN'        => $row->ID_TINDAKAN ?? null,
                'NAMA_TINDAKAN'      => $row->NAMA_TINDAKAN ?? null,
                'ID_RUANGAN'         => $row->ID_RUANGAN ?? null,
                'NAMA_RUANGAN'       => $row->NAMA_RUANGAN ?? null,
                'TARIF'              => $row->TARIF ?? 0,
                'TIM_PETUGAS_MEDIS'  => $row->TIM_PETUGAS_MEDIS ?? null,
                'SUB_TOTAL'          => $row->SUB_TOTAL ?? 0,
                'KUNJUNGAN'          => $row->KUNJUNGAN ?? null,
            ];

            // Free processed item reference to prevent memory peak
            $rows[$index] = null;

            if (count($chunk) >= $chunkSize) {
                DB::connection('mysql_master')
                    ->table('remunerasi_app.tindakan_remunerasi')
                    ->insert($chunk);
                $insertedCount += count($chunk);
                $chunk = [];
            }
        }

        // Insert remaining rows in final chunk
        if (!empty($chunk)) {
            DB::connection('mysql_master')
                ->table('remunerasi_app.tindakan_remunerasi')
                ->insert($chunk);
            $insertedCount += count($chunk);
            $chunk = [];
        }

        unset($rows);

        Log::info('Finished inserting rows into remunerasi_app.tindakan_remunerasi', ['inserted' => $insertedCount]);

        return [
            'deleted_count'  => $deletedCount,
            'inserted_count' => $insertedCount,
            'dari_tanggal'   => $tglAwal,
            'sampai_tanggal' => $tglAkhir,
        ];
    }
}
