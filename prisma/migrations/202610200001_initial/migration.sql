-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('CONTACT', 'DEMO', 'QUOTE', 'PRODUCT_INQUIRY');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED', 'SPAM');

-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('PENDING', 'CONFIRMED', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "TokenPurpose" AS ENUM ('CONFIRM', 'UNSUBSCRIBE');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmailKind" AS ENUM ('LEAD_ADMIN', 'LEAD_RECEIPT', 'NEWSLETTER_CONFIRM', 'NEWSLETTER_WELCOME', 'NEWSLETTER_UNSUBSCRIBED', 'MARKETING');

-- CreateTable
CREATE TABLE "Lead" (
    "id" UUID NOT NULL,
    "fullName" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(24) NOT NULL,
    "companyName" VARCHAR(160),
    "restaurantName" VARCHAR(160),
    "businessType" VARCHAR(40),
    "location" VARCHAR(160),
    "branchCount" INTEGER,
    "productInterest" VARCHAR(60),
    "inquiryType" "InquiryType" NOT NULL,
    "subject" VARCHAR(160) NOT NULL,
    "message" VARCHAR(3000) NOT NULL,
    "planInterest" VARCHAR(12),
    "termMonths" INTEGER,
    "sourcePage" VARCHAR(120) NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "consentAcceptedAt" TIMESTAMP(3) NOT NULL,
    "privacyPolicyVersion" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "type" VARCHAR(40) NOT NULL,
    "actorId" VARCHAR(120),
    "note" VARCHAR(3000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyRecord" (
    "id" UUID NOT NULL,
    "scope" VARCHAR(40) NOT NULL,
    "keyHash" VARCHAR(64) NOT NULL,
    "fingerprint" VARCHAR(64) NOT NULL,
    "response" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" UUID NOT NULL,
    "emailNormalized" VARCHAR(254) NOT NULL,
    "name" VARCHAR(120),
    "status" "SubscriberStatus" NOT NULL DEFAULT 'PENDING',
    "source" VARCHAR(120) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterConsentEvent" (
    "id" UUID NOT NULL,
    "subscriberId" UUID NOT NULL,
    "type" VARCHAR(40) NOT NULL,
    "policyVersion" VARCHAR(60) NOT NULL,
    "source" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterConsentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterToken" (
    "id" UUID NOT NULL,
    "subscriberId" UUID NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "purpose" "TokenPurpose" NOT NULL,
    "version" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailOutbox" (
    "id" UUID NOT NULL,
    "kind" "EmailKind" NOT NULL,
    "recipient" VARCHAR(254) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaseUntil" TIMESTAMP(3),
    "claimToken" UUID,
    "sentAt" TIMESTAMP(3),
    "lastError" VARCHAR(60),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leadId" UUID,
    "subscriberId" UUID,

    CONSTRAINT "EmailOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "key" VARCHAR(64) NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_inquiryType_createdAt_idx" ON "Lead"("inquiryType", "createdAt");

-- CreateIndex
CREATE INDEX "LeadActivity_leadId_createdAt_idx" ON "LeadActivity"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "IdempotencyRecord_expiresAt_idx" ON "IdempotencyRecord"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyRecord_scope_keyHash_key" ON "IdempotencyRecord"("scope", "keyHash");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_emailNormalized_key" ON "NewsletterSubscriber"("emailNormalized");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_status_createdAt_idx" ON "NewsletterSubscriber"("status", "createdAt");

-- CreateIndex
CREATE INDEX "NewsletterConsentEvent_subscriberId_createdAt_idx" ON "NewsletterConsentEvent"("subscriberId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterToken_tokenHash_key" ON "NewsletterToken"("tokenHash");

-- CreateIndex
CREATE INDEX "NewsletterToken_subscriberId_purpose_idx" ON "NewsletterToken"("subscriberId", "purpose");

-- CreateIndex
CREATE INDEX "NewsletterToken_expiresAt_idx" ON "NewsletterToken"("expiresAt");

-- CreateIndex
CREATE INDEX "EmailOutbox_status_nextAttemptAt_idx" ON "EmailOutbox"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "EmailOutbox_subscriberId_idx" ON "EmailOutbox"("subscriberId");

-- CreateIndex
CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsletterConsentEvent" ADD CONSTRAINT "NewsletterConsentEvent_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "NewsletterSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsletterToken" ADD CONSTRAINT "NewsletterToken_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "NewsletterSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailOutbox" ADD CONSTRAINT "EmailOutbox_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailOutbox" ADD CONSTRAINT "EmailOutbox_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "NewsletterSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
