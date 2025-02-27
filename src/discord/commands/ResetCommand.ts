import { type ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "../types/index.js";
import { prisma } from "../../main.js";

export const ResetCommand: Command = {
	metadata: new SlashCommandBuilder()
		.setName("reset")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription("Resets the bot's configuration.")
		.toJSON(),
	async execute(interaction: ChatInputCommandInteraction) {
        // biome-ignore lint/style/noNonNullAssertion: DM permission is set to false
        const guild = interaction.guild!;

        const guildRecord = await prisma.guild.findUnique({
            where: { id: guild.id }
        });

        if (guildRecord) {
            await prisma.guild.delete({
                where: { id: guild.id }
            });
        }

        await interaction.reply({
            content: "The bot's configuration has been reset.",
            ephemeral: true,
        });
	},
};
