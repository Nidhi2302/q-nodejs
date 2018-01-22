let _v = require('../../helper/validate');
let utils = require('../../helper/utils');
let couponValidator = require('./couponValidator');
let couponMiddleware = {};

couponMiddleware.validateInput = (type, validateType) => {
    return function (req, res, next) {
            var couponValidators = {};
            var validators = couponValidator.getcouponValidator(req,type);
            couponValidators = validators;
            var error = _v.validate(req.body, couponValidators);
            if (!utils.empty(error)) {
                return errorUtil.validationError(res, error);
            }
            next();
        };
},
module.exports = couponMiddleware;

