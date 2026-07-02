<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class MasterTindakanController extends Controller
{
    /**
     * Display a paginated, filterable list of Master Tindakan.
     */
    public function index(Request $request): Response
    {
        $perPage = 10;
        $page = (int) $request->query('page', 1);
        $kelompokId = $request->query('kelompok_id', '');
        $search = $request->query('search', '');

        // Build query
        $query = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Tindakan as mt')
            ->join('remunerasi_app.Master_Kelompok as mk', 'mt.FLAG_KELOMPOK', '=', 'mk.ID')
            ->select(
                'mt.ID',
                'mt.TINDAKAN_ID',
                'mt.NAMA_TINDAKAN',
                'mt.JENIS',
                'mt.FLAG_KELOMPOK',
                'mt.STATUS',
                'mk.NAMA_KELOMPOK'
            );

        // Filter by kelompok
        if ($kelompokId !== '') {
            $query->where('mt.FLAG_KELOMPOK', $kelompokId);
        }

        // Search by TINDAKAN_ID or NAMA_TINDAKAN
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                // If search is numeric, also search by TINDAKAN_ID
                if (is_numeric($search)) {
                    $q->where('mt.TINDAKAN_ID', $search)
                      ->orWhere('mt.NAMA_TINDAKAN', 'LIKE', "%{$search}%");
                } else {
                    $q->where('mt.NAMA_TINDAKAN', 'LIKE', "%{$search}%");
                }
            });
        }

        // Get total count for pagination
        $total = $query->count();

        // Fetch paginated records
        $records = $query
            ->orderBy('mt.TINDAKAN_ID', 'asc')
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        // Fetch kelompok options for filter dropdown
        $kelompokOptions = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Kelompok')
            ->where('STATUS', 1)
            ->orderBy('ID')
            ->select('ID as id', 'NAMA_KELOMPOK as nama')
            ->get()
            ->toArray();

        return Inertia::render('Admin/MasterTindakan/Index', [
            'records' => $records,
            'kelompokOptions' => $kelompokOptions,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => (int) ceil($total / $perPage),
            ],
            'filters' => [
                'kelompok_id' => $kelompokId,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a new Master Tindakan record.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'TINDAKAN_ID' => 'required|integer',
            'NAMA_TINDAKAN' => 'required|string|max:255',
            'JENIS' => 'nullable|integer',
            'FLAG_KELOMPOK' => 'required|integer',
            'STATUS' => 'required|integer|in:0,1',
        ]);

        DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Tindakan')
            ->insert($validated);

        return redirect()->route('admin.master-tindakan.index')
            ->with('success', 'Master Tindakan berhasil ditambahkan.');
    }

    /**
     * Update an existing Master Tindakan record.
     */
    public function update(Request $request, $id): RedirectResponse
    {
        $validated = $request->validate([
            'TINDAKAN_ID' => 'required|integer',
            'NAMA_TINDAKAN' => 'required|string|max:255',
            'JENIS' => 'nullable|integer',
            'FLAG_KELOMPOK' => 'required|integer',
            'STATUS' => 'required|integer|in:0,1',
        ]);

        $affected = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Tindakan')
            ->where('ID', $id)
            ->update($validated);

        if ($affected === 0) {
            return redirect()->route('admin.master-tindakan.index')
                ->with('error', 'Data tidak ditemukan atau tidak ada perubahan.');
        }

        return redirect()->route('admin.master-tindakan.index')
            ->with('success', 'Master Tindakan berhasil diperbarui.');
    }

    /**
     * Delete a Master Tindakan record.
     */
    public function destroy($id): RedirectResponse
    {
        $affected = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Tindakan')
            ->where('ID', $id)
            ->delete();

        if ($affected === 0) {
            return redirect()->route('admin.master-tindakan.index')
                ->with('error', 'Data tidak ditemukan.');
        }

        return redirect()->route('admin.master-tindakan.index')
            ->with('success', 'Master Tindakan berhasil dihapus.');
    }
}
