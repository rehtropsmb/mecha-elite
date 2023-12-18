import { injectable } from 'inversify';
import 'reflect-metadata';
import * as dotenv from 'dotenv';

@injectable()
export class EnvService {
    public init() {
        dotenv.config();
    }

    public get discordClientId(): string {
        return process.env.DISCORD_CLIENT_ID;
    }

    public get discordToken(): string {
        return process.env.DISCORD_BOT_TOKEN;
    }

    public get twitchUsername(): string {
        return process.env.TWITCH_USERNAME;
    }

    public get twitchClientId(): string {
        return process.env.TWITCH_CLIENT_ID;
    }

    public get twitchToken(): string {
        return process.env.TWITCH_ACCESS_TOKEN;
    }
}
