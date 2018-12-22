// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is your bot's main entry point to handle incoming activities.

const {
    ActivityTypes,
    TurnContext
} = require('botbuilder');
const {
    ChatSession
} = require('./ChatSession');
// Turn counter property
const TURN_COUNTER_PROPERTY = 'turnCounterProperty';
const USER_PROFILE_PROPERTY = 'userProfile';

class SNBot {
    /**
     *
     * @param {ConversationState} conversation state object
     */
    constructor(conversationState, userState) {
        // Creates a new state accessor property.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors
        this.countProperty = conversationState.createProperty(TURN_COUNTER_PROPERTY);
        this.userProfile = userState.createProperty(USER_PROFILE_PROPERTY);
        this.conversationState = conversationState;
        this.userState = userState;
        this.sessions = [];
    }
    /**
     *
     * Use onTurn to handle an incoming activity, received from a user, process it, and reply as needed
     *
     * @param {TurnContext} on turn context object.
     */
    getSession(context) {
        var userId = context.activity.from.id;
        var session = null;
        this.sessions.forEach(element => {
            if (element.user_id === userId) {
                session = element;
            }
        });
        if (!session) {
            session = new ChatSession(context);
        }
        return session;
    }
    setMBFAdapter(adapter) {
        this.adapter = adapter;
    }
    processMessage(turnContext) {}
    processConversationUpdate(turnContext) {}
    async AMBReceived(message) {
        await this.adapter.continueConversation(this.references[0], async (context) => {
            await context.sendActivity(message.data.message);
        });
    }
    async onTurn(turnContext) {
        var session = this.getSession(turnContext);
        switch (turnContext.activity.type) {
            case ActivityTypes.Message:
                await turnContext.sendActivity(`You said "${ turnContext.activity.text }"`);
                break;
            case ActivityTypes.ConversationUpdate:
                await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
                this.references.push(TurnContext.getConversationReference(turnContext.activity));
                break;
        }
        // Save state changes
        await this.conversationState.saveChanges(turnContext);
    }
}
exports.SNBot = SNBot;