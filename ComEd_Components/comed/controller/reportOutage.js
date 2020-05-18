let metaData = require('../config/config');
let httpService = require('../../services/httpservice');

function reportOutage() {
    let HttpService = new httpService();
    let meta = JSON.parse(JSON.stringify(metaData))

    this.reportStatus = function (session, conversation, callback) {
        if (session.content == 401) {
            session.statusCode = 401;
            callback(session)
        } else {
            try {
                let content = JSON.parse(session.content);
                session.content = content;
                if (content != undefined && content != null && content != "" && content.success) {
                    conversation.logger().info("REPORT OUTAGE CONTROLLER:: API response success is TRUE");
                    session.confirmationNumber = content.data.confirmationNumber;
                    session.checkString = 'success';
                    callback(session);
                } else if (content != undefined && content != null && content != "" && content.success == false) {
                    conversation.logger().info("REPORT OUTAGE CONTROLLER:: API response success is FALSE");
                    session.checkString = 'fail';
                    callback(session);
                } else {
                    conversation.logger().info("REPORT OUTAGE CONTROLLER:: Runtime Exception in else loop");
                    session.checkString = 'runTimeError';
                    callback(session);
                }
            } catch (err) {
                conversation.logger().info("REPORT OUTAGE CONTROLLER:: Runtime Exception in catch loop");
                session.checkString = 'runTimeError';
                callback(session);
            }
        }
    };

    this.run = function (session, conversation, done, callback) {
        meta.hostName = meta.hostName.replace("?envirornmentUrl", session.envirornment);
        conversation.logger().info("HostName: " + meta.hostName);
        if (session.loginAuthenticated == 'Yes') {
            conversation.logger().info("REPORT OUTAGE CONTROLLER::Calling Report Outage Authenticated API.")
            meta.reportOutageAuthenticatedPost.url = meta.reportOutageAuthenticatedPost.url.replace("?accountNumber", session.account_number).replace("?mcsVersionAuth", session.mcsVersionAuth);
                HttpService.httpRequest(meta.reportOutageAuthenticatedPost, meta.hostName, session, conversation, done, function (session) {
                this.reportStatus(session, conversation, function (session) {
                    callback(session)
                }.bind(this));
            }.bind(this));
        } else {
            conversation.logger().info("REPORT OUTAGE CONTROLLER::Calling Report Outage UnAuthenticated API.")
            meta.reportOutagePost.url = meta.reportOutagePost.url.replace("?mcsVersionAnon", session.mcsVersionAnon);
            HttpService.httpRequest(meta.reportOutagePost, meta.hostName, session, conversation, done, function (session) {
                this.reportStatus(session, conversation, function (session) {
                    callback(session)
                }.bind(this));
            }.bind(this));
        }
    }
}

module.exports = reportOutage;