export default function LoadingCourses() {
    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 h-7 w-72 animate-pulse rounded bg-slate-100" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-6 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="mt-3 flex gap-3">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="mt-4 h-9 w-32 animate-pulse rounded bg-slate-200" />
            </div>
        ))}
        </div>
        </main>
    )
}
