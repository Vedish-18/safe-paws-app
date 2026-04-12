DROP POLICY IF EXISTS "Volunteers can update assigned reports" ON public.injury_reports;

CREATE POLICY "Volunteers can claim and update reports" ON public.injury_reports
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'volunteer')
    AND (
      assigned_volunteer_id = auth.uid()
      OR (assigned_volunteer_id IS NULL AND status = 'pending')
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'volunteer')
    AND assigned_volunteer_id = auth.uid()
  );
