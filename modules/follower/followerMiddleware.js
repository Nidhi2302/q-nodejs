let _v = require('../../helper/validate');
let utils = require('../../helper/utils');
let followerValidator = require('./followerValidator');
let followerMiddleware = {};

followerMiddleware.validateInput = (type, validateType) => {
    return function (req, res, next) {
            var followerValidators = {};
            var validators = followerValidator.getFollowerValidator(req,type);
            followerValidators = validators;
            var error = _v.validate(req.body, followerValidators);
            if (!utils.empty(error)) {
                return errorUtil.validationError(res, error);
            }
            next();
        };
},
module.exports = followerMiddleware;