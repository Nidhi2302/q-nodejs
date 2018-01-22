let validator = {};
validator.getcouponValidator = (req, type) => {
    let input = {
            createCoupon: {
                coupon_name: ["notEmpty", req.t("COUPONNAME_REQUIRE")],
                discount_type:["notEmpty", req.t("DISCOUNT_TYPE_REQUIRE")],
                discription:["notEmpty", req.t("DISCRIPTION_REQUIRE")],
                launch_date:["notEmpty", req.t("LAUNCH_DATE_REQUIRE")],
                expiration_date:["notEmpty", req.t("EXPIRATION_DATE_REQUIRE")],
                terms_condition:["notEmpty", req.t("TERMS_CONDITION_REQUIRE")],
           }
        
        };
        return input[type];
}

module.exports = validator;

