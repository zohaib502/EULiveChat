let metaData = require('../config/config');
let httpService = require('../../services/httpservice');
var request = require('request');


function chatSurvey() {
    let HttpService = new httpService();
    let meta = JSON.parse(JSON.stringify(metaData))

    this.run = function (session, conversation,done, callback) {
        meta.chatSurveyApi.url = meta.chatSurveyApi.url.replace("?feedBackHostName", session.feedBackHostName);
        HttpService.httpRequest(meta.chatSurveyApi,meta.hostName, session, conversation,done, function (session) {
           callback(session);
        }.bind(this));
    }
}

module.exports = chatSurvey;