let metaData = require('../config/config');
let httpService = require('../../services/httpservice');
let utility = require('../../utilities/utility');

function budgetBilling() {
    let HttpService = new httpService();
    let Utility = new utility();
    let meta = JSON.parse(JSON.stringify(metaData))

    this.budgetBilling = function (session, conversation, callback) {
        if (session.content == 401) {
            session.statusCode = 401;
            callback(session)
        } else {
            try {
                let content = JSON.parse(session.content);
                session.content = content;
                if (content != undefined && content != null && content != "" && content.success) {
                    conversation.logger().info("BUDGET BILLING CONTROLLER:: API response success is true");
                    if (content.data.isBudgetBillEligible && content.data.isBudgetBill) {
                        session.budgetEligible = 'AlreadyEnrolled';
                        callback(session)
                    } else {
                        session.budgetEligible = content.data.isBudgetBillEligible ? true : false;
                        callback(session)
                    }
                } else {
                    conversation.logger().info("BUDGET BILLING CONTROLLER:: API response success is FALSE");
                    callback(session)
                }
            } catch (err) {
                conversation.logger().info("BUDGET BILLING CONTROLLER:: Runtime Exception at budgetBilling method");
                conversation.logger().info(err);
                callback(session);
            }
        }
    }

    this.budgetEnroll = function (session, conversation, callback) {
        if (session.content == 401) {
            session.statusCode = 401;
            callback(session)
        } else {
            try {
                let content = JSON.parse(session.content);
                session.content = content;
                if (content != undefined && content != null && content != "" && content.success) {
                    conversation.logger().info("BUDGET BILLING RNROLL CONTROLLER:: API response success is TRUE");
                    session.checkString = 'success';
                    session.enrollVal = content.data.confirmationNumber;
                    callback(session)
                } else if (content != undefined && content != null && content != "" && content.success == false) {
                    conversation.logger().info("BUDGET BILLING RNROLL CONTROLLER:: API response success is FALSE");
                    session.resp = 'fail';
                    callback(session);
                } else {
                    conversation.logger().info("BUDGET BILLING ENROLL CONTROLLER:: Runtime Exception at budgetBilling method in else ");
                    session.checkString = 'runTimeError';
                    callback(session);
                }
            } catch (err) {
                conversation.logger().info("BUDGET BILLING ENROLL CONTROLLER:: Runtime Exception at budgetBilling method in catch method");
                conversation.logger().info(err);
                session.checkString = 'runTimeError';
                callback(session);
            }
        }
    };

    this.run = function (session, conversation,done, callback) {
        meta.hostName = meta.hostName.replace("?envirornmentUrl",session.envirornment);
        conversation.logger().info("HostName: " + meta.hostName);
        meta.accountBalanceGet.url = meta.accountBalanceGet.url.replace("?accountNumber", session.account_num).replace("?mcsVersionAuth",session.mcsVersionAuth);
        if (!session.enrollment) {
            HttpService.httpRequest(meta.accountBalanceGet, meta.hostName, session, conversation,done, function (session) {
                this.budgetBilling(session, conversation, function (session) {
                    callback(session)
                }.bind(this));
            }.bind(this));
        } else {
            meta.budgetEnrollmentPut.url = meta.budgetEnrollmentPut.url.replace("?accountNumber", session.account_num).replace("?mcsVersionAuth",session.mcsVersionAuth);
            HttpService.httpRequest(meta.budgetEnrollmentPut, meta.hostName, session, conversation,done, function (session) {
                this.budgetEnroll(session, conversation, function (session) {
                    callback(session)
                }.bind(this));
            }.bind(this));
        }

    }
}

module.exports = budgetBilling;