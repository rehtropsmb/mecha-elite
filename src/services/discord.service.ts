import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import {
    Client,
    Events,
    IntentsBitField,
} from 'discord.js';
import { EnvService } from './env.service';
import { EliteService } from './elite.service';

@injectable()
export class DiscordService {
    private envService: EnvService;
    private eliteService: EliteService;
    constructor(
        @inject(EnvService) envService,
        @inject(EliteService) eliteService,
    ) {
        this.envService = envService;
        this.eliteService = eliteService;
    }

    public async init(): Promise<void> {
        const client = new Client({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.DirectMessages,
            ],
        });

        client.login(this.envService.discordToken);

        client.on(Events.ClientReady, () => {
            console.log('Discord Client Connected');
            this.eliteService.init(client);
        });
    }
}
