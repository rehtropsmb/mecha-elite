import { Container } from 'inversify';
import { DiscordService } from './discord.service';
import { EnvService } from './env.service';
import { EliteService } from './elite.service';

const container = new Container();
container.bind<EnvService>(EnvService).toSelf();
container.bind<DiscordService>(DiscordService).toSelf().inSingletonScope();
container.bind<EliteService>(EliteService).toSelf().inSingletonScope();

export default container;
