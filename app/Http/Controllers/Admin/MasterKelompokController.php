<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class MasterKelompokController extends Controller
{
    /**
     * Display a list of Master Kelompok.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search', '');

        $query = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Kelompok')
            ->select('ID', 'NAMA_KELOMPOK', 'STATUS');

        // Search by ID or NAMA_KELOMPOK
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                if (is_numeric($search)) {
                    $q->where('ID', $search)
                      ->orWhere('NAMA_KELOMPOK', 'LIKE', "%{$search}%");
                } else {
                    $q->where('NAMA_KELOMPOK', 'LIKE', "%{$search}%");
                }
            });
        }

        $records = $query->orderBy('ID', 'asc')->get();

        // Calculate next ID
        $maxId = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Kelompok')
            ->max('ID');
        $nextKelompokId = ($maxId ?? 0) + 1;

        return Inertia::render('Admin/MasterKelompok/Index', [
            'records' => $records,
            'nextKelompokId' => $nextKelompokId,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a new Master Kelompok record.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ID' => 'required|integer',
            'NAMA_KELOMPOK' => 'required|string|max:100',
            'STATUS' => 'required|integer|in:0,1',
        ]);

        DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Kelompok')
            ->insert($validated);

        return redirect()->route('admin.master-kelompok.index')
            ->with('success', 'Master Kelompok berhasil ditambahkan.');
    }

    /**
     * Update an existing Master Kelompok record.
     */
    public function update(Request $request, $id): RedirectResponse
    {
        $validated = $request->validate([
            'NAMA_KELOMPOK' => 'required|string|max:100',
            'STATUS' => 'required|integer|in:0,1',
        ]);

        $affected = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Kelompok')
            ->where('ID', $id)
            ->update($validated);

        if ($affected === 0) {
            return redirect()->route('admin.master-kelompok.index')
                ->with('error', 'Data tidak ditemukan atau tidak ada perubahan.');
        }

        return redirect()->route('admin.master-kelompok.index')
            ->with('success', 'Master Kelompok berhasil diperbarui.');
    }

    /**
     * Delete a Master Kelompok record.
     */
    public function destroy($id): RedirectResponse
    {
        $affected = DB::connection('mysql_master')
            ->table('remunerasi_app.Master_Kelompok')
            ->where('ID', $id)
            ->delete();

        if ($affected === 0) {
            return redirect()->route('admin.master-kelompok.index')
                ->with('error', 'Data tidak ditemukan.');
        }

        return redirect()->route('admin.master-kelompok.index')
            ->with('success', 'Master Kelompok berhasil dihapus.');
    }
}
