let _v = require('../../helper/validate');
let utils = require('../../helper/utils');
let walletValidator = require('./walletValidator');
let walletMiddleware = {};

walletMiddleware.validateInput = (type, validateType) => {
    return function (req, res, next) {
            var walletValidators = {};
            var validators = walletValidator.getwalletValidator(req,type);
            walletValidators = validators;
            var error = _v.validate(req.body, walletValidators);
            if (!utils.empty(error)) {
                return errorUtil.validationError(res, error);
            }
            next();
        };
},
module.exports = walletMiddleware;

