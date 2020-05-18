'use strict';

let utility = require("../utilities/utility");
let Utility = new utility();

module.exports = {
    metadata: () => ({
        name: 'userLogin',
        properties: {
            accountnumber: { required: true, type: 'string' },
            token: {required: true, type: 'string'},
            sessionId:  {required: true, type: 'string'}
        },
        supportedActions: ['Success', 'Fail']
    }),
    invoke: (conversation, done) => {
        // perform conversation tasks.

        let session = {};
        session.account_number = conversation.properties().accountnumber;
        session.token = conversation.properties().token;
        session.sessionId = conversation.properties().sessionId;

        conversation.logger().info("**************User Login Component*****************");
        conversation.logger().info("Input parameter values: account_num: " + session.account_number + " ,token: " + session.token + " ,sessionId: " + session.sessionId);


        let loginCheck = Utility.userLoginCheck(session.account_number,session.token,session.sessionId);
       
        if(loginCheck){
            conversation.transition('Success');
            done();
        } else {
            conversation.transition('Fail');
            done();
        }
    }
};
