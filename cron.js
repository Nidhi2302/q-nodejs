var Cron = require('./modules/notification/notificationController.js');
var CronJob = require('cron').CronJob;
    
new CronJob('0 0 11 * * *', function() {
 Cron.checkExpQupey();
}, null, true, '');

new CronJob('0 0 23 * * *', function() {
    Cron.checkExpQupey();
   }, null, true, '');
   
  