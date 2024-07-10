import { Events, Interaction } from "discord.js";
import { Listener } from "../types";
import { UptimeCommand } from "../commands/UptimeCommand";
import { logger } from "../../main";

export const commands = [UptimeCommand];

export const InteractionCreateListener: Listener = {
    event: Events.InteractionCreate,
    execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            const command = commands.find(command => command.metadate.name === interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                logger.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        }
    }
}