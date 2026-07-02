<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class MasterProporsiController extends Controller
{
    /**
     * Display the Master Proporsi grid page.
     */
    public function index(): Response
    {
        // Fetch all kelompoks
        $kelompoks = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Kelompok')
            ->where('STATUS', 1)
            ->orderBy('ID', 'asc')
            ->select('ID as id', 'NAMA_KELOMPOK as nama')
            ->get();

        // Fetch all penjamins
        $penjamins = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Penjamin')
            ->where('STATUS', 1)
            ->orderBy('PENJAMIN_ID', 'asc')
            ->select('PENJAMIN_ID as id', 'NAMA_PENJAMIN as nama')
            ->get();

        // Fetch all current proporsi records
        $proporsis = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Proporsi')
            ->select('ID_KELOMPOK as kelompok_id', 'ID_PENJAMIN as penjamin_id', 'Proporsi as proporsi')
            ->get();

        return Inertia::render('Admin/MasterProporsi/Index', [
            'kelompoks' => $kelompoks,
            'penjamins' => $penjamins,
            'proporsis' => $proporsis,
        ]);
    }

    /**
     * Bulk save proporsi values.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'updates' => 'required|array',
            'updates.*.penjamin_id' => 'required|integer',
            'updates.*.kelompok_id' => 'required|integer',
            'updates.*.proporsi' => 'required|numeric|min:0|max:100',
        ]);

        $updates = $request->input('updates');

        DB::connection('mysql_master')->transaction(function () use ($updates) {
            $now = date('Y-m-d H:i:s');

            foreach ($updates as $item) {
                // We do an updateOrInsert so if a combination doesn't exist, we insert it
                DB::connection('mysql_master')
                    ->table('remunerasi_app.Master_Proporsi')
                    ->updateOrInsert(
                        [
                            'ID_KELOMPOK' => $item['kelompok_id'],
                            'ID_PENJAMIN' => $item['penjamin_id'],
                        ],
                        [
                            'Proporsi' => (string)$item['proporsi'],
                            'Tanggal_Berlaku' => $now,
                            'Status' => 1
                        ]
                    );
            }
        });

        return redirect()->route('admin.master-proporsi.index')
            ->with('success', 'Proporsi remunerasi berhasil disimpan.');
    }
}
