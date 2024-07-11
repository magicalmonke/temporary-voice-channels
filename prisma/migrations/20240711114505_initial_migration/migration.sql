-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('DEFAULT', 'CLONE');

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "logChannelId" TEXT,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateChannel" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "type" "ChannelType" NOT NULL,

    CONSTRAINT "TemplateChannel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TemplateChannel" ADD CONSTRAINT "TemplateChannel_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
