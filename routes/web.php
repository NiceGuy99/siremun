<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Pegawai\RemunerasiSayaController;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    if (auth()->user()->hasRole('admin')) {
        return redirect()->route('admin.dashboard');
    }
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'role:user'])
    ->prefix('pegawai')
    ->name('pegawai.')
    ->group(function () {
        Route::get('/remunerasi-saya', [RemunerasiSayaController::class, 'index'])
            ->name('remunerasi-saya');
    });

Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');
        Route::get('/perhitungan/jenis/tindakan', [App\Http\Controllers\Admin\TestHitungController::class, 'index'])->name('perhitungan.jenis.tindakan');
        Route::get('/perhitungan/detail/tindakan', [App\Http\Controllers\Admin\DetailTindakanController::class, 'index'])->name('perhitungan.detail.tindakan');

        // Dynamic resource routes
        Route::resource('pegawai', App\Http\Controllers\Admin\PegawaiController::class);
        Route::resource('jabatan', App\Http\Controllers\Admin\JabatanController::class);
        Route::resource('unit', App\Http\Controllers\Admin\UnitController::class);
        Route::resource('grade', App\Http\Controllers\Admin\GradeController::class);
        Route::resource('remunerasi-period', App\Http\Controllers\Admin\RemunerasiPeriodController::class);
        Route::resource('remunerasi-detail', App\Http\Controllers\Admin\RemunerasiDetailController::class);
        Route::resource('remunerasi-import-batch', App\Http\Controllers\Admin\RemunerasiImportBatchController::class);
        Route::resource('master-tindakan', App\Http\Controllers\Admin\MasterTindakanController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('master-penjamin', App\Http\Controllers\Admin\MasterPenjaminController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('master-kelompok', App\Http\Controllers\Admin\MasterKelompokController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('master-proporsi', App\Http\Controllers\Admin\MasterProporsiController::class)->only(['index', 'store']);
    });

require __DIR__.'/auth.php';
