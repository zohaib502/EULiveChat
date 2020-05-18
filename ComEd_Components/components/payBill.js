'use strict';
let payBillController = require("../comed/controller/payBill");
let utility = require("../utilities/utility");
let Utility = new utility();

module.exports = {
    metadata: () => ({
        name: 'payBill',
        properties: {
            actBalance: {required: true, type: 'string'},
            payBillWalletResult: {required: true, type: 'string'},
            payBillPaymentCategoryType: {required: true, type: 'string'},
            payBillWalletId: {required: true, type: 'string'},
            payBillWalletItemId: {required: true, type: 'string'},
            payBillPaymentApiFlag: {required: true, type: 'string'},
            payBillMaskedAccountNumber: {required: true, type: 'string'},
            accountnumber: {required: true, type: 'string'},
            token: {required: true, type: 'string'},
            sessionId:  {required: true, type: 'string'},
            fanResult: {required: true, type: 'string'},
            envirornment: {required: true, type: 'string'},
            isCashOnly:  {required: true, type: 'boolean'},
            OracleMobileBackendID: {required: true, type: 'string'},
            anonOAuthKey: {required: true, type: 'string'},
            mcsVersionAuth: {required: true, type: 'string'}
        },
        supportedActions: ['BalanceZero','Balance<5','PayBillUserActSetupYes',
        'PayBillUserActSetupNo', 'Yes', 'No', 'Fail', 'Duplicate', 'UserNotLoggedIn', 
        'DefaultErrorHandler', 'TcUserInvalid']
    }),
    invoke: (conversation, done) => {
        // perform conversation tasks.

        let session = {};
        session.payment_amount = conversation.properties().actBalance;
        if (session.payment_amount.split(".").length < 2 || session.payment_amount.split(".")[1].length<=2 ){
            session.payment_amount = (Number(session.payment_amount).toFixed(2)).toString();
        }
        session.payBillwalletResult = conversation.properties().payBillWalletResult;
        session.payment_category_type = conversation.properties().payBillPaymentCategoryType;
        session.wallet_id = conversation.properties().payBillWalletId;
        session.wallet_item_id = conversation.properties().payBillWalletItemId;
        session.payBillPaymentApiFlag = conversation.properties().payBillPaymentApiFlag;
        session.masked_wallet_item_account_number = conversation.properties().payBillMaskedAccountNumber;
        session.payment_date = new Date();
        session.accountNumber =  conversation.properties().accountnumber;
        session.token = conversation.properties().token;
        session.sessionId = conversation.properties().sessionId;
        session.envirornment = conversation.properties().envirornment;
        session.isCashOnly = conversation.properties().isCashOnly;
        session.OracleMobileBackendID = conversation.properties().OracleMobileBackendID;
        session.anonOAuthKey = conversation.properties().anonOAuthKey;
        session.mcsVersionAuth = conversation.properties().mcsVersionAuth;

        conversation.logger().info("**************Pay Bill Component*****************");
        conversation.logger().info("Input parameter values: account_num: " + session.accountNumber + ", token: " + session.token + ", sessionId: " + session.sessionId);
        conversation.logger().info("isCashOnly Value: " + session.isCashOnly);

        let loginCheck = Utility.userLoginCheck(session.accountNumber,session.token,session.sessionId);
        
        if(loginCheck){
            if(session.payBillPaymentApiFlag == "No"){
                if(session.payment_amount == 0){
                    conversation.transition("BalanceZero");
                    done();
                } else if (session.payment_amount < 5){
                    conversation.transition("Balance<5");
                    done();
                } else {
                    if(session.isCashOnly == 'True'){
                        conversation.variable('payBillWalletResult', "your account doesn’t allow for direct bank debits.");
                        conversation.transition("PayBillUserActSetupNo");
                        done();
                    } else {
                        new payBillController().run(session, conversation,done, function(session){
                            if(session.statusCode != undefined && session.statusCode == 401){
                                conversation.variable("fanResult","Your session has been expired");
                                conversation.transition('UserNotLoggedIn');
                                done();
                            } else {
                                if(session.checkString == 'success'){
                                    conversation.variable('actBalance',session.payment_amount);
                                    conversation.variable('accountnumber',session.accountNumber);
                                    conversation.variable('payBillWalletResult',session.payBillWalletResult);
                                    conversation.variable('payBillPaymentCategoryType',session.payment_category_type);
                                    conversation.variable('payBillWalletId',session.wallet_id);
                                    conversation.variable('payBillWalletItemId',session.wallet_item_id);
                                    conversation.variable('payBillMaskedAccountNumber',session.masked_wallet_item_account_number);
                    
                                    if(session.userAccountBackendCheck){
                                        conversation.transition("PayBillUserActSetupYes");
                                        done();
                                    } else {
                                        conversation.transition("PayBillUserActSetupNo");
                                        done();
                                    }
                                } else if (session.checkString == 'fail'){
                                    if (session.content.meta.code == "TC-USER-INVALID"){
                                        conversation.logger().info("PAY BILL COMPONENT::Wallet Exception:: User is Invalid exception");
                                        conversation.transition('TcUserInvalid');
                                        done();
                                    } else if (session.content.meta.code == 'TC-PERSONID-INVALID'){
                                        conversation.logger().info("PAY BILL COMPONENT::Wallet Exception:: Person Id is Invalid exception");
                                        conversation.transition('TcUserInvalid');
                                        done();
                                    } else {
                                        conversation.logger().info("PAY BILL COMPONENT::Wallet Exception:: Unknown exception");
                                        conversation.transition('TcUserInvalid');
                                        done();
                                    }
                                } else {
                                    conversation.transition('DefaultErrorHandler');
                                    done();
                                }      
                            }
                        })
                    }
                } 
            } else {
                new payBillController().run(session, conversation, done, function(session){
                    if(session.statusCode != undefined && session.statusCode == 401){
                        conversation.variable("fanResult","Your session has been expired");
                        conversation.transition('UserNotLoggedIn');
                        done();
                    } else {
                        conversation.variable('actBalance',session.payment_amount);
                        conversation.logger().info(session.content);
                        if(session.checkString == 'success'){
                            conversation.transition("Yes");
                            done()
                        } else if (session.checkString == 'fail') {
                            if(session.content.meta.code == 'xmlPayment.duplicate'){
                                conversation.logger().info("PAY BILL COMPONENT::Payment Exception:: Duplicate Payment error");
                                conversation.transition("Duplicate");
                                done();
                            } else if (session.content.meta.code == "TC-USER-INVALID"){
                                conversation.logger().info("PAY BILL COMPONENT::Payment Exception:: User is invalid");
                                conversation.transition('TcUserInvalid');
                                done();
                            } else {
                                conversation.logger().info("PAY BILL COMPONENT::Payment Exception:: Unknown Exception");;
                                conversation.transition('TcUserInvalid');
                                done();
                            }
                        } else {
                            conversation.transition('DefaultErrorHandler');
                            done();
                        }
                    }
                })
            }
        } else {
            conversation.variable("fanResult","For your security, you'll need to log in to your My Account to proceed.");
            conversation.transition('UserNotLoggedIn');
            done();
        }   
    }
};
