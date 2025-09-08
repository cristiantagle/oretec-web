import { NextResponse } from 'next/server';

export async function GET() {
  const env = process.env.VERCEL_ENV || 'local';
  const branch = process.env.VERCEL_GIT_COMMIT_REF || 'local';
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || 'unknown';

  return NextResponse.json({
    ok: true,
    env,
    branch,
    commit,
    timestamp: new Date().toISOString(),
  });
}
