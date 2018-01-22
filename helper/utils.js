let mongoose = require('mongoose');
let crypto = require('crypto');
let AWS = require('aws-sdk');
let fs = require("fs");
let utilsfunction ={};
utilsfunction.isDefined = (variable) => {
    if (typeof variable == 'boolean') return true;
        return (typeof variable !== undefined && variable != null && variable != "");
}
utilsfunction.empty = (mixedVar) => {
        let undef, key, i, len;
        let emptyValues = ["undefined", null, false, 0, '', '0'];
        for (i = 0, len = emptyValues.length; i < len; i++) {
            if (mixedVar === emptyValues[i]) {
                return true;
            }
        }
        if (typeof mixedVar === 'object') {
            for (key in mixedVar) {
                return false;
            }
            return true;
        }

        return false;
}
utilsfunction.isArray = (array) => {
    return  Array.isArray(array);
}
utilsfunction.getTime = () => {
    var date = new Date();
    var time = date.getTime();
    return time;
};
utilsfunction.makeRandomNumber = () => {
       let text = "";
       let possible = "0123456789";
       for( let i=0; i < 4; i++ ){
            text += possible.charAt(Math.floor(Math.random() * possible.length));
       }
       return text;
}
utilsfunction.makeRandom = (req) => {
       let text = "";
       let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
       for( let i=0; i < 20; i++ ){
            text += possible.charAt(Math.floor(Math.random() * possible.length));
       }
       return text;
}
utilsfunction.getHtmlContent = (filePath, callback) => {
        let content = "";
        fs.readFile(filePath, 'utf8', function (err, html) {
            //console.log(err, html);
            if (!err) {
                content = html;

            }
            callback(null, content);

        });
}
utilsfunction.sendEmail = (toEmail, subject, body, callback) => {
        var SES_CONFIG = config.AWS_EMAIL;
        SES_CONFIG = _.extend(SES_CONFIG, { apiVersion: '2010-12-01' });
        var ses = new AWS.SES(SES_CONFIG);
        console.log(body);
        // send to list
        var to = toEmail;
        // this must relate to a verified SES account
        var from = "Qupey@qupey.com";
        // this sends the email
        // @todo - add HTML version
        ses.sendEmail({
            Source: "Qupey <" + from + ">",
            Destination: { ToAddresses: [to] },
            ReplyToAddresses: [toEmail],
            Message: {
                Subject: {
                    Data: subject
                },
                Body: {
                    Html: {
                        Data: body,
                    }
                }
            }
        }, function(error, data) {
            console.log(error);
            console.log(data);
            if (error) {
                isEmailSent = false;
            } else {
                isEmailSent = true;
            }
            callback(error, isEmailSent);
        });
}
utilsfunction.modifyField = (model, condition, updateValue, cb) => {
    mongoose.model(model).update(condition, updateValue, cb);
};
utilsfunction.encrypt =  (password) => {
    // Convert urlsafe base64 to normal base64
   var cipher = crypto.createCipher(process.env.CRYPTO_ALGORITHM,process.env.CRYPTO_PASSWORD)
    var crypted = cipher.update(password,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;

};
utilsfunction.decrypt =  (password) => {
    // Convert urlsafe base64 to normal base64
   let decipher = crypto.createDecipher(process.env.CRYPTO_ALGORITHM,process.env.CRYPTO_PASSWORD)
    let dec = decipher.update(password,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;

};
module.exports = utilsfunction