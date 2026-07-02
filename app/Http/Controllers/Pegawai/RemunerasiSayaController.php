<?php

namespace App\Http\Controllers\Pegawai;

use App\Http\Controllers\Controller;
use App\Models\RemunerasiDetail;
use Inertia\Inertia;

class RemunerasiSayaController extends Controller
{
    public function index()
    {
        $pegawai = auth()->user()->pegawai;

        abort_if(! $pegawai, 403, 'Akun ini belum terhubung dengan data pegawai.');

        $items = RemunerasiDetail::query()
            ->with('period')
            ->where('pegawai_id', $pegawai->id)
            ->where('status', 'published')
            ->latest()
            ->get();

        return Inertia::render('pegawai/remunerasi-saya', [
            'pegawai' => $pegawai,
            'items' => $items,
        ]);
    }
}