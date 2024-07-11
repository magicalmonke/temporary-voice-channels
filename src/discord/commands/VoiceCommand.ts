import { type ChatInputCommandInteraction, SlashCommandBuilder, channelMention, inlineCode, userMention } from "discord.js";
import type { Command } from "../types";
import { temporaryChannels } from "../listeners/VoiceStateUpdateListener";
import { TemplateChannelType } from "@prisma/client";
import { prisma } from "../../main";

export const VoiceCommand: Command = {
	metadata: new SlashCommandBuilder()
    .setName("voice")
    .setDescription("Commands for managing voice channels.")
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
        subcommand
            .setName("name")
            .setDescription("Change the channel name to your preferred name.")
            .addStringOption(option =>
                option
                    .setName("name")
                    .setDescription("Enter the new channel name.")
                    .setRequired(true),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("limit")
            .setDescription("Adjust the maximum number of users in the channel.")
            .addIntegerOption(option =>
                option
                    .setName("limit")
                    .setDescription("Specify the user limit for the channel.")
                    .setRequired(true)
                    .setMinValue(2)
                    .setMaxValue(99),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("claim")
            .setDescription("Take ownership of the channel if the previous owner has left."),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("nsfw")
            .setDescription("Toggle NSFW status for the channel on or off."),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("transfer")
            .setDescription("Transfer ownership of the channel to another user.")
            .addUserOption(option =>
                option
                    .setName("user")
                    .setDescription("Select the user to transfer ownership to.")
                    .setRequired(true),
            ),
    )
    .toJSON(),
	async execute(interaction: ChatInputCommandInteraction) { // TODO: It works, but it's not perfect yet
        // biome-ignore lint/style/noNonNullAssertion: DM permission is set to false
        const guild = interaction.guild!;
        const guildRecord = await prisma.guild.findUnique({
            where: { id: guild.id },
            include: {
                templateChannels: true,
            }
        });

        function logSomething(message: string) { // This is a helper function
            if (guildRecord && guildRecord.logChannelId !== null) {
                const logChannel = guild.channels.cache.get(guildRecord.logChannelId);
                if (logChannel?.isTextBased()) {
                    logChannel.send({
                        content: message,
                    });
                }
            }
        }

        const user = interaction.user;
        const member = guild.members.cache.get(user.id);
        if (!member) {
            return; // User is not in the guild for some reason
        }

        if (member.voice.channelId === null) { // User is not in a voice channel
            await interaction.reply({
                content: "You have to be in a voice channel to use this command.",
                ephemeral: true,
            });
            return;
        }

        const temporaryChannel = temporaryChannels.get(member.voice.channelId);

        if (!temporaryChannel) { // User is not in a temporary channel
            await interaction.reply({
                content: "You can only use this command in a temporary channel.",
                ephemeral: true,
            });
            return;
        }

        // Some checks for the subcommands
        const userIsOwner = temporaryChannel.owner === member.id;
        const temporaryChannelTypeIsDefault = temporaryChannel.type === TemplateChannelType.DEFAULT;
        const ownerIsInChannel = member.voice.channel?.members.some(member => member.id === temporaryChannel.owner);

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "name": {
                if (!userIsOwner) {
                    await interaction.reply({
                        content: "You have to be the owner of the channel to change the name.",
                        ephemeral: true,
                    });
                    return;
                }

                if (!temporaryChannelTypeIsDefault) {
                    await interaction.reply({
                        content: "You can only change the name of a default channel.",
                        ephemeral: true,
                    });
                    return;
                }

                const name = interaction.options.getString("name", true);
                await member.voice.channel?.setName(name);

                logSomething(`The channel name of ${channelMention(member.voice.channelId)} has been changed to ${inlineCode(name)}.`);

                await interaction.reply({
                    content: `The channel name has been changed to ${inlineCode(name)}.`,
                    ephemeral: true,
                });

                break;
            } case "limit": {
                if (!userIsOwner) {
                    await interaction.reply({
                        content: "You have to be the owner of the channel to change the user limit.",
                        ephemeral: true,
                    });
                    return;
                }

                if (!temporaryChannelTypeIsDefault) {
                    await interaction.reply({
                        content: "You can only change the user limit of a default channel.",
                        ephemeral: true,
                    });
                    return;
                }

                const limit = interaction.options.getInteger("limit", true);
                await member.voice.channel?.setUserLimit(limit);

                logSomething(`The user limit of ${channelMention(member.voice.channelId)} has been changed to ${inlineCode(limit.toString())}.`);

                await interaction.reply({
                    content: `The user limit has been changed to ${inlineCode(limit.toString())}.`,
                    ephemeral: true,
                });

                break;
            } case "claim": {
                if (userIsOwner) {
                    await interaction.reply({
                        content: "You are already the owner of the channel.",
                        ephemeral: true,
                    });
                    return;
                }

                if (ownerIsInChannel) {
                    await interaction.reply({
                        content: "The owner is still in the channel.",
                        ephemeral: true,
                    });
                    return;
                }

                temporaryChannels.set(member.voice.channelId, {
                    owner: member.id,
                    type: temporaryChannel.type,
                    createdAt: temporaryChannel.createdAt,
                });

                logSomething(`${channelMention(member.voice.channelId)} has been claimed by ${userMention(member.id)}.`);

                await interaction.reply({
                    content: "You have claimed the channel.",
                    ephemeral: true,
                });

                break;
            } case "nsfw": {
                if (!userIsOwner) {
                    await interaction.reply({
                        content: "You have to be the owner of the channel to toggle NSFW status.",
                        ephemeral: true,
                    });
                    return;
                }

                await member.voice.channel?.setNSFW(!member.voice.channel?.nsfw);

                logSomething(`The NSFW status of ${channelMention(member.voice.channelId)} has been toggled ${member.voice.channel?.nsfw ? "off" : "on"}.`);

                await interaction.reply({
                    content: `The NSFW status has been toggled ${member.voice.channel?.nsfw ? "off" : "on"}.`,
                    ephemeral: true,
                });

                break;
            } case "transfer": {
                if (!userIsOwner) {
                    await interaction.reply({
                        content: "You have to be the owner of the channel to transfer ownership.",
                        ephemeral: true,
                    });
                    return;
                }

                const user = interaction.options.getUser("user", true);
                const newOwner = guild.members.cache.get(user.id);

                if (!newOwner) {
                    await interaction.reply({
                        content: "The user is not in the guild.",
                        ephemeral: true,
                    });
                    return;
                }

                if (!member.voice.channel?.members.some(member => member.id === newOwner.id)) {
                    await interaction.reply({
                        content: "The user is not in the channel.",
                        ephemeral: true,
                    });
                    return;
                }

                temporaryChannels.set(member.voice.channelId, {
                    owner: newOwner.id,
                    type: temporaryChannel.type,
                    createdAt: temporaryChannel.createdAt,
                });

                logSomething(`${channelMention(member.voice.channelId)} has been transferred to ${userMention(newOwner.id)} by ${userMention(member.id)}.`);

                await interaction.reply({
                    content: `The channel has been transferred to ${newOwner.toString()}.`,
                    ephemeral: true,
                });

                break;
            }
        }
	},
};
