import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Dropdown from '@/Components/Dropdown';

export default function AdminLayout({ children, title }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Light/Dark mode state initialized from localStorage or system preference
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' ||
                (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    // Apply dark class to document element on mount and state change
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        if (darkMode) {
            localStorage.setItem('theme', 'light');
            setDarkMode(false);
        } else {
            localStorage.setItem('theme', 'dark');
            setDarkMode(true);
        }
    };

    // === Navigation Data ===

    // Perhitungan group with sub-groups
    const perhitunganGroup = {
        name: 'Perhitungan',
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
        active: route().current('admin.perhitungan.*'),
        subGroups: [
            {
                name: 'Jenis',
                children: [
                    { name: 'Tindakan', href: route('admin.perhitungan.jenis.tindakan'), active: route().current('admin.perhitungan.jenis.tindakan') },
                    { name: 'Akomodasi', href: '#', active: false, disabled: true },
                    { name: 'Farmasi', href: '#', active: false, disabled: true },
                ],
            },
            {
                name: 'Detail',
                children: [
                    { name: 'Tindakan', href: route('admin.perhitungan.detail.tindakan'), active: route().current('admin.perhitungan.detail.tindakan') },
                    { name: 'Akomodasi', href: '#', active: false, disabled: true },
                    { name: 'Farmasi', href: '#', active: false, disabled: true },
                ],
            },
        ],
    };

    // Master data navigation items
    const masterNavItems = [
        {
            name: 'Pegawai',
            href: route('admin.pegawai.index'),
            active: route().current('admin.pegawai.*'),
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            name: 'Jabatan',
            href: route('admin.jabatan.index'),
            active: route().current('admin.jabatan.*'),
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
            )
        },
        {
            name: 'Unit Kerja',
            href: route('admin.unit.index'),
            active: route().current('admin.unit.*'),
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        },
        {
            name: 'Grade',
            href: route('admin.grade.index'),
            active: route().current('admin.grade.*'),
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
            )
        },
        {
            name: 'Periode Remunerasi',
            href: route('admin.remunerasi-period.index'),
            active: route().current('admin.remunerasi-period.*'),
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            name: 'Detail Remunerasi',
            href: route('admin.remunerasi-detail.index'),
            active: route().current('admin.remunerasi-detail.*'),
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            name: 'Batch Import',
            href: route('admin.remunerasi-import-batch.index'),
            active: route().current('admin.remunerasi-import-batch.*'),
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
            )
        },
        {
            name: 'Master Tindakan',
            href: route('admin.master-tindakan.index'),
            active: route().current('admin.master-tindakan.*'),
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            )
        },
        {
            name: 'Master Penjamin',
            href: route('admin.master-penjamin.index'),
            active: route().current('admin.master-penjamin.*'),
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        },
        {
            name: 'Master Kelompok',
            href: route('admin.master-kelompok.index'),
            active: route().current('admin.master-kelompok.*'),
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            name: 'Master Proporsi',
            href: route('admin.master-proporsi.index'),
            active: route().current('admin.master-proporsi.*'),
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            )
        }
    ];

    // === Collapsible State ===
    const [perhitunganOpen, setPerhitunganOpen] = useState(perhitunganGroup.active);
    const [openSubGroups, setOpenSubGroups] = useState(() => {
        const initial = {};
        perhitunganGroup.subGroups.forEach((sg) => {
            initial[sg.name] = sg.children.some((c) => c.active);
        });
        return initial;
    });

    const toggleSubGroup = (name) => {
        setOpenSubGroups((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    // === Render Helpers ===
    const renderNavLink = (item) => (
        <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition duration-150 group relative ${
                item.active
                    ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
            {item.icon}
            {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
                    {item.name}
                </motion.span>
            )}
            {!sidebarOpen && (
                <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-30 pointer-events-none shadow-md">
                    {item.name}
                </div>
            )}
        </Link>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 overflow-hidden font-sans">
            {/* Sidebar Container */}
            <motion.div
                animate={{ width: sidebarOpen ? 260 : 70 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full flex flex-col relative z-20 shadow-sm"
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 overflow-hidden">
                    <Link href={route('admin.dashboard')} className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo RSUD" className="w-8 h-8 object-contain flex-shrink-0 bg-white p-0.5 rounded-lg border border-gray-200/40" />
                        {sidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="font-bold text-lg tracking-wider text-amber-600 dark:text-amber-500 whitespace-nowrap"
                            >
                                SIREMUN
                            </motion.span>
                        )}
                    </Link>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {/* Dashboard */}
                    <Link
                        href={route('admin.dashboard')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition duration-150 group relative ${
                            route().current('admin.dashboard')
                                ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 font-semibold'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {sidebarOpen && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
                                Dashboard
                            </motion.span>
                        )}
                        {!sidebarOpen && (
                            <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-30 pointer-events-none shadow-md">
                                Dashboard
                            </div>
                        )}
                    </Link>

                    {/* ── Perhitungan (Collapsible Group) ── */}
                    <div>
                        <button
                            onClick={() => setPerhitunganOpen(!perhitunganOpen)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition duration-150 group relative ${
                                perhitunganGroup.active
                                    ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 font-semibold'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            {perhitunganGroup.icon}
                            {sidebarOpen && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap flex-1 text-left">
                                    {perhitunganGroup.name}
                                </motion.span>
                            )}
                            {sidebarOpen && (
                                <svg
                                    className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${perhitunganOpen ? 'rotate-90' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                            {!sidebarOpen && (
                                <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-30 pointer-events-none shadow-md">
                                    {perhitunganGroup.name}
                                </div>
                            )}
                        </button>

                        {/* Collapsible children */}
                        {sidebarOpen && perhitunganOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="ml-4 mt-1 border-l-2 border-gray-100 dark:border-gray-800 pl-3 space-y-0.5 overflow-hidden"
                            >
                                {perhitunganGroup.subGroups.map((subGroup) => (
                                    <div key={subGroup.name}>
                                        {/* Sub-group header (Jenis / Detail) */}
                                        <button
                                            onClick={() => toggleSubGroup(subGroup.name)}
                                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition duration-150"
                                        >
                                            <svg
                                                className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${openSubGroups[subGroup.name] ? 'rotate-90' : ''}`}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                            </svg>
                                            <span>{subGroup.name}</span>
                                        </button>

                                        {/* Sub-group children (Tindakan / Akomodasi / Farmasi) */}
                                        {openSubGroups[subGroup.name] && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                                className="space-y-0.5 overflow-hidden"
                                            >
                                                {subGroup.children.map((child) =>
                                                    child.disabled ? (
                                                        <div
                                                            key={child.name}
                                                            className="flex items-center gap-2 px-2.5 py-2 ml-3 rounded-lg text-sm text-gray-300 dark:text-gray-600 cursor-not-allowed select-none"
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></span>
                                                            <span>{child.name}</span>
                                                            <span className="text-[9px] ml-auto bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 px-1.5 py-0.5 rounded font-medium">Soon</span>
                                                        </div>
                                                    ) : (
                                                        <Link
                                                            key={child.name}
                                                            href={child.href}
                                                            className={`flex items-center gap-2 px-2.5 py-2 ml-3 rounded-lg text-sm transition duration-150 ${
                                                                child.active
                                                                    ? 'text-amber-600 dark:text-amber-500 font-semibold bg-amber-50/50 dark:bg-amber-950/10'
                                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/30'
                                                            }`}
                                                        >
                                                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${child.active ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                                                            <span>{child.name}</span>
                                                        </Link>
                                                    )
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* ── Separator: Master Data ── */}
                    {sidebarOpen && (
                        <div className="pt-2 pb-1">
                            <div className="border-t border-gray-100 dark:border-gray-800"></div>
                            <span className="block px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-600">Master Data</span>
                        </div>
                    )}
                    {!sidebarOpen && <div className="border-t border-gray-100 dark:border-gray-800 my-2"></div>}

                    {/* Master Data Items */}
                    {masterNavItems.map(renderNavLink)}
                </nav>

                {/* Sidebar Toggle Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -right-3 top-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 p-1.5 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 z-30 focus:outline-none"
                >
                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${sidebarOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </motion.div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 z-10 shadow-sm">
                    {/* Page Title & Breadcrumbs */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Link href={route('admin.dashboard')} className="hover:text-amber-500 transition duration-150">Admin</Link>
                            <span>/</span>
                            <span className="text-gray-500 font-medium">{title}</span>
                        </div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none mt-1">{title}</h1>
                    </div>

                    {/* Dark Mode & User Settings */}
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle Button */}
                        <button
                            type="button"
                            onClick={toggleDarkMode}
                            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition duration-150 focus:outline-none"
                            title={darkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
                        >
                            {darkMode ? (
                                // Sun Icon (Light Mode toggle)
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                </svg>
                            ) : (
                                // Moon Icon (Dark Mode toggle)
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {/* User Settings Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none bg-gray-50 dark:bg-gray-800/40 py-1.5 px-3 rounded-xl transition duration-150">
                                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                                        {user.name.substring(0, 1)}
                                    </div>
                                    <span>{user.name}</span>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content align="right" width="48">
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profile Settings
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Content Body with Page Transitions */}
                <main className="flex-1 overflow-y-auto p-6 relative">
                    <motion.div
                        key={route().current()}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
