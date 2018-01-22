let validator = {};
validator.getwalletValidator = (req, type) => {
    let input = {
            saveCoupon: {
                coupon_id: ["notEmpty", req.t("COUPONNAME_REQUIRE")],
                vendor_id:["notEmpty", req.t("DISCOUNT_TYPE_REQUIRE")],
           }
        
        };
        return input[type];
}

module.exports = validator;

