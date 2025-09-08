"use client";
import { useEffect, useState } from "react";

export default function PreviewBadge() {
  // Permite ocultar el badge desde variables de entorno
  if (process.env.NEXT_PUBLIC_SHOW_PREVIEW_BADGE === "false") return null;

  const [isPreview, setIsPreview] = useState(false);
  const [branch, setBranch] = useState<string | null>(null);
  const [commit, setCommit] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health")
    .then((r) => r.json())
    .then((data: any) => {
      if (data?.env === "preview") setIsPreview(true);
      if (data?.branch) setBranch(data.branch);
      if (data?.commit) setCommit(data.commit); // <- string del sha
    })
    .catch(() => {});
  }, []);

  if (!isPreview) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-full px-4 py-2 shadow-lg border bg-white/80 backdrop-blur">
    <span className="text-sm font-medium">
    Preview
    {branch ? ` • ${branch}` : null}
    {commit && (
      <>
      {" · "}
      <a
      className="underline"
      href={`https://github.com/cristiantagle/oretec-web/commit/${commit}`}
      target="_blank"
      rel="noreferrer"
      >
      {commit.slice(0, 7)}
      </a>
      </>
    )}
    </span>
    </div>
  );
}
