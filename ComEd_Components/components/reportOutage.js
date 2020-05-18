'use strict';
var reportOutageController = require("../comed/controller/reportOutage");

module.exports = {
    metadata: () => ({
        name: 'reportOutage',
        properties: {
            phonenumber: { required: true, type: 'string' },
            noticeOutageUnusual: { required: true, type: 'string' },
            lightsOut: { required: true, type: 'string' },
            fanResult: { required: true, type: 'string' },
            loginAuthenticated: { required: true, type: 'string' },
            accountnumber: { required: true, type: 'string' },
            token: {required: true, type: 'string'},
            sessionId:  {required: true, type: 'string'},
            envirornment: {required: true, type: 'string'},
            OracleMobileBackendID: {required: true, type: 'string'},
            anonOAuthKey: {required: true, type: 'string'},
            mcsVersionAuth: {required: true, type: 'string'},
            mcsVersionAnon: {required: true, type: 'string'}
        },
        supportedActions: ['outageReportResult','UserNotLoggedIn', 'DefaultErrorHandler', 
        'TcUserInvalid', 'Invalid']
    }),
    invoke: (conversation, done) => {
        // perform conversation tasks.
        
        let session = {};
        session.phone = conversation.properties().phonenumber;
        session.outageIssue = conversation.properties().lightsOut;
        session.unusual = conversation.properties().noticeOutageUnusual;
        session.loginAuthenticated = conversation.properties().loginAuthenticated;
        session.account_number = conversation.properties().accountnumber;
        session.token = conversation.properties().token;
        session.sessionId = conversation.properties().sessionId;
        session.envirornment = conversation.properties().envirornment;
        session.OracleMobileBackendID = conversation.properties().OracleMobileBackendID;
        session.anonOAuthKey = conversation.properties().anonOAuthKey;
        session.mcsVersionAuth = conversation.properties().mcsVersionAuth;
        session.mcsVersionAnon = conversation.properties().mcsVersionAnon;

        conversation.logger().info("**************Report Outage Component*****************");
        conversation.logger().info("Input parameter values: account_num: " + session.account_number + ", token: " + session.token + ", sessionId: " + session.sessionId);

        new reportOutageController().run(session, conversation,done, function (session) {
            if(session.statusCode != undefined && session.statusCode == 401){
                conversation.variable("fanResult","Your session has been expired");
                conversation.transition('UserNotLoggedIn');
                done();
            } else {
                if(session.checkString == "success"){
                    conversation.variable('fanResult',session.confirmationNumber)
                    conversation.transition('outageReportResult')
                    done();
                } else if(session.checkString == 'fail'){
                    if(session.content.meta.code == "TC-ACCT-INVALID"){
                        conversation.logger().info("REPORT OUTAGE COMPONENT::Exception:: Account is Invalid");
                        conversation.transition('Invalid');
                        done();
                    } else if(session.content.meta.code == "TC-USER-INVALID"){
                        conversation.logger().info("REPORT OUTAGE COMPONENT::Exception:: User is Invalid");
                        conversation.transition('TcUserInvalid');
                        done();
                    } else {
                        conversation.logger().info("REPORT OUTAGE COMPONENT::Exception:: Unknown exception");
                        conversation.transition('TcUserInvalid');
                        done();
                    }
                } else {
                    conversation.transition('DefaultErrorHandler');
                    done();
                }
            }
        });
    }
};
