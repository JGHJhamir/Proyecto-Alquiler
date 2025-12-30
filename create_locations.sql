-- Run this in your Supabase SQL Editor to enable Locations management

-- 1. Create the table
create table if not exists locations (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- e.g. "Máncora"
  department text not null, -- e.g. "Piura"
  image_url text, 
  created_at timestamptz default now(),
  unique(name, department) -- Prevent duplicates
);

-- 2. Enable Row Level Security (RLS)
alter table locations enable row level security;

-- 3. Policies
-- Everyone can read locations (for the search filters)
create policy "Public read access" on locations for select using (true);

-- Only Admins can insert/update/delete
create policy "Admin full access" on locations for all using (
  auth.uid() in (select id from profiles where role = 'admin')
);

-- 4. SEED DATA (Populate with your existing lists)
insert into locations (department, name) values
  -- Tumbes
  ('Tumbes', 'Tumbes'), ('Tumbes', 'Zorritos'), ('Tumbes', 'Punta Sal'),
  -- Piura
  ('Piura', 'Piura'), ('Piura', 'Máncora'), ('Piura', 'Colán'), ('Piura', 'Vichayito'), ('Piura', 'Lobitos'),
  -- Lambayeque
  ('Lambayeque', 'Chiclayo'), ('Lambayeque', 'Pimentel'),
  -- La Libertad
  ('La Libertad', 'Trujillo'), ('La Libertad', 'Huanchaco'), ('La Libertad', 'Pacasmayo'),
  -- Ancash
  ('Ancash', 'Chimbote'), ('Ancash', 'Tuquillo'),
  -- Lima
  ('Lima', 'Lima'), ('Lima', 'Asia'), ('Lima', 'Punta Hermosa'), ('Lima', 'San Bartolo'),
  -- Ica
  ('Ica', 'Ica'), ('Ica', 'Paracas'), ('Ica', 'Huacachina'),
  -- Arequipa
  ('Arequipa', 'Arequipa'), ('Arequipa', 'Mollendo'), ('Arequipa', 'Camaná'), ('Arequipa', 'Mejía'),
  -- Moquegua
  ('Moquegua', 'Moquegua'), ('Moquegua', 'Ilo'),
  -- Tacna
  ('Tacna', 'Tacna'), ('Tacna', 'Boca del Río')
on conflict (name, department) do nothing;

