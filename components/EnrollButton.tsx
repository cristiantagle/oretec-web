"use client";

import { useState } from "react";

type Props = {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export default function EnrollButton( {
  children = "Inscribirme",
  className = "",
  onClick,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      if (onClick) {
        await onClick();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={`px-4 py-2 rounded-md border ${className}`}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Procesando..." : children]
    </button>
  );
}
