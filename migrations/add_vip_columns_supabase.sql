-- VIP System Schema Update for Supabase (PostgreSQL)
-- Run this on your Supabase database

-- Add VIP columns to Users table if they don't exist
DO $$ 
BEGIN
    -- Add VipStatus column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = 'VipStatus'
    ) THEN
        ALTER TABLE "Users" ADD COLUMN "VipStatus" VARCHAR(20) DEFAULT 'none';
    END IF;

    -- Add VipExpiresAt column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = 'VipExpiresAt'
    ) THEN
        ALTER TABLE "Users" ADD COLUMN "VipExpiresAt" TIMESTAMP NULL;
    END IF;

    -- Add VipLastClaim column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = 'VipLastClaim'
    ) THEN
        ALTER TABLE "Users" ADD COLUMN "VipLastClaim" TIMESTAMP NULL;
    END IF;
END $$;

-- Create index for VIP status queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_vip_status ON "Users"("VipStatus");

SELECT 'VIP columns added successfully to Supabase!' as message;
