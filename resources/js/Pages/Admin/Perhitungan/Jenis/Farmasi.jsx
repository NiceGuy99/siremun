import { useState, useEffect, useRef, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';

const TimeDropdowns = ({ value, onChange }) => {
    const parts = value ? value.split(':') : ['00', '00', '00'];
    const h = parts[0] || '00';
    const m = parts[1] || '00';
    const s = parts[2] || '00';

    const handleHourChange = (newH) => {
        onChange(`${newH}:${m}:${s}`);
    };
    const handleMinuteChange = (newM) => {
        onChange(`${h}:${newM}:${s}`);
    };
    const handleSecondChange = (newS) => {
        onChange(`${h}:${m}:${newS}`);
    };

    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
    const seconds = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

    return (
        <div className="flex gap-1 items-center bg-gray-50 dark:bg-gray-950/40 p-1 rounded-xl border border-gray-200/60 dark:border-gray-800/85">
            <select
                value={h}
                onChange={(e) => handleHourChange(e.target.value)}
                className="block w-13 rounded-lg border-0 bg-transparent text-sm py-1 px-1 text-center font-mono focus:ring-0 focus:outline-none text-gray-800 dark:text-gray-200"
            >
                {hours.map((val) => (
                    <option key={val} value={val} className="bg-white dark:bg-gray-900">{val}</option>
                ))}
            </select>
            <span className="text-gray-400 font-mono text-xs">:</span>
            <select
                value={m}
                onChange={(e) => handleMinuteChange(e.target.value)}
                className="block w-13 rounded-lg border-0 bg-transparent text-sm py-1 px-1 text-center font-mono focus:ring-0 focus:outline-none text-gray-800 dark:text-gray-200"
            >
                {minutes.map((val) => (
                    <option key={val} value={val} className="bg-white dark:bg-gray-900">{val}</option>
                ))}
            </select>
            <span className="text-gray-400 font-mono text-xs">:</span>
            <select
                value={s}
                onChange={(e) => handleSecondChange(e.target.value)}
                className="block w-13 rounded-lg border-0 bg-transparent text-sm py-1 px-1 text-center font-mono focus:ring-0 focus:outline-none text-gray-800 dark:text-gray-200"
            >
                {seconds.map((val) => (
                    <option key={val} value={val} className="bg-white dark:bg-gray-900">{val}</option>
                ))}
            </select>
        </div>
    );
};

export default function Farmasi({ ruanganOptions, penjaminOptions, records, filters }) {
    // Helper to parse date time
    const parseDateTime = (dateTimeStr, defaultTime = '00:00:00') => {
        if (!dateTimeStr) return { date: '', time: defaultTime };
        const cleanStr = dateTimeStr.replace('T', ' ');
        const parts = cleanStr.split(' ');
        if (parts.length === 2) {
            let time = parts[1];
            if (time.length === 5) time += ':00';
            return { date: parts[0], time };
        }
        return { date: '', time: defaultTime };
    };

    const buildDateTime = (date, time) => {
        if (!date) return '';
        return `${date} ${time || '00:00:00'}`;
    };

    const parsedAwal = parseDateTime(filters.tgl_awal, '00:00:00');
    const parsedAkhir = parseDateTime(filters.tgl_akhir, '23:59:59');

    const [tglAwalDate, setTglAwalDate] = useState(parsedAwal.date);
    const [tglAwalTime, setTglAwalTime] = useState(parsedAwal.time);
    const [tglAkhirDate, setTglAkhirDate] = useState(parsedAkhir.date);
    const [tglAkhirTime, setTglAkhirTime] = useState(parsedAkhir.time);
    const [ruanganId, setRuanganId] = useState(filters.ruangan_id || '');
    const [jaminanId, setJaminanId] = useState(filters.jaminan_id || '');
    const [norm, setNorm] = useState(filters.norm || '');
    const [nopen, setNopen] = useState(filters.nopen || '');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showEmptyModal, setShowEmptyModal] = useState(false);
    const itemsPerPage = 10;
    const prevRecordsRef = useRef(records);

    // Reset page when new records are loaded
    useEffect(() => {
        setCurrentPage(1);
    }, [records]);

    // Show popup when search returns empty results
    useEffect(() => {
        if (filters.isSearched && records.length === 0 && prevRecordsRef.current !== records) {
            setShowEmptyModal(true);
        }
        prevRecordsRef.current = records;
    }, [records, filters.isSearched]);

    // Filter records client-side by No RM and Nopen
    const filteredRecords = useMemo(() => {
        if (!records) return [];
        return records.filter((row) => {
            const matchNorm = norm
                ? String(row.NORM || '').toLowerCase().includes(norm.toLowerCase())
                : true;
            const matchNopen = nopen
                ? String(row.NOPEN || '').toLowerCase().includes(nopen.toLowerCase())
                : true;
            return matchNorm && matchNopen;
        });
    }, [records, norm, nopen]);

    // Reset pagination to page 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [norm, nopen]);

    const totalItems = filteredRecords.length || 0;
    const lastPage = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

    // Dynamic Summary calculations for matching records
    const summaryTotals = useMemo(() => {
        let totalJumlahObat = 0;
        let totalNilai = 0;

        filteredRecords.forEach((row) => {
            totalJumlahObat += parseFloat(row.JUMLAH_OBAT || 0);
            totalNilai += parseFloat(row.TOTAL || 0);
        });

        return {
            totalBaris: filteredRecords.length,
            totalJumlahObat,
            totalNilai,
        };
    }, [filteredRecords]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= lastPage) setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(lastPage, start + maxVisible - 1);
        if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    // Sync state when filters from Inertia change
    useEffect(() => {
        const syncAwal = parseDateTime(filters.tgl_awal, '00:00:00');
        const syncAkhir = parseDateTime(filters.tgl_akhir, '23:59:59');
        setTglAwalDate(syncAwal.date);
        setTglAwalTime(syncAwal.time);
        setTglAkhirDate(syncAkhir.date);
        setTglAkhirTime(syncAkhir.time);
        setRuanganId(filters.ruangan_id || '');
        setJaminanId(filters.jaminan_id || '');
        setNorm(filters.norm || '');
        setNopen(filters.nopen || '');
    }, [filters]);

    // Quick date presets
    const applyPreset = (presetType) => {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10);
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        if (presetType === 'today') {
            setTglAwalDate(dateStr);
            setTglAwalTime('00:00:00');
            setTglAkhirDate(dateStr);
            setTglAkhirTime('23:59:59');
        } else if (presetType === 'yesterday') {
            setTglAwalDate(yesterdayStr);
            setTglAwalTime('00:00:00');
            setTglAkhirDate(yesterdayStr);
            setTglAkhirTime('23:59:59');
        }
    };

    // Global Inertia loading state tracker
    useEffect(() => {
        const removeStartListener = router.on('start', () => setLoading(true));
        const removeFinishListener = router.on('finish', () => setLoading(false));
        return () => {
            removeStartListener();
            removeFinishListener();
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('admin.perhitungan.jenis.farmasi'),
            {
                tgl_awal: buildDateTime(tglAwalDate, tglAwalTime),
                tgl_akhir: buildDateTime(tglAkhirDate, tglAkhirTime),
                ruangan_id: ruanganId,
                jaminan_id: jaminanId,
                search: 1
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleExportExcel = () => {
        const params = new URLSearchParams({
            tgl_awal: buildDateTime(tglAwalDate, tglAwalTime),
            tgl_akhir: buildDateTime(tglAkhirDate, tglAkhirTime),
            ruangan_id: ruanganId,
            jaminan_id: jaminanId,
            norm: norm,
            nopen: nopen,
            search: 1,
            export: 'csv'
        });
        window.location.href = route('admin.perhitungan.jenis.farmasi') + '?' + params.toString();
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 2
        }).format(val);
    };

    return (
        <AdminLayout title="Jenis → Farmasi">
            <Head title="Perhitungan Jenis Farmasi - Admin SIREMUN" />

            <div className="space-y-6">
                {/* Filters Section */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Filter Pencarian</h2>

                    <form onSubmit={handleSearch} className="space-y-4">
                        {/* Quick Presets */}
                        <div className="flex flex-wrap gap-2 items-center text-xs pb-3 border-b border-gray-100 dark:border-gray-800">
                            <span className="font-semibold text-gray-500 dark:text-gray-400 mr-1 flex items-center gap-1">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Pintasan Waktu:
                            </span>
                            <button type="button" onClick={() => applyPreset('today')} className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 transition text-[11px] font-medium">
                                Hari Ini (Full)
                            </button>
                            <button type="button" onClick={() => applyPreset('yesterday')} className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700/50 transition text-[11px] font-medium">
                                Kemarin (Full)
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {/* Tanggal Awal */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Tanggal Awal</label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input type="date" value={tglAwalDate} onChange={(e) => setTglAwalDate(e.target.value)} className="block flex-1 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm py-2 px-3 focus:border-amber-500 focus:ring-amber-500 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition duration-150" />
                                    <TimeDropdowns value={tglAwalTime} onChange={setTglAwalTime} />
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {['00:00', '07:00', '08:00', '14:00', '20:00'].map((t) => (
                                        <button key={t} type="button" onClick={() => setTglAwalTime(t + ':00')}
                                            className={`text-[10px] font-semibold py-0.5 px-1.5 rounded transition duration-150 ${tglAwalTime?.startsWith(t) ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                                        >{t}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Tanggal Akhir */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Tanggal Akhir</label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input type="date" value={tglAkhirDate} onChange={(e) => setTglAkhirDate(e.target.value)} className="block flex-1 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm py-2 px-3 focus:border-amber-500 focus:ring-amber-500 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition duration-150" />
                                    <TimeDropdowns value={tglAkhirTime} onChange={setTglAkhirTime} />
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {['14:00', '20:00', '23:59'].map((t) => (
                                        <button key={t} type="button" onClick={() => setTglAkhirTime(t === '23:59' ? '23:59:59' : t + ':00')}
                                            className={`text-[10px] font-semibold py-0.5 px-1.5 rounded transition duration-150 ${tglAkhirTime?.startsWith(t) ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                                        >{t === '23:59' ? '23:59:59' : t}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Ruangan */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="ruangan_id" className="text-xs font-semibold text-gray-600 dark:text-gray-400">Ruangan</label>
                                <select id="ruangan_id" value={ruanganId} onChange={(e) => setRuanganId(e.target.value)} className="block w-full rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm py-2 px-3 focus:border-amber-500 focus:ring-amber-500 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition duration-150">
                                    <option value="">-- Semua Ruangan --</option>
                                    {ruanganOptions.map((opt) => (
                                        <option key={opt.id} value={opt.id}>{opt.id} - {opt.deskripsi}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Jaminan */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="jaminan_id" className="text-xs font-semibold text-gray-600 dark:text-gray-400">Penjamin</label>
                                <select id="jaminan_id" value={jaminanId} onChange={(e) => setJaminanId(e.target.value)} className="block w-full rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm py-2 px-3 focus:border-amber-500 focus:ring-amber-500 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition duration-150">
                                    <option value="">-- Semua Penjamin --</option>
                                    {penjaminOptions.map((opt) => (
                                        <option key={opt.id} value={opt.id}>{opt.nama}</option>
                                    ))}
                                </select>
                            </div>

                            {/* No RM */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="norm" className="text-xs font-semibold text-gray-600 dark:text-gray-400">No. RM (Filter Data)</label>
                                <input
                                    type="text"
                                    id="norm"
                                    value={norm}
                                    onChange={(e) => setNorm(e.target.value)}
                                    placeholder="Cari berdasarkan No. RM..."
                                    className="block w-full rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm py-2 px-3 focus:border-amber-500 focus:ring-amber-500 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition duration-150"
                                />
                            </div>

                            {/* Nopen */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="nopen" className="text-xs font-semibold text-gray-600 dark:text-gray-400">Nopen (Filter Data)</label>
                                <input
                                    type="text"
                                    id="nopen"
                                    value={nopen}
                                    onChange={(e) => setNopen(e.target.value)}
                                    placeholder="Cari berdasarkan Nopen..."
                                    className="block w-full rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm py-2 px-3 focus:border-amber-500 focus:ring-amber-500 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition duration-150"
                                />
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="flex justify-end gap-3 pt-2">
                            {filters.isSearched && filteredRecords && filteredRecords.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleExportExcel}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 transition duration-150 cursor-pointer"
                                >
                                    <svg className="h-4 w-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                    Ekspor Excel
                                </button>
                            )}
                            <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold py-2.5 px-6 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 transition duration-150 disabled:opacity-50">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    'Cari Data'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Shimmer loading bar */}
                {loading && (
                    <div className="w-full h-1 bg-amber-100 dark:bg-amber-950 overflow-hidden relative rounded-full shadow-sm">
                        <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                            className="h-full bg-amber-500 rounded-full w-1/3 absolute"
                        />
                    </div>
                )}

                {/* Statistics Cards */}
                {filters.isSearched && filteredRecords && filteredRecords.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Baris Item</span>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {summaryTotals.totalBaris.toLocaleString('id-ID')}
                                <span className="text-sm font-normal text-gray-500"> Item</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Jumlah Obat</span>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {summaryTotals.totalJumlahObat.toLocaleString('id-ID', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm bg-gradient-to-br from-amber-500/[0.03] to-transparent">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Nilai Farmasi</span>
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                                {formatCurrency(summaryTotals.totalNilai)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Table Section */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800">
                                    <th className="px-4 py-3.5 whitespace-nowrap">No.</th>
                                    <th className="px-4 py-3.5 whitespace-nowrap">Tanggal</th>
                                    <th className="px-4 py-3.5 whitespace-nowrap">No RM</th>
                                    <th className="px-4 py-3.5 whitespace-nowrap">Nopen</th>
                                    <th className="px-4 py-3.5 whitespace-nowrap">SEP</th>
                                    <th className="px-4 py-3.5 whitespace-nowrap">Nama Pasien</th>
                                    <th className="px-4 py-3.5 whitespace-nowrap">Nama DPJP</th>
                                    <th className="px-4 py-3.5 whitespace-nowrap">Jaminan</th>
                                    <th className="px-4 py-3.5 whitespace-nowrap">Jenis Rincian</th>
                                    <th className="px-4 py-3.5 whitespace-nowrap">ID Barang</th>
                                    <th className="px-4 py-3.5 whitespace-nowrap">Nama Barang</th>
                                    <th className="px-4 py-3.5 text-right whitespace-nowrap">Harga Satuan</th>
                                    <th className="px-4 py-3.5 text-right whitespace-nowrap">Jumlah Obat</th>
                                    <th className="px-4 py-3.5 text-right whitespace-nowrap">Total</th>
                                    <th className="px-4 py-3.5 whitespace-nowrap">Depo / Ruangan</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                                {paginatedRecords && paginatedRecords.length > 0 ? (
                                    paginatedRecords.map((row, idx) => (
                                        <tr key={row.ID} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition duration-150">
                                            <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                                                {startIndex + idx + 1}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{row.TANGGAL || '-'}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{row.NORM || '-'}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{row.NOPEN || '-'}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{row.SEP || '-'}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.NAMA_PASIEN || '-'}</td>
                                            <td className="px-4 py-3 text-xs">{row.NAMA_DPJP || '-'}</td>
                                            <td className="px-4 py-3 text-xs">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                                                    {row.JAMINAN || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs">{row.JENIS_RINCIAN || '-'}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{row.ID_BARANG || '-'}</td>
                                            <td className="px-4 py-3 min-w-[260px] text-xs font-medium text-gray-900 dark:text-white">
                                                {row.NAMA_BARANG || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-xs">
                                                {formatCurrency(row.HARGA_SATUAN || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-xs font-semibold">
                                                {parseFloat(row.JUMLAH_OBAT || 0).toLocaleString('id-ID', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold font-mono text-emerald-600 dark:text-emerald-400 text-xs">
                                                {formatCurrency(row.TOTAL || 0)}
                                            </td>
                                            <td className="px-4 py-3 min-w-[200px] text-xs">
                                                {row.NAMA_RUANGAN || '-'}{' '}
                                                <span className="text-[10px] text-gray-400 font-mono">({row.ID_RUANGAN || '-'})</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="15" className="px-4 py-16 text-center text-gray-500 dark:text-gray-400">
                                            {!filters.isSearched ? (
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <svg className="h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                    <span className="text-sm">
                                                        Silakan isi filter dan klik <strong className="text-gray-700 dark:text-gray-300">Cari Data</strong> untuk memulai pencarian.
                                                    </span>
                                                </div>
                                            ) : records.length > 0 ? (
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <span className="text-sm">Tidak ada data yang cocok dengan filter No. RM atau Nopen yang dimasukkan.</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <span className="text-sm">Tidak ada data remunerasi farmasi yang ditemukan untuk filter ini.</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Client-side Pagination Footer */}
                    {filters.isSearched && totalItems > itemsPerPage && (
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/20 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Menampilkan {startIndex + 1} hingga {Math.min(startIndex + itemsPerPage, totalItems)} dari {totalItems} data
                            </span>

                            <div className="flex items-center justify-center gap-1.5">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className={`px-3.5 py-2 text-xs border rounded-xl transition duration-150 ease-in-out font-medium ${currentPage === 1
                                            ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/10 border-gray-200 dark:border-gray-800 cursor-not-allowed select-none'
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    Sebelumnya
                                </button>

                                {getPageNumbers().map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3.5 py-2 text-xs border rounded-xl transition duration-150 ease-in-out font-medium ${currentPage === page
                                                ? 'bg-amber-500 border-amber-500 text-white font-semibold shadow-sm shadow-amber-500/20'
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    disabled={currentPage === lastPage}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className={`px-3.5 py-2 text-xs border rounded-xl transition duration-150 ease-in-out font-medium ${currentPage === lastPage
                                            ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/10 border-gray-200 dark:border-gray-800 cursor-not-allowed select-none'
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    Berikutnya
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modal: Data Tidak Ditemukan ── */}
            {showEmptyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowEmptyModal(false)}
                    />
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 max-w-sm w-full text-center z-10"
                    >
                        {/* Icon */}
                        <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center mb-5">
                            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Data Tidak Ditemukan</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Tidak ada data farmasi remunerasi yang ditemukan untuk filter yang dipilih. Silakan ubah filter pencarian dan coba lagi.
                        </p>

                        <button
                            onClick={() => setShowEmptyModal(false)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold py-2.5 px-8 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10 transition duration-150 focus:outline-none"
                        >
                            Mengerti
                        </button>
                    </motion.div>
                </div>
            )}
        </AdminLayout>
    );
}
