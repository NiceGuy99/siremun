<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class MasterPenjaminController extends Controller
{
    /**
     * Display a list of Master Penjamin.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search', '');

        $query = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Penjamin')
            ->select('ID', 'PENJAMIN_ID', 'NAMA_PENJAMIN', 'STATUS');

        // Search by PENJAMIN_ID or NAMA_PENJAMIN
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                if (is_numeric($search)) {
                    $q->where('PENJAMIN_ID', $search)
                      ->orWhere('NAMA_PENJAMIN', 'LIKE', "%{$search}%");
                } else {
                    $q->where('NAMA_PENJAMIN', 'LIKE', "%{$search}%");
                }
            });
        }

        $records = $query->orderBy('PENJAMIN_ID', 'asc')->get();

        // Get next PENJAMIN_ID for create form
        $maxPenjaminId = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Penjamin')
            ->max('PENJAMIN_ID');
        $nextPenjaminId = ($maxPenjaminId ?? 0) + 1;

        return Inertia::render('Admin/MasterPenjamin/Index', [
            'records' => $records,
            'nextPenjaminId' => $nextPenjaminId,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a new Master Penjamin record.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'PENJAMIN_ID' => 'required|integer',
            'NAMA_PENJAMIN' => 'required|string|max:500',
            'STATUS' => 'required|integer|in:0,1',
        ]);

        DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Penjamin')
            ->insert($validated);

        return redirect()->route('admin.master-penjamin.index')
            ->with('success', 'Master Penjamin berhasil ditambahkan.');
    }

    /**
     * Update an existing Master Penjamin record.
     */
    public function update(Request $request, $id): RedirectResponse
    {
        $validated = $request->validate([
            'PENJAMIN_ID' => 'required|integer',
            'NAMA_PENJAMIN' => 'required|string|max:500',
            'STATUS' => 'required|integer|in:0,1',
        ]);

        $affected = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Penjamin')
            ->where('ID', $id)
            ->update($validated);

        if ($affected === 0) {
            return redirect()->route('admin.master-penjamin.index')
                ->with('error', 'Data tidak ditemukan atau tidak ada perubahan.');
        }

        return redirect()->route('admin.master-penjamin.index')
            ->with('success', 'Master Penjamin berhasil diperbarui.');
    }

    /**
     * Delete a Master Penjamin record.
     */
    public function destroy($id): RedirectResponse
    {
        $affected = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Penjamin')
            ->where('ID', $id)
            ->delete();

        if ($affected === 0) {
            return redirect()->route('admin.master-penjamin.index')
                ->with('error', 'Data tidak ditemukan.');
        }

        return redirect()->route('admin.master-penjamin.index')
            ->with('success', 'Master Penjamin berhasil dihapus.');
    }
}
