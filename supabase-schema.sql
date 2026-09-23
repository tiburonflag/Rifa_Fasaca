create table if not exists reservas (
  numero integer primary key check (numero >= 1 and numero <= 100),
  nombre text not null,
  telefono text not null,
  estado text not null check (estado in ('reserved', 'paid')),
  created_at timestamptz default now()
);

alter table reservas enable row level security;

create policy "lectura publica" on reservas
  for select using (true);

create policy "insercion publica" on reservas
  for insert with check (true);

create policy "actualizacion publica" on reservas
  for update using (true);

create policy "borrado publico" on reservas
  for delete using (true);
