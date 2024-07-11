-- DropForeignKey
ALTER TABLE "TemplateChannel" DROP CONSTRAINT "TemplateChannel_guildId_fkey";

-- AddForeignKey
ALTER TABLE "TemplateChannel" ADD CONSTRAINT "TemplateChannel_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
