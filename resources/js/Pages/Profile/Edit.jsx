import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminLayout from '@/Layouts/AdminLayout';
import DokterLayout from '@/Layouts/DokterLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    // Determine layout based on user role/status
    let Layout = AuthenticatedLayout;
    if (user.is_doctor) {
        Layout = DokterLayout;
    } else if (user.roles && user.roles.includes('admin')) {
        Layout = AdminLayout;
    }

    return (
        <Layout title="Profile">
            <Head title="Profile - SIREMUN" />

            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm sm:rounded-2xl sm:p-8">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm sm:rounded-2xl sm:p-8">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm sm:rounded-2xl sm:p-8">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </Layout>
    );
}
