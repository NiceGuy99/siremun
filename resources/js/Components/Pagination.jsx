import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex items-center justify-center gap-1.5">
            {links.map((link, idx) => {
                const label = link.label
                    .replace('&laquo; Previous', 'Sebelumnya')
                    .replace('Next &raquo;', 'Berikutnya');

                if (link.url === null) {
                    return (
                        <div
                            key={idx}
                            className="px-3.5 py-2 text-xs text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/10 border border-gray-200/60 dark:border-gray-800 rounded-xl cursor-not-allowed select-none"
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                }

                return (
                    <Link
                        key={idx}
                        href={link.url}
                        className={`px-3.5 py-2 text-xs border rounded-xl transition duration-150 ease-in-out font-medium ${
                            link.active
                                ? 'bg-amber-500 border-amber-500 text-white font-semibold shadow-sm shadow-amber-500/20'
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        dangerouslySetInnerHTML={{ __html: label }}
                        preserveState
                        preserveScroll
                    />
                );
            })}
        </div>
    );
}
