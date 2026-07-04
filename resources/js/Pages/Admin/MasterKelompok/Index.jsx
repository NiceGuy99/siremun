import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Modal Component ──
const Modal = ({ show, onClose, title, children, maxWidth = 'max-w-lg' }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 ${maxWidth} w-full z-10`}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition duration-150">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </motion.div>
        </div>
    );
};

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

export default function Index({ records, nextKelompokId, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [loading, setLoading] = useState(false);
    const [flashMsg, setFlashMsg] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Inline unit cost state
    const [localUnitCosts, setLocalUnitCosts] = useState({});

    // Initialize local unit costs from records
    useEffect(() => {
        if (records) {
            const initial = {};
            records.forEach((r) => {
                initial[r.ID] = r.UNIT_COST_PERSEN;
            });
            setLocalUnitCosts(initial);
        }
    }, [records]);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [deletingRecord, setDeletingRecord] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        ID: '',
        NAMA_KELOMPOK: '',
        UNIT_COST_PERSEN: 0,
        STATUS: 1,
    });
    const [formErrors, setFormErrors] = useState({});
    const [formProcessing, setFormProcessing] = useState(false);

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

    // Reset pagination on new data
    useEffect(() => {
        setCurrentPage(1);
    }, [records]);

    // ── Client-side pagination ──
    const totalItems = records?.length || 0;
    const lastPage = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRecords = records ? records.slice(startIndex, startIndex + itemsPerPage) : [];

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

    // ── Filter/Search ──
    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            route('admin.master-kelompok.index'),
            { search },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        router.get(route('admin.master-kelompok.index'), {}, { preserveState: true, preserveScroll: true });
    };

    // ── CRUD handlers ──
    const resetForm = () => {
        setFormData({ ID: nextKelompokId || '', NAMA_KELOMPOK: '', UNIT_COST_PERSEN: 0, STATUS: 1 });
        setFormErrors({});
    };

    const openCreate = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const openEdit = (record) => {
        setEditingRecord(record);
        setFormData({
            ID: record.ID || '',
            NAMA_KELOMPOK: record.NAMA_KELOMPOK || '',
            UNIT_COST_PERSEN: record.UNIT_COST_PERSEN !== undefined ? record.UNIT_COST_PERSEN : 0,
            STATUS: record.STATUS !== undefined ? record.STATUS : 1,
        });
        setFormErrors({});
        setShowEditModal(true);
    };

    const openDelete = (record) => {
        setDeletingRecord(record);
        setShowDeleteModal(true);
    };

    const handleStore = (e) => {
        e.preventDefault();
        setFormProcessing(true);
        router.post(route('admin.master-kelompok.store'), formData, {
            preserveScroll: true,
            onSuccess: () => { setShowCreateModal(false); resetForm(); },
            onError: (errors) => setFormErrors(errors),
            onFinish: () => setFormProcessing(false),
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        setFormProcessing(true);
        router.put(route('admin.master-kelompok.update', editingRecord.ID), formData, {
            preserveScroll: true,
            onSuccess: () => { setShowEditModal(false); setEditingRecord(null); resetForm(); },
            onError: (errors) => setFormErrors(errors),
            onFinish: () => setFormProcessing(false),
        });
    };

    const handleInlineUpdate = (row) => {
        const newVal = localUnitCosts[row.ID];
        if (newVal === undefined || parseFloat(newVal) === parseFloat(row.UNIT_COST_PERSEN)) return;

        router.put(
            route('admin.master-kelompok.update', row.ID),
            {
                NAMA_KELOMPOK: row.NAMA_KELOMPOK,
                STATUS: row.STATUS,
                UNIT_COST_PERSEN: newVal,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onError: (errors) => {
                    // Revert to original on error
                    setLocalUnitCosts(prev => ({ ...prev, [row.ID]: row.UNIT_COST_PERSEN }));
                    if (errors.UNIT_COST_PERSEN) {
                        alert(errors.UNIT_COST_PERSEN);
                    }
                }
            }
        );
    };

    const handleDestroy = () => {
        setFormProcessing(true);
        router.delete(route('admin.master-kelompok.destroy', deletingRecord.ID), {
            preserveScroll: true,
            onSuccess: () => { setShowDeleteModal(false); setDeletingRecord(null); },
            onFinish: () => setFormProcessing(false),
        });
    };

    // ── Helpers ──
    const inputClass = "block w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm py-2.5 px-3.5 focus:border-amber-500 focus:ring-amber-500 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition duration-150";

    // ── Form fields renderer ──
    const renderFormFields = () => (
        <div className="space-y-4">
            {/* ID (Kelompok ID) */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Kelompok ID <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    value={formData.ID}
                    className={`${inputClass} bg-gray-100 dark:bg-gray-900 cursor-not-allowed`}
                    required
                    disabled
                    placeholder="Auto-incremented"
                />
                {formErrors.ID && <span className="text-xs text-red-500 font-semibold">{formErrors.ID}</span>}
            </div>

            {/* NAMA_KELOMPOK */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Nama Kelompok <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.NAMA_KELOMPOK}
                    onChange={(e) => setFormData({ ...formData, NAMA_KELOMPOK: e.target.value })}
                    className={inputClass}
                    required
                    placeholder="Masukkan nama kelompok"
                />
                {formErrors.NAMA_KELOMPOK && <span className="text-xs text-red-500 font-semibold">{formErrors.NAMA_KELOMPOK}</span>}
            </div>

            {/* UNIT_COST_PERSEN */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Persen Unit Cost (%) <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.UNIT_COST_PERSEN}
                    onChange={(e) => setFormData({ ...formData, UNIT_COST_PERSEN: e.target.value })}
                    className={inputClass}
                    required
                    placeholder="Masukkan persentase unit cost (0-100)"
                />
                {formErrors.UNIT_COST_PERSEN && <span className="text-xs text-red-500 font-semibold">{formErrors.UNIT_COST_PERSEN}</span>}
            </div>

            {/* STATUS toggle */}
            <div className="flex items-center gap-3 py-1">
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, STATUS: formData.STATUS ? 0 : 1 })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.STATUS ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-800'
                    }`}
                >
                    <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            formData.STATUS ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                </button>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Status: {formData.STATUS ? 'Aktif' : 'Nonaktif'}
                </span>
            </div>
        </div>
    );

    return (
        <AdminLayout title="Master Kelompok">
            <Head title="Master Kelompok - Admin SIREMUN" />

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

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-end gap-4">
                        {/* Search Input */}
                        <div className="flex flex-col gap-1.5 w-full sm:flex-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Pencarian</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari by Kelompok ID atau Nama Kelompok..."
                                    className="block w-full rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm pl-10 pr-4 py-2 focus:border-amber-500 focus:ring-amber-500 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition duration-150"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold py-2 px-5 bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition duration-150 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Mencari...
                                    </>
                                ) : (
                                    'Cari'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center justify-center rounded-xl text-sm font-semibold py-2 px-4 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition duration-150"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={openCreate}
                                className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition duration-150"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                Tambah
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

                {/* Data Table */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800">
                                    <th className="px-5 py-3.5 whitespace-nowrap w-12">No.</th>
                                    <th className="px-5 py-3.5 whitespace-nowrap w-24">Kelompok ID</th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">Nama Kelompok</th>
                                    <th className="px-5 py-3.5 whitespace-nowrap w-36 text-center">Unit Cost (%)</th>
                                    <th className="px-5 py-3.5 whitespace-nowrap w-24 text-center">Status</th>
                                    <th className="px-5 py-3.5 text-right whitespace-nowrap w-28">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                                <AnimatePresence mode="popLayout">
                                    {paginatedRecords && paginatedRecords.length > 0 ? (
                                        paginatedRecords.map((row, idx) => (
                                            <motion.tr
                                                key={row.ID}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.15 }}
                                                className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition duration-150"
                                            >
                                                <td className="px-5 py-3 font-semibold text-gray-900 dark:text-white">{startIndex + idx + 1}</td>
                                                <td className="px-5 py-3 font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">{row.ID}</td>
                                                <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{row.NAMA_KELOMPOK}</td>
                                                <td className="px-5 py-2 text-center w-36">
                                                    <div className="flex items-center gap-1 justify-center">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            value={localUnitCosts[row.ID] !== undefined ? localUnitCosts[row.ID] : row.UNIT_COST_PERSEN}
                                                            onChange={(e) => setLocalUnitCosts({ ...localUnitCosts, [row.ID]: e.target.value })}
                                                            onBlur={() => handleInlineUpdate(row)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleInlineUpdate(row);
                                                                }
                                                            }}
                                                            className="w-20 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-xs py-1 px-2.5 focus:border-amber-500 focus:ring-amber-500 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition text-right font-mono font-semibold text-gray-900 dark:text-white"
                                                        />
                                                        <span className="text-xs text-gray-500 font-semibold">%</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    {row.STATUS === 1 ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                            Nonaktif
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 text-right whitespace-nowrap space-x-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(row)}
                                                        className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-amber-500 text-gray-500 dark:text-gray-400 hover:text-amber-500 transition duration-150"
                                                        title="Ubah Data"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openDelete(row)}
                                                        className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-red-500 text-gray-500 dark:text-gray-400 hover:text-red-500 transition duration-150"
                                                        title="Hapus Data"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-5 py-16 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <svg className="h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-sm">Tidak ada data Master Kelompok yang ditemukan.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {totalItems > itemsPerPage && (
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/20 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Menampilkan {startIndex + 1} hingga {Math.min(startIndex + itemsPerPage, totalItems)} dari {totalItems} data
                            </span>

                            <div className="flex items-center justify-center gap-1.5">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className={`px-3.5 py-2 text-xs border rounded-xl transition duration-150 ease-in-out font-medium ${
                                        currentPage === 1
                                            ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/10 border-gray-200 dark:border-gray-800 cursor-not-allowed select-none'
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >Sebelumnya</button>

                                {getPageNumbers().map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3.5 py-2 text-xs border rounded-xl transition duration-150 ease-in-out font-medium ${
                                            currentPage === page
                                                ? 'bg-amber-500 border-amber-500 text-white font-semibold shadow-sm shadow-amber-500/20'
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >{page}</button>
                                ))}

                                <button
                                    type="button"
                                    disabled={currentPage === lastPage}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className={`px-3.5 py-2 text-xs border rounded-xl transition duration-150 ease-in-out font-medium ${
                                        currentPage === lastPage
                                            ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/10 border-gray-200 dark:border-gray-800 cursor-not-allowed select-none'
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >Berikutnya</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Create Modal ── */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tambah Master Kelompok">
                <form onSubmit={handleStore}>
                    {renderFormFields()}
                    <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-gray-100 dark:border-gray-800">
                        <button type="button" onClick={() => setShowCreateModal(false)} className="inline-flex items-center justify-center rounded-xl text-sm font-semibold py-2.5 px-5 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition duration-150">
                            Batal
                        </button>
                        <button type="submit" disabled={formProcessing} className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold py-2.5 px-6 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10 transition duration-150 disabled:opacity-50">
                            {formProcessing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Menyimpan...
                                </>
                            ) : 'Simpan Data'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Edit Modal ── */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title="Ubah Master Kelompok">
                <form onSubmit={handleUpdate}>
                    {renderFormFields()}
                    <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-gray-100 dark:border-gray-800">
                        <button type="button" onClick={() => setShowEditModal(false)} className="inline-flex items-center justify-center rounded-xl text-sm font-semibold py-2.5 px-5 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition duration-150">
                            Batal
                        </button>
                        <button type="submit" disabled={formProcessing} className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold py-2.5 px-6 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10 transition duration-150 disabled:opacity-50">
                            {formProcessing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Menyimpan...
                                </>
                            ) : 'Perbarui Data'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Delete Confirmation Modal ── */}
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Konfirmasi Hapus" maxWidth="max-w-sm">
                <div className="text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4">
                        <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Apakah Anda yakin ingin menghapus kelompok:</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-6">
                        {deletingRecord?.NAMA_KELOMPOK}
                        <span className="text-xs font-mono text-gray-400 ml-1">(ID: {deletingRecord?.ID})</span>
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <button type="button" onClick={() => setShowDeleteModal(false)} className="inline-flex items-center justify-center rounded-xl text-sm font-semibold py-2.5 px-5 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition duration-150">
                            Batal
                        </button>
                        <button type="button" onClick={handleDestroy} disabled={formProcessing} className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold py-2.5 px-6 bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/10 transition duration-150 disabled:opacity-50">
                            {formProcessing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Menghapus...
                                </>
                            ) : 'Ya, Hapus'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
