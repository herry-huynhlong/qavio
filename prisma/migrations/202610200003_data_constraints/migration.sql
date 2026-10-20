ALTER TABLE "NewsletterSubscriber" ADD CONSTRAINT "subscriber_normalized_email" CHECK ("emailNormalized" = lower(btrim("emailNormalized")));
ALTER TABLE "Lead" ADD CONSTRAINT "lead_branch_positive" CHECK ("branchCount" IS NULL OR "branchCount" BETWEEN 1 AND 10000), ADD CONSTRAINT "lead_term_valid" CHECK ("termMonths" IS NULL OR "termMonths" IN (3,6,12));
ALTER TABLE "EmailOutbox" ADD CONSTRAINT "email_attempts_nonnegative" CHECK (attempts >= 0);
ALTER TABLE "NewsletterSubscriber" ADD CONSTRAINT "subscriber_version_positive" CHECK (version > 0);
ALTER TABLE "RateLimitBucket" ADD CONSTRAINT "rate_count_positive" CHECK (count > 0);
