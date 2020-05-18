let metaData = require('../config/config');
let httpService = require('../../services/httpservice');
let utility = require('../../utilities/utility');
let _ = require('lodash')

function payBill() {
    let HttpService = new httpService();
    let Utility = new utility();
    let meta = JSON.parse(JSON.stringify(metaData))

    this.payBillStatus = function (session,conversation, callback) {
        if(session.content == 401){
            session.statusCode = 401;
            callback(session)
        } else {
            try{
                let content = session.content;
               // session.content = content;
                if(content != undefined && content != null && content != "" && content.success){
                    session.checkString = "success";
                    conversation.logger().info("Pay Bill Wallet Response Success at payBillStatus method");
                    if(content.data.WalletItems.length > 0){
                        let isDefaultData = _.filter(content.data.WalletItems,function(e){
                            return e.isDefault == true;
                        })
                        if(isDefaultData.length > 0){
                            session.userAccountBackendCheck = true; 
                            let defaultData = isDefaultData[0];
                            session.payment_category_type = defaultData.paymentCategoryType;
                            session.payBillWalletResult = defaultData.paymentMethodType + " " + defaultData.paymentCategoryType + " " + "ending with" + " " + defaultData.maskedWalletItemAccountNumber.slice(-4);
                            session.wallet_id = defaultData.walletExternalID;
                            session.wallet_item_id = defaultData.walletItemID;
                            session.masked_wallet_item_account_number = defaultData.maskedWalletItemAccountNumber.slice(-4);
                            callback(session)
                        } else {
                            session.userAccountBackendCheck = false;
                            session.payBillWalletResult = "you have multiple accounts and don’t have one identified as the default."
                            callback(session)
                        }
                    } else {
                        session.userAccountBackendCheck = false;
                        session.payBillWalletResult = "you don’t have a payment method saved under your account."
                        callback(session)
                    }
                } else if (content != undefined && content != null && content != "" && content.success == false) {
                    conversation.logger().info("Pay Bill Wallet Response Failed at payBillStatus method");
                    session.checkString = 'fail';
                    callback(session);
                } else {
                    conversation.logger().info("Pay Bill Wallet Runtime Exception at payBillStatus method");
                    session.checkString = 'runTimeError';
                    callback(session);
                }
            } catch (err){
                conversation.logger().info("Pay Bill Wallet Runtime Exception at payBillStatus method");
                session.checkString = 'runTimeError';
                callback(session);
            } 
        }
    };

    this.createPayment = function(session,conversation,callback){
        if(session.content == 401){
            session.statusCode = 401;
            callback(session)
        } else {
            try{
                let content = session.content;
                if(content != undefined && content != null && content != "" && content.success){
                    conversation.logger().info("PAY BILL CONTROLLER:: API response success is TRUE");
                    session.checkString = 'success';
                    callback(session)
                } else if (content != undefined && content != null && content != "" && content.success == false){                    
                    conversation.logger().info("PAY BILL CONTROLLER:: API response success is FALSE");
                    session.checkString = 'fail';
                    callback(session)
                } else {
                    conversation.logger().info("Pay Bill Controller:: Create Payment Runtime Exception at createPayment method in else");
                    session.checkString = 'runTimeError';
                    callback(session);
                }
            } catch (err){
                conversation.logger().info("Pay Bill Controller:: Create Payment Runtime Exception at createPayment method in catch method");
                conversation.logger().info(err);
                session.checkString = 'runTimeError';
                callback(session);
            }  
        }
    }

    this.run = function (session, conversation,done, callback) {
        meta.hostName = meta.hostName.replace("?envirornmentUrl",session.envirornment);
        conversation.logger().info("HostName: " + meta.hostName);
        meta.payBillWalletPost.url = meta.payBillWalletPost.url.replace("?mcsVersionAuth",session.mcsVersionAuth);
        if (session.payBillPaymentApiFlag == "No"){
            conversation.logger().info("Pay Bill Controller:: Wallet Check API Call");
            HttpService.httpRequest(meta.payBillWalletPost,meta.hostName, session,conversation,done, function (session) {
                this.payBillStatus(session,conversation, function (session) {
                    callback(session)
                }.bind(this));
            }.bind(this));
        } else {
            session.payment_category_type = session.payment_category_type == "CREDIT" ? 'Card' : 'Check';
            meta.payBillCreatePaymentPost.url = meta.payBillCreatePaymentPost.url.replace("?accountNumber",session.accountNumber).replace("?mcsVersionAuth",session.mcsVersionAuth);
            conversation.logger().info("Pay Bill Controller:: Create Payment API Call");
            HttpService.httpRequest(meta.payBillCreatePaymentPost,meta.hostName, session,conversation,done, function (session) {
                this.createPayment(session,conversation, function (session) {
                   callback(session);
                }.bind(this));
            }.bind(this));  
        }
    }
}

module.exports = payBill;