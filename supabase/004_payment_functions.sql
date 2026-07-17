-- ============================================================
-- PAYMENTS SUPPORT FUNCTIONS — Phase 5
-- ============================================================

create or replace function increment_coupon_usage(p_code text)
returns void as $$
begin
  update coupons
  set times_used = times_used + 1
  where code = p_code;
end;
$$ language plpgsql security definer;
