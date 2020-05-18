'use strict';

let ChatSurveyController = require("../comed/controller/chatSurvey"); 

module.exports = {
    metadata: () => ({
        name: 'chatSurvey',
        properties: {
            rating: { required: true, type: 'int' },
            chatSurveyComments: {required: true, type: 'string'},
            email: {required: true, type: 'string'},
            feedBackHostName: {required: true, type: 'string'},
            ocpApimSubscriptionKey: {required: true, type: 'string'}
        },
        supportedActions: ['Success', 'Fail']
    }),
    invoke: (conversation, done) => {
        // perform conversation tasks.

        let session = {};
        session.rating = conversation.properties().rating;
        session.comments = conversation.properties().chatSurveyComments == '${chatSurveyComments.value}' ? "" : conversation.properties().chatSurveyComments;
        session.userName = conversation.properties().email == 'noemail@test.com' ? "" : conversation.properties().email;
        session.timestamp = new Date();
        session.ocpApimSubscriptionKey = conversation.properties().ocpApimSubscriptionKey;
        session.feedBackHostName = conversation.properties().feedBackHostName;

        conversation.logger().info("**************Chat Survey Component*****************");
        conversation.logger().info("Input parameter values: rating: " + session.rating + " ,comments: " + session.comments + " ,Email: " + session.userName + " ,Timestamp: " + session.timestamp);
        
        new ChatSurveyController().run(session,conversation,done, function(session){
            if(session.content == "True"){
                conversation.transition("Success");
                done();
            } else {
                conversation.transition("Fail");
                done();
            }
        }); 
    }
};
