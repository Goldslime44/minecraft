const { Client, GatewayIntentBits, Partials, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const TicketManager = require('./commands/tickets'); // Import du fichier ticket.js
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.DirectMessages // Important pour écouter les MP
    ],
    partials: [Partials.Channel] // Pour gérer les MP qui ne sont pas entièrement chargés
});

const { handleTicketCreation } = require('./commands/tickets');
const { refreshStatus, handleStatusCommand } = require('./commands/status');

const token = 'MTI5NDkzODk2OTI4MDM1MjMxNw.GY1qs8.rUofpwr7iK-h85dQMLqYaBC8chrg_WW0ISqbiA';

client.once('ready', () => {
    console.log('Bot prêt !');

    // Canal pour les mises à jour de statut
    const channel = client.channels.cache.get('1161990833189441571');
    if (channel) {
        // Vérifie et met à jour le statut chaque minute
        refreshStatus(channel);
        setInterval(() => {
            refreshStatus(channel);
        }, 60000); // 60 secondes
    }
});
client.once('ready', () => {
    console.log('pl ticket1 ok !');
client.on('interactionCreate', async interaction => {
    // Vérification si le bouton "Ouvrir un ticket" est cliqué
    if (interaction.isButton() && interaction.customId === 'open_ticket') {
        const modal = new ModalBuilder()
            .setCustomId('ticketModal')
            .setTitle('Ouvrir un ticket');

        const reasonInput = new TextInputBuilder()
            .setCustomId('ticketReason')
            .setLabel('Raison du ticket')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('Support, achat, thème, etc.');

        const descriptionInput = new TextInputBuilder()
            .setCustomId('ticketDescription')
            .setLabel('Décrivez votre problème')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setPlaceholder('Détaillez votre problème ici.');

        const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);
        const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);

        modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);
    }

    // Vérification si le modal est soumis
    if (interaction.isModalSubmit() && interaction.customId === 'ticketModal') {
        await TicketManager.handleTicketSubmission(interaction);
    }

    // Vérification si le bouton "Ticket pris en charge" est cliqué
    if (interaction.isButton() && interaction.customId === 'take_ticket') {
        await TicketManager.handleTakeTicket(interaction);
    }

    // Vérification si le bouton "Fermer le ticket" est cliqué
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await TicketManager.handleCloseTicket(interaction);
    }

    // Vérification si le bouton "Transcription" est cliqué
    if (interaction.isButton() && interaction.customId === 'transcript_ticket') {
        await TicketManager.handleTranscriptTicket(interaction);
    }

    // Vérification si le bouton "Fermeture complète" est cliqué
    if (interaction.isButton() && interaction.customId === 'delete_ticket') {
        await TicketManager.handleDeleteTicket(interaction);
    }
},
)});

client.login(token);