import { ClientEvents } from "discord.js";

export interface Listener {
    event: keyof ClientEvents;
    once?: boolean;
    execute(...args: unknown[]): Promise<void> | void;
}