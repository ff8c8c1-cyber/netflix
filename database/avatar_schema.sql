-- Avatar 3D System Database Schema
-- Add AvatarUrl column to Users table for storing custom 3D avatars

ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "AvatarUrl" TEXT;

-- Set default Ready Player Me avatar for existing users
UPDATE "Users" 
SET "AvatarUrl" = 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb'
WHERE "AvatarUrl" IS NULL;

-- Create index for faster avatar lookup
CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON "Users"("AvatarUrl");

-- Verify changes
SELECT "Id", "Username", "AvatarUrl" 
FROM "Users" 
LIMIT 5;
