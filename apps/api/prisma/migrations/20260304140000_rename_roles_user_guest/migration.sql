-- Rename Role enum values: manager -> user, staff -> guest
ALTER TYPE "Role" RENAME VALUE 'manager' TO 'user';
ALTER TYPE "Role" RENAME VALUE 'staff' TO 'guest';

-- Update default value for User.role
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'guest';
