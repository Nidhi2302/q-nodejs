//Dependencies 
let express = require('express');
let multipart = require('connect-multiparty');
let userCtr = require('./userController.js');
let userMiddleware = require('./userMiddleware.js');
let auth = require("../../helper/auth");
let userRouter = express.Router();
let multipartMiddleware = multipart();

/**
 * @apiDefine TokenHeader
 * @apiHeader {String} X-Auth-Token Users unique access-token.
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "x-auth-token": "eyJ0eXAiOiJ...b1ZM9jh-c"
 *     }
 */

/**
* @apiDefine UserNotAuthorized
*
* @apiError 400 Unauthorized
*
* @apiErrorExample 400 : Access token invalid
*     HTTP/1.1 400 Unauthorized
*		{
*			"success": 0,
*			"message": "Unauthorized access."
*		}
*/
/**
 * @apiDefine TokenHeader
 * @apiHeader {String} X-Auth-Token Users unique access-token.
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "x-auth-token": "eyJ0eXAiOiJ...b1ZM9jh-c"
 *     }
*/
/**
 * @api {post} /user/login Login User 
 * @apiName login  
 * @apiGroup User
 * @apiVersion 0.1.0
 * @apiPermission user
 * @apiParam {String} user_name mobile
 * @apiParam {String} password Password To Corresponding Account 
 * @apiParam {enum} device_type user deivce type('iOS','Android')
 * @apiParam {String} device_token user deivce token
 * 
 * @apiParamExample Request Example:
 *		{
 *			"user_name": "9408023783",
 *			"password": "malay@12345",
 *			"device_type": "ios",
 *			"device_token": "tewt123434dstyu8ir",
 *		}
 *
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 *result": {
 *       "secreteToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OTY4YzVlYTVhNDQwNjU4ODQzY2YwMWMifQ.6mhT0pgXaCunwpOob2vmsfK5Bsj5F_fWZkassE-gei8",
 *       "uData": {
 *           "_id": "5968c5ea5a440658843cf01c",
 *           "email": "trivedi.malay@yahoo.com",
 *           "username": "trivedi1",
 *           "phonenumber": "9427211748",
 *          "type": "vendor",
*            "verified": true,
*            "isBlocked": false
*        }
*    }
 *
 * @apiError 400 Bad User Input
 *
 * @apiErrorExample 400 Error: username
 *     HTTP/1.1 400 Bad Input
 *     {
 *		 "Username Required"
 *	   }
 * @apiErrorExample 400 Error: password
 *     HTTP/1.1 400 Bad Input
 *     {
 *		 "Password Required"
 *		}
 */
let loginMiddleware = [userMiddleware.validateInput("login"), userCtr.login];
userRouter.post('/login', loginMiddleware);

/**
 * @api {post} /user/login-social-media Socil Login User 
 * @apiName login-social-media 
 * @apiGroup User
 * @apiVersion 0.1.0
 * @apiPermission user
 * @apiParam {String} social_media_id 
 * @apiParam {String} social_media_type social_media_type  
 * @apiParam {enum} device_type user deivce type('iOS','Android')
 * @apiParam {String} device_token user deivce token
 * 
 * @apiParamExample Request Example:
 *		{
 *			"social_media_id": "9408023783",
 *			"social_media_type": "Facebook",
 *			"device_type": "ios",
 *			"device_token": "tewt123434dstyu8ir",
 *		}
 *
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 *result": {
 *       "secreteToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OTY4YzVlYTVhNDQwNjU4ODQzY2YwMWMifQ.6mhT0pgXaCunwpOob2vmsfK5Bsj5F_fWZkassE-gei8",
 *       "uData": {
 *           "_id": "5968c5ea5a440658843cf01c",
 *           "email": "trivedi.malay@yahoo.com",
 *           "username": "trivedi1",
 *           "phonenumber": "9427211748",
 *          "type": "vendor",
*            "verified": true,
*            "isBlocked": false
*        }
*    }
*/

