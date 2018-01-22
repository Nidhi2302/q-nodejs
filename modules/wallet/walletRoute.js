//Dependencies 
let express = require('express');
let walletCtr = require('./walletController.js');
let walletMiddleware = require('./walletMiddleware.js');
let auth = require("../../helper/auth");
let walletRouter = express.Router();
/**
 * @apiDefine TokenHeader
 * @apiHeader {String} X-Auth-Token Users unique access-token.
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "x-auth-token": "eyJ0eXAiOiJ...b1ZM9jh-c"
 *     }
 */
let saveWalletMiddleware = [auth.requiresLogin,walletMiddleware.validateInput("saveCoupon"),walletCtr.saveCoupon];
walletRouter.post('/save-coupon', saveWalletMiddleware);

let getCouponMiddleware = [auth.requiresLogin,walletCtr.getCoupon];
walletRouter.get('/get-save-coupon', getCouponMiddleware);

module.exports = walletRouter; 

