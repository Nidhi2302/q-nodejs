let express = require('express');
let adminCtr = require('./adminController.js');
let notificationCtr = require('../notification/notificationController.js');
let userMiddleware = require('../user/userMiddleware.js');
let auth = require("../../helper/auth");
let userCtrl = require('../user/userController.js');
let adminRouter = express.Router();

let loginMiddleware = [userMiddleware.validateInput("login"),adminCtr.login];
adminRouter.post('/login', loginMiddleware);

/**
 * @api {get} /admin/getusers/:start Get Users
 * @apiName Get Users
 * @apiGroup Admin
 * @apiVersion 0.1.0
 * @apiPermission admin
 * @apiUse TokenHeader
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 {
 *   "users": [
 *       {
 *          "_id": "5968dfe0011ebf7a502ea596",
 *          "email": "nidhi_joshi2302@yahoo.in",
 *          "username": "Test@1234",
 *          "phonenumber": "9725200421",
 *          "isBlocked": false
 *       }
 *   ],
 *   "totalUser": 1
}
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {
 *  "message": "No Record Found"
}
 */

let authorizeAdminMiddleware = [auth.requiresAdminLogin, adminCtr.getUsers];
adminRouter.get('/getusers/:start', authorizeAdminMiddleware);

/**
 * @api {get} /admin/vendor/:start Get Vendors
 * @apiName Get Vendors
 * @apiGroup Admin
 * @apiVersion 0.1.0
 * @apiPermission admin
 * @apiUse TokenHeader
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 {
 *   "vendors": [
 *       {
 *           "_id": "5968c5ea5a440658843cf01c",
 *           "email": "trivedi.malay@yahoo.com",
 *           "username": "trivedi1",
 *           "phonenumber": "9427211748",
 *           "verified": true,
 *           "isBlocked": false
 *       }
 *   ],
 *   "totalVendor": 1
}
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {
 *  "message": "No Record Found"
}
 */
let authorizeAdmin = [auth.requiresAdminLogin, adminCtr.getVendors];
adminRouter.get('/vendor/:start', authorizeAdmin);

/**
 * @api {post} /admin/block Block/UnBlock Users/Vendor
 * @apiName Block/UnBlock Users/Vendor
 * @apiGroup Admin
 * @apiVersion 0.1.0
 * @apiPermission admin
 * @apiUse TokenHeader 
 * @apiParam {String} id Required
 * @apiParam {String} isBlocked Required
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 {
 *   "message": "SUCCESS"
}
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {
 *  "message": "Please Try Again"
}
 */
let updateUserBlockMiddleware = [auth.requiresAdminLogin, userMiddleware.validateInput("updateUserBlockStatus"), adminCtr.updateBlockStatus];
adminRouter.post('/block', updateUserBlockMiddleware);

/**
 * @api {post} /admin/verify Verify Vendors
 * @apiName Verify Vendors
 * @apiGroup Admin
 * @apiVersion 0.1.0
 * @apiPermission admin
 * @apiUse TokenHeader 
 * @apiParam {String} id Required
 * @apiParam {String} verified Required
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 {
 *   "message": "SUCCESS"
}
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {
 *  "message": "Please Try Again"
}
 */
let updateUserVerifiacation = [auth.requiresAdminLogin, userMiddleware.validateInput("updateUserVerification"), adminCtr.updateVerification];
adminRouter.post('/verify', updateUserVerifiacation);

/**
 * @api {post} /admin/search/:type/:start Search Vendors/Users By phone,email,username
 * @apiName Search Users/Vendors
 * @apiGroup Admin
 * @apiVersion 0.1.0
 * @apiPermission admin
 * @apiUse TokenHeader 
 * @apiParam {String} username Required
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 {
 *   "userResults": [
 *       {
 *           "_id": "5968dfe0011ebf7a502ea596",
 *           "email": "nidhi_joshi2302@yahoo.in",
 *           "username": "Test@1234",
 *           "phonenumber": "9725200421",
 *           "type": "user",
 *           "isBlocked": false,
 *           "name": "Nidhi Joshi"
 *       }
 *   ],
 *   "totalUser": 1
}
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {
 *   "message": "No Record Found"
}
 */
let searchUserMiddleware = [auth.requiresAdminLogin, userMiddleware.validateInput("login"), adminCtr.searchUser];
adminRouter.post('/search/:type/:start', searchUserMiddleware);