let loginWithSocialMediaMiddleware = [userCtr.loginWithSocialMedia];
userRouter.post('/login-social-media', loginWithSocialMediaMiddleware);


/**
 * @api {post} /user/registration Registration
 * @apiName registration 
 * @apiGroup User
 * @apiVersion 0.1.0
 * @apiPermission user
 * @apiParam {String} name 
 * @apiParam {String} email Required
 * @apiParam {String} username Required
 * @apiParam {String} phonenumber Required
 * @apiParam {String} type 
 * @apiParam {String} social_media_id social media registration for user
 * @apiParam {String} social_media_type social media registration for user
 * @apiParam {enum} device_type user deivce type('iOS','Android')
 * @apiParam {String} device_token user deivce token
 * 
 * @apiParamExample Request Example:
 *		{
 *			 "email":"trivedi.malay@yahoo.com"
 *           "password":"malay@12345"
 *           "username":"trivedi1"
 *           "phonenumber":"9427211748"
 *           "type":"vendor"
 *           "verified":'true'
 *           "name":"malay trivedi"
 *		}
 *
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 *result": {
 *       
 *       "data": {
 *           "email": "trivedi.malay@yahoo.com",
 *           "username": "trivedi1",
 *           "phonenumber": "9427211748",
 *           "type": "vendor",
*            "verified": true,
*            "isBlocked": false
*            "secreteToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OTY4YzVlYTVhNDQwNjU4ODQzY2YwMWMifQ.6mhT0pgXaCunwpOob2vmsfK5Bsj5F_fWZkassE-gei8",   
*        }
*    }
*/

let createMiddleware = [userMiddleware.validateInput("registration"), userCtr.userRegistration];
userRouter.post('/registration', createMiddleware);

/**
 * @api {post} /user/email-exists Email Exists
 * @apiName email-exists 
 * @apiGroup User
 * @apiVersion 0.1.0
 * @apiPermission user
 * @apiParam {String} email Required
 * @apiParamExample Request Example:
 *		{
 *			 "email":"trivedi.malay@yahoo.com"
 *		}
 *
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 *  {"SUCCESS"}
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {"trivedi.malay@yahoo.com is alredy exists"}
 */

let emailExistsMiddleware = [userMiddleware.validateInput("emailExists"), userCtr.emailExists];
userRouter.post('/email-exists', emailExistsMiddleware);

/**
 * @api {post} /user/forgot-password Forgot Password
 * @apiName forgot-password 
 * @apiGroup User
 * @apiVersion 0.1.0
 * @apiPermission user
 * @apiParam {String} email Required
 * @apiParamExample Request Example:
 *		{
 *			 "email":"trivedi.malay@yahoo.com"
 *		}
 *
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 *  {"Email sent to your email address"}
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {"trivedi.malay1@yahoo.com is not exists"}
 */

let forgotPasswordMiddleware = [userMiddleware.validateInput("forgotPassword"), userCtr.forgotPassword];
userRouter.post('/forgot-password', forgotPasswordMiddleware);

/**
 * @api {post} /user/username-exists Username Exists
 * @apiName username-exists 
 * @apiGroup User
 * @apiVersion 0.1.0
 * @apiPermission user
 * @apiParam {String} username Required
 * @apiParamExample Request Example:
 *		{
 *			 "username":"trivedi2"
 *		}
 *
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 *  {"SUCCESS"}
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {"trivedi1 is alredy exists"}
 */

let userNameExistsMiddleware = [userMiddleware.validateInput("userNameExists"), userCtr.userNameExists];
userRouter.post('/username-exists', userNameExistsMiddleware);

/**
 * @api {post} /user/otp Otp
 * @apiName otp 
 * @apiGroup User
 * @apiVersion 0.1.0
 * @apiPermission user
 * @apiParam {String} phonenumber Required
 * @apiParamExample Request Example:
 *		{
 *			 "phonenumber":"9427211748"
 *		}
 *
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 *  {
 *   "otp": "1234",
 *   "message": "SUCCESS"
 *   }
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {"9408023783 is alredy exists"}
 */

