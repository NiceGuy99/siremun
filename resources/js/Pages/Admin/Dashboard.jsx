import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard - Admin SIREMUN" />

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Selamat Datang di SIREMUN Admin</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Silakan gunakan menu di panel kiri untuk mulai mengelola remunerasi pegawai.
                </p>
            </div>
        </AdminLayout>
    );
}
