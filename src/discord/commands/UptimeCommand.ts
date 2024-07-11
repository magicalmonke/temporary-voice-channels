import { SlashCommandBuilder, inlineCode } from "discord.js";
import prettyMilliseconds from "pretty-ms";
import type { Command } from "../types";

export const UptimeCommand: Command = {
	metadata: new SlashCommandBuilder()
		.setName("uptime")
		.setDescription("Shows how long the bot has been running.")
		.toJSON(),
	async execute(interaction) {
		await interaction.reply({
			content: `The bot has been running for: ${inlineCode(prettyMilliseconds(interaction.client.uptime, { verbose: true }))}`,
			ephemeral: true,
		});
	},
};
