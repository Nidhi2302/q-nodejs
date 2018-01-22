var mongoose = require('mongoose');

/* if(process.env.DBUSER != ''){
	
} else {
	mongoose.connect('mongodb://'+process.env.DATABASEURL+':'+process.env.DATABSEPORT+'/'+process.env.DATABASE);
} */

mongoose.connect('mongodb://' + process.env.DBUSER + ':' + process.env.DBPASSWORD + '@'+process.env.DATABASEURL+'/'+process.env.DATABASE);

mongoose.connection.on('error', function (err) {
	console.log(err);
    console.log("Could not connect server....");
});