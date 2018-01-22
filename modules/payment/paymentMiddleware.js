let _v = require('../../helper/validate.js');
let utils = require('../../helper/utils.js');
let paymentValidator = require('./paymentValidator.js');
let paymentMiddleware = {};

paymentMiddleware.validateInput = (type, validateType) => {
    return function (req, res, next) {
            var paymentValidators = {};
            var validators = paymentValidator.paymentValidator(req,type);
            paymentValidators = validators
            var error = _v.validate(req.body, paymentValidators);
            if (!utils.empty(error)) {
                return res.status(400).json({"message": error});
            }
            next();
        };
},
module.exports = paymentMiddleware;

