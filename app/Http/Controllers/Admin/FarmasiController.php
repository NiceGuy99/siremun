<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FarmasiController extends Controller
{
    public function index(Request $request)
    {
        ini_set('memory_limit', '2048M');

        $tglAwal = $request->query('tgl_awal', '');
        $tglAkhir = $request->query('tgl_akhir', '');
        $ruanganId = $request->query('ruangan_id', '');
        $jaminanId = $request->query('jaminan_id', '');
        $norm = $request->query('norm', '');
        $nopen = $request->query('nopen', '');
        $isSearched = $request->has('search');

        // Hanya ruangan Depo Farmasi:
        // JENIS_KUNJUNGAN = 11 dan JENIS = 5.
        $ruanganOptions = DB::connection('mysql_master')
            ->table('ruangan')
            ->where('JENIS_KUNJUNGAN', 11)
            ->where('JENIS', 5)
            ->where('STATUS', 1)
            ->orderBy('DESKRIPSI')
            ->select('ID as id', 'DESKRIPSI as deskripsi')
            ->get()
            ->toArray();

        // Seluruh penjamin pada master remunerasi_app.
        $penjaminOptions = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Penjamin')
            ->orderBy('PENJAMIN_ID')
            ->select('PENJAMIN_ID as id', 'NAMA_PENJAMIN as nama')
            ->get()
            ->toArray();

        $records = [];

        if ($isSearched) {
            \Illuminate\Support\Facades\Log::info('Farmasi Search Query Params', [
                'tgl_awal' => $tglAwal,
                'tgl_akhir' => $tglAkhir,
                'ruangan_id' => $ruanganId,
                'jaminan_id' => $jaminanId,
                'norm' => $norm,
                'nopen' => $nopen,
                'sync' => $request->query('sync')
            ]);

            $syncResult = null;
            // If sync parameter is set, calculate via procedure & insert in chunks from web app
            if ($request->query('sync') === '1' && $tglAwal && $tglAkhir) {
                try {
                    $service = new \App\Services\FarmasiRemunerasiService();
                    $parsedAwal = date('Y-m-d H:i:s', strtotime($tglAwal));
                    $parsedAkhir = date('Y-m-d H:i:s', strtotime($tglAkhir));
                    $syncResult = $service->syncFarmasi($parsedAwal, $parsedAkhir, $ruanganId, $jaminanId);
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::error('Error during syncFarmasi: ' . $e->getMessage());
                }
            }

            $query = DB::connection('mysql_master')
                ->table('remunerasi_app.farmasi_remunerasi')
                ->select(
                    'ID',
                    'TANGGAL',
                    'NORM',
                    'NOPEN',
                    'SEP',
                    'ID_PENJAMIN',
                    'JAMINAN',
                    'NAMA_PASIEN',
                    'NAMA_DPJP',
                    'JENIS_RINCIAN',
                    'ID_BARANG',
                    'NAMA_BARANG',
                    'HARGA_SATUAN',
                    'JUMLAH_OBAT',
                    'TOTAL',
                    'ID_RUANGAN',
                    'NAMA_RUANGAN',
                    'TANGGAL_PROSES'
                );

            if ($tglAwal !== '') {
                $query->where('TANGGAL', '>=', $this->normalizeDateTime($tglAwal, '00:00:00'));
            }

            if ($tglAkhir !== '') {
                $query->where('TANGGAL', '<=', $this->normalizeDateTime($tglAkhir, '23:59:59'));
            }

            if ($ruanganId !== '') {
                $query->where('ID_RUANGAN', $ruanganId);
            }

            if ($jaminanId !== '') {
                $query->where('ID_PENJAMIN', $jaminanId);
            }

            if ($norm !== '') {
                $query->where('NORM', 'like', '%' . $norm . '%');
            }

            if ($nopen !== '') {
                $query->where('NOPEN', 'like', '%' . $nopen . '%');
            }

            $query
                ->orderBy('TANGGAL')
                ->orderBy('ID');

            Log::info('Compiled Farmasi SQL query', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings(),
            ]);

            if ($request->query('export') === 'csv') {
                return $this->exportCsv(clone $query);
            }

            // Cap display records to 15,000 to keep memory & JSON payload under browser limit
            $rawRecords = (clone $query)->limit(15000)->get();
            $records = $this->cleanUtf8($rawRecords);
        }

        return Inertia::render('Admin/Perhitungan/Jenis/Farmasi', [
            'ruanganOptions' => $ruanganOptions,
            'penjaminOptions' => $penjaminOptions,
            'records' => $records,
            'syncResult' => $syncResult ?? null,
            'filters' => [
                'tgl_awal' => $tglAwal,
                'tgl_akhir' => $tglAkhir,
                'ruangan_id' => $ruanganId,
                'jaminan_id' => $jaminanId,
                'norm' => $norm,
                'nopen' => $nopen,
                'isSearched' => $isSearched,
            ],
        ]);
    }

    private function normalizeDateTime(string $value, string $defaultTime): string
    {
        $value = trim(str_replace('T', ' ', $value));

        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            $value .= ' ' . $defaultTime;
        }

        $timestamp = strtotime($value);

        return $timestamp === false
            ? $value
            : date('Y-m-d H:i:s', $timestamp);
    }

    private function exportCsv($query)
    {
        $filename = 'perhitungan_jenis_farmasi_' . date('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($query) {
            $file = fopen('php://output', 'w');

            // UTF-8 BOM agar karakter terbaca baik di Excel.
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Compute summary totals via SQL query directly
            $totalCount = (clone $query)->count();
            $totalJumlahObat = (float) (clone $query)->sum('JUMLAH_OBAT');
            $totalNilai = (float) (clone $query)->sum('TOTAL');

            fputcsv($file, ['RINGKASAN TOTAL FARMASI']);
            fputcsv($file, ['Total Baris Item', $totalCount]);
            fputcsv($file, ['Total Jumlah Obat', $totalJumlahObat]);
            fputcsv($file, ['Total Nilai Farmasi', $totalNilai]);
            fputcsv($file, []);

            fputcsv($file, [
                'No.',
                'Tanggal',
                'No RM',
                'Nopen',
                'SEP',
                'ID Penjamin',
                'Jaminan',
                'Nama Pasien',
                'Nama DPJP',
                'Jenis Rincian',
                'ID Barang',
                'Nama Barang',
                'Harga Satuan',
                'Jumlah Obat',
                'Total',
                'ID Ruangan',
                'Nama Ruangan',
                'Tanggal Proses',
            ]);

            $index = 0;
            // Stream in chunks of 5,000 rows to keep RAM usage minimal
            (clone $query)->chunk(5000, function ($rows) use ($file, &$index) {
                $cleanedRows = $this->cleanUtf8($rows);
                foreach ($cleanedRows as $row) {
                    $index++;
                    fputcsv($file, [
                        $index,
                        $row->TANGGAL ?? '',
                        $row->NORM ?? '',
                        $row->NOPEN ?? '',
                        $row->SEP ?? '',
                        $row->ID_PENJAMIN ?? '',
                        $row->JAMINAN ?? '',
                        $row->NAMA_PASIEN ?? '',
                        $row->NAMA_DPJP ?? '',
                        $row->JENIS_RINCIAN ?? '',
                        $row->ID_BARANG ?? '',
                        $row->NAMA_BARANG ?? '',
                        (float) ($row->HARGA_SATUAN ?? 0),
                        (float) ($row->JUMLAH_OBAT ?? 0),
                        (float) ($row->TOTAL ?? 0),
                        $row->ID_RUANGAN ?? '',
                        $row->NAMA_RUANGAN ?? '',
                        $row->TANGGAL_PROSES ?? '',
                    ]);
                }
            });

            fputcsv($file, [
                'TOTAL',
                '', '', '', '', '', '', '', '', '', '', '', '',
                $totalJumlahObat,
                $totalNilai,
                '', '', '',
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function cleanUtf8($data)
    {
        if (is_string($data)) {
            return mb_convert_encoding($data, 'UTF-8', 'UTF-8');
        }
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = $this->cleanUtf8($value);
            }
            return $data;
        }
        if (is_object($data)) {
            foreach ($data as $key => $value) {
                $data->$key = $this->cleanUtf8($value);
            }
            return $data;
        }
        return $data;
    }
}
