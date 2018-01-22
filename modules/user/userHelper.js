let fs = require('fs');
let userModel = require('./userModel.js');
let utils = require('../../helper/utils');
let mongoose = require('mongoose');
let userHelper = {};
userHelper.emailExists = (email,callback) => {
    
        userModel.find({
			'email':email,
		}, {
			"email": 1,
		},
		function (err, userResults) {
            
        if(userResults.length>0){
            callback(true);
        }else{
            callback(false);
        }
    });
}
userHelper.phoneNumberExists = (phonenumber,callback) => {
        userModel.find({
			'phonenumber':phonenumber,
		}, {
			"phonenumber": 1,
		},
		function (err, userResults) {
        if(userResults.length>0){
            callback(true);
        }else{
            callback(false);
        }
    });
}
//this code is not done yet
userHelper.sendForgotEmail = (email,uName,password,callback) =>{
    let resetpwd = "./mail-content/reset-password.html";
    utils.getHtmlContent(resetpwd, function (err, content) {
         content = content.replace("{USRNAME}", uName);
         content = content.replace("{PASSWORD}",password);
         //console.log(content);
         utils.sendEmail(email,"Forgot Password", content, function () {});
         callback(null,true);
    });
    //callback(null,true);
}

//Delete User
userHelper.deleteUser=(userId,callback)=>{
    userModel.remove({
        "_id": mongoose.Types.ObjectId(userId)
    }, (err, result) => {
        // console.log(err,result);
        if (!err) {
            callback(null,result);
        }
        else {
            callback(err,result);
        }
    })
}
module.exports = userHelper;