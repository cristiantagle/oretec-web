-- Tabla de testimonios
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  role text not null,
  initials text not null,
  created_at timestamp with time zone default now()
);

-- Índice para ordenar rápido por fecha
create index if not exists testimonials_created_at_idx on testimonials(created_at desc);

-- Datos de ejemplo iniciales
insert into testimonials (quote, name, role, initials) values
  ('Contenido claro y práctico. El proceso de certificación fue muy rápido.', 'María P.', 'Encargada de Prevención', 'MP'),
  ('Ideal para capacitar turnos. 100% online y con soporte excelente.', 'Carlos R.', 'Jefe de Operaciones', 'CR'),
  ('Cumplimos la normativa sin interrumpir la producción. Recomendado.', 'Valentina G.', 'RRHH', 'VG');
