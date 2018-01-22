/*
  Useful URL http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
*/
const config = require('../config/config')
const utilsfunction = require('./utils');
const sizeOf = require('image-size');
const resizeImg = require('resize-img');
const fs = require('fs');
const AWS = require('aws-sdk');
let gm = require('gm')
    .subClass({ imageMagick: true });
const url = require('url');
const https = require('https');
let path = require('path');
let async = require('async');
AWS.config.update(config.AWS)

const Q = require('q')
const awsUtils = {}

const S3 = new AWS.S3()

awsUtils.listAllBuckets = function () {
  let deferred = Q.defer()
  S3.listBuckets(function (err, data) {
    if (err) {
      deferred.reject(err)
    } else {
      deferred.resolve(data)
    }
  })
  return deferred.promise
}

awsUtils.uploadFileToBucket = function (file, cb) {
  // Read in the file, convert it to base64, store to S3
    let deferred = Q.defer()
    // fs.readFile(file.path, function (err, data) {
    //     if (err) { throw err }

        let base64data = new Buffer(file.data, 'binary')
        S3.upload({
            Bucket: config.AWS_BUCKET,
            Key: file.path,
            Body: base64data,
            ACL: 'public-read'
        }, function (err, data) {
            if (err) {
                deferred.reject(err)
            } else {
                deferred.resolve(data)
            }
        })
    // })
    cb(deferred.promise);
}

awsUtils.uploadFileToBuckets = (file, referenceId, storagePath, cb) => {
  
    let configS3 = config.AWS_CONFIG;
    let response = { "data": [], "error": "" };
    configS3 = _.extend(configS3, { apiVersion: '2006-03-01' });
    let s3 = new AWS.S3(configS3);
    // console.log("load resize upload done");
    // console.log("-------------------------");
    // console.log(file);
    let newFilename = referenceId + "_" + utilsfunction.getTime() + ".png";
    let newPath = storagePath + newFilename;
    let base64data = new Buffer(file, 'binary')
    let params = {
        Bucket: config.AWS_BUCKET,
        Key: newPath,
        Body: base64data,
        ACL: 'public-read',
        ContentType: 'image/png'
    };
    s3.putObject(params, (err, res) => {
        // console.log(err, res);
        if( utilsfunction.isDefined(err) ){
            response.error = err;
        } else {
            response.data.push(newFilename);
        }
        cb(response);
    });
}

awsUtils.uploadFile = (file, referenceId, storagePath, cb) => {
    let files = file;
    let currentFile = awsUtils;
    let response = { "data": [], "error": "" };
    let fileData = [];
    let configS3 = config.AWS_CONFIG;
    configS3 = _.extend(configS3, { apiVersion: '2006-03-01' });
    let s3 = new AWS.S3(configS3);
    let oldFilename = file.path;
    let fileName = file.name;
    let extension = path.extname(fileName);
    let baseFileName = path.basename(fileName, extension);
    let newFilename = referenceId + "_" + utilsfunction.getTime() + extension;
    let newPath = storagePath + newFilename;
    let data = fs.readFileSync(oldFilename);
    console.log(storagePath);
     console.log("data");
    fileData.push({

        "data": data,
        "type": file.type,
        "name": newFilename,
        "path": newPath
    });
     console.log(fileData);
    if( fileData.length > 0 ) {
        async.eachSeries(fileData, (file, callback) => {
            let params = {
                Bucket: process.env.BUCKET_NAME,
                ACL: 'public-read',
                Body: file.data,
                Key: file.path,
                ContentType: file.type
            };
            console.log(params);
            s3.putObject(params, (err, res) => {
                // console.log(err, res);
                if( utilsfunction.isDefined(err) )
                    response.error = err;
                    // console.log(res);
                response.data.push(file.name);
                callback(response);
            });
        }, (err) => {
           cb(response);
          
        });
    } else {
        console.log("error");
        //callback(response);
    }
}
awsUtils.resize = (file, imagePath, userId, userThumbDir, fsize, cb) => {  
    // console.log("resizeUserIcon");  
    // console.log(file);

    // let imagePath = config.AWS_URL + config.ADVT_IMAGE_PATH + fileName; 
    
    var options = url.parse(imagePath);
    console.log(options);
    
    https.get(options, function (response) {
    let chunks = [];
    //console.log(response);    
    response.on('data', function (chunk) {
        chunks.push(chunk);
    }).on('end', function() {
    // console.log(chunks)
        let buffer = Buffer.concat(chunks);
    // dimensions.push(Buffer.concat(chunks));
        let dimensions = sizeOf(buffer);
       // console.log(dimensions);
        let ratio = 0;  // Used for aspect ratio
        // console.log(dimensions);
        if (dimensions.width > fsize && dimensions.height > fsize) {        
        gm(buffer).size(function(err, size) {
                    console.log(err, size);
                    if (err) {
                        console.log("err...in image resize.......", err);
                        cb(err);
                    } else {
                        let MAX_WIDTH = fsize;
                        let MAX_HEIGHT = fsize;
                        // Infer the scaling factor to avoid stretching the image unnaturally.
                        let scalingFactor = Math.max(
                            MAX_WIDTH / size.width,
                            MAX_HEIGHT / size.height
                        );
                        let width = scalingFactor * size.width;
                        let height = scalingFactor * size.height;

                        // Transform the image buffer in memory.
                        this.resize(width, height)
                            .toBuffer(imagePath.substr(imagePath.lastIndexOf('.')), function(err, buffer) {
                                if (err) {
                                    console.log('err............in resize function cb');
                                    console.log(err);
                                    cb(err);
                                } else {
                                    awsUtils.uploadFileToBuckets(buffer, userId, userThumbDir, (savedFile) =>{
                                        // console.log("uploadUserIcon done");
                                        // console.log(savedFile);
                                        cb(savedFile);
                                    });

                                }
                            });
                    }
                });     
        } else {        
            awsUtils.uploadFile(file, userId, userThumbDir, (savedFile) =>{
                cb(savedFile);
            });      
        }    
    });
    }); 
        
}

