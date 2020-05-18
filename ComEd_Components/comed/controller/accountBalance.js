let metaData = require('../config/config');
let httpService = require('../../services/httpservice');
let utility = require('../../utilities/utility');
let moment = require('moment');

function accountBalance() {
    let HttpService = new httpService();
    let Utility = new utility();
    let meta = JSON.parse(JSON.stringify(metaData));

    this.balStatus = function (session, conversation, callback) {
        if (session.content == 401) {
            session.statusCode = 401;
            callback(session)
        } else {
            try {
                let content = JSON.parse(session.content);
                session.content = content;
                if (content != undefined && content != null && content != "" && content.success) {
                    conversation.logger().info("ACCOUNT BALANCE CONTROLLER:: API response success is true");
                    session.actBalance = content.data.BillingInfo.netDueAmount;
                    session.actDueDate = content.data.BillingInfo.dueByDate != undefined ? Utility.dateFormat(content.data.BillingInfo.dueByDate, 'MM/DD/YYYY') : 'null';
                    session.address = content.data.address;
                    session.bdate = content.data.BillingInfo.billDate != undefined ? Utility.dateFormat(content.data.BillingInfo.billDate, 'YYYY-MM-DD') : 'null';
                    session.isCashOnly = content.data.isCashOnly;
                    session.checkString = "success"
                    callback(session)
                } else if (content != undefined && content != null && content != "" && content.success == false) {
                    session.checkString = "fail";
                    conversation.logger().info("ACCOUNT BALANCE CONTROLLER:: API response success is false");
                    callback(session);
                } else {
                    conversation.logger().info("ACCOUNT BALANCE CONTROLLER:: Runtime exception in else ");
                    session.checkString = 'runTimeError';
                    callback(session);
                }
            } catch (err) {
                conversation.logger().info("ACCOUNT BALANCE CONTROLLER:: Runtime exception in Catch ");
                conversation.logger().info(err);
                session.checkString = 'runTimeError';
                callback(session);
            }
        }
    };

    this.run = function (session, conversation, done, callback) {
        meta.hostName = meta.hostName.replace("?envirornmentUrl",session.envirornment);
        conversation.logger().info("HostName: " + meta.hostName);
        meta.accountBalanceGet.url = meta.accountBalanceGet.url.replace("?accountNumber", session.account_num).replace("?mcsVersionAuth",session.mcsVersionAuth);
        HttpService.httpRequest(meta.accountBalanceGet, meta.hostName, session, conversation,done, function (session) {
            this.balStatus(session, conversation, function (session) {
                callback(session)
            }.bind(this));
        }.bind(this));
    }
}

module.exports = accountBalance;