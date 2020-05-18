'use strict';
var OutageController = require("../comed/controller/outageStatus");
var _ = require('lodash');

module.exports = {
    metadata: () => ({
        name: 'outageStatus',
        properties: {
            phonenumber: { required: true, type: 'string' },
            accountnumber: { required: true, type: 'string' },
            loginAuthenticated: { required: true, type: 'string' },
            address: {required:true, type: 'string'},
            token: {required: true, type: 'string'},
            sessionId:  {required: true, type: 'string'},
            fanResult: {required: true, type: 'string'},
            maskedAddress: {required: true, type: 'string'},
            maskedAccountNumber: {required: true, type: 'string'},
            omrStatus: {required: true, type: 'string'},
            outageReported: {required: true, type: 'string'},
            envirornment: {required: true, type: 'string'},
            storeOutageJson: {required: true, type: 'list'},
            OracleMobileBackendID: {required: true, type: 'string'},
            restorationTime: {required: true, type: 'string'},
            anonOAuthKey: {required: true, type: 'string'},
            mcsVersionAuth: {required: true, type: 'string'},
            mcsVersionAnon: {required: true, type: 'string'}
        },
        supportedActions: ['Yes', 'No', 'MultipleAccounts', 'Invalid', 'OmrActive',
        'UserNotLoggedIn','ContinueOutage', 'DefaultErrorHandler', 'TcUserInvalid','MultipleAccounts>5','FnAccProtected',"FnAccFinaled"]
    }),
    invoke: (conversation, done) => {
        // perform conversation tasks.
        let session = {};
        session.phone = conversation.properties().phonenumber;
        session.loginAuthenticated = conversation.properties().loginAuthenticated;
        session.address = conversation.properties().address;
        session.account_number = conversation.properties().accountnumber;
        session.token = conversation.properties().token;
        session.sessionId = conversation.properties().sessionId;
        session.maskedAddress = conversation.properties().maskedAddress;
        session.maskedAccountNumber = conversation.properties().maskedAccountNumber;
        session.omrStatus = conversation.properties().omrStatus;
        session.outageReported = conversation.properties().outageReported;
        session.envirornment = conversation.properties().envirornment;
        session.storeOutageJson = conversation.properties().storeOutageJson;
        session.OracleMobileBackendID = conversation.properties().OracleMobileBackendID;
        session.restorationTime = conversation.properties().restorationTime;
        session.anonOAuthKey = conversation.properties().anonOAuthKey;
        session.mcsVersionAuth = conversation.properties().mcsVersionAuth;
        session.mcsVersionAnon = conversation.properties().mcsVersionAnon;


        conversation.logger().info("*******storeOutageJson*********");
        conversation.logger().info(session.storeOutageJson);
        if (session.storeOutageJson != undefined && session.storeOutageJson != "" && session.storeOutageJson != '${storeOutageJson.value}' && session.storeOutageJson.length > 1) {
            var filterAccountNumber = _.filter(session.storeOutageJson,function(o){
                return o.maskedAccountNumber == session.account_number;
            })
            session.account_number = filterAccountNumber[0].accountNumber;
        }


        conversation.logger().info("**************Outage Status Component*****************");
        conversation.logger().info("Input parameter values: account_num: " + session.account_number + ", token: " + session.token + ", sessionId: " + session.sessionId);

        if(session.omrStatus != ""){
            if(session.omrStatus == "Yes"){
                conversation.transition("OmrActive");
                done();
            } else {
                if(session.outageReported == "Yes"){
                    conversation.transition("Yes")
                    done();
                } else {
                    conversation.transition("No")
                    done();
                }
            }
        } else {
            new OutageController().run(session,conversation,done,function (session) {
                if(session.statusCode != undefined && session.statusCode == 401){
                    conversation.variable("fanResult","Your session has been expired");
                    conversation.transition('UserNotLoggedIn');
                    done();
                } else {
                    if(session.checkString == 'success'){
                        if(session.multipleAcc == 'Yes'){
                            if(session.multipleAccLessThan4 == "Yes"){
                                conversation.variable("fanResult",session.accountNum);
                                conversation.variable('storeOutageJson',session.storeOutageJson);
                                conversation.transition('MultipleAccounts');
                                done();
                            } else {
                                conversation.transition('MultipleAccounts>5');
                                done();
                            }   
                        }else{
                            conversation.variable('address',session.loginAuthenticated == 'Yes' ? session.address : session.maskedAddress + "***");
                            conversation.variable('restorationTime',session.restorationTime);
                            conversation.variable('phonenumber',session.phone);
                            conversation.variable('accountnumber',session.accountNumber);
                            conversation.variable('loginAuthenticated',session.loginAuthenticated);
                            conversation.variable('maskedAddress',session.maskedAddress + "***");
                            conversation.variable('maskedAccountNumber',session.maskedAccountNumber);
                            conversation.variable('omrStatus',session.omrStatus);
                            conversation.variable('outageReported',session.outageReported);
                            if(session.loginAuthenticated == 'Yes'){
                                if(session.omrStatus == "Yes"){
                                    conversation.transition("OmrActive");
                                    done();
                                } else {
                                    if(session.outageReported == "Yes"){
                                        conversation.transition("Yes")
                                        done();
                                    } else {
                                        conversation.transition("No")
                                        done();
                                    }
                                }
                            } else {
                                conversation.transition('ContinueOutage');
                                done();
                            }     
                        }
                    } else if (session.checkString == 'fail'){
                        console.log(session.content)
                        if(session.content.meta.code == "TC-ACCT-INVALID" || session.content.meta.code == "FN-ACCT-NOTFOUND"){
                            conversation.logger().info("OUTAGE STATUS COMPONENT::Exception:: USER ACCOUNT IS INVALID OR NOT FOUND");
                            conversation.transition('Invalid');
                            done();
                        } else if (session.content.meta.code == "FN-ACCT-PROTECTED" || session.content.meta.code == "FN-ACCOUNT-PROTECTED"){
                            conversation.logger().info("OUTAGE STATUS COMPONENT::Exception:: User Account is Password Protected");
                            conversation.transition('FnAccProtected');
                            done();
                        } else if (session.content.meta.code == "TC-USER-INVALID"){ 
                            conversation.logger().info("OUTAGE STATUS COMPONENT::Exception:: User is Invalid");
                            conversation.transition('TcUserInvalid');
                            done();
                        } else if (session.content.meta.code == "FN-ACCOUNT-FINALED"){
                            conversation.logger().info("OUTAGE STATUS COMPONENT::Exception:: User Account is Finaled");
                            conversation.transition('FnAccFinaled');
                            done();
                        } else {
                            conversation.logger().info("OUTAGE STATUS COMPONENT::Exception:: Unknown exception");
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
    }
};
