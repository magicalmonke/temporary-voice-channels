import { inlineCode, SlashCommandBuilder } from "discord.js";
import { Command } from "../types";
import prettyMilliseconds from "pretty-ms";

export const UptimeCommand: Command = {
    metadata: new SlashCommandBuilder()
        .setName("uptime")
        .setDescription("Shows how long the bot has been running.")
        .toJSON(),
    async execute(interaction) {
        await interaction.reply({
            content: `The bot has been running for: ${inlineCode(prettyMilliseconds(interaction.client.uptime, { verbose: true }))}`,
            ephemeral: true
        });
    }
}