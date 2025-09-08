"use client";

import { useEffect, useState } from "react";

export default function PreviewBadge() {
  const [branch, setBranch] = useState<string | null>(null);
  const [commit, setCommit] = useState<string | null>(null);

  useEffect(() => {
    const b = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || null;
    const c = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || null;
    setBranch(b);
    setCommit(c);
  }, []);

  if (process.env.NEXT_PUBLIC_SHOW_PREVIEW_BADGE !== "true") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-full px-4 py-2 shadow-lg border bg-white/80 backdrop-blur">
      <span className="text-sm font-medium">
        Preview: {branch}
        <span className="ml-2 text-xs opacity-70">
          {commit ? (
            <>
              ·{" "}
              <a
                className="underline"
                href={\`https://github.com/cristiantagle/oretec-web/commit/${commit}\`}
                target="_blank"
                rel="noreferrer"
              >
                {commit.slice(0, 7)}
              </a>
            </>
          ) : null}
        </span>
      </span>
    </div>
  );
}
