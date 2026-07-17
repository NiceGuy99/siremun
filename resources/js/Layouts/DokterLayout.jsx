import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropdown from '@/Components/Dropdown';

export default function DokterLayout({ children, title }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

    const renderSidebarContent = (isMobile = false) => {
        const showLabel = isMobile || sidebarOpen;
        return (
            <>
                {/* Logo Area */}
                <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 overflow-hidden justify-between flex-shrink-0">
                    <Link href={route('dokter.dashboard')} className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo RSUD" className="w-8 h-8 object-contain flex-shrink-0 bg-white p-0.5 rounded-lg border border-gray-200/40" />
                        {showLabel && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="font-bold text-lg tracking-wider text-amber-600 dark:text-amber-500 whitespace-nowrap"
                            >
                                SIREMUN
                            </motion.span>
                        )}
                    </Link>
                    {isMobile && (
                        <button
                            onClick={() => setMobileSidebarOpen(false)}
                            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none lg:hidden"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {/* Dashboard Dokter */}
                    <Link
                        href={route('dokter.dashboard')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition duration-150 group relative ${
                            route().current('dokter.dashboard')
                                ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 font-semibold'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {showLabel && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
                                Dashboard Dokter
                            </motion.span>
                        )}
                        {!showLabel && (
                            <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-30 pointer-events-none shadow-md">
                                Dashboard Dokter
                            </div>
                        )}
                    </Link>
                </nav>
            </>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-955 text-gray-800 dark:text-gray-200 overflow-hidden font-sans relative">
            {/* Mobile Backdrop Overlay (Scrim) */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileSidebarOpen(false)}
                        className="fixed inset-0 bg-black z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar Panel (Slides in) */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 w-[260px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 flex flex-col lg:hidden shadow-xl h-full"
                    >
                        {renderSidebarContent(true)}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar (Collapsible) */}
            <motion.div
                animate={{ width: sidebarOpen ? 260 : 70 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="hidden lg:flex flex-col flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full relative z-20 shadow-sm"
            >
                {renderSidebarContent(false)}
                
                {/* Sidebar Collapse Toggle Button */}
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
                <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6 z-10 shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-xl text-gray-505 hover:bg-gray-100 dark:hover:bg-gray-800/40 hover:text-amber-500 lg:hidden focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        
                        {/* Page Title & Breadcrumbs */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Link href={route('dokter.dashboard')} className="hover:text-amber-500 transition duration-150">Dokter</Link>
                                <span>/</span>
                                <span className="text-gray-500 font-medium">{title}</span>
                            </div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none mt-1">{title}</h1>
                        </div>
                    </div>

                    {/* Dark Mode & User Settings */}
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle Button */}
                        <button
                            type="button"
                            onClick={toggleDarkMode}
                            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 text-gray-550 dark:text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-955/20 transition duration-150 focus:outline-none"
                            title={darkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
                        >
                            {darkMode ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                </svg>
                            ) : (
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
                                    <span className="hidden sm:inline">{user.name}</span>
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
                <main className="flex-1 overflow-y-auto p-4 lg:p-6 relative">
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
