import {
	ChannelType,
	type ChatInputCommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
	channelMention,
} from "discord.js";
import { prisma } from "../../main.js";
import type { Command } from "../types/index.js";

export const SetCommand: Command = {
	metadata: new SlashCommandBuilder()
		.setName("set")
		.setDescription("Configure the bot's settings.")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild) // TODO: Think about that one again at some point
		.addSubcommand((subcommand) =>
			subcommand
				.setName("log-channel")
				.setDescription("Specify or remove the log channel for the bot.")
				.addChannelOption((option) =>
					option
						.setName("channel")
						.setDescription(
							"The channel to use for logging (leave empty to remove the current log channel).",
						),
				),
		)
		.toJSON(),
	async execute(interaction: ChatInputCommandInteraction) {
		// biome-ignore lint/style/noNonNullAssertion: DM permission is set to false
		const guild = interaction.guild!;

		const subcommand = interaction.options.getSubcommand();
		switch (subcommand) {
			case "log-channel": {
				const channel = interaction.options.getChannel("channel");
				let content = "The log channel has been successfully removed.";
				let logChannelId = null;

				if (channel) {
					if (channel.type !== ChannelType.GuildText) {
						await interaction.reply({
							content: "Please select a text channel.",
							ephemeral: true,
						});
						return;
					}
					logChannelId = channel.id;
					content = `The log channel has been successfully set to ${channelMention(channel.id)}.`;
				}

				await prisma.guild.upsert({
					where: { id: guild.id },
					update: { logChannelId: logChannelId },
					create: { id: guild.id, logChannelId: logChannelId },
				});

				await interaction.reply({
					content: content,
					ephemeral: true,
				});

				break;
			}
		}
	},
};
