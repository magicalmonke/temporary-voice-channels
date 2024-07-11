import { type ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "../types";
import { prisma } from "../../main";
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
        // biome-ignore lint/style/noNonNullAssertion: It's an ChatInputCommandInteraction so it has a channel
        const channel = interaction.channel!;

        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "default": {
                await prisma.templateChannel.upsert({
                    where: { id: channel.id },
                    update: { type: TemplateChannelType.DEFAULT },
                    create: {
                        id: channel.id,
                        guild: {
                            connectOrCreate: {
                                where: { id: guild.id },
                                create: { id: guild.id }
                            }
                        },
                        type: TemplateChannelType.DEFAULT,
                    }
                });

                await interaction.reply({
                    content: "Default setup",
                    ephemeral: true,
                });

                break;
            }
            case "clone": {
                await prisma.templateChannel.upsert({
                    where: { id: channel.id },
                    update: { type: TemplateChannelType.CLONE },
                    create: {
                        id: channel.id,
                        guild: {
                            connectOrCreate: {
                                where: { id: guild.id },
                                create: { id: guild.id }
                            }
                        },
                        type: TemplateChannelType.CLONE,
                    }
                });

                await interaction.reply({
                    content: "Clone setup",
                    ephemeral: true,
                });

                break;
            }
        }
	},
};
