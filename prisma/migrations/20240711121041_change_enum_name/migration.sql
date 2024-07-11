/*
  Warnings:

  - Changed the type of `type` on the `TemplateChannel` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TemplateChannelType" AS ENUM ('DEFAULT', 'CLONE');

-- AlterTable
ALTER TABLE "TemplateChannel" DROP COLUMN "type",
ADD COLUMN     "type" "TemplateChannelType" NOT NULL;

-- DropEnum
DROP TYPE "ChannelType";
