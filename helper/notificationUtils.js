let apn = require("apn");
let AWS = require("aws-sdk");
let FCM = require('fcm-node');
let utils = require('../helper/utils.js');
let notificationModel = require('../modules/notification/notificationModel.js');
let notificationUtil = {};

notificationUtil.generateAPNData = (data) => {
    let notification = {
        "badge": 1,
        "sound": "default",
        "alert": "",
        "content-available": "",
        "category": ""
    };
    let payload = {};
    for (var key in data) {
        switch (key) {
            case 'title':
                notification.alert.title = data.title;
                notification.alert.body = "";
                break;
            case 'body':
                if (!(notification.alert["title"]) || (notification.alert["title"] && utils.empty(notification.alert.title))) {
                    notification.alert.title = data.body;
                } else {
                    notification.alert.body = data.body;
                }
                break;
            case 'badge':
                notification.badge = data.badge;
                break;
            case 'sound':
                notification.sound = data.sound;
                break;
            case 'content-available':
                //notification.setNewsstandAvailable(true);
                var isAvailable = data['content-available'] === 1;
                notification.contentAvailable = isAvailable;
                break;
            case 'category':
                notification.category = data.category;
                break;
            default:
                payload[key] = data[key];
                break;
        }
    }
    notification.payload = payload;
    notification.expiry = Math.floor(Date.now() / 1000) + 3600;
    return notification;
}

notificationUtil.generateGCMData = (data) => {
    let notification = {
        "notification": {},
        "data": {}
    };
    let payload = {};
    for (var key in data) {
        switch (key) {
            case "title":
                notification["notification"]["title"] = data["title"];
                break;
            case "body":
                notification["notification"]["body"] = data["body"];
                break;
            case "icon":
                notification["notification"]["icon"] = data["body"];
                break;
            default:
                payload[key] = data[key];
                break;
        }
    }
    notification.data = payload;
    return notification;
}

//Get SNS
notificationUtil.getSNSObject = () => {
    let SES_CONFIG = config.AWS;
    SES_CONFIG = _.extend(SES_CONFIG, { apiVersion: '2010-03-31' });
    let sns = new AWS.SNS(SES_CONFIG);
    return sns;
}

//Create Platform EndPoint

notificationUtil.addDeviceToken = (deviceType, deviceToken, callback) => {
    let sns = notificationUtil.getSNSObject();
    let device_type = (deviceType != null) ? deviceType : "IOS"
    let params = {
        PlatformApplicationArn: process.env["AWS_SNS_" + device_type.toUpperCase() + "_APP_ARN"],
        Token: deviceToken,
        CustomUserData: ""
    }
    sns.createPlatformEndpoint(params, (err, endpointDetails) => {
        console.log("inside notification service", err, endpointDetails);
        if (utils.empty(err)) {
            callback(err, endpointDetails.EndpointArn);
        } else {
            callback(err, null);

        }
    });
}
//Topics Subscribe-Unsubscribe  
notificationUtil.updateSubscription = (endpointArn, settings, callback) => {
    let sns = notificationUtil.getSNSObject();
    for (var key in settings) {
        console.log("key", settings)
        if (settings[key].value) {

            let subscribeParam = {
                Endpoint: endpointArn,
                Protocol: "application",
                TopicArn: process.env[key.toUpperCase() + "_ARN"]
            }
            sns.subscribe(subscribeParam, function (err, data) {
                console.log(err, data);
                settings[key].id = data.SubscriptionArn
                callback(err, settings);
            });
        } else {
            let unsubscribeParam = {
                SubscriptionArn: settings[key].id
            }
            sns.unsubscribe(unsubscribeParam, function (err, data) {
                console.log(err, data);
                settings[key].id = null;
                callback(err, settings);
            });
        }
    }

}
//Topics Subscribe
notificationUtil.subscription = (endpointArn, type, settings, callback) => {
    let sns = notificationUtil.getSNSObject();

    console.log("key", settings)
    let subscribeParam1 = {
        Endpoint: endpointArn,
        Protocol: "application",
        TopicArn: process.env.NEWQUPEYNOTIFY_ARN
    }
    let subscribeParam2 = {
        Endpoint: endpointArn,
        Protocol: "application",
        TopicArn: process.env.EXPQUPEYNOTIFY_ARN
    }
    let subscribeParam3 = {
        Endpoint: endpointArn,
        Protocol: "application",
        TopicArn: process.env.REDEMPTIONNOTIFY_ARN
    }

    let subscribeParam4 = {
        Endpoint: endpointArn,
        Protocol: "application",
        TopicArn: process.env.NEWBUSINESSNOTIFY_ARN
    }
    if (type == "user") {
        sns.subscribe(subscribeParam1, function (err1, data1) {
            if (!err1) {
                settings["newQupeyNotify"].id = data1.SubscriptionArn
            }
            sns.subscribe(subscribeParam2, function (err2, data2) {
                if (!err2) {
                    settings["expQupeyNotify"].id = data2.SubscriptionArn
                }
                sns.subscribe(subscribeParam2, function (err3, data3) {
                    if (!err3) {
                        settings["redemptionNotify"].id = data3.SubscriptionArn
                    }
                    sns.subscribe(subscribeParam2, function (err4, data4) {
                        if (!err4) {
                            settings["newBusinessNotify"].id = data4.SubscriptionArn
                        }
                        callback(settings)
                    });
                });
            });
        });

    }
    else {
        callback(settings)
    }



}
//unsubscribe
notificationUtil.unsubscribe = (settings, callback) => {
    let sns = notificationUtil.getSNSObject();
    console.log("key", settings)

    let unsubscribeParam1 = {
        SubscriptionArn: settings["newQupeyNotify"].id
    }
    sns.unsubscribe(unsubscribeParam1, function (err1, data1) {

        settings["newQupeyNotify"].id = null;
        let unsubscribeParam2 = {
            SubscriptionArn: settings["expQupeyNotify"].id
        }
        sns.unsubscribe(unsubscribeParam2, function (err2, data2) {

            settings["expQupeyNotify"].id = null;
            let unsubscribeParam3 = {
                SubscriptionArn: settings["redemptionNotify"].id
            }
            sns.unsubscribe(unsubscribeParam3, function (err3, data3) {

                settings["redemptionNotify"].id = null;
                let unsubscribeParam4 = {
                    SubscriptionArn: settings["newBusinessNotify"].id
                }
                sns.unsubscribe(unsubscribeParam4, function (err4, data4) {

                    settings["newBusinessNotify"].id = null;
                    callback(settings);
                });
            });
        });
    });



}
/*
 * Send notifiction to ios
 */
