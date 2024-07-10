import { ClientEvents, CommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";

export interface Listener {
    event: keyof ClientEvents;
    once?: boolean;
    execute(...args: unknown[]): Promise<void> | void;
}

export interface Command {
    metadata: RESTPostAPIChatInputApplicationCommandsJSONBody;
    cooldown?: number;
    execute(interaction: CommandInteraction): Promise<void>;
}