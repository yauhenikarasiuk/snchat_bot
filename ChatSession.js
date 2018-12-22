// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is your bot's main entry point to handle incoming activities.
const {
    TurnContext
} = require('botbuilder');
const request = require('request');
const credentials = {
    client: {
        id: process.env.sn_client_id,
        secret: process.env.sn_secret_key
    },
    auth: {
        tokenHost: 'https://petrofacdev.service-now.com',
        authorizePath: '/oauth_auth.do'
    }
};

// Initialize the OAuth2 Library
const oauth2 = require('simple-oauth2').create(credentials);

const authorizationUri = oauth2.authorizationCode.authorizeURL({
    redirect_uri: '',
    scope: '', // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
    state: 'servicenowoauth'
});
class ChatSession {
    constructor(context) {
        this.user_id = context.activity.from.id;
        this.botReference = TurnContext.getConversationReference(context.activity);
        this.auth = this.getAuth(context);
    }
    getAuth(context) {
        context.sendActivity(authorizationUri);
    }
    getChat(context) {
        request.get({
            url: 'https://petrofacdev.service-now.com/api/now/connect/support/queues/f4d701b1b3900300f7d1a13816a8dc8e/sessions',
            headers: {
                Authorization: 'Basic eWF1aGVuaV9rYXJhc2l1a0BlcGFtLmNvbTo0OUJhbmltdQ=='
            }
        }, function(response) {
            console.log(response);
        });
    }
}
exports.ChatSession = ChatSession;
