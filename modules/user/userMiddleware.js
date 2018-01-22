let _v = require('../../helper/validate');
let utils = require('../../helper/utils');
let userValidator = require('./userValidator');
let userMiddleware = {};

userMiddleware.validateInput = (type, validateType) => {
    return function (req, res, next) {
            var userValidators = {};
            var validators = userValidator.getuserValidator(req,type);
            userValidators = validators;
            var error = _v.validate(req.body, userValidators);
            if (!utils.empty(error)) {
                return errorUtil.validationError(res, error);
            }
            next();
        };
},
module.exports = userMiddleware;

