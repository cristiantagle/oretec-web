"use client";

import React from "react";
import CountUp from "react-countup";

type Item = { label: string; end: number };

const DATA: Item[] = [
  { label: "Alumnos", end: 1200 },
  { label: "Cursos", end: 45 },
  { label: "Horas", end: 5000 },
];

export default function StatsBand() {
  return (
    <section className="w-full py-5 bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 px-4">
        {DATA.map((item, i) => (
          <div className="rounded-2xl shadow-lg bg-white p-6 text-center" key={i}>
            <div className="text-4xl font-bold">
              <CountUp end={item.end} duration={1.4} prefix="+" />
            </div>
            <p className="text-neutral-600">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
