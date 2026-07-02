import { useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Form({ resourceKey, resourceName, fields, data, isEdit }) {
    const { data: formData, setData, post, put, processing, errors, transform } = useForm({
        ...data
    });

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Convert toggle values to boolean / 1 or 0 if necessary
        transform((transformedData) => {
            const finalData = { ...transformedData };
            fields.forEach((field) => {
                if (field.type === 'toggle') {
                    finalData[field.name] = finalData[field.name] ? 1 : 0;
                }
            });
            return finalData;
        });

        if (isEdit) {
            put(route(`admin.${resourceKey}.update`, data.id));
        } else {
            post(route(`admin.${resourceKey}.store`));
        }
    };

    return (
        <AdminLayout title={`${isEdit ? 'Ubah' : 'Tambah'} ${resourceName}`}>
            <Head title={`${isEdit ? 'Ubah' : 'Tambah'} ${resourceName} - Admin SIREMUN`} />

            <div className="max-w-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                        Formulir {resourceName}
                    </h2>
                    <Link
                        href={route(`admin.${resourceKey}.index`)}
                        className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-amber-500 transition duration-150 font-semibold"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Kembali ke List
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {fields.map((field) => {
                            const isFullWidth = field.columnSpanFull || field.type === 'textarea';
                            const inputClass = "block w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm py-2.5 px-3.5 focus:border-amber-500 focus:ring-amber-500 dark:focus:border-amber-500 dark:focus:ring-amber-500 transition duration-150";

                            return (
                                <div key={field.name} className={`flex flex-col gap-1.5 ${isFullWidth ? 'sm:col-span-2' : ''}`}>
                                    {field.type !== 'toggle' && (
                                        <label htmlFor={field.name} className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                    )}

                                    {/* Text / String Input */}
                                    {field.type === 'text' && (
                                        <input
                                            type="text"
                                            id={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => setData(field.name, e.target.value)}
                                            className={inputClass}
                                            required={field.required}
                                        />
                                    )}

                                    {/* Number / Numeric Input */}
                                    {field.type === 'number' && (
                                        <input
                                            type="number"
                                            step="any"
                                            id={field.name}
                                            value={formData[field.name] !== undefined && formData[field.name] !== null ? formData[field.name] : ''}
                                            onChange={(e) => setData(field.name, e.target.value)}
                                            className={inputClass}
                                            required={field.required}
                                        />
                                    )}

                                    {/* Select Dropdown */}
                                    {field.type === 'select' && (
                                        <select
                                            id={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => setData(field.name, e.target.value)}
                                            className={inputClass}
                                            required={field.required}
                                        >
                                            <option value="">-- Pilih {field.label} --</option>
                                            {field.options && field.options.map((opt) => (
                                                <option key={opt.id} value={opt.id}>
                                                    {opt.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {/* Datetime Input */}
                                    {field.type === 'datetime' && (
                                        <input
                                            type="datetime-local"
                                            id={field.name}
                                            // Format date-time for datetime-local value format (YYYY-MM-DDTHH:mm)
                                            value={formData[field.name] ? new Date(formData[field.name]).toISOString().slice(0, 16) : ''}
                                            onChange={(e) => setData(field.name, e.target.value)}
                                            className={inputClass}
                                            required={field.required}
                                        />
                                    )}

                                    {/* Textarea Input */}
                                    {field.type === 'textarea' && (
                                        <textarea
                                            id={field.name}
                                            rows={4}
                                            value={formData[field.name] || ''}
                                            onChange={(e) => setData(field.name, e.target.value)}
                                            className={`${inputClass} resize-none`}
                                            required={field.required}
                                        />
                                    )}

                                    {/* Toggle / Switch Input */}
                                    {field.type === 'toggle' && (
                                        <div className="flex items-center gap-3 py-1">
                                            <button
                                                type="button"
                                                onClick={() => setData(field.name, !formData[field.name])}
                                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                    formData[field.name] ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-800'
                                                }`}
                                            >
                                                <span
                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                        formData[field.name] ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                                />
                                            </button>
                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                {field.label}
                                            </span>
                                        </div>
                                    )}

                                    {/* Validation Errors */}
                                    {errors[field.name] && (
                                        <span className="text-xs text-red-500 mt-1 font-semibold">
                                            {errors[field.name]}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Link
                            href={route(`admin.${resourceKey}.index`)}
                            className="inline-flex items-center justify-center rounded-xl text-sm font-semibold py-2.5 px-5 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition duration-150"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold py-2.5 px-6 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 transition duration-150 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Data'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
