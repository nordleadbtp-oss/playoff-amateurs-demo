
-- Remove permissive UPDATE policy on creneaux (not needed; reservations table tracks bookings)
DROP POLICY IF EXISTS "Authenticated can mark creneau reserved" ON public.creneaux;
REVOKE UPDATE ON public.creneaux FROM authenticated;

-- Lock down trigger function execution
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
