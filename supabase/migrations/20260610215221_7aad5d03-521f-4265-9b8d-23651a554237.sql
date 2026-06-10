CREATE POLICY "Users delete joueurs of own reservations"
ON public.joueurs_match
FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.reservations r
  WHERE r.id = joueurs_match.reservation_id AND r.user_id = auth.uid()
));