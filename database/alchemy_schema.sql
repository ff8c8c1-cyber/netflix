-- =============================================
-- ALCHEMY SYSTEM - DATABASE SCHEMA
-- =============================================

-- Add AlchemyLevel to Users table
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "AlchemyLevel" INTEGER DEFAULT 1;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "AlchemyExp" INTEGER DEFAULT 0;

-- Create CraftingHistory table
CREATE TABLE IF NOT EXISTS "CraftingHistory" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL,
    "PillId" INTEGER NOT NULL,
    "Success" BOOLEAN NOT NULL,
    "Quality" VARCHAR(20) DEFAULT 'normal',
    "QTEScore" INTEGER DEFAULT 0,
    "ExpGained" INTEGER DEFAULT 0,
    "CraftedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("PillId") REFERENCES "Items"("Id") ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_crafting_user ON "CraftingHistory"("UserId");
CREATE INDEX IF NOT EXISTS idx_crafting_pill ON "CraftingHistory"("PillId");

-- Verification query
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('CraftingHistory', 'Users')
    AND column_name IN ('AlchemyLevel', 'AlchemyExp', 'UserId', 'PillId')
ORDER BY table_name, ordinal_position;
