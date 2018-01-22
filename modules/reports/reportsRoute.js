let express = require('express');
let reportsCtr = require('./reportsController.js');
let auth = require("../../helper/auth");
let reportsRouter = express.Router();

let mostRedeemodayMiddleware = [auth.requiresLogin,reportsCtr.mostRedeemoday];
reportsRouter.get('/today-redeem/:start',mostRedeemodayMiddleware);

let leastRedeemMiddleware = [auth.requiresLogin,reportsCtr.leastRedeem];
reportsRouter.get('/least-redeem/:start',leastRedeemMiddleware);

let mostRedeemers = [auth.requiresLogin,reportsCtr.mostRedeemers];
reportsRouter.get('/most-redeemers/:start',mostRedeemers);

let mostRedeemMonthly = [auth.requiresLogin,reportsCtr.mostRedeemMonthly];
reportsRouter.post('/monthly-redeemers',mostRedeemMonthly);



module.exports = reportsRouter; 