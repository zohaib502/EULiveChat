let metaData = require('../config/config');
let httpService = require('../../services/httpservice');
var utility = require('../../utilities/utility');
var moment = require('moment');

function outageStatus() {
    let HttpService = new httpService();
    let meta = JSON.parse(JSON.stringify(metaData))
    let Utility = new utility();

    this.omsStatus = function (session, conversation, callback) {
        if (session.content == 401) {
            session.statusCode = 401;
            callback(session)
        } else {
            try {
                let content = JSON.parse(session.content)
                session.content = content;
                let data = content.meta != undefined && content.meta.code == "FN-ACCT-MULTIPLE" ? content.data : content.data != undefined && content.data.length > 0 ? content.data[0] : content;
                if (content != undefined && content != null && content != "" && content.success) {
                    conversation.logger().info("OUTAGE CHECK STATUS CONTROLLER:: API response success is TRUE");
                    session.checkString = 'success';
                    if (data.length > 1 && data.length < 6) {
                        conversation.logger().info("OUTAGE CHECK STATUS CONTROLLER:: User has multiple accounts");
                        session.storeOutageJson = data;
                        session.multipleAcc = "Yes";
                        session.multipleAccLessThan4 = "Yes";
                        session.accountNum = "";
                        for (let i in data) {
                            let d = data[i].maskedAccountNumber;
                            session.accountNum += d + ","
                        }
                        session.accountNum = session.accountNum.slice(0, -1)
                        callback(session)
                    } else if (data.length > 5){
                        session.multipleAcc = "Yes";
                        session.multipleAccLessThan4 = "No" ;
                        callback(session);
                    } else {
                        conversation.logger().info("OUTAGE CHECK STATUS CONTROLLER:: User has a single account");
                        session.phone = data.contactHomeNumber;
                        session.accountNumber = data.accountNumber;
                        session.maskedAccountNumber = data.maskedAccountNumber;
                        session.maskedAddress = data.maskedAddress;
                        session.multipleAcc = "No";
                        if (data.status === "ACTIVE") {
                            conversation.logger().info("OUTAGE CHECK STATUS CONTROLLER:: The outage is active for the account");
                            session.omrStatus = 'No';
                                session.address = data.address;
                                session.restorationTime = moment(moment(data.ETR).utcOffset('-06:00')).format("hh:mm:ss a") + ' on ' + moment(data.ETR).format('MM/DD/YYYY');
                                session.outageReported = 'No'
                                callback(session)
                            //}
                        } else {
                            conversation.logger().info("OUTAGE CHECK STATUS CONTROLLER:: The outage is not active for the account");
                            session.omrStatus = 'Yes';
                            session.address = data.address;
                            callback(session)
                        }
                    }
                } else if (content != undefined && content != null && content != "" && content.success == false) {
                    conversation.logger().info("OUTAGE CHECK STATUS CONTROLLER:: API response in success is FALSE");
                    session.checkString = "fail";
                    callback(session)
                } else {
                    conversation.logger().info("OUTAGE CHECK STATUS CONTROLLER:: Runtime Exception in else");
                    session.checkString = 'runTimeError';
                    callback(session);
                }
            } catch (err) {
                conversation.logger().info("OUTAGE CHECK STATUS CONTROLLER:: Runtime Exception in catch");
                conversation.logger().info(err);
                session.checkString = 'runTimeError';
                callback(session);
            }
        }
    };

    this.run = function (session, conversation,done, callback) {
        meta.hostName = meta.hostName.replace("?envirornmentUrl",session.envirornment);
        conversation.logger().info("HostName: " + meta.hostName);
        if (session.loginAuthenticated == 'Yes') {
            conversation.logger().info("OUTAGE STATUS CONTROLLER:: Calling Outage Authenticated API.")
            meta.outageAuthenticatedGet.url = meta.outageAuthenticatedGet.url.replace("?accountNumber", session.account_number).replace("?mcsVersionAuth",session.mcsVersionAuth);
            HttpService.httpRequest(meta.outageAuthenticatedGet, meta.hostName, session, conversation,done, function (session) {
                this.omsStatus(session, conversation, function (session) {
                    callback(session)
                }.bind(this));
            }.bind(this));
        } else {
            session.phone == "" ? delete meta.outagePost.postParams.phone : delete meta.outagePost.postParams.account_number;
            conversation.logger().info("OUTAGE STATUS CONTROLLER:: Calling Outage UnAuthenticated API.")
            meta.outagePost.url = meta.outagePost.url.replace("?mcsVersionAnon",session.mcsVersionAnon);
            HttpService.httpRequest(meta.outagePost, meta.hostName, session, conversation,done, function (session) {
                this.omsStatus(session, conversation, function (session) {
                    callback(session)
                }.bind(this));
            }.bind(this));
        }
    }
}

module.exports = outageStatus;