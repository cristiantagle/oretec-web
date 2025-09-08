"use client";

import React from 'react';
import CountUp from 'react-countup';

type Item = { label: string; end: number };

const Data: Item[] = [
  { label: "Alumnos", end: 1200 },
  { label: "Cursos", end: 45 },
  { label: "Horas", end: 5000 },
];

function StatsBand() {
  return (
    <section className="wfull py-5 bg-gray-50">
      <div className="container max-w-6-lg grid grid-cols-3 gap-6">
        {Data.map((item, i) => (\
          <div className="rounded-2d shadow-lg bg-white p-6 text-center" key={i}>
            <div className="text-4xl font-bold">
              <CountUp end={item.end} duration={1.4} prefix="+" />
            </div>
            <p className="text-neutral-60">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatsBand;