let otpMiddleware = [userMiddleware.validateInput("otp"), userCtr.otp];
userRouter.post('/otp', otpMiddleware);
/**
 * @api {get} /user/vendor-profile Vendor Profile
 * @apiName Vendor Profile 
 * @apiGroup Vendor
 * @apiVersion 0.1.0
 * @apiPermission user
 * @apiUse TokenHeader
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 *{
 *   "data": [
 *       {
 *           "_id": "5968c5ea5a440658843cf01c",
 *           "email": "trivedi.malay@yahoo.com",
 *           "username": "trivedi1",
 *           "phonenumber": 9427211748,
 *          "type": "vendor",
 *          "vendor_id": "5968c5ea5a440658843cf01c",
 *           "profile_discrption": "",
 *           "address1": "Bring street",
 *           "address2": "",
 *           "city": "Califonia",
 *           "state": "Califonia",
 *           "zip": "14575",
 *           "note": "Lorum ipsum",
 *           "weekhours": ['Monday'],
 *           "website": "www.example.com",
 *           "twitter": "@malay",
 *           "facebook": "malay",
 *           "latitude": "72.58659",
 *           "longitude": "23.2458"
 *       }
 *   ],
 *   "message": "SUCCESS"
}
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {"You Are Not Authorized"}
 */

let userProfileMiddleware = [auth.requiresLogin, userCtr.userProfile];
userRouter.get('/user-profile', userProfileMiddleware);
let vendorProfileMiddleware = [auth.requiresLogin, userCtr.vendorProfile];
userRouter.get('/vendor-profile', vendorProfileMiddleware);


/**
 * @api {post} /user/update-vendor-profile Update Vendor Profile
 * @apiName Update Vendor Profile 
 * @apiGroup Vendor
 * @apiVersion 0.1.0
 * @apiPermission user
 * @apiUse TokenHeader
 * @apiParam {String} name Required
 * @apiParam {String} username Required
 * @apiParam {String} email Required
 * @apiParam {String} phonenumber Required
 * @apiParam {String} profile_discrption 
 * @apiParam {String} address1 Required
 * @apiParam {String} address2 
 * @apiParam {String} city Required
 * @apiParam {String} state Required
 * @apiParam {String} zip Required
 * @apiParam {String} note 
 * @apiParam {Array} weekhours Required
 * @apiParam {String} website
 * @apiParam {String} facebook
 * @apiParam {String} twitter
 * @apiParam {String} latitude
 * @apiParam {String} longitude
 * @apiParamExample Request Example:
 *		{
 *          "name":"malay"
 *          "username":"trivedi1"
*           "email":"trivedi.malay@yahoo.com"
*           "phonenumber":"9427211748"
*           "profile_discrption":"test1234567889"
*           "address1":"bringlin street"
*           "address2":"opp macd"
*           "city":"califonia"
*           "state":"califonia"
*           "zip":"12345"
*           "note":"Lorum ipsum"
*           "weekhours":['Monday','Tuesday','Friday']
*           "website":"test.com"
*           "facebook":"malay123"
*           "twitter":"@test",
*           "latitude":"72.586985"
*           "longitude":"23.58647"
 *		}
 *
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {"Please try again"}
 */

let updateVendorProfileMiddleware = [multipartMiddleware, auth.requiresLogin, userMiddleware.validateInput("updateVendorProfile"), userCtr.updateVendorProfile];
userRouter.post('/update-vendor-profile', updateVendorProfileMiddleware);

let updateUserProfileMiddleware = [auth.requiresLogin, userMiddleware.validateInput("updateUserProfile"), userCtr.updateUserProfile];
userRouter.post('/update-user-profile', updateUserProfileMiddleware);

