const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });


const token = 'MTI5NDkzODk2OTI4MDM1MjMxNw.GY1qs8.rUofpwr7iK-h85dQMLqYaBC8chrg_WW0ISqbiA';


const siteUrl = 'https://minelaunched.fr';


const uptimeRobotUrl = 'https://stats.uptimerobot.com/api/getMonitorList/g8zlgHlEkE';


let lastSiteStatus = null;
let lastServicesStatus = null;


const statusFilePath = path.join(__dirname, 'status.json');


function readStatusFile() {
    if (fs.existsSync(statusFilePath)) {
        const data = fs.readFileSync(statusFilePath, 'utf8');
        return JSON.parse(data);
    }
    return { lastMessageId: null };
}


function writeStatusFile(data) {
    fs.writeFileSync(statusFilePath, JSON.stringify(data, null, 2));
}


let { lastMessageId } = readStatusFile();


async function checkSiteStatus() {
    try {
        const response = await axios.get(siteUrl);
        return response.status === 200 ? '✅' : '❌'; 
    } catch (error) {
        return '❌'; 
    }
}

async function checkServicesStatus() {
    try {
        const response = await axios.get(uptimeRobotUrl);
        const status = response.data.status === 'ok' ? '✅' : '❌';
        return status;
    } catch (error) {
        return '❌'; 
    }
}


async function createStatusEmbed(siteStatus, servicesStatus) {
    const color = siteStatus === '✅' && servicesStatus === '✅' ? 0x00FF00 : 0xFF0000; // Vert si tout est OK, sinon rouge

    const embed = new EmbedBuilder()
        .setTitle('Mise à jour des statuts')
        .setDescription('Voici les statuts actuels du site et des services.')
        .addFields(
            { name: 'Statut du site', value: siteStatus, inline: true },
            { name: 'Statut des services', value: servicesStatus, inline: true }
        )
        .setColor(color)  
        .setTimestamp()  
        .setFooter({ text: 'Mise à jour automatique', iconURL: 'https://www.bcs-36.fr/test-launcher/t%c3%a9l%c3%a9charg%c3%a9.jpg' }); 

    return embed;
}


async function refreshStatus(channel) {
    const siteStatus = await checkSiteStatus();
    const servicesStatus = await checkServicesStatus();


    if (siteStatus !== lastSiteStatus || servicesStatus !== lastServicesStatus) {
        lastSiteStatus = siteStatus;
        lastServicesStatus = servicesStatus;

        const embed = await createStatusEmbed(siteStatus, servicesStatus);

        if (lastMessageId) {

            const lastMessage = await channel.messages.fetch(lastMessageId).catch(() => null);

            if (lastMessage) {
                await lastMessage.edit({ embeds: [embed] });
            } else {

                const newMessage = await channel.send({ embeds: [embed] });
                lastMessageId = newMessage.id;
                writeStatusFile({ lastMessageId }); 
            }
        } else {

            const newMessage = await channel.send({ embeds: [embed] });
            lastMessageId = newMessage.id;
            writeStatusFile({ lastMessageId }); 
        }
    }
}


client.once('ready', () => {
    console.log('Bot prêt !');


    const channel = client.channels.cache.get('1161990833189441571');
    if (channel) {

        refreshStatus(channel);


        setInterval(() => {
            refreshStatus(channel);
        }, 60000); 
    } else {
        console.log('Canal non trouvé. Vérifie l\'ID du canal.');
    }
});


client.on('messageCreate', async (message) => {
    if (message.content === './*!statut') {
        const siteStatus = await checkSiteStatus();
        const servicesStatus = await checkServicesStatus();

        const embed = await createStatusEmbed(siteStatus, servicesStatus);
        const sentMessage = await message.channel.send({ embeds: [embed] });


        lastMessageId = sentMessage.id;
        writeStatusFile({ lastMessageId }); 
    }
});


client.login(token);
