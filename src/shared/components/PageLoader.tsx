interface PageLoaderProps {
  label?: string;
}

export function PageLoader({ label = 'Loading page...' }: PageLoaderProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-6 text-slate-500 dark:text-slate-400">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400"
        role="status"
        aria-label={label}
      />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
