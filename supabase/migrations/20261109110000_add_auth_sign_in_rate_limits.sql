CREATE TABLE "public"."auth_sign_in_rate_limits" (
  "keyHash" text NOT NULL,
  "windowStartedAt" timestamptz NOT NULL,
  "requestCount" integer NOT NULL,
  CONSTRAINT "auth_sign_in_rate_limits_pkey" PRIMARY KEY ("keyHash"),
  CONSTRAINT "auth_sign_in_rate_limits_requestCount_check"
    CHECK ("requestCount" > 0)
);

CREATE INDEX "auth_sign_in_rate_limits_windowStartedAt_idx"
  ON "public"."auth_sign_in_rate_limits" ("windowStartedAt");

ALTER TABLE "public"."auth_sign_in_rate_limits" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "public"."auth_sign_in_rate_limits"
  FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.consume_auth_sign_in_rate_limit(
  p_account_key text,
  p_client_ip_key text
)
RETURNS TABLE (allowed boolean, retry_after_seconds integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_now timestamptz := clock_timestamp();
  v_window_started_at timestamptz;
  v_request_count integer;
  v_retry_after integer := 0;
BEGIN
  IF p_account_key IS NULL AND p_client_ip_key IS NULL THEN
    RETURN QUERY SELECT true, 0;
    RETURN;
  END IF;

  DELETE FROM public.auth_sign_in_rate_limits
  WHERE "windowStartedAt" < v_now - interval '24 hours';

  IF p_account_key IS NOT NULL THEN
    INSERT INTO public.auth_sign_in_rate_limits AS existing (
      "keyHash",
      "windowStartedAt",
      "requestCount"
    )
    VALUES (p_account_key, v_now, 1)
    ON CONFLICT ("keyHash") DO UPDATE
    SET
      "windowStartedAt" = CASE
        WHEN existing."windowStartedAt" <= v_now - interval '15 minutes'
          THEN v_now
        ELSE existing."windowStartedAt"
      END,
      "requestCount" = CASE
        WHEN existing."windowStartedAt" <= v_now - interval '15 minutes'
          THEN 1
        ELSE existing."requestCount" + 1
      END
    RETURNING "requestCount", "windowStartedAt"
    INTO v_request_count, v_window_started_at;

    IF v_request_count > 10 THEN
      v_retry_after := GREATEST(
        v_retry_after,
        CEIL(EXTRACT(EPOCH FROM (v_window_started_at + interval '15 minutes' - v_now)))::integer
      );
    END IF;
  END IF;

  IF p_client_ip_key IS NOT NULL THEN
    INSERT INTO public.auth_sign_in_rate_limits AS existing (
      "keyHash",
      "windowStartedAt",
      "requestCount"
    )
    VALUES (p_client_ip_key, v_now, 1)
    ON CONFLICT ("keyHash") DO UPDATE
    SET
      "windowStartedAt" = CASE
        WHEN existing."windowStartedAt" <= v_now - interval '15 minutes'
          THEN v_now
        ELSE existing."windowStartedAt"
      END,
      "requestCount" = CASE
        WHEN existing."windowStartedAt" <= v_now - interval '15 minutes'
          THEN 1
        ELSE existing."requestCount" + 1
      END
    RETURNING "requestCount", "windowStartedAt"
    INTO v_request_count, v_window_started_at;

    IF v_request_count > 60 THEN
      v_retry_after := GREATEST(
        v_retry_after,
        CEIL(EXTRACT(EPOCH FROM (v_window_started_at + interval '15 minutes' - v_now)))::integer
      );
    END IF;
  END IF;

  RETURN QUERY SELECT v_retry_after = 0, v_retry_after;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_auth_sign_in_rate_limit(text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_auth_sign_in_rate_limit(text, text)
  TO service_role;
