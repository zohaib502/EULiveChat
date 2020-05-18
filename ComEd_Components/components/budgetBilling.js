'use strict';
let budgetBillingController = require("../comed/controller/budgetBilling");
let utility = require("../utilities/utility");
let Utility = new utility();

module.exports = {
     metadata: () => ({
         name: 'budgetBilling',
         properties: {
            accountnumber: {required: true, type: 'string'},
            enrollment: {required:true, type: 'boolean'},
            fanResult: {required: true, type: 'string'},
            token: {required: true, type: 'string'},
            sessionId:  {required: true, type: 'string'},
            envirornment: {required: true, type: 'string'},
            OracleMobileBackendID: {required: true, type: 'string'},
            anonOAuthKey: {required: true, type: 'string'},
            mcsVersionAuth: {required: true, type: 'string'}
         },
         supportedActions: ['Yes','No','EnrollSuccess','NotEligible','EnrolledAlready',
         'UserNotLoggedIn', 'DefaultErrorHandler', 'TcUserInvalid']
     }),
     invoke: (conversation, done) => {
         // perform conversation tasks.

        let session = {};
        session.enrollment = conversation.properties().enrollment;
        session.account_num = conversation.properties().accountnumber;
        session.token = conversation.properties().token;
        session.sessionId = conversation.properties().sessionId;
        session.envirornment = conversation.properties().envirornment;
        session.OracleMobileBackendID = conversation.properties().OracleMobileBackendID;
        session.anonOAuthKey = conversation.properties().anonOAuthKey;
        session.mcsVersionAuth = conversation.properties().mcsVersionAuth;

        conversation.logger().info("**************Budget Billing Component*****************");
        conversation.logger().info("Input parameter values: account_num: " + session.account_num + ", token: " + session.token + ", sessionId: " + session.sessionId);

        let loginCheck = Utility.userLoginCheck(session.account_num,session.token,session.sessionId);

        if(loginCheck){
            new budgetBillingController().run(session,conversation,done, function (session) {
                if(session.statusCode != undefined && session.statusCode == 401){
                    conversation.variable("fanResult","Your session has been expired");
                    conversation.transition('UserNotLoggedIn');
                    done();
                } else {
                    if(!session.enrollment){
                        if(session.content != undefined && session.content.success){
                            if(session.budgetEligible == 'AlreadyEnrolled'){
                                conversation.transition('EnrolledAlready');
                                done();
                            } else {
                                if(session.budgetEligible){
                                    conversation.transition('Yes');
                                    done();
                                } else {
                                    conversation.transition('No');
                                    done();
                                }
                            }
                        } else {
                            conversation.transition('TcUserInvalid');
                            done();
                        }  
                    } else {
                        if(session.checkString == 'success'){
                            conversation.variable('fanResult',session.enrollVal);
                            conversation.transition('EnrollSuccess');
                            done();
                        } else if(session.checkString == 'fail'){
                            if(session.content.meta.code == "FN-NOT-ELIGIBLE"){
                                conversation.logger().info("BUDGET BILLING COMPONENT::Exception:: User is not eligible for Budget billing program.");
                                conversation.transition('NotEligible');
                                done(); 
                            } else if(session.content.meta.code == "FN-ALREADY-ENROLLED"){
                                conversation.logger().info("BUDGET BILLING COMPONENT::Exception:: User is already enrolled for Budget billing program.");
                                conversation.transition('EnrolledAlready');
                                done(); 
                            } else {
                                conversation.logger().info("BUDGET BILLING COMPONENT::Exception:: Unknown exception");
                                conversation.transition('TcUserInvalid');
                                done(); 
                            }
                        } else {
                            conversation.transition('DefaultErrorHandler');
                            done();
                        }
                    }
                }
            });
        } else {
            conversation.variable("fanResult","For your security, you'll need to log in to your My Account to proceed.");
            conversation.transition('UserNotLoggedIn');
            done();
        }
        
    }
};
