import { useState, useEffect } from 'react';
import DokterLayout from '@/Layouts/DokterLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function DokterDashboard({ doctorName, pegawai, records, totals, pagination, penjaminOptions, filters }) {
    const [month, setMonth] = useState(filters.month || '');
    const [jaminanId, setJaminanId] = useState(filters.jaminan_id || '');
    const [norm, setNorm] = useState(filters.norm || '');
    const [loading, setLoading] = useState(false);

    // Sync filters from Inertia
    useEffect(() => {
        setMonth(filters.month || '');
        setJaminanId(filters.jaminan_id || '');
        setNorm(filters.norm || '');
    }, [filters]);

    // Handle global loading states
    useEffect(() => {
        const removeStartListener = router.on('start', () => setLoading(true));
        const removeFinishListener = router.on('finish', () => setLoading(false));
        return () => {
            removeStartListener();
            removeFinishListener();
        };
    }, []);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get(
            route('dokter.dashboard'),
            {
                month: month,
                jaminan_id: jaminanId,
                norm: norm,
                page: 1
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleReset = () => {
        router.get(
            route('dokter.dashboard'),
            {},
            { preserveState: false, preserveScroll: true }
        );
    };

    const handleExportCsv = () => {
        const params = new URLSearchParams({
            month: month,
            jaminan_id: jaminanId,
            norm: norm,
            export: 'csv'
        });
        window.location.href = route('dokter.dashboard') + '?' + params.toString();
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > pagination.last_page) return;
        router.get(
            route('dokter.dashboard'),
            {
                month: month,
                jaminan_id: jaminanId,
                norm: norm,
                page: page
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const formatCurrency = (val) => {
        if (val === null || val === undefined) return 'Rp 0,00';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 2
        }).format(val);
    };

    const formatMonthName = (monthStr) => {
        if (!monthStr) return '-';
        const date = new Date(monthStr + '-02'); // add day to avoid timezone wrap
        return new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'long' }).format(date);
    };

    return (
        <DokterLayout title="Dashboard Dokter">
            <Head title="Dashboard Dokter - SIREMUN" />

            <div className="space-y-6">
                
                {/* Header Action Row */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-gray-900 dark:text-white">
                            Dashboard Remunerasi Dokter
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Laporan rincian remunerasi tindakan medis untuk {doctorName}
                        </p>
                    </div>
                    <button
                        onClick={handleExportCsv}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition duration-150 shadow-sm shadow-emerald-600/10 cursor-pointer self-start md:self-auto"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Ekspor CSV
                    </button>
                </div>
                
                {/* Doctor Bio Card */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl shadow-amber-500/10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <span className="bg-white/20 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm">
                                Profil Dokter
                            </span>
                            <h3 className="text-2xl font-bold mt-2">
                                {doctorName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-white/80">
                                <span>NIP: {pegawai?.nip || '-'}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-white/40 hidden sm:inline"></span>
                                <span>Unit: {pegawai?.unit?.nama || '-'}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-white/40 hidden sm:inline"></span>
                                <span>Jabatan: {pegawai?.jabatan?.nama || '-'}</span>
                            </div>
                        </div>
                        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10 self-stretch sm:self-auto flex sm:flex-col items-center justify-between text-right">
                            <span className="text-xs text-white/70">Periode Aktif</span>
                            <span className="font-semibold text-base sm:mt-1">{formatMonthName(month)}</span>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Tindakan */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Tindakan</span>
                            <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                                </svg>
                            </div>
                        </div>
                        <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4">
                            {totals.count}
                        </h4>
                        <p className="text-xs text-gray-500 mt-2">Jumlah prosedur pelayanan dilakukan</p>
                    </div>

                    {/* Card 2: Total Sub Total */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sub Total</span>
                            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <h4 className="text-xl font-extrabold text-gray-900 dark:text-white mt-4 truncate" title={formatCurrency(totals.total)}>
                            {formatCurrency(totals.total)}
                        </h4>
                        <p className="text-xs text-gray-500 mt-2">Akumulasi bruto tindakan medis</p>
                    </div>

                    {/* Card 3: dr. Op */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Jasa dr. Op</span>
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                        <h4 className="text-xl font-extrabold text-gray-900 dark:text-white mt-4 truncate" title={formatCurrency(totals.dr_op)}>
                            {formatCurrency(totals.dr_op)}
                        </h4>
                        <p className="text-xs text-gray-500 mt-2">Total proporsi dokter operator</p>
                    </div>

                    {/* Card 4: dr. Co-op */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total dr. Co-op</span>
                            <div className="p-2 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-xl">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                        <h4 className="text-xl font-extrabold text-gray-900 dark:text-white mt-4 truncate" title={formatCurrency(totals.dr_coop)}>
                            {formatCurrency(totals.dr_coop)}
                        </h4>
                        <p className="text-xs text-gray-500 mt-2">Total proporsi dokter co-operator</p>
                    </div>
                </div>

                {/* Additional Summary Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Card 5: dr. Anes */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total dr. Anestesi</span>
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                        </div>
                        <h4 className="text-xl font-extrabold text-gray-900 dark:text-white mt-4 truncate" title={formatCurrency(totals.dr_anes)}>
                            {formatCurrency(totals.dr_anes)}
                        </h4>
                        <p className="text-xs text-gray-500 mt-2">Total proporsi dokter anestesi</p>
                    </div>

                    {/* Card 6: Tenaga Lain */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Tenaga Lain</span>
                            <div className="p-2 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-xl">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <h4 className="text-xl font-extrabold text-gray-900 dark:text-white mt-4 truncate" title={formatCurrency(totals.medis_lain)}>
                            {formatCurrency(totals.medis_lain)}
                        </h4>
                        <p className="text-xs text-gray-500 mt-2">Total proporsi perawat/medis lain</p>
                    </div>

                    {/* Card 7: Unit Cost */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Unit Cost</span>
                            <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
                                </svg>
                            </div>
                        </div>
                        <h4 className="text-xl font-extrabold text-gray-900 dark:text-white mt-4 truncate" title={formatCurrency(totals.unit_cost)}>
                            {formatCurrency(totals.unit_cost)}
                        </h4>
                        <p className="text-xs text-gray-500 mt-2">Total porsi biaya unit pelayanan</p>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Filter Data</h3>
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        {/* Requirement 4: Choose date by month */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pilih Bulan</label>
                            <input
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="block w-full rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 text-sm focus:border-amber-500 focus:ring-amber-500 text-gray-700 dark:text-gray-200"
                            />
                        </div>

                        {/* Requirement 8: Penjamin filter */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Penjamin</label>
                            <select
                                value={jaminanId}
                                onChange={(e) => setJaminanId(e.target.value)}
                                className="block w-full rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 text-sm focus:border-amber-500 focus:ring-amber-500 text-gray-700 dark:text-gray-200"
                            >
                                <option value="">Semua Penjamin</option>
                                {penjaminOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>{opt.nama}</option>
                                ))}
                            </select>
                        </div>

                        {/* Requirement 9: RM search */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">No. RM Pasien</label>
                            <input
                                type="text"
                                placeholder="Cari No. RM..."
                                value={norm}
                                onChange={(e) => setNorm(e.target.value)}
                                className="block w-full rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 text-sm focus:border-amber-500 focus:ring-amber-500 text-gray-700 dark:text-gray-200"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition duration-150 shadow-sm shadow-amber-500/10 cursor-pointer"
                            >
                                Terapkan Filter
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center justify-center p-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition duration-150 cursor-pointer"
                                title="Reset Filter"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/25">
                                    <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px]">No.</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Tanggal</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px]">No RM</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Pasien</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Penjamin</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Tindakan</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px] text-right">Unit Cost</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px] text-right">dr. Op</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px] text-right">dr. Co-op</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px] text-right">dr. Anes</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px] text-right">Tenaga Lain</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px] text-right">Sub Total</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-[11px]">Tim Medis</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {records && records.length > 0 ? (
                                    records.map((row, idx) => (
                                        <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition">
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                                                {(pagination.current_page - 1) * pagination.per_page + idx + 1}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {row.tgl ? new Date(row.tgl).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 dark:text-white font-mono text-xs">
                                                {row.norm || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                                                {row.nama || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                {row.penjamin || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                <div className="font-medium">{row.tindakan || '-'}</div>
                                                <span className="text-[10px] bg-gray-100 dark:bg-gray-850 px-1.5 py-0.5 rounded text-gray-400 dark:text-gray-500 uppercase font-semibold">
                                                    {row.kelompok}
                                                </span>
                                            </td>
                                            {/* Column breakdown */}
                                            <td className="px-6 py-4 text-right font-mono text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {formatCurrency(row.unit_cost)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {formatCurrency(row.dr_op)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {formatCurrency(row.dr_coop)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {formatCurrency(row.dr_anes)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                {formatCurrency(row.medis_lain)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-xs font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                                {formatCurrency(row.total)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {row.tim_petugas_medis ? (() => {
                                                    try {
                                                        const petugas = JSON.parse(row.tim_petugas_medis);
                                                        return (
                                                            <div className="flex flex-col gap-1 text-[11px] text-gray-500 max-w-[200px]">
                                                                {petugas.map((pm, pmIdx) => (
                                                                    <div key={pmIdx} className="flex justify-between border-b border-gray-100 dark:border-gray-800 last:border-0 pb-0.5 last:pb-0 gap-3">
                                                                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate mr-2" title={pm.nama}>
                                                                            {pm.nama}
                                                                        </span>
                                                                        <span className="text-gray-400 bg-gray-50 dark:bg-gray-800/80 px-1 rounded flex-shrink-0 text-[10px] self-start">
                                                                            {pm.peran}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    } catch (e) {
                                                        return <span className="text-xs text-gray-400">{row.tim_petugas_medis}</span>;
                                                    }
                                                })() : '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="13" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <svg className="w-8 h-8 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>Tidak ada tindakan medis ditemukan pada periode ini.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Menampilkan Halaman <strong>{pagination.current_page}</strong> dari <strong>{pagination.last_page}</strong> ({pagination.total} total item)
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={pagination.current_page === 1}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                                >
                                    First
                                </button>
                                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                                    .filter(p => Math.abs(pagination.current_page - p) <= 2 || p === 1 || p === pagination.last_page)
                                    .map((p, i, arr) => {
                                        const showDots = i > 0 && p - arr[i-1] > 1;
                                        return (
                                            <div key={p} className="flex items-center gap-1">
                                                {showDots && <span className="px-1.5 text-gray-400">...</span>}
                                                <button
                                                    onClick={() => handlePageChange(p)}
                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                                                        pagination.current_page === p
                                                            ? 'bg-amber-500 text-white'
                                                            : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            </div>
                                        );
                                    })}
                                <button
                                    onClick={() => handlePageChange(pagination.last_page)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                                >
                                    Last
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </DokterLayout>
    );
}
