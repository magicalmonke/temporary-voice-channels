import { Client, Events } from "discord.js";
import { Listener } from "../types";

export const ClientReadyListener: Listener = {
    event: Events.ClientReady,
    once: true,
    execute: async (client: Client<true>) => {
        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};