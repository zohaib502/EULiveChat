"use strict";

var request = require('request');

function httpservice() {
    var req = request.defaults({
        jar: request.jar(),                // save cookies to jar
        followAllRedirects: true
    });
    this.httpRequest = function (stepMetadata,hostName, session, conversation,done, callback) {

        try {
            let form = {};
            let headers = stepMetadata.name != undefined && stepMetadata.name == "chatSurveyApi" ? {
                'Ocp-Apim-Subscription-Key': session.ocpApimSubscriptionKey} : {
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/json',
                    'oracle-mobile-backend-id': session.OracleMobileBackendID,
                    'Authorization': session.loginAuthenticated != undefined && session.loginAuthenticated == "No" ? "Basic " + session.anonOAuthKey : 'Bearer ' + session.token,
                    'Cookie': 'ASP.NET_SessionId='+ session.sessionId
                }
            let reqOptions = {
                url: stepMetadata.url.replace('?hostName',hostName),
                headers: headers
            };

            session.loginAuthenticated != undefined && session.loginAuthenticated == "No" ? delete reqOptions.headers.Cookie : reqOptions;

            this.prepareGet(reqOptions, session, stepMetadata);

            if (stepMetadata.method === "Get") {
                conversation.logger().info("Get Request Options: " + JSON.stringify(reqOptions));
                req.get(reqOptions, function (err, resp, responseContent) {
                    if (err) {
                        console.error(err);
                        conversation.transition('DefaultErrorHandler');
                        done();
                    }
                    if(resp.statusCode == 401){
                        session.content = 401;
                        callback(session);
                    } else {
                        session.content = responseContent;
                        callback(session);
                    }
                }.bind(this))
            } else if (stepMetadata.method === "Put") {
                conversation.logger().info("Put Request Options: " + JSON.stringify(reqOptions));
                req.put(reqOptions, function (err, resp, responseContent) {
                    if (err) {
                        console.error(err);
                        conversation.transition('DefaultErrorHandler');
                        done();
                    }
                    if(resp.statusCode == 401){
                        session.content = 401;
                        callback(session);
                    } else {
                        session.content = responseContent;
                        callback(session);
                    }
                }.bind(this))
            } else {
                this.preparePost(reqOptions, session, stepMetadata);
                conversation.logger().info("Post Request Options: " + JSON.stringify(reqOptions));  
                req.post(reqOptions, function (err, resp, responseContent) {
                    if (err) {
                        console.error(err);
                        conversation.transition('DefaultErrorHandler');
                        done();
                    } else if(resp.statusCode == 401){
                        session.content = 401;
                        callback(session);
                    } else {
                        session.content = responseContent;
                        conversation.logger().info("HTTPSERVICE:: Responsecontent"+ JSON.stringify(responseContent) +responseContent  );
                        callback(session);
                    }
                }.bind(this));
            }
        } catch (err) {
            conversation.logger().info("HTTPSERVICE:: Error in request");
            conversation.logger().info(err);
            conversation.transition('DefaultErrorHandler');
            done();
        }
    }.bind(this);

    this.prepareGet = function (reqOptions, session, stepMetadata) {
        var getParams = stepMetadata.getParams;
        for (var key in getParams) {
            getParams[key] = session[key];
            reqOptions.url += key + '=' + getParams[key] + '&';
        }
    };

    this.preparePost = function (reqOptions, session, stepMetadata) {
        if (stepMetadata.hasOwnProperty("postParams")) {
            var requestParams = JSON.parse(JSON.stringify(stepMetadata.postParams));
            for (var key in requestParams) {
                requestParams[key] = typeof requestParams[key] == "boolean" ? requestParams[key]: requestParams[key].indexOf('?') !== -1 ? session[requestParams[key].replace('?', '')] : requestParams[key];
            }
            if(stepMetadata.name != undefined && (stepMetadata.name == "chatSurveyApi" || stepMetadata.name == "payBillCreatePaymentPost" || stepMetadata.name == "payBillWalletPost" )){
                reqOptions.json = requestParams;
            } else {
                reqOptions.form = requestParams;
            }
        }
    };
}

module.exports = httpservice;