let http = require('http');
require("dotenv").config();
let app = require('./config/app');
let cron = require('./cron.js');
http.createServer(app).listen(app.get('port'), function () {console.log('Express server listening on port ' + app.get('port'));});
