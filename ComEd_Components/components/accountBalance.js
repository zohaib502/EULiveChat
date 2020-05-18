'use strict';
let accountBalanceController = require("../comed/controller/accountBalance");
let utility = require("../utilities/utility");
let Utility = new utility();

module.exports = {
    metadata: () => ({
        name: 'accountBalance',
        properties: {
            actBalance: {required: true, type: 'string'},
            actDueDate: {required: true, type: 'string'},
            accountnumber: {required: true, type: 'string'},
            address: {require:true, type: 'string'},
            bdate: {require:true, type: 'string'},
            payBillAccountBalanceFlag:  {required: true, type: 'string'},
            token: {required: true, type: 'string'},
            sessionId:  {required: true, type: 'string'},
            fanResult:  {required: true, type: 'string'},
            envirornment:  {required: true, type: 'string'},
            isCashOnly:  {required: true, type: 'boolean'},
            getBillBdateFlag: {required: true, type: 'string'},
            OracleMobileBackendID: {required: true, type: 'string'},
            anonOAuthKey: {required: true, type: 'string'},
            mcsVersionAuth: {required: true, type: 'string'}
        },
        supportedActions: ['Success','MultiAccounts','WrongInformation','PayBillComponent',
        'UserNotLoggedIn', 'DefaultErrorHandler', 'FnAccProtected', 'TcUserInvalid', 'GetCopyOfBill', 'DueDateNull']
    }),
    invoke: (conversation, done) => {
        // perform conversation tasks.

        let session = {};
        session.actBalance = conversation.properties().actBalance;
        session.actDueDate = conversation.properties().actDueDate;
        session.account_num = conversation.properties().accountnumber;
        session.token = conversation.properties().token;
        session.sessionId = conversation.properties().sessionId;
        session.envirornment = conversation.properties().envirornment;
        session.isCashOnly = conversation.properties().isCashOnly;
        session.OracleMobileBackendID = conversation.properties().OracleMobileBackendID;
        session.anonOAuthKey = conversation.properties().anonOAuthKey;
        session.mcsVersionAuth = conversation.properties().mcsVersionAuth;
        
        conversation.logger().info("**************Account Balance Component*****************");
        conversation.logger().info("Input parameter values: account_num: " + session.account_num + ", token: " + session.token + ", sessionId: " + session.sessionId);
        
        
        let payBillAccountBalanceFlag = conversation.properties().payBillAccountBalanceFlag;
        let getBillBdateFlag = conversation.properties().getBillBdateFlag;
        
        let loginCheck = Utility.userLoginCheck(session.account_num,session.token,session.sessionId);
       
        if(loginCheck){
            new accountBalanceController().run(session,conversation,done, function (session) {
                if(session.statusCode != undefined && session.statusCode == 401){
                    conversation.variable("fanResult","Your session has been expired");
                    conversation.transition('UserNotLoggedIn');
                    done();
                } else {
                    if(session.checkString == "success"){
                        if (session.actBalance.toString().split(".").length < 2 || session.actBalance.toString().split(".")[1].length<=2 ){
                            session.actBalance = (Number(session.actBalance).toFixed(2)).toString();
                        }
                        conversation.variable("actBalance",session.actBalance);
                        conversation.variable("actDueDate",session.actDueDate);
                        conversation.variable("address",session.address);
                        conversation.variable("accountnumber",session.account_num);
                        conversation.variable("bdate",session.bdate);
                        conversation.variable("isCashOnly",session.isCashOnly);
                        if(payBillAccountBalanceFlag == "No" && getBillBdateFlag == "No"){
                            if(session.actDueDate == "null"){
                                conversation.transition("DueDateNull");
                                done();
                            } else {
                                conversation.transition('Success');
                                done();
                            } 
                        } else if(payBillAccountBalanceFlag == "Yes" && getBillBdateFlag == "No"){
                            conversation.transition('PayBillComponent');
                            done();
                        } else {
                            conversation.transition('GetCopyOfBill');
                            done();
                        }      
                    } else if (session.checkString == "fail"){
                        if (session.content.meta.code == "FN-MULTIPLE-ACCOUNTS") {
                            conversation.logger().info("ACCOUNT BALANCE COMPONENT::Exception:: Multiple accounts associated with the user");
                            conversation.transition('MultiAccounts');
                            done();
                        } else if (session.content.meta.code == "TC-ACCT-CLOSED"){
                            conversation.logger().info("ACCOUNT BALANCE COMPONENT::Exception:: Account is Closed");
                            conversation.transition('WrongInformation');
                            done();
                        } else if (session.content.meta.code == "FN-ACCOUNT-PROTECTED"){
                            conversation.logger().info("ACCOUNT BALANCE COMPONENT::Exception:: Account is Password Protected");
                            conversation.transition('FnAccProtected');
                            done();
                        } else if (session.content.meta.code == "TC-USER-INVALID"){
                            conversation.logger().info("ACCOUNT BALANCE COMPONENT::Exception:: User is invalid");
                            conversation.transition('TcUserInvalid');
                            done();
                        } else {
                            conversation.logger().info("ACCOUNT BALANCE COMPONENT::Exception:: Unknown exception");
                            conversation.transition('TcUserInvalid');
                            done();
                        }
                    } else {
                        conversation.transition('DefaultErrorHandler');
                        done();
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
