import { useState, useMemo } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard({
    revenueThisMonth,
    revenuePercentageChange,
    totalPegawai,
    newPegawaiLast30Days,
    lastSync,
    penjaminOptions,
    trendData,
    activePeriodName
}) {
    const [selectedPenjamin, setSelectedPenjamin] = useState('all');
    const [hoveredMonth, setHoveredMonth] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    // Helper to format currency in Indonesian style (Jt for Juta, M for Miliar)
    const formatIndonesianCurrency = (value) => {
        if (value >= 1000000000) {
            return `Rp ${(value / 1000000000).toFixed(1).replace('.', ',')} M`;
        }
        if (value >= 1000000) {
            return `Rp ${(value / 1000000).toFixed(1).replace('.', ',')} Jt`;
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatCurrencyFull = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 2
        }).format(value);
    };

    // Calculate active trend values based on chosen Penjamin filter
    const computedTrend = useMemo(() => {
        return trendData.map((data) => {
            let tindakan = 0;
            let akomodasi = 0;
            let farmasi = 0;

            if (selectedPenjamin === 'all') {
                tindakan = Object.values(data.tindakan).reduce((sum, val) => sum + val, 0);
                akomodasi = Object.values(data.akomodasi).reduce((sum, val) => sum + val, 0);
                farmasi = Object.values(data.farmasi).reduce((sum, val) => sum + val, 0);
            } else {
                tindakan = data.tindakan[selectedPenjamin] || 0;
                akomodasi = data.akomodasi[selectedPenjamin] || 0;
                farmasi = data.farmasi[selectedPenjamin] || 0;
            }

            return {
                month: data.month,
                monthName: monthNames[data.month - 1],
                tindakan,
                akomodasi,
                farmasi,
                total: tindakan + akomodasi + farmasi
            };
        });
    }, [trendData, selectedPenjamin]);

    // Find the maximum value in the active dataset to scale the Y-axis
    const yMax = useMemo(() => {
        const values = computedTrend.flatMap((d) => [d.tindakan, d.akomodasi, d.farmasi]);
        const maxVal = Math.max(...values, 1000000); // minimum scale is 1M
        return maxVal * 1.15; // 15% padding at top
    }, [computedTrend]);

    // Graph plotting bounds
    const svgWidth = 1000;
    const svgHeight = 300;
    const paddingLeft = 80;
    const paddingRight = 30;
    const paddingTop = 20;
    const paddingBottom = 40;

    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;

    // Get coordinates for each month
    const getCoordinates = (index, value) => {
        const x = paddingLeft + (index * (chartWidth / 11));
        const y = paddingTop + chartHeight - (value / yMax) * chartHeight;
        return { x, y };
    };

    // Generate path points
    const makePathD = (key) => {
        const points = computedTrend.map((d, index) => getCoordinates(index, d[key]));
        if (points.length === 0) return '';
        return points.reduce((acc, p, i) => {
            return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
        }, '');
    };

    // Grid lines count
    const yDivisions = 4;
    const gridLines = Array.from({ length: yDivisions + 1 }, (_, i) => {
        const val = (yMax / yDivisions) * i;
        const y = paddingTop + chartHeight - (val / yMax) * chartHeight;
        return { y, val };
    });

    const handleMouseMove = (e, index) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({
            x: e.clientX - rect.left + 15,
            y: e.clientY - rect.top - 120
        });
        setHoveredMonth(index);
    };

    // Format Sync Date
    const formatSyncDate = (dateStr) => {
        if (!dateStr) return 'Belum Pernah';
        const date = new Date(dateStr);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
        if (isToday) {
            return `Hari ini, ${timeStr}`;
        }
        
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return `${date.toLocaleDateString('id-ID', options)}, ${timeStr}`;
    };

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard Admin - SIREMUN" />

            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Admin</h1>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Card 1: Pendapatan Total Bulan Ini */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex items-center justify-between transition hover:shadow-md duration-200">
                        <div className="space-y-1.5">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                                Pendapatan Total ({activePeriodName})
                            </span>
                            <h2 className="text-2xl font-bold text-gray-950 dark:text-white">
                                {formatIndonesianCurrency(revenueThisMonth)}
                            </h2>
                            <div className="flex items-center gap-1 text-xs">
                                <span className={`flex items-center font-semibold ${revenuePercentageChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {revenuePercentageChange >= 0 ? '↑' : '↓'} {Math.abs(revenuePercentageChange).toFixed(1)}%
                                </span>
                                <span className="text-gray-400 dark:text-gray-500">dari bulan lalu</span>
                            </div>
                        </div>
                        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Card 2: Jumlah Pegawai */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex items-center justify-between transition hover:shadow-md duration-200">
                        <div className="space-y-1.5">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                                Jumlah Pegawai
                            </span>
                            <h2 className="text-2xl font-bold text-gray-950 dark:text-white">
                                {new Intl.NumberFormat('id-ID').format(totalPegawai)}
                            </h2>
                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                {newPegawaiLast30Days > 0 ? `+${newPegawaiLast30Days} pegawai baru` : 'Tidak ada perubahan'}
                            </span>
                        </div>
                        <div className="p-3.5 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-xl">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Card 3: Sync Terakhir */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex items-center justify-between transition hover:shadow-md duration-200">
                        <div className="space-y-1.5">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
                                Sync Terakhir
                            </span>
                            <h2 className="text-lg font-bold text-gray-950 dark:text-white leading-tight">
                                {formatSyncDate(lastSync?.executed_at)}
                            </h2>
                            <div className="pt-1.5">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    lastSync?.status?.toLowerCase() === 'success' || lastSync?.status?.toLowerCase() === 'berhasil'
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                                }`}>
                                    {lastSync?.status ? (lastSync.status === 'Success' ? 'Berhasil' : lastSync.status) : 'Belum Sync'}
                                </span>
                            </div>
                        </div>
                        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl">
                            <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17M9 11l3 3m0 0l3-3m-3 3V8" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Trend Chart Box */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                        <h3 className="text-base font-bold text-gray-950 dark:text-white">
                            Total Pendapatan (1 Tahun Terakhir)
                        </h3>

                        <div className="flex items-center gap-3">
                            {/* Legend Indicators */}
                            <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-gray-500 mr-2">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-md bg-blue-500" />
                                    Tindakan
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-md bg-emerald-500" />
                                    Akomodasi
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-md bg-purple-500" />
                                    Farmasi
                                </span>
                            </div>

                            {/* Dropdown Penjamin selector */}
                            <select
                                value={selectedPenjamin}
                                onChange={(e) => setSelectedPenjamin(e.target.value)}
                                className="block rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-xs py-1.5 pl-3 pr-8 focus:border-amber-500 focus:ring-amber-500 text-gray-700 dark:text-gray-300 font-medium"
                            >
                                <option value="all">Semua Penjamin</option>
                                {penjaminOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>{opt.nama}</option>
                                ))}
                            </select>

                            <Link
                                href={route('admin.perhitungan.jenis.tindakan')}
                                className="inline-flex items-center justify-center text-xs font-semibold px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300 transition duration-150"
                            >
                                Lihat Detail
                            </Link>
                        </div>
                    </div>

                    {/* Legend for smaller screens */}
                    <div className="flex lg:hidden flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-md bg-blue-500" />
                            Tindakan
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-md bg-emerald-500" />
                            Akomodasi
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-md bg-purple-500" />
                            Farmasi
                        </span>
                    </div>

                    {/* Graphic Plotting Canvas */}
                    <div className="relative pt-2">
                        <svg
                            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                            width="100%"
                            height="100%"
                            className="overflow-visible"
                        >
                            {/* Grid Lines */}
                            {gridLines.map((line, idx) => (
                                <g key={idx}>
                                    <line
                                        x1={paddingLeft}
                                        y1={line.y}
                                        x2={svgWidth - paddingRight}
                                        y2={line.y}
                                        className="stroke-gray-100 dark:stroke-gray-800/80 stroke-dasharray-[4,4]"
                                        strokeWidth="1"
                                        strokeDasharray="4,4"
                                    />
                                    <text
                                        x={paddingLeft - 10}
                                        y={line.y + 4}
                                        textAnchor="end"
                                        className="fill-gray-400 dark:fill-gray-500 font-mono text-[10px] font-medium"
                                    >
                                        {formatIndonesianCurrency(line.val).replace('Rp ', '')}
                                    </text>
                                </g>
                            ))}

                            {/* Line: Farmasi (Purple) */}
                            <motion.path
                                d={makePathD('farmasi')}
                                fill="none"
                                stroke="#8b5cf6"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                            />

                            {/* Line: Akomodasi (Green) */}
                            <motion.path
                                d={makePathD('akomodasi')}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
                            />

                            {/* Line: Tindakan (Blue) */}
                            <motion.path
                                d={makePathD('tindakan')}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                            />

                            {/* Intersection Nodes (Dots) */}
                            {computedTrend.map((d, index) => {
                                const ptTindakan = getCoordinates(index, d.tindakan);
                                const ptAkomodasi = getCoordinates(index, d.akomodasi);
                                const ptFarmasi = getCoordinates(index, d.farmasi);

                                return (
                                    <g key={index} className="group/dots">
                                        {/* Dot: Farmasi */}
                                        {d.farmasi > 0 && (
                                            <circle
                                                cx={ptFarmasi.x}
                                                cy={ptFarmasi.y}
                                                r="4.5"
                                                className="fill-purple-500 stroke-white dark:stroke-gray-900 stroke-[2] shadow-sm transition-all duration-150 cursor-pointer hover:r-[6]"
                                            />
                                        )}
                                        {/* Dot: Akomodasi */}
                                        {d.akomodasi > 0 && (
                                            <circle
                                                cx={ptAkomodasi.x}
                                                cy={ptAkomodasi.y}
                                                r="4.5"
                                                className="fill-emerald-500 stroke-white dark:stroke-gray-900 stroke-[2] shadow-sm transition-all duration-150 cursor-pointer hover:r-[6]"
                                            />
                                        )}
                                        {/* Dot: Tindakan */}
                                        {d.tindakan > 0 && (
                                            <circle
                                                cx={ptTindakan.x}
                                                cy={ptTindakan.y}
                                                r="4.5"
                                                className="fill-blue-500 stroke-white dark:stroke-gray-900 stroke-[2] shadow-sm transition-all duration-150 cursor-pointer hover:r-[6]"
                                            />
                                        )}

                                        {/* Transparent Hover Interceptor Column */}
                                        <rect
                                            x={paddingLeft + (index * (chartWidth / 11)) - 20}
                                            y={paddingTop}
                                            width="40"
                                            height={chartHeight}
                                            className="fill-transparent cursor-pointer"
                                            onMouseMove={(e) => handleMouseMove(e, index)}
                                            onMouseLeave={() => setHoveredMonth(null)}
                                        />
                                    </g>
                                );
                            })}

                            {/* X-Axis labels */}
                            {monthNames.map((name, idx) => {
                                const x = paddingLeft + (idx * (chartWidth / 11));
                                return (
                                    <text
                                        key={idx}
                                        x={x}
                                        y={svgHeight - 15}
                                        textAnchor="middle"
                                        className="fill-gray-400 dark:fill-gray-500 font-semibold text-[11px]"
                                    >
                                        {name}
                                    </text>
                                );
                            })}
                        </svg>

                        {/* Interactive Tooltip Overlay */}
                        <AnimatePresence>
                            {hoveredMonth !== null && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.12 }}
                                    style={{
                                        position: 'absolute',
                                        left: `${tooltipPos.x}px`,
                                        top: `${tooltipPos.y}px`,
                                        pointerEvents: 'none'
                                    }}
                                    className="z-10 bg-gray-900/95 dark:bg-black/90 backdrop-blur-md border border-gray-800 text-white rounded-xl p-4.5 shadow-xl w-60 text-xs flex flex-col space-y-2.5"
                                >
                                    <span className="font-bold text-gray-300 text-[11px] uppercase tracking-wider block border-b border-gray-800 pb-1.5">
                                        Periode: {monthNames[hoveredMonth]} 2026
                                    </span>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between gap-4 text-gray-400">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded bg-blue-500 inline-block" />
                                                Tindakan
                                            </span>
                                            <span className="font-mono text-gray-200">
                                                {formatCurrencyFull(computedTrend[hoveredMonth].tindakan)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 text-gray-400">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded bg-emerald-500 inline-block" />
                                                Akomodasi
                                            </span>
                                            <span className="font-mono text-gray-200">
                                                {formatCurrencyFull(computedTrend[hoveredMonth].akomodasi)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 text-gray-400">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded bg-purple-500 inline-block" />
                                                Farmasi
                                            </span>
                                            <span className="font-mono text-gray-200">
                                                {formatCurrencyFull(computedTrend[hoveredMonth].farmasi)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-800 pt-2 flex items-center justify-between gap-4 font-bold text-[13px] text-amber-400">
                                        <span>Total</span>
                                        <span className="font-mono">
                                            {formatCurrencyFull(computedTrend[hoveredMonth].total)}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
