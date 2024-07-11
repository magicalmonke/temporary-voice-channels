import { type Client, Events } from "discord.js";
import { logger } from "../../main";
import type { Listener } from "../types";
import { commands } from "./InteractionCreateListener";

export const ClientReadyListener: Listener = {
	event: Events.ClientReady,
	once: true,
	execute: async (client: Client<true>) => {
		logger.info(`Ready! Logged in as ${client.user.tag}`);

		if (process.env.REGISTER_DISCORD_COMMANDS?.toLowerCase() === "true") {
			logger.info("Registering slash commands...");
			await client.application.commands.set(
				commands.map((command) => command.metadata),
			);
		}
	},
};
