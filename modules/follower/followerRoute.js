//Dependencies 
let express = require('express');
let followerCtr = require('./followerController.js');
let followerMiddleware = require('./followerMiddleware.js');
let auth = require("../../helper/auth");
let followerRouter = express.Router();
/**
 * @apiDefine TokenHeader
 * @apiHeader {String} X-Auth-Token Users unique access-token.
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "x-auth-token": "eyJ0eXAiOiJ...b1ZM9jh-c"
 *     }
*/
/**
 * @api {post} /follower/follow Follow Vendor/Store 
 * @apiName follow  
 * @apiGroup Follower
 * @apiVersion 0.1.0
 * @apiPermission user
 * @apiUse TokenHeader
 * @apiParam {String} vendor ID
 * @apiParam {String} status status should be Follow or Unfollow
 * 
 * @apiParamExample Request Example:
 *		{
 *			"vendorId" : "5968c5ea5a440658843cf48c",
 *			"status" : "Unfollow"
 *		}
 *
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 *result": {
 *       'message': "Follower Status Updated."
*    }
 *
 * @apiError 400 Bad User Input
 *
 * @apiErrorExample 400 Error: vendorId
 *     HTTP/1.1 400 Bad Input
 *     {
 *		 ""Vendor Id Required""
 *	   }
 */
let followerStatusMiddleware = [auth.requiresLogin,followerMiddleware.validateInput("updateFollowStatus"),followerCtr.updateFollowStatus];
followerRouter.post('/follow',followerStatusMiddleware);

/**
 * @api {get} /follower/getfollowers/:start Follow Vendor/Store 
 * @apiName getfollowers  
 * @apiGroup Follower
 * @apiVersion 0.1.0
 * @apiPermission vendor
 * @apiUse TokenHeader
 * @apiSuccessExample Success-Response: Block
 *     HTTP/1.1 200 OK
 * result": {
 *   "data": [
 *       {
 *           "_id": "5971c4e0829105da1c3ad401",
 *           "username": [
 *               "Test@test"
 *           ]
 *       }
 *   ],
 *   "message": "Followers Fetched."
 * }
 */
let getFollowerMiddleware = [auth.requiresLogin,followerCtr.getFollowers];
followerRouter.get('/getfollowers/:start',getFollowerMiddleware);
module.exports = followerRouter; 

