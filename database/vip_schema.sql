-- VIP System Database Schema
-- Add VIP columns to Users table

-- Run this in Supabase SQL Editor

ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "VipStatus" VARCHAR(20) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS "VipExpiresAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "LastVipClaim" TIMESTAMP;

-- Update existing users to have 'none' status
UPDATE "Users" SET "VipStatus" = 'none' WHERE "VipStatus" IS NULL;

-- Create index for faster VIP queries
CREATE INDEX IF NOT EXISTS idx_users_vip_status ON "Users"("VipStatus");

-- Verify changes
SELECT "Id", "Username", "VipStatus", "VipExpiresAt", "LastVipClaim" 
FROM "Users" 
LIMIT 5;
