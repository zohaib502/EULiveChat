let moment = require('moment')

function utility(){
    this.dateFormat = function(date,format){
        let d = moment(date).format(format);
        return d;
    }

    this.userLoginCheck = function(accountNumber, token, sessionId){
        if(accountNumber == 'noAccountNumber' && token == 'noToken' && sessionId == 'noSessionId'){
            return false;
        } else {
            return true;
        }
    }

    this.errorCodeHandler = function(code){
        
    }
}

module.exports = utility;