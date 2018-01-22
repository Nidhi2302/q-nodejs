let jwt = require('jwt-simple');
let jwtUtil ={};

/*
 * For Create Secret Token For User
 * @param Int uid Uid
 * @return String
 */
jwtUtil.createSecretToken = (data) => {
    let token = jwt.encode(data, config.SECRET);
    return token;
}
/*
 * For Get User ID Form SecretToken
 * @param Int uid Uid
 * @return String
 */
jwtUtil.decodeToken = (token) => {
    var data = {};
    if (token) {
        try {
            var decoded = jwt.decode(token, config.SECRET);
            data = decoded;
        } catch (err) {
            data
        }
    }
    return data;
}
jwtUtil.getUserId = (token) => {
    console.log(token);
    let userID = "";
    if (token) {
        try {
            console.log(token, config.SECRET);
            let decoded = jwt.decode(token, config.SECRET);
            userID = decoded.uid;
        } catch (err) {
            userID
        }
    }
    return userID;
}
jwtUtil.getCurrentUserId = (req) => {
    let token = (req.headers && req.headers['x-auth-token']);
    console.log(config.SECRET);
    let userID = "";        
    if (token) {
        try {
            let decoded = jwt.decode(token, config.SECRET);
            console.log(decoded);
            userID = decoded.uid;
        } catch (err) {
            userID
        }
    }        
    return userID;
}
module.exports = jwtUtil