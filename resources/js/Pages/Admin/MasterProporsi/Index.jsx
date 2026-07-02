import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Flash Message Component ──
const FlashMessage = ({ message, type = 'success', onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border shadow-sm ${
                type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                    : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30'
            }`}
        >
            {type === 'success' ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )}
            <span className="flex-1">{message}</span>
            <button onClick={onDismiss} className="p-0.5 hover:opacity-70 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </motion.div>
    );
};

export default function Index({ kelompoks, penjamins, proporsis }) {
    const { flash } = usePage().props;
    const [flashMsg, setFlashMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    // Grid Columns state: array of selected penjamin IDs
    // We default to showing the first three penjamins, or at least two columns
    const [activePenjaminIds, setActivePenjaminIds] = useState([1, 2]);

    // Grid values state: { [penjaminId]: { [kelompokId]: proporsiValue } }
    const [gridValues, setGridValues] = useState({});

    // Flash message from Inertia shared props
    useEffect(() => {
        if (flash?.success) setFlashMsg({ type: 'success', message: flash.success });
        if (flash?.error) setFlashMsg({ type: 'error', message: flash.error });
    }, [flash?.success, flash?.error]);

    // Inertia loading tracker
    useEffect(() => {
        const removeStart = router.on('start', () => setLoading(true));
        const removeFinish = router.on('finish', () => setLoading(false));
        return () => { removeStart(); removeFinish(); };
    }, []);

    // Load initial values from DB
    const loadInitialValues = () => {
        const initial = {};
        // Initialize all penjamins with empty objects
        penjamins.forEach((p) => {
            initial[p.id] = {};
            // Initialize all kelompoks for this penjamin with '0'
            kelompoks.forEach((k) => {
                initial[p.id][k.id] = '0';
            });
        });

        // Fill with actual data from DB
        proporsis.forEach((row) => {
            if (initial[row.penjamin_id]) {
                initial[row.penjamin_id][row.kelompok_id] = row.proporsi || '0';
            }
        });

        setGridValues(initial);
    };

    useEffect(() => {
        loadInitialValues();
    }, [proporsis, kelompoks, penjamins]);

    // Add a new column to the grid
    const addColumn = () => {
        // Find first penjamin ID that is not already active
        const unused = penjamins.find(p => !activePenjaminIds.includes(p.id));
        if (unused) {
            setActivePenjaminIds([...activePenjaminIds, unused.id]);
        } else {
            // If all are already displayed, do nothing
            setFlashMsg({ type: 'error', message: 'Semua Penjamin sudah ditampilkan di grid.' });
        }
    };

    // Remove a column from the grid
    const removeColumn = (indexToRemove) => {
        if (activePenjaminIds.length <= 1) {
            setFlashMsg({ type: 'error', message: 'Minimal harus menampilkan satu kolom Penjamin.' });
            return;
        }
        const updated = activePenjaminIds.filter((_, idx) => idx !== indexToRemove);
        setActivePenjaminIds(updated);
    };

    // Handle change of Penjamin dropdown at column header
    const handleColumnPenjaminChange = (index, newPenjaminId) => {
        const val = parseInt(newPenjaminId);
        // Check if already active in another column
        if (activePenjaminIds.includes(val) && activePenjaminIds.indexOf(val) !== index) {
            setFlashMsg({ type: 'error', message: 'Penjamin ini sudah dipilih pada kolom lain.' });
            return;
        }
        const updated = [...activePenjaminIds];
        updated[index] = val;
        setActivePenjaminIds(updated);
    };

    // Handle proporsi input change
    const handleCellChange = (penjaminId, kelompokId, value) => {
        // Clean numeric input
        let cleanVal = value.replace(/[^0-9.]/g, '');
        if (cleanVal === '') cleanVal = '0';

        // Limit value to max 100
        const floatVal = parseFloat(cleanVal);
        if (floatVal > 100) cleanVal = '100';

        setGridValues(prev => ({
            ...prev,
            [penjaminId]: {
                ...prev[penjaminId],
                [kelompokId]: cleanVal
            }
        }));
    };

    // Reset grid values to last saved DB state
    const handleReset = () => {
        if (confirm('Apakah Anda yakin ingin membatalkan semua perubahan?')) {
            loadInitialValues();
            setFlashMsg({ type: 'success', message: 'Perubahan dibatalkan. Nilai direset ke basis data.' });
        }
    };

    // Save grid values to DB
    const handleSave = (e) => {
        e.preventDefault();
        
        // Prepare list of updates for active columns only
        const updates = [];
        activePenjaminIds.forEach((penjaminId) => {
            const penjaminData = gridValues[penjaminId] || {};
            kelompoks.forEach((kelompok) => {
                const propVal = penjaminData[kelompok.id] || '0';
                updates.push({
                    penjamin_id: penjaminId,
                    kelompok_id: kelompok.id,
                    proporsi: parseFloat(propVal) || 0
                });
            });
        });

        // Validate that totals do not exceed 100% (optional, but good UX to warn them)
        let hasOverTotal = false;
        activePenjaminIds.forEach((penjaminId) => {
            const total = calculateColumnTotal(penjaminId);
            if (total > 100.01) { // allow minor rounding error
                const pName = penjamins.find(p => p.id === penjaminId)?.nama || '';
                setFlashMsg({ type: 'error', message: `Total proporsi untuk Penjamin "${pName}" melebihi 100% (${total.toFixed(2)}%).` });
                hasOverTotal = true;
            }
        });

        if (hasOverTotal) return;

        router.post(route('admin.master-proporsi.store'), { updates }, {
            preserveScroll: true,
            onSuccess: () => {
                // Success popup is already triggered by flash prop listener
            }
        });
    };

    // Calculate sum of proportions for a column
    const calculateColumnTotal = (penjaminId) => {
        const penjaminData = gridValues[penjaminId] || {};
        return kelompoks.reduce((sum, k) => {
            const val = parseFloat(penjaminData[k.id]) || 0;
            return sum + val;
        }, 0);
    };

    return (
        <AdminLayout title="Master Proporsi">
            <Head title="Master Proporsi - Admin SIREMUN" />

            <div className="space-y-6">
                {/* Flash Message */}
                <AnimatePresence>
                    {flashMsg && (
                        <FlashMessage
                            message={flashMsg.message}
                            type={flashMsg.type}
                            onDismiss={() => setFlashMsg(null)}
                        />
                    )}
                </AnimatePresence>

                {/* Explanation Card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">Pengaturan Proporsi Remunerasi</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl">
                            Atur persentase proporsi pembagian remunerasi berdasarkan Kelompok Remunerasi (Baris) untuk setiap Penjamin (Kolom). 
                            Anda dapat menambahkan beberapa kolom penjamin secara berdampingan untuk memudahkan perbandingan.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addColumn}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition duration-150 self-start md:self-center"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Kolom Penjamin
                    </button>
                </div>

                {/* Loading indicator */}
                {loading && (
                    <div className="w-full h-1 bg-amber-100 dark:bg-amber-950 overflow-hidden relative rounded-full shadow-sm">
                        <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                            className="h-full bg-amber-500 rounded-full w-1/3 absolute"
                        />
                    </div>
                )}

                {/* Proportion Matrix Table */}
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm min-w-[700px]">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold">
                                        {/* Row Header Column */}
                                        <th className="px-6 py-4 w-72 sticky left-0 bg-gray-50 dark:bg-gray-900 z-10 border-r border-gray-200 dark:border-gray-800">
                                            Kelompok Remunerasi
                                        </th>

                                        {/* Dynamic Penjamin Columns */}
                                        {activePenjaminIds.map((activePenjaminId, index) => (
                                            <th key={index} className="px-6 py-3 min-w-[200px] border-r border-gray-100 dark:border-gray-800/50">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Penjamin {index + 1}</span>
                                                        {activePenjaminIds.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeColumn(index)}
                                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 rounded transition"
                                                                title="Hapus Kolom"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <select
                                                        value={activePenjaminId}
                                                        onChange={(e) => handleColumnPenjaminChange(index, e.target.value)}
                                                        className="block w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-xs py-1.5 px-2.5 focus:border-amber-500 focus:ring-amber-500 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition duration-150 font-semibold text-gray-700 dark:text-gray-300"
                                                    >
                                                        {penjamins.map((p) => (
                                                            <option key={p.id} value={p.id}>{p.nama}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                                    {kelompoks.map((kelompok) => (
                                        <tr key={kelompok.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/10 transition">
                                            {/* Kelompok Name (Sticky Left Column) */}
                                            <td className="px-6 py-3.5 sticky left-0 bg-white dark:bg-gray-900 z-10 border-r border-gray-200 dark:border-gray-800 font-medium text-gray-900 dark:text-white">
                                                {kelompok.nama}
                                                <span className="text-[10px] text-gray-400 font-mono ml-1.5">({kelompok.id})</span>
                                            </td>

                                            {/* Proportion input for each active Penjamin */}
                                            {activePenjaminIds.map((penjaminId) => {
                                                const currentVal = gridValues[penjaminId]?.[kelompok.id] ?? '0';
                                                return (
                                                    <td key={penjaminId} className="px-6 py-2.5 border-r border-gray-100 dark:border-gray-800/50">
                                                        <div className="relative rounded-xl shadow-sm">
                                                            <input
                                                                type="text"
                                                                value={currentVal === '0' ? '' : currentVal}
                                                                onChange={(e) => handleCellChange(penjaminId, kelompok.id, e.target.value)}
                                                                placeholder="0"
                                                                className="block w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm py-1.5 pl-3.5 pr-8 focus:border-amber-500 focus:ring-amber-500 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition font-semibold text-right text-gray-900 dark:text-white"
                                                            />
                                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                                <span className="text-gray-400 dark:text-gray-600 text-xs font-bold">%</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}

                                    {/* ── Total Row ── */}
                                    <tr className="bg-gray-50/50 dark:bg-gray-800/20 font-bold border-t-2 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
                                        <td className="px-6 py-4 sticky left-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
                                            Total Proporsi
                                        </td>
                                        {activePenjaminIds.map((penjaminId) => {
                                            const total = calculateColumnTotal(penjaminId);
                                            const isOver = total > 100.01;
                                            const isPerfect = Math.abs(total - 100) < 0.01;

                                            return (
                                                <td key={penjaminId} className="px-6 py-4 border-r border-gray-100 dark:border-gray-800/50">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`font-mono text-sm ${
                                                            isOver ? 'text-red-500' : isPerfect ? 'text-emerald-500' : 'text-amber-500'
                                                        }`}>
                                                            {total.toFixed(2)}%
                                                        </span>
                                                        {isPerfect ? (
                                                            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 py-0.5 px-1.5 rounded-md font-semibold uppercase tracking-wide">Pas 100%</span>
                                                        ) : isOver ? (
                                                            <span className="text-[10px] bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 py-0.5 px-1.5 rounded-md font-semibold uppercase tracking-wide">Melebihi</span>
                                                        ) : total > 0 ? (
                                                            <span className="text-[10px] bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 py-0.5 px-1.5 rounded-md font-semibold uppercase tracking-wide">Kurang</span>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center justify-center rounded-xl text-sm font-semibold py-2.5 px-5 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition duration-150"
                        >
                            Batal (Reset)
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold py-2.5 px-6 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 transition duration-150 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Proporsi'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
