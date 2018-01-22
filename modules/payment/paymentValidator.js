let validator = {};
validator.paymentValidator = (req, type) => {
    let input = {
            addCard: {
                token: ["notEmpty", req.t("TOKEN_REQUIRE")],
            }
        };
        return input[type];
}

module.exports = validator;

