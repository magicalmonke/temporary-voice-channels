import { Collection, Events, Interaction } from "discord.js";
import { Listener } from "../types";
import { UptimeCommand } from "../commands/UptimeCommand";
import { logger } from "../../main";

export const commands = [UptimeCommand];
const cooldowns: Collection<string, Collection<string, number>> = new Collection();

export const InteractionCreateListener: Listener = {
    event: Events.InteractionCreate,
    execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            const command = commands.find(command => command.metadata.name === interaction.commandName);
            if (!command) return;

            if (!cooldowns.has(command.metadata.name)) {
                cooldowns.set(command.metadata.name, new Collection());
            }

            const now = Date.now();
            const timestamps = cooldowns.get(command.metadata.name);
            const defaultCooldownDuration = 3;
            const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000; // 3 seconds default

            if (timestamps && timestamps.has(interaction.user.id)) {
                const expirationTime = (timestamps?.get(interaction.user.id) ?? 0) + cooldownAmount;
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    interaction.reply({ content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.metadata.name}\` command.`, ephemeral: true });
                    return; // Do not execute the command
                }
            }

            timestamps?.set(interaction.user.id, now);

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