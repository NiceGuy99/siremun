<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TestHitungController extends Controller
{
    public function index(Request $request): Response
    {
        $tgl_awal = $request->query('tgl_awal', '');
        $tgl_akhir = $request->query('tgl_akhir', '');
        $ruangan_id = $request->query('ruangan_id', '');
        $jaminan_id = $request->query('jaminan_id', '');
        $isSearched = $request->has('search');

        // Fetch Ruangan Options from master database
        $ruanganOptions = DB::connection('mysql_master')
            ->table('ruangan')
            ->where('JENIS', 5)
            ->where('STATUS', 1)
            ->orderBy('ID')
            ->select('ID as id', 'DESKRIPSI as deskripsi')
            ->get()
            ->toArray();

        $records = [];

        if ($isSearched) {
            \Illuminate\Support\Facades\Log::info('TestHitung Search Query Params', [
                'tgl_awal' => $tgl_awal,
                'tgl_akhir' => $tgl_akhir,
                'ruangan_id' => $ruangan_id,
                'jaminan_id' => $jaminan_id
            ]);

            $query = DB::connection('mysql_master')
                ->table('remunerasi_app.tindakan_remunerasi')
                ->select(
                    'ID',
                    'TANGGAL_PEMBAYARAN',
                    'NORM',
                    'NOPEN',
                    'NO_SEP',
                    'NAMA_PASIEN',
                    'DOKTER_DPJP',
                    'JAMINAN',
                    'JENIS_RINCIAN',
                    'TANGGAL_TINDAKAN',
                    'NAMA_TINDAKAN',
                    'ID_RUANGAN',
                    'NAMA_RUANGAN',
                    'TARIF',
                    'TIM_PETUGAS_MEDIS',
                    'SUB_TOTAL'
                );

            // Filter by date range
            if ($tgl_awal) {
                $parsedAwal = date('Y-m-d H:i:s', strtotime($tgl_awal));
                $query->where('TANGGAL_PEMBAYARAN', '>=', $parsedAwal);
                \Illuminate\Support\Facades\Log::info('Tgl Awal filter applied', ['original' => $tgl_awal, 'parsed' => $parsedAwal]);
            }
            if ($tgl_akhir) {
                $parsedAkhir = date('Y-m-d H:i:s', strtotime($tgl_akhir));
                $query->where('TANGGAL_PEMBAYARAN', '<=', $parsedAkhir);
                \Illuminate\Support\Facades\Log::info('Tgl Akhir filter applied', ['original' => $tgl_akhir, 'parsed' => $parsedAkhir]);
            }

            // Filter by ruangan
            if ($ruangan_id) {
                $query->where('ID_RUANGAN', $ruangan_id);
            }

            // Filter by jaminan (Penjamin)
            if ($jaminan_id) {
                $jaminanMap = [
                    '1' => 'Tanpa Asuransi / Umum',
                    '2' => 'BPJS / JKN',
                    '3' => 'BPJS Ketenagakerjaan',
                    '4' => 'Jasa Raharja',
                    '5' => 'Rujuk Internal JKN',
                    '6' => 'Global Fund',
                    '7' => 'RSI Aminah',
                    '8' => 'RS Yapalis',
                    '9' => 'RS Mitra Sehat',
                    '10' => 'Klinik Mitra 62',
                    '11' => 'Pra-Klaim',
                    '12' => 'AdMedika',
                    '13' => 'PT RAJAWALI TANJUNGSARI ENJINIRING',
                    '14' => 'PIUTANG',
                    '15' => 'BPJS - Ambulans',
                ];
                if (isset($jaminanMap[$jaminan_id])) {
                    $query->where('JAMINAN', $jaminanMap[$jaminan_id]);
                }
            }

            $query->orderBy('TANGGAL_PEMBAYARAN', 'asc');

            // Log compiled SQL
            \Illuminate\Support\Facades\Log::info('Compiled SQL query', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings()
            ]);

            $records = $query->get();
            \Illuminate\Support\Facades\Log::info('Query execution records count', ['count' => count($records)]);
        }

        return Inertia::render('Admin/Perhitungan/Jenis/Tindakan', [
            'ruanganOptions' => $ruanganOptions,
            'records' => $records,
            'filters' => [
                'tgl_awal' => $tgl_awal,
                'tgl_akhir' => $tgl_akhir,
                'ruangan_id' => $ruangan_id,
                'jaminan_id' => $jaminan_id,
                'isSearched' => $isSearched,
            ],
        ]);
    }
}
