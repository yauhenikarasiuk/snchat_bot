// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Import required packages
const restify = require('restify');
const cometdLib = require('cometd');
require('cometd-nodejs-client').adapt();
var cometd = new cometdLib.CometD();

// Import required bot services. See https://aka.ms/bot-services to learn more about the different parts of a bot.
const {
    BotFrameworkAdapter,
    ConversationState,
    MemoryStorage,
    UserState
} = require('botbuilder');

const {
    SNBot
} = require('./bot');

const adapter = new BotFrameworkAdapter({
    appId: process.env.microsoftAppID,
    appPassword: process.env.microsoftAppPassword,
    channelService: process.env.ChannelService,
    openIdMetadata: process.env.BotOpenIdMetadata
});
// Catch-all for any unhandled errors in your bot.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${ error }`);
    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong!`);
    // Clear out state
    await conversationState.clear(context);
    // Save state changes.
    await conversationState.saveChanges(context);
};

// Define a state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state store to persist the dialog and user state between messages.

// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);
// Create the main dialog.
const bot = new SNBot(conversationState, userState);
bot.setMBFAdapter(adapter);

// Create HTTP server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open echoBot-with-counter.bot file in the Emulator`);
});

// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // route to main dialog.
        await bot.onTurn(context);
    });
});
// Optionally, obtain an extension and register it.
var TimeStampExtension = require('cometd/TimeStampExtension');
cometd.registerExtension('timestamp', new TimeStampExtension());

// Configure the CometD object.
cometd.configure({
    url: 'https://petrofacdev.service-now.com/amb',
    logLevel: 'debug'
});
// Handshake with the server
cometd.handshake(function(h) {
    if (h.successful) {
        var xhr = this.getTransport().newXMLHttpRequest();
        // Copy external context, to be used in other environments.
        xhr.open('POST', this.getURL().replace('amb', 'login.do'), false);
        var headers = this.getConfiguration().requestHeaders;
        for (var headerName in headers) {
            xhr.setRequestHeader(headerName, headers[headerName]);
        }
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {
            cometd.subscribe('/connect/e6b09fb4db3bd30082e2f78eaf9619ed', function(m) {
                bot.AMBReceived(m);
            });
            cometd.subscribe('/connect/message/e6b09fb4db3bd30082e2f78eaf9619ed', function(m) {
                bot.AMBReceived(m);
            });
        };
        xhr.send('user_name=yauheni_karasiuk%40epam.com&user_password=49Banimu&sys_action=sysverb_login');
    }
});