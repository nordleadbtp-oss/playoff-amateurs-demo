
-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, prenom, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'prenom', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ TERRAINS ============
CREATE TABLE public.terrains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  sport text NOT NULL CHECK (sport IN ('football','basket','padel')),
  ville text NOT NULL,
  code_postal text NOT NULL,
  distance_km numeric,
  prix_heure integer NOT NULL,
  note numeric DEFAULT 4.5,
  nb_avis integer NOT NULL DEFAULT 0,
  disponible boolean NOT NULL DEFAULT true,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.terrains TO anon, authenticated;
GRANT ALL ON public.terrains TO service_role;
ALTER TABLE public.terrains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Terrains are public" ON public.terrains
  FOR SELECT TO anon, authenticated USING (true);

-- ============ CRENEAUX ============
CREATE TABLE public.creneaux (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  terrain_id uuid NOT NULL REFERENCES public.terrains(id) ON DELETE CASCADE,
  date_debut timestamptz NOT NULL,
  date_fin timestamptz NOT NULL,
  prix_total integer NOT NULL,
  statut text NOT NULL DEFAULT 'disponible' CHECK (statut IN ('disponible','complet','reserve')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_creneaux_terrain ON public.creneaux(terrain_id, date_debut);
GRANT SELECT ON public.creneaux TO anon, authenticated;
GRANT UPDATE ON public.creneaux TO authenticated;
GRANT ALL ON public.creneaux TO service_role;
ALTER TABLE public.creneaux ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creneaux are public" ON public.creneaux
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can mark creneau reserved" ON public.creneaux
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============ RESERVATIONS ============
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creneau_id uuid NOT NULL REFERENCES public.creneaux(id) ON DELETE CASCADE,
  terrain_id uuid NOT NULL REFERENCES public.terrains(id),
  statut text NOT NULL DEFAULT 'confirmee' CHECK (statut IN ('confirmee','annulee','en_attente')),
  prix_paye integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own reservations" ON public.reservations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own reservations" ON public.reservations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reservations" ON public.reservations
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ JOUEURS_MATCH ============
CREATE TABLE public.joueurs_match (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  prenom text NOT NULL,
  email text,
  statut_paiement text NOT NULL DEFAULT 'en_attente' CHECK (statut_paiement IN ('en_attente','paye')),
  est_organisateur boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.joueurs_match TO authenticated;
GRANT ALL ON public.joueurs_match TO service_role;
ALTER TABLE public.joueurs_match ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view joueurs of own reservations" ON public.joueurs_match
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.reservations r WHERE r.id = reservation_id AND r.user_id = auth.uid())
  );
CREATE POLICY "Users insert joueurs in own reservations" ON public.joueurs_match
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.reservations r WHERE r.id = reservation_id AND r.user_id = auth.uid())
  );
CREATE POLICY "Users update joueurs of own reservations" ON public.joueurs_match
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.reservations r WHERE r.id = reservation_id AND r.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.reservations r WHERE r.id = reservation_id AND r.user_id = auth.uid())
  );

-- ============ SEED TERRAINS ============
INSERT INTO public.terrains (nom, sport, ville, code_postal, distance_km, prix_heure, note, nb_avis, disponible, image_url) VALUES
-- Football
('Terrain Municipal Avon', 'football', 'Avon', '77210', 2.3, 40, 4.6, 128, true, 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=600&q=70'),
('Complexe Sportif de Fontainebleau', 'football', 'Fontainebleau', '77300', 3.8, 45, 4.3, 87, true, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=70'),
('Stade Jean Bouin Melun', 'football', 'Melun', '77000', 4.1, 38, 4.4, 62, true, 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=600&q=70'),
('Stade Couvert de Nemours', 'football', 'Nemours', '77140', 5.2, 50, 4.8, 54, true, 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=70'),
-- Basket
('Gymnase Avon Centre', 'basket', 'Avon', '77210', 1.8, 30, 4.5, 73, true, '/src/assets/court-basket-1.jpg'),
('Salle Polyvalente Fontainebleau', 'basket', 'Fontainebleau', '77300', 3.2, 28, 4.1, 55, true, '/src/assets/court-basket-2.jpg'),
('Gymnase Léo Lagrange Melun', 'basket', 'Melun', '77000', 4.7, 29, 4.3, 48, true, '/src/assets/court-basket-3.jpg'),
('Playground Nemours Sud', 'basket', 'Nemours', '77140', 6.1, 32, 3.9, 33, true, '/src/assets/court-basket-1.jpg'),
-- Padel
('Club Padel Avon', 'padel', 'Avon', '77210', 2.9, 25, 4.7, 91, true, '/src/assets/court-padel-1.jpg'),
('Padel Arena Fontainebleau', 'padel', 'Fontainebleau', '77300', 4.4, 22, 4.5, 67, true, '/src/assets/court-padel-2.jpg'),
('Padel Indoor Melun', 'padel', 'Melun', '77000', 5.8, 26, 4.6, 54, true, '/src/assets/court-padel-3.jpg'),
('Padel Center Nemours', 'padel', 'Nemours', '77140', 8.5, 28, 4.2, 29, true, '/src/assets/court-padel-1.jpg');

-- ============ SEED CRENEAUX ============
-- 20 créneaux par terrain sur 30 jours, heures 9-21h
INSERT INTO public.creneaux (terrain_id, date_debut, date_fin, prix_total, statut)
SELECT
  t.id,
  slot_start,
  slot_start + interval '1 hour',
  t.prix_heure + ((extract(hour from slot_start)::int - 9) * 2),
  CASE WHEN (extract(day from slot_start)::int + extract(hour from slot_start)::int) % 5 = 0
       THEN 'complet' ELSE 'disponible' END
FROM public.terrains t
CROSS JOIN LATERAL (
  SELECT (date_trunc('day', now()) + (d || ' days')::interval + (h || ' hours')::interval) AS slot_start
  FROM generate_series(0, 29) d,
       (VALUES (9),(11),(14),(16),(18),(20)) AS hours(h)
  ORDER BY d, h
  LIMIT 20
) s;
