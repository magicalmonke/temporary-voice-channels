import { Client, Events } from "discord.js";
import { Listener } from "../types";
import { logger } from "../../main";

export const ClientReadyListener: Listener = {
    event: Events.ClientReady,
    once: true,
    execute: async (client: Client<true>) => {
        logger.info(`Ready! Logged in as ${client.user.tag}`);
    },
};