/**
 * @api {get} /user/vendor/:id Get Particular Vendor Detail
 * @apiName Get Particular Vendor Detail 
 * @apiGroup User
 * @apiVersion 0.1.0
 * @apiPermission user
 * @apiUse TokenHeader
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 *{
 *   "data": [
 *      {
 *         "_id": "5968c5ea5a440658843cf01c",
 *           "vendorname": null,
 *           "location": [
 *               73.223892,
 *               23.838248
 *           ],
 *           "note": "dsfg",
 *           "phone": "",
 *           "zip": null,
 *           "state": "sdfdsf",
 *           "city": "sdfsdf",
 *           "address1": "sdfsdfdsf",
 *           "address2": "sdfsdfdsf",
 *           "logo_url": null,
 *           "video_url": null,
 *           "banner_url": null,
 *           "status": "Follow",
 *           "like": true
 *       }
 *   ],
 *  "message": "SUCCESS"
}
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {"No Record Found"}
 */
let vendorDetailMiddleware = [auth.requiresLogin, userCtr.getVendor];
userRouter.get('/vendor/:id', vendorDetailMiddleware);

/**
 * @api {post} /user/near-by-vendors/ Get Near By Vendors
 * @apiName Get Near By Vendor Detail 
 * @apiGroup User
 * @apiVersion 0.1.0
 * @apiPermission user
 * @apiUse TokenHeader
 * @apiParam {String} longitude Required
 * @apiParam {String} latitude Required
 * @apiParam {String} start 
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 {
 *   "vendors": [
 *       {
 *           "_id": "5970c11f422a2e79e522d2c4",
 *           "vendorname": "Tthh",
 *           "note": "",
 *           "phone": "",
 *           "zip": "",
 *           "state": "",
 *           "city": "",
 *           "address1": "",
 *           "address2": "",
 *           "logo_url": null,
 *           "video_url": null,
 *           "banner_url": null,
 *           "distance": {
 *               "calculated": 3902.1478755130765,
 *               "location": [
 *                   72.5229,
 *                   23.0591
 *               ]
 *           }
 *       }
 *   ],
 *   "message": "SUCCESS"
}
 *  @apiSuccessExample ERROR-Response: Block
 *     HTTP/1.1 400 OK
 *  {"No Record Found"}
 */
let vendorsMiddleware = [auth.requiresLogin, userMiddleware.validateInput("userLocation"), userCtr.getNearByVendor];
userRouter.post('/near-by-vendors', vendorsMiddleware);

let stripePlanMiddleware = [auth.requiresLogin, userCtr.stripePlan];
userRouter.get('/plan', stripePlanMiddleware);

let getUserPlanMiddleware = [auth.requiresLogin, userCtr.getUserPlanMiddleware];
userRouter.get('/get-user-plan', getUserPlanMiddleware);

let profileImageMiddleware = [multipartMiddleware,auth.requiresLogin, userCtr.setProfileImage];
userRouter.post('/profile-image', profileImageMiddleware);

let profilePasswordMiddleware = [auth.requiresLogin, userMiddleware.validateInput("changePassword"), userCtr.changePassword];
userRouter.post('/change-password', profilePasswordMiddleware);

let saveSettingMiddleware = [auth.requiresLogin, userCtr.saveSetting];
userRouter.post('/save-setting', saveSettingMiddleware);

let allNumbersMiddleware = [auth.requiresLogin, userCtr.getNumbers];
userRouter.get('/all-numbers', allNumbersMiddleware);

let vendorCouponCountsMiddleware = [auth.requiresLogin, userCtr.getNearByVendorCouponCount];
userRouter.post('/vendor-coupon-count', vendorCouponCountsMiddleware);

let chargeCreateMiddleware = [auth.requiresLogin,userCtr.chargeCreate];
userRouter.post('/charge-create',chargeCreateMiddleware);

let logoutMiddleware = [userCtr.logout];
userRouter.post('/logout',logoutMiddleware);

module.exports = userRouter; 