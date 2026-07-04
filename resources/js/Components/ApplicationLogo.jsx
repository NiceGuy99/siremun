export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <img
            src="/logo.png"
            alt="Logo RSUD Sidoarjo Barat"
            className={`bg-white p-1 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-sm ${className}`}
            {...props}
        />
    );
}
