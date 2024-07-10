import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config";
import { ClientReadyListener } from "./discord/listeners/ClientReadyListener";
import { Logger } from "tslog";
import { InteractionCreateListener } from "./discord/listeners/InteractionCreateListener";

export const logger = new Logger();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const listeners = [ClientReadyListener, InteractionCreateListener];
for (const listener of listeners) {
    if (listener.once) {
        client.once(listener.event, listener.execute);
    } else {
        client.on(listener.event, listener.execute);
    }
}

client.login(process.env.DISCORD_TOKEN);