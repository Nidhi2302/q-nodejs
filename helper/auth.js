let utils = require('../helper/utils.js');
let userModel = require('../modules/user/userModel');
let adminModel = require('../modules/admin/adminModel');
let jwt = require('./jwt');
let auth = {};
auth.checkToken = (req, res, next) => {
    let token = (req.headers && req.headers['x-auth-token']);
        if (utils.empty(token)) {
            token = (req.body && req.body['x-auth-token']);
        }
        if (utils.empty(token)) {
            return errorUtil.notAuthenticated(res, req);
        }
        req.token = token;
        next();
}
auth.requiresLogin = (req, res, next) => {
    let token = (req.headers && req.headers['x-auth-token']);
    let userId = jwt.getUserId(token);
    console.log("user",userId);
    if (utils.empty(token) || utils.empty(userId)) {	    
        res.status(400).json(req.t("NOT_AUTHORIZED"));
    }
    else{
        userModel.findOne({"_id":userId}).exec(function(err, user){
        	if(!user){
        		res.status(400).json(req.t("NOT_AUTHORIZED"));
        		return;
        	}else{
                if(user.type=="vendor"){
                    if(user.verified == true && user.isBlocked == false){
                        next();
                    }else{
                       res.status(400).json(req.t("NOT_AUTHORIZED"));
        		        return; 
                    }
                }else{
                    next();
                }
        		
        	}
        })
    }
},
auth.requiresAdminLogin = (req, res, next) => {
    let token = (req.headers && req.headers['x-auth-token']);
    let adminId = jwt.getCurrentUserId(req);
    if (utils.empty(token) || utils.empty(adminId)) {	    
        res.status(400).json({"message": req.t("NOT_AUTHORIZED")});
    }
    else{
        adminModel.findOne({"_id":adminId}).exec(function(err, admin){
        	if(!admin){
        		res.status(400).json({"message": req.t("NOT_AUTHORIZED")});
        		return;
        	}else{
                next();
        	}
        })
    }
},
module.exports = auth