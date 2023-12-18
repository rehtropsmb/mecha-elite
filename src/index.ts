import container from './services/container';
import { DiscordService } from './services/discord.service';
import { EnvService } from './services/env.service';

// Don't end program when uncaught exception occurs
process.on('uncaughtException', (error) => {
    console.log(error.stack);
});

// load env variables
const envService: EnvService = container.get<EnvService>(EnvService);
envService.init();

// connect to discord
const discordService: DiscordService =
    container.get<DiscordService>(DiscordService);
discordService.init();
