import { ChannelType, type ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "../types/index.js";
import { prisma } from "../../main.js";
import { TemplateChannelType } from "@prisma/client";

export const SetupCommand: Command = {
	metadata: new SlashCommandBuilder()
		.setName("setup")
		.setDescription("Setup channels to create temporary channels.")
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild) // TODO: Think about that one again at some point
        .addSubcommand((subcommand) =>
            subcommand
                .setName("default")
                .setDescription("Setup the default “Join To Create” channel")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("clone")
                .setDescription("Setup a clone “Join To Create” channel which is cloned when a user joins it")
        )
		.toJSON(),
        async execute(interaction: ChatInputCommandInteraction) {
            // biome-ignore lint/style/noNonNullAssertion: DM permission is set to false
            const guild = interaction.guild!;
            // biome-ignore lint/style/noNonNullAssertion: ChatInputCommandInteraction has to be in a channel
            const channel = interaction.channel!;

            if (channel.type !== ChannelType.GuildVoice) {
                await interaction.reply({
                    content: "Please select a voice channel.",
                    ephemeral: true,
                });
                return;
            }

            const subcommand = interaction.options.getSubcommand();
            const setupTemplateChannel = async (type: TemplateChannelType, message: string) => {
                await prisma.templateChannel.upsert({
                    where: { id: channel.id },
                    update: { type: type },
                    create: {
                        id: channel.id,
                        guild: {
                            connectOrCreate: {
                                where: { id: guild.id },
                                create: { id: guild.id }
                            }
                        },
                        type: type,
                    }
                });

                await interaction.reply({
                    content: message,
                    ephemeral: true,
                });
            };

            switch (subcommand) {
                case "default":
                    await setupTemplateChannel(TemplateChannelType.DEFAULT, "Default setup");
                    break;
                case "clone":
                    await setupTemplateChannel(TemplateChannelType.CLONE, "Clone setup");
                    break;
            }
        }
};
