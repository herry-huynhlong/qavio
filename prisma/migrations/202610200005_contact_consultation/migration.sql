-- Additive relaxation: keep every existing value, column, index and relation.
ALTER TABLE "Lead" ALTER COLUMN "email" DROP NOT NULL;
