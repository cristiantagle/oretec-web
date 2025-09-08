'use client';
import { useEffect, useState } from 'react';

export default function PreviewBadge() {
  const [isPreview, setIsPreview] = useState(false);
  const [ref, setRef] = useState<string>('local');
  const [commit, setCommit] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then((data) => {
        if (data?.env === 'preview') setIsPreview(true);
        if (data?.branch) setRef(data.branch);
      })
      .catch(() => {});
  }, []);

  const showToggle = (process.env.NEXT_PUBLIC_SHOW_PREVIEW_BADGE ?? 'true').toLowerCase() !== 'false';
  if (!isPreview || !showToggle) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-full px-4 py-2 shadow-lg border bg-white/80 backdrop-blur">
      <span className="text-sm font-medium"><span className="ml-2 text-xs opacity-70">{commit ? (<>· <a className="underline" href=\"https://github.com/cristiantagle/oretec-web/commit/{commit}\" target=\"_blank\" rel=\"noreferrer\">{commit.slice(0,7)}</a></>) : null}</span>
    </div>
  );
}