/**
 * @api {get} /admin/coupons/:start Get coupons with pagination
 * @apiName Get Coupons
 * @apiGroup Admin
 * @apiVersion 0.1.0
 * @apiPermission admin
 * @apiUse TokenHeader
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 {
 *   "data": [
 *       {
 *           "_id": "5976e9beec3960034e1de5fb",
 *           "vendor_id": "5976dc3cec3960034e1de5f0",
 *           "vendor_name": "test",
 *           "coupon_name": "cxvxcv",
 *           "discount_type": "Countdown",
 *           "qupey_type": "4Purchases",
 *           "discription": "cxvcx",
 *           "expiration_date": "2029-01-01T07:31:00.000Z",
 *           "total_redeems": 1
 *       }
 *   ],
 *   "totalCoupon": 1,
 *   "message": "SUCCESS"
}
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {
 *   "message": "No Record Found"
}
 */
let getCouponsMiddleware = [auth.requiresAdminLogin,adminCtr.getAll];
adminRouter.get('/coupons/:start',getCouponsMiddleware);

/**
 * @api {post} /admin/search/:start Search coupons with pagination
 * @apiName Search Coupons
 * @apiGroup Admin
 * @apiVersion 0.1.0
 * @apiPermission admin
 * @apiUse TokenHeader
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 {
 *   "data": [
 *       {
 *           "_id": "5976e9beec3960034e1de5fb",
 *           "vendor_id": "5976dc3cec3960034e1de5f0",
 *           "vendor_name": "test",
 *           "coupon_name": "cxvxcv",
 *           "discount_type": "Countdown",
 *           "qupey_type": "4Purchases",
 *           "discription": "cxvcx",
 *           "expiration_date": "2029-01-01T07:31:00.000Z",
 *           "total_redeems": 1
 *       }
 *   ],
 *   "totalCoupon": 1,
 *   "message": "SUCCESS"
}
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {
 *   "message": "No Record Found"
}
 */
let searchCouponMiddleware = [auth.requiresAdminLogin,adminCtr.search];//api is not completed.
adminRouter.post('/search/:start',searchCouponMiddleware);

let publishCouponMiddleware = [auth.requiresAdminLogin,adminCtr.publishCoupon];
adminRouter.post('/coupon/publish',publishCouponMiddleware);

let getTopStoreMiddleware = [auth.requiresAdminLogin,adminCtr.getTopStore];
adminRouter.get('/get-top-store/:start',getTopStoreMiddleware);

let getTopUsersMiddleware = [auth.requiresAdminLogin,adminCtr.getTopUsers];
adminRouter.get('/get-top-users/:start',getTopUsersMiddleware);

let getTotalCouponsPerVendorMiddleware = [auth.requiresAdminLogin,adminCtr.getTotalCouponsPerVendor];
adminRouter.get('/get-total-vendors-coupons/:start',getTotalCouponsPerVendorMiddleware);

let getTotalCouponsRefeeredPerVendorMiddleware = [auth.requiresAdminLogin,adminCtr.getTotalCouponsRefeeredPerVendor];
adminRouter.get('/get-total-vendors-couponsrefeered/:start',getTotalCouponsRefeeredPerVendorMiddleware);

let getTotalCouponsRedeemedPerVendorMiddleware = [auth.requiresAdminLogin,adminCtr.getTotalCouponsRedeemedPerVendor];
adminRouter.get('/get-total-vendors-couponsredeemed/:start',getTotalCouponsRedeemedPerVendorMiddleware);

let notifyToAllMiddleware = [auth.requiresAdminLogin,notificationCtr.notifyToAll];
adminRouter.post('/notify-to-all',notifyToAllMiddleware);

let getNotificationMiddleware = [auth.requiresAdminLogin,notificationCtr.getNotificationsServer];
adminRouter.get('/notification/:start',getNotificationMiddleware);

let deleteUserMiddleware = [auth.requiresAdminLogin,userCtrl.deleteUser];
adminRouter.delete('/delete-user/:id',deleteUserMiddleware);

let videoSaveMiddleware = [auth.requiresAdminLogin,userCtrl.saveVideoURL];
adminRouter.post('/save-vendor-video/',videoSaveMiddleware);

let getVideoMiddleware = [auth.requiresAdminLogin,userCtrl.getVideoURL];
adminRouter.get('/get-vendor-video/:id',getVideoMiddleware);

let getTopHeaderMiddleware = [auth.requiresAdminLogin,adminCtr.getTopHeaderData];
adminRouter.get('/get-top-header-data',getTopHeaderMiddleware);

module.exports = adminRouter; 