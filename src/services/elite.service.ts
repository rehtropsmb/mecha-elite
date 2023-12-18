import { injectable } from 'inversify';
import 'reflect-metadata';
import { Client, TextChannel } from 'discord.js';
import { BoardSubmission, RecentSubmission } from '../interfaces/elite.interface';

@injectable()
export class EliteService {

    private curr_records: string[] = [];

    private discordClient: Client;

    public async init(discordClient: Client) {
        this.discordClient = discordClient;

        // set-up records which were already posted
        const body: any[] = await this.getRecent();
        this.curr_records = body.map(value => value.id);

        const schedule = require('node-schedule');
        schedule.scheduleJob('*/1 * * * *', async () => {

            const body: RecentSubmission[] = await this.getRecent();
            for (const upload of body) {
                if (this.curr_records.includes(upload.id)) { continue; }
                const body = {
                    game: upload.level.mode.game.abb,
                    category_name: upload.level.category,
                    is_score: upload.score,
                    level: upload.level.name,
                };
            
                const response = await fetch(
                    'https://dtexopnygapvstzdhwai.supabase.co/rest/v1/rpc/get_chart_submissions',
                    {
                        method: 'post',
                        body: JSON.stringify(body),
                        headers: {
                            'Content-Type': 'application/json',
                            Apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0ZXhvcG55Z2FwdnN0emRod2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTU3NDE0MzEsImV4cCI6MTk3MTMxNzQzMX0.tcxPv7bNJxHlaT8F8G7wmBvTVJCZsUxNqjUgp4EZN7g',
                        },
                    }
                );
                const data: BoardSubmission[] =await response.json() as BoardSubmission[];
                for (const record of data) {
                    if (upload.id !== record.id) { continue; }
                    let medal;
                    if (record.medal === 'platinum') {
                        medal = `${this.getEmoji('platinum')} Platinum`;
                    }
                    else if (record.medal === 'gold') {
                        medal = `${this.getEmoji('gold')} Gold`;
                    }
                    else {
                        break;
                    }
                    const channel = discordClient.channels.cache.get('1186065103880192084') as TextChannel;
                    channel.send(`**${this.stringToName(upload.level.name)}**\n**${upload.score ? upload.record : Math.abs(upload.record).toFixed(2)}** by [${upload.profile.username}](<https://www.smbelite.net/user/${upload.profile.id}>)\n**${medal}** on [SMB Elite](<https://smbelite.net/games/${upload.level.mode.game.abb}/${upload.level.category}/${upload.score ? 'score' : 'time'}/${upload.level.name}>)\n${upload.proof}`);
                    break;
                }
            }

            this.curr_records = body.map(value => value.id);
        });
    }

    private async getRecent(): Promise<RecentSubmission[]> {

        const response = await fetch('https://dtexopnygapvstzdhwai.supabase.co/rest/v1/submission?select=all_position%2Cid%2Clevel%28category%2Cmode%28game%28abb%2Cname%29%29%2Cname%2Ctimer_type%29%2Cposition%2Cprofile%28country%2Cid%2Cusername%29%2Cproof%2Crecord%2Cscore%2Ctas&offset=0&limit=10&order=id.desc', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0ZXhvcG55Z2FwdnN0emRod2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTU3NDE0MzEsImV4cCI6MTk3MTMxNzQzMX0.tcxPv7bNJxHlaT8F8G7wmBvTVJCZsUxNqjUgp4EZN7g`,
                'Apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0ZXhvcG55Z2FwdnN0emRod2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTU3NDE0MzEsImV4cCI6MTk3MTMxNzQzMX0.tcxPv7bNJxHlaT8F8G7wmBvTVJCZsUxNqjUgp4EZN7g'
            }
        });

        const body = await response.json() as RecentSubmission[];
        if (!body) {
            throw new Error(`Stuff went wrong with the search!`);
        }

        body.reverse();
        return body;
    }

    private getEmoji(name: string): string {
        return `${this.discordClient.emojis.cache.find(emoji => emoji.name === name)}`;
    }

    private stringToName(string: String) {
        let name = string.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
        });

        return name;
    }
}
