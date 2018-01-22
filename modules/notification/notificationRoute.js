//Dependencies 
let express = require('express');
let notificationCtr = require('./notificationController.js');
let auth = require("../../helper/auth");
let notificationRouter = express.Router();
/**
 * @apiDefine TokenHeader
 * @apiHeader {String} X-Auth-Token Users unique access-token.
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "x-auth-token": "eyJ0eXAiOiJ...b1ZM9jh-c"
 *     }
 */

let getNotificationsMiddleware = [auth.requiresLogin,notificationCtr.getNotifications];
notificationRouter.get('/get-notifications', getNotificationsMiddleware);

module.exports = notificationRouter; 

