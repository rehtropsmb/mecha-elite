import { Client, Events, IntentsBitField, TextChannel } from 'discord.js';
import * as dotenv from 'dotenv';
import {
    BoardSubmission,
    RecentSubmission,
} from './interfaces/elite.interface';

// Don't end program when uncaught exception occurs
process.on('uncaughtException', (error) => {
    console.log(error.stack);
});

// prepare env vars
dotenv.config();

// create discord client
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages,
    ],
});
const getRecent = async (): Promise<RecentSubmission[]> => {
    const submissionCount = 10;
    const response = await fetch(
        `https://dtexopnygapvstzdhwai.supabase.co/rest/v1/submission?select=all_position%2Cid%2Clevel%28category%2Cmode%28game%28abb%2Cname%29%29%2Cname%2Ctimer_type%29%2Cposition%2Cprofile%28country%2Cid%2Cusername%29%2Cproof%2Crecord%2Cscore%2Ctas&offset=0&limit=${submissionCount}&order=id.desc`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0ZXhvcG55Z2FwdnN0emRod2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTU3NDE0MzEsImV4cCI6MTk3MTMxNzQzMX0.tcxPv7bNJxHlaT8F8G7wmBvTVJCZsUxNqjUgp4EZN7g`,
                Apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0ZXhvcG55Z2FwdnN0emRod2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTU3NDE0MzEsImV4cCI6MTk3MTMxNzQzMX0.tcxPv7bNJxHlaT8F8G7wmBvTVJCZsUxNqjUgp4EZN7g',
            },
        }
    );

    const body = (await response.json()) as RecentSubmission[];
    if (!body) {
        throw new Error(`Stuff went wrong with the search!`);
    }

    body.reverse();
    return body;
};

const getEmoji = (name: string): string => {
    return `${client.emojis.cache.find((emoji) => emoji.name === name)}`;
};

const stringToName = (string: String) => {
    let name = string.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });

    return name;
};

client.login(process.env.DISCORD_BOT_TOKEN);

client.on(Events.ClientReady, async () => {
    console.log('Discord Client Connected');
    // setup recent records list
    let curr_records: RecentSubmission[] = await getRecent();
    let curr_proofs: string[] = [];
    console.log('Pulled current records from smb-elite');
    const schedule = require('node-schedule');
    schedule.scheduleJob('*/2 * * * *', async () => {
        const body: RecentSubmission[] = await getRecent();
        for (const upload of body) {
            // skip upload if not new
            if (curr_records.some((element) => element.id === upload.id)) {
                continue;
            }
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
            const data: BoardSubmission[] =
                (await response.json()) as BoardSubmission[];

            // loop thru all submissions on stage board
            for (const submission of data) {
                // if upload and submission aren't the same, skip
                if (upload.id !== submission.id) {
                    continue;
                }
                let medal;
                if (submission.medal === 'platinum') {
                    medal = `${getEmoji('platinum')} Platinum`;
                } else if (submission.medal === 'gold') {
                    medal = `${getEmoji('gold')} Gold`;
                } else {
                    break;
                }
                const abb = upload.level.mode.game.abb;
                let channelId = '';
                switch (abb) {
                    case 'smb1':
                    case 'smb2':
                    case 'smb2pal':
                    case 'smbdx':
                    case 'smba':
                    // case 'smbjr': 
                    {
                        // Main Games
                        channelId = '1186463794201890856'; // smb elite
                        // channelId = '1186065103880192084'; // test
                        break;
                    }
                    case 'bm': 
                    case 'bbhd': 
                    case 'br': 
                    {
                        // Banana Era
                        channelId = '1188903356496871535'; // smb elite
                        // channelId = '1186065103880192084'; // test
                        break;
                    }
                    case '651':
                    case 'gaiden': 
                    case 'launch': 
                    case 'invasion': 
                    case 'stardust': 
                    case 'smbp': 
                    case 'bbsbv4': 
                    case 'hgs':
                    {
                        // Custom Games
                        channelId = '1186463937873588244'; // smb elite
                        // channelId = '1186065103880192084'; // test
                        break;
                    }
                    default: {
                        console.log(`Game ${abb} not supported!`);
                        break;
                    }
                }
                
                if (channelId) {
                    const channel = client.channels.cache.get(
                        channelId
                    ) as TextChannel;
    
                    const gameName = upload.level.mode.game.name;
                    const stageName = stringToName(upload.level.name);
                    const record = upload.score
                        ? upload.record
                        : (abb === 'br' ? Math.abs(upload.record).toFixed(3) : Math.abs(upload.record).toFixed(2));
                    let recordLink = upload.proof
                        .replace('//twitter.com', '//fxtwitter.com')
                        .replace('//x.com', '//fixupx.com');
                    let dup = '';
    
                    if (curr_proofs.includes(upload.proof)) {
                        recordLink = `<${recordLink}>`;
                        dup = `[*Duplicate Video Submission*]`;
                    }
                    const username = upload.profile.username;
                    const usernameLink = `https://www.smbelite.net/user/${upload.profile.id}`;
                    const leaderboardLink = `https://smbelite.net/games/${
                        upload.level.mode.game.abb
                    }/${upload.level.category}/${upload.score ? 'score' : 'time'}/${
                        upload.level.name
                    }`;
                    channel.send(
                        `**${gameName}**\n${stageName}\n**[${record}](${recordLink})** by [${username}](<${usernameLink}>) | **${medal}** on [SMB Elite](<${leaderboardLink}>)\n${dup}`
                    );
                    console.log(
                        `${stageName} | ${record} | ${username} | ${upload.id}`
                    );
                }

                // log proof to track future duplicates
                curr_proofs.push(upload.proof);
                while (curr_proofs.length > 10) {
                    curr_proofs.shift();
                }
                break;
            }
        }

        curr_records = body;
    });
    console.log('Activated Schedule');
});
