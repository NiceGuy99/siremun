<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AkomodasiController extends Controller
{
    public function index(Request $request)
    {
        ini_set('memory_limit', '512M');

        $tgl_awal = $request->query('tgl_awal', '');
        $tgl_akhir = $request->query('tgl_akhir', '');
        $ruangan_id = $request->query('ruangan_id', '');
        $jaminan_id = $request->query('jaminan_id', '');
        $norm = $request->query('norm', '');
        $nopen = $request->query('nopen', '');
        $isSearched = $request->has('search');

        // Fetch Ruangan Options from master database
        $ruanganOptions = DB::connection('mysql_master')
            ->table('ruangan')
            ->where('JENIS_KUNJUNGAN', 3)
            ->where('STATUS', 1)
            ->orderBy('ID')
            ->select('ID as id', 'DESKRIPSI as deskripsi')
            ->get()
            ->toArray();

        // Fetch Jaminan (Penjamin) Options from master database
        $penjaminOptions = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Penjamin')
            ->where('STATUS', 1)
            ->orderBy('PENJAMIN_ID')
            ->select('PENJAMIN_ID as id', 'NAMA_PENJAMIN as nama')
            ->get()
            ->toArray();

        $records = [];

        if ($isSearched) {
            \Illuminate\Support\Facades\Log::info('Akomodasi Search Query Params', [
                'tgl_awal' => $tgl_awal,
                'tgl_akhir' => $tgl_akhir,
                'ruangan_id' => $ruangan_id,
                'jaminan_id' => $jaminan_id,
                'norm' => $norm,
                'nopen' => $nopen
            ]);

            $query = DB::connection('mysql_master')
                ->table('remunerasi_app.akomodasi_remunerasi')
                ->select(
                    'ID',
                    'TANGGAL',
                    'NORM',
                    'NOPEN',
                    'NO_SEP',
                    'ID_PENJAMIN',
                    'NAMA_PASIEN',
                    'NAMA_DPJP',
                    'JAMINAN',
                    'JENIS_RINCIAN',
                    'TOTAL_HARI',
                    'ID_RUANGAN',
                    'MASUK',
                    'KELUAR',
                    'NAMA_RUANGAN',
                    'TARIF',
                    'SUB_TOTAL',
                    'TANGGAL_PROSES'
                );

            // Filter by date range (TANGGAL)
            if ($tgl_awal) {
                $parsedAwal = date('Y-m-d H:i:s', strtotime($tgl_awal));
                $query->where('TANGGAL', '>=', $parsedAwal);
            }
            if ($tgl_akhir) {
                $parsedAkhir = date('Y-m-d H:i:s', strtotime($tgl_akhir));
                $query->where('TANGGAL', '<=', $parsedAkhir);
            }

            // Filter by ruangan (ID_RUANGAN) - using like query to support hierarchical search for JENIS=3 rooms
            if ($ruangan_id) {
                $query->where('ID_RUANGAN', 'like', $ruangan_id . '%');
            }

            // Filter by jaminan (ID_PENJAMIN)
            if ($jaminan_id) {
                $query->where('ID_PENJAMIN', $jaminan_id);
            }

            // Filter by No. RM
            if ($norm) {
                $query->where('NORM', 'like', '%' . $norm . '%');
            }

            // Filter by Nopen
            if ($nopen) {
                $query->where('NOPEN', 'like', '%' . $nopen . '%');
            }

            $query->orderBy('TANGGAL', 'asc');

            // Log compiled SQL
            \Illuminate\Support\Facades\Log::info('Compiled Akomodasi SQL query', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings()
            ]);

            $records = $query->get();
            \Illuminate\Support\Facades\Log::info('Akomodasi Query records count', ['count' => count($records)]);

            if ($request->query('export') === 'csv') {
                $headers = [
                    'Content-Type' => 'text/csv; charset=UTF-8',
                    'Content-Disposition' => 'attachment; filename="perhitungan_jenis_akomodasi_' . date('Ymd_His') . '.csv"',
                    'Pragma' => 'no-cache',
                    'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                    'Expires' => '0'
                ];

                $callback = function() use ($records) {
                    $file = fopen('php://output', 'w');
                    fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

                    // Calculate totals first
                    $totalHari = 0;
                    $totalTarif = 0;
                    $totalSub = 0;
                    foreach ($records as $row) {
                        $totalHari += (double) ($row->TOTAL_HARI ?? 0);
                        $totalTarif += (double) ($row->TARIF ?? 0);
                        $totalSub += (double) ($row->SUB_TOTAL ?? 0);
                    }

                    // Write summary at the beginning of Excel
                    fputcsv($file, ['RINGKASAN TOTAL PENJUMLAHAN']);
                    fputcsv($file, ['Total Hari', $totalHari]);
                    fputcsv($file, ['Total Tarif', $totalTarif]);
                    fputcsv($file, ['Total Sub Total', $totalSub]);
                    fputcsv($file, []); // blank line separator

                    fputcsv($file, [
                        'No.',
                        'Tanggal',
                        'No RM',
                        'Nopen',
                        'No SEP',
                        'Nama Pasien',
                        'Nama DPJP',
                        'Jaminan',
                        'Jenis Rincian',
                        'Total Hari',
                        'Nama Ruangan',
                        'Masuk',
                        'Keluar',
                        'Tarif',
                        'Sub Total'
                    ]);

                    foreach ($records as $idx => $row) {
                        $hariVal = (double) ($row->TOTAL_HARI ?? 0);
                        $tarifVal = (double) ($row->TARIF ?? 0);
                        $subTotalVal = (double) ($row->SUB_TOTAL ?? 0);

                        fputcsv($file, [
                            $idx + 1,
                            $row->TANGGAL ?? '',
                            $row->NORM ?? '',
                            $row->NOPEN ?? '',
                            $row->NO_SEP ?? '',
                            $row->NAMA_PASIEN ?? '',
                            $row->NAMA_DPJP ?? '',
                            $row->JAMINAN ?? '',
                            $row->JENIS_RINCIAN ?? '',
                            $hariVal,
                            $row->NAMA_RUANGAN ?? '',
                            $row->MASUK ?? '',
                            $row->KELUAR ?? '',
                            $tarifVal,
                            $subTotalVal
                        ]);
                    }

                    // Add Totals Row at the end
                    fputcsv($file, [
                        'Total',
                        '', '', '', '', '', '', '', '',
                        $totalHari,
                        '', '', '',
                        $totalTarif,
                        $totalSub
                    ]);

                    fclose($file);
                };

                return response()->stream($callback, 200, $headers);
            }
        }

        return Inertia::render('Admin/Perhitungan/Jenis/Akomodasi', [
            'ruanganOptions' => $ruanganOptions,
            'penjaminOptions' => $penjaminOptions,
            'records' => $records,
            'filters' => [
                'tgl_awal' => $tgl_awal,
                'tgl_akhir' => $tgl_akhir,
                'ruangan_id' => $ruangan_id,
                'jaminan_id' => $jaminan_id,
                'norm' => $norm,
                'nopen' => $nopen,
                'isSearched' => $isSearched,
            ],
        ]);
    }
}
