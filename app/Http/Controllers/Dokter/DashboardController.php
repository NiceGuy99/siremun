<?php

namespace App\Http\Controllers\Dokter;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        ini_set('memory_limit', '512M');

        $user = auth()->user();
        $pegawai = $user ? $user->pegawai : null;

        // Ensure user is connected to a pegawai profile
        abort_if(!$pegawai, 403, 'Akun Anda belum terhubung dengan data pegawai.');

        // Requirement 1: Check title prefix 'dr.' or 'drg.'
        $gelar_depan = trim($pegawai->gelar_depan ?? '');
        $gelar_depan_clean = strtolower($gelar_depan);
        $gelar_depan_clean = rtrim($gelar_depan_clean, '.');

        abort_if(
            !in_array($gelar_depan_clean, ['dr', 'drg']),
            403,
            'Hanya dokter (dr. atau drg.) yang dapat mengakses menu dan dashboard ini.'
        );

        // Format doctor name to query in TIM_PETUGAS_MEDIS
        // Standardize title prefix with dot
        if ($gelar_depan && substr($gelar_depan, -1) !== '.') {
            $gelar_depan .= '.';
        }
        $doctorName = trim(($gelar_depan ? $gelar_depan . ' ' : '') . $pegawai->nama . ($pegawai->gelar_belakang ? ', ' . trim($pegawai->gelar_belakang) : ''));

        // 1. Fetch active period from master database to establish default month filter
        $activePeriod = DB::connection('mysql_master')
            ->table('remunerasi_app.periode_remun')
            ->where('status', 'Aktif')
            ->first();

        if (!$activePeriod) {
            $activePeriod = DB::connection('mysql_master')
                ->table('remunerasi_app.periode_remun')
                ->orderBy('tahun', 'desc')
                ->orderBy('bulan', 'desc')
                ->first();
        }

        $defaultYear = $activePeriod ? $activePeriod->tahun : (int)date('Y');
        $defaultMonth = $activePeriod ? $activePeriod->bulan : (int)date('m');
        $defaultMonthStr = sprintf('%04d-%02d', $defaultYear, $defaultMonth);

        // Requirement 4: bisa memilih tanggal berdasarkan bulan
        $selectedMonth = $request->query('month', $defaultMonthStr);
        if (!$selectedMonth) {
            $selectedMonth = $defaultMonthStr;
        }

        $tgl_awal = date('Y-m-01 00:00:00', strtotime($selectedMonth . '-01'));
        $tgl_akhir = date('Y-m-t 23:59:59', strtotime($selectedMonth . '-01'));

        // Requirement 8 & 9: Filters (Penjamin & No RM)
        $jaminan_id = $request->query('jaminan_id', '');
        $norm = $request->query('norm', '');

        // Fetch Penjamin Options from master database for the filter dropdown
        $penjaminOptions = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Penjamin')
            ->where('STATUS', 1)
            ->orderBy('PENJAMIN_ID')
            ->select('PENJAMIN_ID as id', 'NAMA_PENJAMIN as nama')
            ->get()
            ->toArray();

        // Query tindakan_remunerasi for this doctor
        // Requirement 2 & 3: Automatic filter by name, only for self
        $query = DB::connection('mysql_master')
            ->table('remunerasi_app.tindakan_remunerasi')
            ->leftJoin('remunerasi_app.Master_Tindakan', 'Master_Tindakan.TINDAKAN_ID', '=', 'tindakan_remunerasi.ID_TINDAKAN')
            ->leftJoin('remunerasi_app.Master_Kelompok', 'Master_Kelompok.ID', '=', 'Master_Tindakan.FLAG_KELOMPOK')
            ->where(DB::raw('LOWER(tindakan_remunerasi.TIM_PETUGAS_MEDIS)'), 'like', '%' . strtolower($doctorName) . '%')
            ->whereBetween('tindakan_remunerasi.TANGGAL_TINDAKAN', [$tgl_awal, $tgl_akhir])
            ->select([
                'tindakan_remunerasi.ID',
                'tindakan_remunerasi.TANGGAL_TINDAKAN',
                'tindakan_remunerasi.NORM',
                'tindakan_remunerasi.NAMA_PASIEN',
                'tindakan_remunerasi.JAMINAN',
                'tindakan_remunerasi.NAMA_RUANGAN',
                'tindakan_remunerasi.NAMA_TINDAKAN',
                'tindakan_remunerasi.ID_RUANGAN',
                'tindakan_remunerasi.ID_PENJAMIN',
                'tindakan_remunerasi.SUB_TOTAL',
                'tindakan_remunerasi.TIM_PETUGAS_MEDIS',
                'Master_Tindakan.FLAG_KELOMPOK',
                'Master_Kelompok.NAMA_KELOMPOK'
            ]);

        // Filter by penjamin
        if ($jaminan_id) {
            $query->where('tindakan_remunerasi.ID_PENJAMIN', $jaminan_id);
        }

        // Filter by No. RM
        if ($norm) {
            $query->where('tindakan_remunerasi.NORM', 'like', '%' . $norm . '%');
        }

        $allRecords = $query->orderBy('tindakan_remunerasi.TANGGAL_TINDAKAN', 'asc')->get();

        // Load proporsi rules
        $proporsis = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Proporsi')
            ->where('Status', 1)
            ->get();

        $proporsiMap = [];
        foreach ($proporsis as $p) {
            $proporsiMap[$p->ID_PENJAMIN][$p->ID_KELOMPOK] = (double) $p->Proporsi;
        }

        // Load kelompok rules for unit cost percentages
        $kelompoks = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Kelompok')
            ->where('STATUS', 1)
            ->get();

        $unitCostMap = [];
        foreach ($kelompoks as $k) {
            $unitCostMap[$k->ID] = (double) ($k->UNIT_COST_PERSEN ?? 0.0);
        }

        $calculatedRecords = [];
        $totals = [
            'unit_cost' => 0.0,
            'dr_op' => 0.0,
            'dr_coop' => 0.0,
            'dr_anes' => 0.0,
            'medis_lain' => 0.0,
            'total' => 0.0,
            'count' => 0,
        ];

        foreach ($allRecords as $row) {
            $subTotal = (double) $row->SUB_TOTAL;
            $idPenjamin = (int) $row->ID_PENJAMIN;
            $flagKelompok = (int) $row->FLAG_KELOMPOK;

            // Unit Cost (Based on action group's UNIT_COST_PERSEN)
            $proporsiUnitCost = $unitCostMap[$flagKelompok] ?? 0.0;
            $unitCost = $subTotal * ($proporsiUnitCost / 100);

            // dr. Op (ID_KELOMPOK = FLAG_KELOMPOK)
            $proporsidrOp = $proporsiMap[$idPenjamin][$flagKelompok] ?? 0.0;
            $drOp = $subTotal * ($proporsidrOp / 100);

            // dr. Co-op (ID_KELOMPOK = 6)
            if ($flagKelompok === 6) {
                $proporsidrCoop = $proporsiMap[$idPenjamin][6] ?? 0.0;
                $drCoop = $subTotal * ($proporsidrCoop / 100);
            } else {
                $drCoop = 0.0;
            }

            // dr. Anes (ID_KELOMPOK = 14, calculated from OK Operator/Co-Op total)
            if ($flagKelompok === 5) {
                $proporsidrAnes = $proporsiMap[$idPenjamin][14] ?? 0.0;
                $drAnes = $drOp * ($proporsidrAnes / 100);
            } else if ($flagKelompok === 6) {
                $proporsidrAnes = $proporsiMap[$idPenjamin][14] ?? 0.0;
                $baseDoctorFee = $drCoop > 0 ? $drCoop : $drOp;
                $drAnes = $baseDoctorFee * ($proporsidrAnes / 100);
            } else {
                $drAnes = 0.0;
            }

            // medis lain / tenaga lain (ID_KELOMPOK = 12)
            $proporsimedisLain = $proporsiMap[$idPenjamin][12] ?? 0.0;
            $medisLain = $subTotal * ($proporsimedisLain / 100);

            // Accumulate totals
            $totals['unit_cost'] += $unitCost;
            $totals['dr_op'] += $drOp;
            $totals['dr_coop'] += $drCoop;
            $totals['dr_anes'] += $drAnes;
            $totals['medis_lain'] += $medisLain;
            $totals['total'] += $subTotal;
            $totals['count']++;

            $calculatedRecords[] = [
                'id' => $row->ID,
                'tgl' => $row->TANGGAL_TINDAKAN,
                'norm' => $row->NORM,
                'nama' => $row->NAMA_PASIEN,
                'penjamin' => $row->JAMINAN,
                'ruangan' => $row->NAMA_RUANGAN,
                'tindakan' => $row->NAMA_TINDAKAN,
                'kelompok' => $row->NAMA_KELOMPOK ?? '-',
                'unit_cost' => $unitCost,
                'dr_op' => $drOp,
                'dr_coop' => $drCoop,
                'dr_anes' => $drAnes,
                'medis_lain' => $medisLain,
                'total' => $subTotal,
                'tim_petugas_medis' => $row->TIM_PETUGAS_MEDIS,
            ];
        }

        // Export Excel Option
        if ($request->query('export') === 'csv') {
            $headers = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="remunerasi_dokter_' . date('Ymd_His') . '.csv"',
                'Pragma' => 'no-cache',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0'
            ];

            $callback = function() use ($calculatedRecords, $totals, $doctorName) {
                $file = fopen('php://output', 'w');
                fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

                fputcsv($file, ['LAPORAN REMUNERASI DOKTER']);
                fputcsv($file, ['Nama Dokter', $doctorName]);
                fputcsv($file, []);
                fputcsv($file, ['RINGKASAN TOTAL']);
                fputcsv($file, ['Total Tindakan', $totals['count']]);
                fputcsv($file, ['Total Unit Cost', $totals['unit_cost']]);
                fputcsv($file, ['Total dr. Op', $totals['dr_op']]);
                fputcsv($file, ['Total dr. Co-op', $totals['dr_coop']]);
                fputcsv($file, ['Total dr. Anes', $totals['dr_anes']]);
                fputcsv($file, ['Total Tenaga Lain', $totals['medis_lain']]);
                fputcsv($file, ['Total Sub Total', $totals['total']]);
                fputcsv($file, []); // separator

                fputcsv($file, [
                    'No.',
                    'Tgl Tindakan',
                    'No RM',
                    'Nama Pasien',
                    'Penjamin',
                    'Ruangan',
                    'Tindakan',
                    'Kelompok',
                    'Unit Cost',
                    'dr. Op',
                    'dr. Co-op',
                    'dr. Anes',
                    'Tenaga Lain',
                    'Total'
                ]);

                foreach ($calculatedRecords as $idx => $row) {
                    fputcsv($file, [
                        $idx + 1,
                        $row['tgl'] ?? '',
                        $row['norm'] ?? '',
                        $row['nama'] ?? '',
                        $row['penjamin'] ?? '',
                        $row['ruangan'] ?? '',
                        $row['tindakan'] ?? '',
                        $row['kelompok'] ?? '',
                        $row['unit_cost'] ?? 0,
                        $row['dr_op'] ?? 0,
                        $row['dr_coop'] ?? 0,
                        $row['dr_anes'] ?? 0,
                        $row['medis_lain'] ?? 0,
                        $row['total'] ?? 0
                    ]);
                }

                // Add Totals Row
                fputcsv($file, [
                    'Total',
                    '', '', '', '', '', '', '',
                    $totals['unit_cost'],
                    $totals['dr_op'],
                    $totals['dr_coop'],
                    $totals['dr_anes'],
                    $totals['medis_lain'],
                    $totals['total']
                ]);

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        // Paginate results in memory
        $totalItems = count($calculatedRecords);
        $perPage = 10;
        $page = (int) $request->query('page', 1);
        if ($page < 1) $page = 1;

        $offset = ($page - 1) * $perPage;
        $records = array_slice($calculatedRecords, $offset, $perPage);

        $pagination = [
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $totalItems,
            'last_page' => (int) ceil($totalItems / $perPage),
        ];

        return Inertia::render('Dokter/Dashboard', [
            'doctorName' => $doctorName,
            'pegawai' => $pegawai,
            'records' => $records,
            'totals' => $totals,
            'pagination' => $pagination,
            'penjaminOptions' => $penjaminOptions,
            'filters' => [
                'month' => $selectedMonth,
                'jaminan_id' => $jaminan_id,
                'norm' => $norm,
            ],
        ]);
    }
}
