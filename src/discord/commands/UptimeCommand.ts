import { SlashCommandBuilder } from "discord.js";
import { Command } from "../types";
import prettyMilliseconds from "pretty-ms";

export const UptimeCommand: Command = {
    metadate: new SlashCommandBuilder()
        .setName("uptime")
        .setDescription("Check the bot's uptime")
        .toJSON(),
    async execute(interaction) {
        await interaction.reply({
            content: `The bot has been running for: ${prettyMilliseconds(interaction.client.uptime, { verbose: true })}`,
            ephemeral: true
        });
    }
}