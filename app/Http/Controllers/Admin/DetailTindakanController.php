<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DetailTindakanController extends Controller
{
    public function index(Request $request)
    {
        ini_set('memory_limit', '512M');

        $tgl_awal = $request->query('tgl_awal', '');
        $tgl_akhir = $request->query('tgl_akhir', '');
        $ruangan_id = $request->query('ruangan_id', '');
        $jaminan_id = $request->query('jaminan_id', '');
        $norm = $request->query('norm', '');
        $petugas_medis = $request->query('petugas_medis', '');
        $dokter_kosong = $request->query('dokter_kosong', '') === 'true' || $request->query('dokter_kosong', '') === '1';
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

        // Fetch Penjamin Options from master database
        $penjaminOptions = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Penjamin')
            ->where('STATUS', 1)
            ->orderBy('PENJAMIN_ID')
            ->select('PENJAMIN_ID as id', 'NAMA_PENJAMIN as nama')
            ->get()
            ->toArray();

        // Fetch all active pegawais for Petugas Medis select options with profesi = 4
        $pegawais = DB::connection('mysql')
            ->table('pegawais')
            ->where('status_aktif', 1)
            ->where('profesi', 4)
            ->select('nama', 'gelar_depan', 'gelar_belakang')
            ->orderBy('nama')
            ->get();

        $petugasMedisOptions = [];
        foreach ($pegawais as $p) {
            $gelar_depan = trim($p->gelar_depan);
            if ($gelar_depan && substr($gelar_depan, -1) !== '.') {
                $gelar_depan .= '.';
            }
            $fullName = trim(($gelar_depan ? $gelar_depan . ' ' : '') . $p->nama . ($p->gelar_belakang ? ', ' . trim($p->gelar_belakang) : ''));
            if ($fullName !== '') {
                $petugasMedisOptions[] = [
                    'id' => $fullName,
                    'nama' => $fullName
                ];
            }
        }

        $records = [];
        $totals = [
            'unit_cost' => 0.0,
            'dr_op' => 0.0,
            'dr_coop' => 0.0,
            'dr_anes' => 0.0,
            'medis_lain' => 0.0,
            'investasi' => 0.0,
            'total' => 0.0,
        ];
        $pagination = [
            'current_page' => 1,
            'per_page' => 10,
            'total' => 0,
            'last_page' => 1,
        ];

        if ($isSearched) {
            $query = DB::connection('mysql_master')
                ->table('remunerasi_app.tindakan_remunerasi')
                ->leftJoin('remunerasi_app.Master_Tindakan', 'Master_Tindakan.TINDAKAN_ID', '=', 'tindakan_remunerasi.ID_TINDAKAN')
                ->leftJoin('remunerasi_app.Master_Kelompok', 'Master_Kelompok.ID', '=', 'Master_Tindakan.FLAG_KELOMPOK')
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

            // Filter by date range (TANGGAL_TINDAKAN)
            if ($tgl_awal) {
                $parsedAwal = date('Y-m-d H:i:s', strtotime($tgl_awal));
                $query->where('tindakan_remunerasi.TANGGAL_TINDAKAN', '>=', $parsedAwal);
            }
            if ($tgl_akhir) {
                $parsedAkhir = date('Y-m-d H:i:s', strtotime($tgl_akhir));
                $query->where('tindakan_remunerasi.TANGGAL_TINDAKAN', '<=', $parsedAkhir);
            }

            // Filter by ruangan
            if ($ruangan_id) {
                $query->where('tindakan_remunerasi.ID_RUANGAN', $ruangan_id);
            }

            // Filter by penjamin
            if ($jaminan_id) {
                $query->where('tindakan_remunerasi.ID_PENJAMIN', $jaminan_id);
            }

            // Filter by No. RM
            if ($norm) {
                $query->where('tindakan_remunerasi.NORM', 'like', '%' . $norm . '%');
            }

            // Filter by Petugas Medis / Dokter Kosong
            if ($dokter_kosong) {
                $query->where(function($q) {
                    $q->whereNull('tindakan_remunerasi.TIM_PETUGAS_MEDIS')
                      ->orWhere('tindakan_remunerasi.TIM_PETUGAS_MEDIS', '')
                      ->orWhere('tindakan_remunerasi.TIM_PETUGAS_MEDIS', '[]');
                });
            } elseif ($petugas_medis) {
                $query->where('tindakan_remunerasi.TIM_PETUGAS_MEDIS', 'like', '%' . $petugas_medis . '%');
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

                // dr. Anes (ID_KELOMPOK = 14)
                if ($flagKelompok === 6 || $flagKelompok === 5) {
                    $proporsidrAnes = $proporsiMap[$idPenjamin][14] ?? 0.0;
                    $drAnes = $subTotal * ($proporsidrAnes / 100);
                } else {
                    $drAnes = 0.0;
                }

                // medis lain (ID_KELOMPOK = 12)
                $proporsimedisLain = $proporsiMap[$idPenjamin][12] ?? 0.0;
                $medisLain = $subTotal * ($proporsimedisLain / 100);

                // Investasi (ID_KELOMPOK = 13)
                $proporsiInvestasi = $proporsiMap[$idPenjamin][13] ?? 0.0;
                $investasi = $subTotal * ($proporsiInvestasi / 100);

                // Accumulate totals
                $totals['unit_cost'] += $unitCost;
                $totals['dr_op'] += $drOp;
                $totals['dr_coop'] += $drCoop;
                $totals['dr_anes'] += $drAnes;
                $totals['medis_lain'] += $medisLain;
                $totals['investasi'] += $investasi;
                $totals['total'] += $subTotal;

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
                    'investasi' => $investasi,
                    'total' => $subTotal,
                    'tim_petugas_medis' => $row->TIM_PETUGAS_MEDIS,
                ];
            }

            if ($request->query('export') === 'csv') {
                $headers = [
                    'Content-Type' => 'text/csv; charset=UTF-8',
                    'Content-Disposition' => 'attachment; filename="perhitungan_detail_tindakan_' . date('Ymd_His') . '.csv"',
                    'Pragma' => 'no-cache',
                    'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                    'Expires' => '0'
                ];

                $callback = function() use ($calculatedRecords, $totals) {
                    $file = fopen('php://output', 'w');
                    fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

                    // Write summary at the beginning of Excel
                    fputcsv($file, ['RINGKASAN TOTAL PENJUMLAHAN']);
                    fputcsv($file, ['Total Unit Cost', $totals['unit_cost']]);
                    fputcsv($file, ['Total dr. Op', $totals['dr_op']]);
                    fputcsv($file, ['Total dr. Co-op', $totals['dr_coop']]);
                    fputcsv($file, ['Total dr. Anes', $totals['dr_anes']]);
                    fputcsv($file, ['Total Tenaga Lain', $totals['medis_lain']]);
                    fputcsv($file, ['Total Investasi', $totals['investasi']]);
                    fputcsv($file, ['Total Sub Total', $totals['total']]);
                    fputcsv($file, []); // blank line separator

                    fputcsv($file, [
                        'No.',
                        'Tgl Tindakan',
                        'No RM',
                        'Nama Pasien',
                        'Penjamin',
                        'Ruangan',
                        'Tindakan',
                        'Kelompok',
                        'Petugas Medis',
                        'Unit Cost',
                        'dr. Op',
                        'dr. Co-op',
                        'dr. Anes',
                        'Tenaga Lain',
                        'Investasi',
                        'Total'
                    ]);

                    foreach ($calculatedRecords as $idx => $row) {
                        $timPetugasStr = '';
                        if (!empty($row['tim_petugas_medis'])) {
                            try {
                                $petugas = json_decode($row['tim_petugas_medis'], true);
                                if (is_array($petugas) && count($petugas) > 0) {
                                    $arr = [];
                                    foreach ($petugas as $pm) {
                                        $arr[] = ($pm['nama'] ?? '') . ' (' . ($pm['peran'] ?? '') . ')';
                                    }
                                    $timPetugasStr = implode('; ', $arr);
                                }
                            } catch (\Exception $e) {
                                $timPetugasStr = '';
                            }
                        }

                        fputcsv($file, [
                            $idx + 1,
                            $row['tgl'] ?? '',
                            $row['norm'] ?? '',
                            $row['nama'] ?? '',
                            $row['penjamin'] ?? '',
                            $row['ruangan'] ?? '',
                            $row['tindakan'] ?? '',
                            $row['kelompok'] ?? '',
                            $timPetugasStr,
                            $row['unit_cost'] ?? 0,
                            $row['dr_op'] ?? 0,
                            $row['dr_coop'] ?? 0,
                            $row['dr_anes'] ?? 0,
                            $row['medis_lain'] ?? 0,
                            $row['investasi'] ?? 0,
                            $row['total'] ?? 0
                        ]);
                    }

                    // Add Totals Row
                    fputcsv($file, [
                        'Total',
                        '', '', '', '', '', '', '', '',
                        $totals['unit_cost'],
                        $totals['dr_op'],
                        $totals['dr_coop'],
                        $totals['dr_anes'],
                        $totals['medis_lain'],
                        $totals['investasi'],
                        $totals['total']
                    ]);

                    fclose($file);
                };

                return response()->stream($callback, 200, $headers);
            }

            // Paginate in memory
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
        }

        return Inertia::render('Admin/Perhitungan/Detail/Tindakan', [
            'ruanganOptions' => $ruanganOptions,
            'penjaminOptions' => $penjaminOptions,
            'petugasMedisOptions' => $petugasMedisOptions,
            'records' => $records,
            'totals' => $totals,
            'pagination' => $pagination,
            'filters' => [
                'tgl_awal' => $tgl_awal,
                'tgl_akhir' => $tgl_akhir,
                'ruangan_id' => $ruangan_id,
                'jaminan_id' => $jaminan_id,
                'norm' => $norm,
                'petugas_medis' => $petugas_medis,
                'dokter_kosong' => $dokter_kosong,
                'isSearched' => $isSearched,
            ],
        ]);
    }
}
