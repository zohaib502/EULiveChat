'use strict';
var ConversationLogController = require("../comed/controller/conversationLog");

module.exports = {
    metadata: () => ({
        name: 'conversationLog',
        properties: {
            email: { required: true, type: 'string' },
            idcsHostName: { required: true, type: 'string' },
            clientId: { required: true, type: 'string' },
            clientSecret: { required: true, type: 'string' },
            scopeUrl: { required: true, type: 'string' },
            odaHostName: { required: true, type: 'string' },
            username: { required: true, type: 'string' }
        },
        supportedActions: ['Success', 'Fail', 'Invalid', 'DefaultErrorHandler']
    }),
    invoke: (conversation, done) => {
        // perform conversation tasks.
        let session = {};
        session.email = conversation.properties().email;
        session.idcsHostName = conversation.properties().idcsHostName;
        session.clientId = conversation.properties().clientId;
        session.clientSecret = conversation.properties().clientSecret;
        session.scopeUrl = conversation.properties().scopeUrl;
        session.odaHostName = conversation.properties().odaHostName;
        session.sessionId = conversation.sessionId();
        session.username = conversation.properties().username;
        
        conversation.logger().info("Input parameter values: Email: " + session.email + " ,SessionId: "+ session.sessionId);

        new ConversationLogController().run(session, conversation, done, function (session) {
            if (session.emailValidation) {
                if (session.emailSent) {
                    conversation.transition('Success');
                    done();
                } else {
                    conversation.transition('Fail')
                    done();
                }
            } else {
                conversation.transition('Invalid');
                done();
            }
        });
    }
};
