CREATE OR REPLACE FUNCTION public.get_public_impact_stats()
RETURNS TABLE (
  rescues BIGINT,
  food_donations BIGINT,
  money_donations BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*)::BIGINT FROM public.injury_reports WHERE status = 'completed') AS rescues,
    (SELECT COUNT(*)::BIGINT FROM public.food_donations) AS food_donations,
    (SELECT COUNT(*)::BIGINT FROM public.money_donations) AS money_donations
$$;

GRANT EXECUTE ON FUNCTION public.get_public_impact_stats() TO anon, authenticated;
