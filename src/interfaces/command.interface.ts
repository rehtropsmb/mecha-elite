import { Message, User } from 'discord.js';

export interface Command {
    // command aliases
    aliases: string[];
    // execution functions
    discordExecute?: Function;
    twitchExecute?: Function;
    discordInteraction?: Function;
    // help text
    description: string[];
    arguments: string[];
    examples: string[];
}

export interface DiscordArgs {
    command: string;
    args: string;
    message: Message;
    user: User;
}

export interface TwitchArgs {
    command: string;
    args: string;
    reply: Function;
    user: string;
    channel: string;
}
