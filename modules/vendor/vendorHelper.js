let fs = require('fs');
let vendorModel = require('./vendorModel.js');
let vendorHelper = {};
vendorHelper.vendorExists = (vendorId,callback) => {
        venderModel.findOne({
			'vendor_id':vendorId,
		}, {
			"vendor_id": 1,
		},
		function (err, vendorResults) {
            
        if(vendorResults){
            callback(true);
        }else{
            callback(false);
        }
    });
}
module.exports = vendorHelper;