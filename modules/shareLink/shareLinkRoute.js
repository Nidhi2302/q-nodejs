//Dependencies 
let express = require('express');
let shareLinkCtr = require('./shareLinkController.js');
let auth = require("../../helper/auth");
let shareLinkRouter = express.Router();
/**
 * @apiDefine TokenHeader
 * @apiHeader {String} X-Auth-Token Users unique access-token.
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "x-auth-token": "eyJ0eXAiOiJ...b1ZM9jh-c"
 *     }
 */

let saveLinksMiddleware = [auth.requiresLogin,shareLinkCtr.saveLinks];
shareLinkRouter.post('/save-link', saveLinksMiddleware);

module.exports = shareLinkRouter; 

