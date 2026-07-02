import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Index({ resourceKey, resourceName, columns, records }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const itemsPerPage = 10;

    // Reset pagination when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Format currency helper
    const formatCurrency = (val) => {
        if (val === null || val === undefined) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 2
        }).format(val);
    };

    // Format datetime helper
    const formatDateTime = (val) => {
        if (!val) return '-';
        try {
            const d = new Date(val);
            return d.toLocaleString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (e) {
            return val;
        }
    };

    // Helper to resolve nested relation keys (e.g. 'unit.nama')
    const resolveValue = (row, col) => {
        if (col.relation) {
            const relName = col.relation;
            const parts = col.key.split('.');
            const field = parts[1] || 'id';
            return row[relName] ? row[relName][field] : '-';
        }
        return row[col.key] !== null && row[col.key] !== undefined ? row[col.key] : '-';
    };

    // Handle delete action
    const handleDelete = (id) => {
        if (confirm(`Apakah Anda yakin ingin menghapus data ${resourceName} ini?`)) {
            router.delete(route(`admin.${resourceKey}.destroy`, id), {
                preserveScroll: true
            });
        }
    };

    // Handle sort toggle
    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    // Filter records locally
    const filteredRecords = records.filter((row) => {
        return columns.some((col) => {
            const val = resolveValue(row, col);
            if (val === null || val === undefined || val === '-') return false;
            return String(val).toLowerCase().includes(searchQuery.toLowerCase());
        });
    });

    // Sort records locally
    const sortedRecords = [...filteredRecords].sort((a, b) => {
        if (!sortKey) return 0;
        let valA = a[sortKey];
        let valB = b[sortKey];

        // Resolve relation sorting if sort key includes relation parts
        if (sortKey.includes('.')) {
            const parts = sortKey.split('.');
            valA = a[parts[0]] ? a[parts[0]][parts[1]] : '';
            valB = b[parts[0]] ? b[parts[0]][parts[1]] : '';
        }

        if (typeof valA === 'string') {
            return sortDirection === 'asc' 
                ? valA.localeCompare(valB) 
                : valB.localeCompare(valA);
        } else {
            return sortDirection === 'asc' 
                ? (valA > valB ? 1 : -1) 
                : (valA < valB ? 1 : -1);
        }
    });

    // Client-side pagination calculations
    const totalItems = sortedRecords.length;
    const lastPage = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRecords = sortedRecords.slice(startIndex, startIndex + itemsPerPage);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(lastPage, start + maxVisible - 1);
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <AdminLayout title={resourceName}>
            <Head title={`${resourceName} - Admin SIREMUN`} />

            <div className="space-y-6">
                {/* Search Bar & Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                    {/* Search Field */}
                    <div className="relative w-full sm:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder={`Cari ${resourceName}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm pl-10 pr-4 py-2 focus:border-amber-500 focus:ring-amber-500 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition duration-150"
                        />
                    </div>

                    {/* Create New Button */}
                    <Link
                        href={route(`admin.${resourceKey}.create`)}
                        className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold py-2 px-5 bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition duration-150"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah {resourceName}
                    </Link>
                </div>

                {/* Table Card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800">
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            onClick={() => col.sortable && handleSort(col.key)}
                                            className={`px-6 py-4 whitespace-nowrap ${col.sortable ? 'cursor-pointer select-none hover:text-amber-500' : ''}`}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span>{col.label}</span>
                                                {col.sortable && sortKey === col.key && (
                                                    <svg className={`h-3 w-3 transform transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 text-right whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                                <AnimatePresence mode="popLayout">
                                    {paginatedRecords.length > 0 ? (
                                        paginatedRecords.map((row) => (
                                            <motion.tr
                                                key={row.id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.15 }}
                                                className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition duration-150"
                                            >
                                                {columns.map((col) => {
                                                    const value = resolveValue(row, col);
                                                    return (
                                                        <td key={col.key} className="px-6 py-3.5 whitespace-nowrap">
                                                            {col.type === 'boolean' ? (
                                                                value === true || value === 1 ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                        Aktif
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                                        Nonaktif
                                                                    </span>
                                                                )
                                                            ) : col.type === 'currency' ? (
                                                                <span className="font-mono">{formatCurrency(value)}</span>
                                                            ) : col.type === 'datetime' ? (
                                                                <span className="font-mono text-xs">{formatDateTime(value)}</span>
                                                            ) : (
                                                                String(value)
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-6 py-3.5 text-right whitespace-nowrap space-x-2">
                                                    <Link
                                                        href={route(`admin.${resourceKey}.edit`, row.id)}
                                                        className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-amber-500 text-gray-500 dark:text-gray-400 hover:text-amber-500 transition duration-150"
                                                        title="Ubah Data"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(row.id)}
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
                                            <td colSpan={columns.length + 1} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <svg className="h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    <span className="text-sm">Tidak ada data {resourceName} yang ditemukan.</span>
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
                                {/* Previous Page Button */}
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    className={`px-3.5 py-2 text-xs border rounded-xl transition duration-150 ease-in-out font-medium ${
                                        currentPage === 1
                                            ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/10 border-gray-200 dark:border-gray-800 cursor-not-allowed select-none'
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    Sebelumnya
                                </button>

                                {/* Page Numbers */}
                                {getPageNumbers().map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3.5 py-2 text-xs border rounded-xl transition duration-150 ease-in-out font-medium ${
                                            currentPage === page
                                                ? 'bg-amber-500 border-amber-500 text-white font-semibold shadow-sm shadow-amber-500/20'
                                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                {/* Next Page Button */}
                                <button
                                    type="button"
                                    disabled={currentPage === lastPage}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    className={`px-3.5 py-2 text-xs border rounded-xl transition duration-150 ease-in-out font-medium ${
                                        currentPage === lastPage
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
        </AdminLayout>
    );
}
