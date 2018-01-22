let validator = {};
validator.getFollowerValidator = (req, type) => {
    let input = {
            updateFollowStatus: {
                vendorId: ["notEmpty",req.t("VENDOR_ID_REQUIRE")]
            }
        };
        return input[type];
}

module.exports = validator;