notificationUtil.sendNotification = (data) => {
    let sns = notificationUtil.getSNSObject();
    // let APNData = notificationUtil.generateAPNData(data);
    // let GCMData = notificationUtil.generateGCMData(data);
    let dt = {
        "default": data.title,
        "APNS_SANDBOX": JSON.stringify({
            "aps": {
                "alert": data.APNData, "sound": 'default',
                "badge": 1
            }
        }),
        // "GCM": JSON.stringify({ "notification": GCMData })
    }
    let send = {
        TopicArn: process.env[data.key.toUpperCase() + "_ARN"],
        Message: JSON.stringify(dt),
        Subject: data.title,
        MessageStructure: "json"
    }
    //console.log("Topic ARN",send)
    sns.publish(send, (err, messageSuccess) => {
        console.log(err, messageSuccess);
        sns.listSubscriptionsByTopic({ TopicArn: process.env[data.key.toUpperCase() + "_ARN"] }, (err2, listSub) => {
            console.log("err2, listSub", err2, listSub.Subscriptions);

            let saveAll = listSub.Subscriptions.map((subscription) => {
                return { "endPointArn": subscription.Endpoint, "notifyMsg": data.HTMLData }
            })
            try {
                notificationModel.insertMany(saveAll)
            } catch (e) {
                console.log(e);
            }
        })
    });
};
notificationUtil.sendOneNotification = (data) => {
    let sns = notificationUtil.getSNSObject();
    // let APNData = notificationUtil.generateAPNData(data);
    // let GCMData = notificationUtil.generateGCMData(data);
    let dt = {
        "default": data.title,
        "APNS_SANDBOX": JSON.stringify({
            "aps": {
                "alert": data.APNData, "sound": 'default',
                "badge": 1
            }
        }),
        // "GCM": JSON.stringify({ "notification": GCMData })
    }
    let send = {
        TargetArn: data.targetARN,
        Message: JSON.stringify(dt),
        Subject: data.title,
        MessageStructure: "json"
    }
    //console.log("Topic ARN",send)
    sns.publish(send, (err, messageSuccess) => {
        console.log(err, messageSuccess);
        let saveData = { "endPointArn": data.targetARN, "notifyMsg": data.HTMLData }
        let notify = new notificationModel(saveData);
        notify.save((err2, result) => {
            console.log(err2, result);
        })

    });
};
notificationUtil.deleteEndpoint = (endPoint) => {
    let sns = notificationUtil.getSNSObject();
    var params = {
        EndpointArn: endPoint  /* required */
    };
    sns.deleteEndpoint(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });
}
notificationUtil.notifyToMany = (devices, notifyMsg, htmlMsg) => {
    let androidDevices = devices.filter((dev) => dev.type == "Android")
    let iOSDevices = devices.filter((dev) => dev.type == "iOS")
    if (androidDevices.length != 0) {
        let device_list = androidDevices.map((dev) => { return dev.token });
        console.log(device_list);
        var serverKey = process.env.FCM_SERVERKEY; //put your server key here 
        var fcm = new FCM(serverKey);
        var message = { 
            registration_ids: device_list,
            collapse_key: '',
            notification: {
                title: "Qupey",
                body: notifyMsg,
                icon: "icon",
            },
            data: {}
        };
        console.log(message);
        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Android PN : Something has gone wrong!");
                console.log(err, response);
            } else {
                console.log("Android PN : Successfully sent with response: ", response);
            }
        });
    }
    if (iOSDevices.length != 0) {
        let options = {
            cert: process.env.APN_PEM,
            key: process.env.APN_PEM,
        };
        let device_list = iOSDevices.map((dev) => { return dev.token });
        console.log(device_list);
        let connection = new apn.Provider(options);
        let note = new apn.Notification();
        note.alert = notifyMsg;
        connection.send(note, device_list).then((response) => {
            console.log("apn___", response);
            response.sent.forEach((token) => {
            });
            response.failed.forEach((failure) => {
                console.log("apn err___", failure.response);
            });
        });
    }

    let saveAll = devices.map((device) => {
        return { "device_token": device.token, "notifyMsg": htmlMsg }
    })
    try {
        notificationModel.insertMany(saveAll)
    } catch (e) {
        console.log(e);
    }
}

module.exports = notificationUtil