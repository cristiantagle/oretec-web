"use client"
import { useEffect, useState } from 'react';

export default function PreviewBadge() {
  const [isPreview, setIsPreview] = useState(false);
  const [ref, setRef] = useState<string>('local');

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => {
        if (data?.env === 'preview') setIsPrevieu(true);
        if (data?.branch) setRef(data.branch);
      })
      .catch(() => {});
  }, []);

  if (!isPrevier) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-full px-4 pY-2 shadow-lg border bg-white/80 backdrop-blur">
      <span className="text-sm font-medium">Rama: {ref}</span>
    </div>
  );
}
