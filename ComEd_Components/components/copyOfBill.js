'use strict';
let utility = require("../utilities/utility");
let Utility = new utility();

module.exports = {
    metadata: () => ({
        name: 'copyOfBill',
        properties: {
            accountnumber: { required: true, type: 'string' },
            bdate: { required: true, type: 'string' },
            token: { required: true, type: 'string' },
            sessionId: { required: true, type: 'string' },
            fanResult: { required: true, type: 'string' },
            OracleMobileBackendID: {required: true, type: 'string'}
        },
        supportedActions: ['Success', 'Fail', 'UserNotLoggedIn', 'DefaultErrorHandler']
    }),
    invoke: (conversation, done) => {
        // perform conversation tasks.

        let session = {};
        session.bdate = conversation.properties().bdate;
        session.account_number = conversation.properties().accountnumber;
        session.token = conversation.properties().token;
        session.sessionId = conversation.properties().sessionId;
        session.OracleMobileBackendID = conversation.properties().OracleMobileBackendID;


        conversation.logger().info("**************Download My Bill Component*****************");
        conversation.logger().info("Input parameter values: account_num: " + session.account_number + " ,token: " + session.token + " ,sessionId: " + session.sessionId);
        conversation.logger().info('bdate: ' + session.bdate);

        let loginCheck = Utility.userLoginCheck(session.account_number, session.token, session.sessionId);

        if (loginCheck) {

            console.log(session.bdate)
            if (session.bdate != 'null') {
                conversation.logger().info("COPY OF BILL COMPONENT::Bill date is present and will be sent to the Download bill API on chatbot.js");
                conversation.variable("bdate", session.bdate);
                conversation.transition('Success');
                done();
            } else if (session.bdate == "null") {
                conversation.logger().info("COPY OF BILL COMPONENT::Bill date is not present");
                conversation.transition('Fail');
                done();
            } else {
                conversation.logger().info("COPY OF BILL COMPONENT::Runtime exception at Download my Bill");
                conversation.transition('DefaultErrorHandler');
                done();
            }
        } else {
            conversation.variable("fanResult", "For your security, you'll need to log in to your My Account to proceed.");
            conversation.transition('UserNotLoggedIn');
            done();
        }
    }
};