awsUtils.uploadUserlogoImage = (file, referenceId, storagePath, cb) => {
    if(!storagePath) {
        storagePath = config.DEFAULT_IMAGE_PATH;
    }
    let currentFile = awsUtils;
    let data = "";
    console.log("uploadLogoImage ");
    currentFile.uploadFile(file, referenceId, storagePath,(savefile)=>{
       // console.log(savefile);
      // console.log("cb",cb);
       cb(savefile);
       
    });
    
};
awsUtils.uploadBackgroundImage = (file, referenceId, storagePath, cb) => {
    if(!storagePath) {
        storagePath = config.DEFAULT_BACKGROUND_IMAGE_PATH;
    }
    let currentFile = awsUtils;
    console.log("uploadLogoImage ");
    currentFile.uploadFile(file, referenceId, storagePath,(savefile)=>{
        cb(savefile);
    });
};


awsUtils.uploadBannerImage = (file, userId, cb) => {
    let thumbSize = config.BACKGROUND_THUMB_SIZE;
    let fullSize = config.BACKGROUND_THUMB_SIZE;
    let couponFullImageDir = config.DEFAULT_BACKGROUND_IMAGE_PATH;
    let couponThumbDir = config.DEFAULT_THUMB_BACKGROUND_IMAGE_PATH;
    let currentFile = awsUtils;
    currentFile.uploadBackgroundImage(file, userId, couponFullImageDir,(savedFile1) => {
        let imagePath = config.AWS_URL + couponFullImageDir + savedFile1.data;
            currentFile.resize(file, imagePath, userId, couponThumbDir, thumbSize,(savedFile3) => {
                   let result = {
                    originalImage : savedFile1.data,
                    thumb : savedFile3.data
                }
                cb(result);
            });
    });
};

awsUtils.uploadLogoImage = (file, couponId, cb) => {
    let thumbSize = config.THUMB_IMAGE_SIZE;
    let fullSize = config.THUMB_IMAGE_SIZE;
    let couponFullImageDir = config.DEFAULT_IMAGE_PATH;
    let couponThumbDir = config.DEFAULT_THUMB_IMAGE_PATH;
    let currentFile = awsUtils;
     currentFile.uploadUserlogoImage(file, couponId, couponFullImageDir,(savedFile1) => {
        //console.log(savedFile1); 
        let imagePath = config.AWS_URL + couponFullImageDir + savedFile1.data;
        //console.log(imagePath);
        //console.log(file, imagePath, couponId, couponThumbDir, thumbSize);
            currentFile.resize(file, imagePath, couponId, couponThumbDir, thumbSize,(savedFile3) => {
                let result = {
                    originalImage : savedFile1.data,
                    thumb : savedFile3.data
                }
                cb(result);
            });
    });
};




awsUtils.deleteFile = (oldData, storagePath) => {
    console.log(oldData,storagePath);
    let configS3 = config.AWS_CONFIG;
    configS3 = _.extend(configS3, { apiVersion: '2006-03-01' });
    let s3 = new AWS.S3(configS3);
    let params = {
        Bucket: process.env.BUCKET_NAME
    };
    params.Key = storagePath + oldData;
    s3.deleteObject(params, function(err, data) {
        console.log(err,data);
    });
}

module.exports = awsUtils;
