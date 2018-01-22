let devSetting = function () {};
devSetting.SECRET = process.env.SECRET_KEY
devSetting.STRIPE_PLAN = process.env.STRIPE_PLAN
devSetting.AWS_EMAIL = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY_ID,
  region:'us-east-1'    
}
devSetting.AWS = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY_ID,
  region:'us-east-1'    
}
devSetting.AWS_BUCKET = process.env.BUCKET_NAME;
devSetting.AWS_URL = "https://s3.amazonaws.com/qupey-images/";
devSetting.DEFAULT_IMAGE_PATH = "logo_images/default/";
devSetting.DEFAULT_BACKGROUND_IMAGE_PATH = "background_images/default/";
devSetting.DEFAULT_THUMB_IMAGE_PATH = "logo_images/thumb/";
devSetting.DEFAULT_THUMB_BACKGROUND_IMAGE_PATH = "background_images/thumb/";
devSetting.THUMB_IMAGE_SIZE = 288;
devSetting.BACKGROUND_THUMB_SIZE =1245;
module.exports = devSetting;