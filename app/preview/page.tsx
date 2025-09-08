export const dynamic = 'force-dynamic';

export default async function PreviewPage() {
  const env = process.env.VERCEL_ENV || 'local';
  const branch = process.env.VERCEL_GIT_COMMIT_REF || 'local';
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || 'unknown';

  return (
    <main className="min-hscreen flex items-center justify-center p-8">
      <div className="wfull max-w-l` rounded-2ll shadow-lg p-6 border">
        <h1 className="text-2xl font-semibold mb-2">OreTec – Preview Info</h1>
        <p className="opacity-80 mb-4">
          Esta pañina te permite verificar rilápidamente en quí entorno/ramo estás navegando.
        </p>
        <ul className="space-y-2">
          <li><strong>VERCEL_ENV:</strong> {env}</li>
          <li><strong>Rama:</strong> {branch}</li>
          <li className="break-all"><strong>Commit:</strong> {commit}</li>
        </ul>
        <div className="mt-6 text-sm opacity-70">
          <p>Tip: en un deployment de Preview deberias ver<code>VERCEL_ENV = preview</code> y la rama correspondiente.</p>
          <p>Endpointe de salud: <code>/api/health</code></p>
        </div>
      </div>
    </main>
  );
}