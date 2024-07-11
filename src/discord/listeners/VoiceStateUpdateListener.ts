import { ChannelType, Collection, Events, inlineCode, userMention, type VoiceState } from "discord.js";
import type { Listener } from "../types";
import { prisma } from "../../main";
import { TemplateChannelType } from "@prisma/client";
import prettyMilliseconds from "pretty-ms";

export const temporaryChannels = new Collection<string, { owner: string, type: TemplateChannelType, createdAt: number}>();

export const VoiceStateUpdateListener: Listener = { // TODO: It works, but it's not perfect yet
    event: Events.VoiceStateUpdate,
    execute: async (oldState: VoiceState, newState: VoiceState) => {
        const guild = newState.guild;
        const member = newState.member;
        if (!member) {
            return;
        }

        const guildRecord = await prisma.guild.findUnique({
            where: { id: guild.id },
            include: {
                templateChannels: true,
            }
        });

        if (oldState.channelId) {
            const temporaryChannel = temporaryChannels.get(oldState.channelId);
            if (temporaryChannel) {
                if (oldState.channel?.members.size === 0){
                    oldState.channel.delete();
                    temporaryChannels.delete(oldState.channelId);

                    if (guildRecord && guildRecord.logChannelId !== null) {
                        const logChannel = newState.guild.channels.cache.get(guildRecord.logChannelId);
                        if (logChannel?.isTextBased()) {
                            await logChannel.send({
                                content: `The temporary channel of ${userMention(member.id)} has been deleted after ${inlineCode(prettyMilliseconds(Date.now() - temporaryChannel.createdAt, { verbose: true }))} because it was empty.`,
                            });
                        }
                    }
                }
            }
        }

        if (!guildRecord || !newState.channel) {
            return;
        }

        const templateChannel = guildRecord.templateChannels.find((channel) => channel.id === newState.channelId);
        if (templateChannel) {
            const templateChannelType = templateChannel.type;
            switch (templateChannelType) {
                case TemplateChannelType.DEFAULT: {
                    const newTemporaryChannel = await guild.channels.create({
                        name: `${newState.member.user.username}'s Channel`,
                        type: ChannelType.GuildVoice,
                        parent: newState.channel?.parent,
                    });

                    await newState.setChannel(newTemporaryChannel);

                    temporaryChannels.set(newTemporaryChannel.id, {
                        owner: newState.member.id,
                        type: TemplateChannelType.DEFAULT,
                        createdAt: Date.now(),
                    });

                    if (guildRecord.logChannelId !== null) {
                        const logChannel = newState.guild.channels.cache.get(guildRecord.logChannelId);
                        if (logChannel?.isTextBased()) {
                            await logChannel.send({
                                content: `The temporary channel of ${userMention(member.id)} has been created.`,
                            });
                        }
                    }

                    break;
                } case TemplateChannelType.CLONE: {
                    const newTemporaryChannel = await guild.channels.create({
                        name: newState.channel.name,
                        type: ChannelType.GuildVoice,
                        parent: newState.channel?.parent,
                        userLimit: newState.channel.userLimit,
                        nsfw: newState.channel.nsfw,
                    });

                    await newState.setChannel(newTemporaryChannel);

                    temporaryChannels.set(newTemporaryChannel.id, {
                        owner: newState.member.id,
                        type: TemplateChannelType.CLONE,
                        createdAt: Date.now(),
                    });

                    if (guildRecord.logChannelId !== null) {
                        const logChannel = newState.guild.channels.cache.get(guildRecord.logChannelId);
                        if (logChannel?.isTextBased()) {
                            await logChannel.send({
                                content: `The temporary channel of ${userMention(member.id)} has been created.`,
                            });
                        }
                    }

                    break;
                }
            }
        }
    }
}