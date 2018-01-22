let express = require('express');
let bodyParser = require('body-parser');
let app = express.Router();
app.use('/api/v1/admin',require("./modules/admin/adminRoute"));
app.use('/api/v1/user', require('./modules/user/userRoute'));
app.use('/api/v1/notification', require('./modules/notification/notificationRoute'));
app.use('/api/v1/coupon', require('./modules/coupon/couponRoute'));
app.use('/api/v1/payment', require('./modules/payment/paymentRoute'));
app.use('/api/v1/reports', require('./modules/reports/reportsRoute'));
app.use('/api/v1/follower',require('./modules/follower/followerRoute'));
app.use('/api/v1/wallet',require('./modules/wallet/walletRoute'));
app.use('/api/v1/share',require('./modules/shareLink/shareLinkRoute'));
app.all('/*', function (req, res) {
   return errorUtil.notFound(res, req);
});
module.exports = app;
