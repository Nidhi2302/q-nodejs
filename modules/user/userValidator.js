let validator = {};
validator.getuserValidator = (req, type) => {
    let input = {
            login: {
                username: ["notEmpty", req.t("USERNAME_REQUIRE")],
                password: ["notEmpty", req.t("USER_PASSWORD_REQUIRE")],
            },
            registration: {
                email: ["notEmpty", req.t("EMAIL_REQUIRE")],
                username:["notEmpty", req.t("USERNAME_REQUIRE")],
                phonenumber:["notEmpty", req.t("PHONENUMBER_REQUIRE")],
            },
            forgotPassword: {
                email: ["notEmpty", req.t("EMAIL_REQUIRE")]
            },
            emailExists: {
                email: ["notEmpty", req.t("EMAIL_REQUIRE")]
            },
            userNameExists: {
                username:["notEmpty", req.t("USERNAME_REQUIRE")]
            },
            phoneNumberExists: {
                phonenumber:["notEmpty", req.t("PHONENUMBER_REQUIRE")]
            },
            otp: {
                phonenumber:["notEmpty", req.t("PHONENUMBER_REQUIRE")]
            },
            changePassword:{
                oldpassword: ["notEmpty", req.t("OLD_PASSWORD_REQUIRE")],
                newpassword: ["notEmpty", req.t("NEW_PASSWORD_REQUIRE")],
            },
            updateUserProfile:{
                email: ["notEmpty", req.t("EMAIL_REQUIRE")],
                username:["notEmpty", req.t("USERNAME_REQUIRE")],
            },
            updateVendorProfile: {
                email: ["notEmpty", req.t("EMAIL_REQUIRE")],
                username:["notEmpty", req.t("USERNAME_REQUIRE")],
                phonenumber:["notEmpty", req.t("PHONENUMBER_REQUIRE")],
                address1:["notEmpty", req.t("ADDRESS1_REQUIRE")],
                city:["notEmpty", req.t("CITY_REQUIRE")],
                state:["notEmpty", req.t("STATE_REQUIRE")],
                zip:["notEmpty", req.t("ZIP_REQUIRE")]
               // weekhours:["notEmpty", req.t("WEEKHOURS_REQUIRE")],
                
            },
            updateUserBlockStatus: {
                id: ["notEmpty",req.t("USER_ID_REQUIRE")],
                isBlocked: ["notEmpty",req.t("USER_BLOCK_STATUS_REQUIRE")]
            },
            updateUserVerification: {
                id: ["notEmpty",req.t("USER_ID_REQUIRE")],
                verified: ["notEmpty",req.t("USER_VERIFICATION_STATUS_REQUIRE")]
            },
            userLocation: {
                longitude: ["notEmpty",req.t("LONGITUDE_REQUIRE")],
                latitude: ["notEmpty",req.t("LATITUDE_REQUIRE")],
            }
        
        };
        return input[type];
}

module.exports = validator;

