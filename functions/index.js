const functions = require('firebase-functions');
const fetch = require("node-fetch");
const admin = require('firebase-admin');

admin.initializeApp();

const providers = [
    'paypal',
    'braintree',
    'stripe',
    'paytm',
    'payulatam',
    'flutterwave',
    'paystack',
    'securepay',
    'payfast',
    'liqpay',
    'culqi'
]

let arr = [];

for (let i = 0; i < providers.length; i++) {
    try {
        exports[providers[i]] = require('./providers/' + providers[i]);
        arr.push({
            name: providers[i],
            image: 'https://dev.exicube.com/images/' + providers[i] + '-logo.png',
            link: '/' + providers[i] + '-link'
        });
    }
    catch (e) {
        console.log("Provider " + providers[i] + " was not found. Ignore if you have removed yourself.");
    }
}

exports.get_providers = functions.https.onRequest((request, response) => {
    response.send(arr);
});


let sample_db = {
    "About_Us": {
        "contents": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting.\\\"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting.",
        "email": "support@email.com",
        "heading": "Who We Are",
        "phone": "+91 9635xxxxxx"
    },
    "cancel_reason": [{
        "label": "Unable to Contact Driver",
        "value": 0
    }, {
        "label": "Cab is not moving in my direction",
        "value": 1
    }, {
        "label": "My reason is not listed",
        "value": 2
    }, {
        "label": "Driver Denied duty",
        "value": 3
    }, {
        "label": "Cab is taking long time",
        "value": 4
    }],
    "offers": {
        "offer1": {
            "max_promo_discount_value": 10,
            "min_order": 10,
            "promo_description": "Free $10 for everybody",
            "promo_discount_type": "flat",
            "promo_discount_value": 10,
            "promo_name": "First ride bonus",
            "promo_start": "11/20/2019",
            "promo_usage_limit": 1000,
            "promo_validity": "01/01/2021"
        }
    },
    "rates": {
        "car_type": [{
            "convenience_fees": 10,
            "image": "https://dev.exicube.com/images/car0.png",
            "min_fare": 15,
            "name": "Economy",
            "rate_per_hour": 10,
            "rate_per_kilometer": 10
        }, {
            "convenience_fees": 15,
            "image": "https://dev.exicube.com/images/car1.png",
            "min_fare": 15,
            "name": "Comfort",
            "rate_per_hour": 20,
            "rate_per_kilometer": 20
        }, {
            "convenience_fees": 20,
            "image": "https://dev.exicube.com/images/car2.png",
            "min_fare": 20,
            "name": "Exclusive",
            "rate_per_hour": 30,
            "rate_per_kilometer": 30
        }]
    },
    "referral": {
        "bonus": {
            "amount": 10,
            "id": "bonus",
            "key": "bonus",
            "updatedAt": 1564495712585
        }
    },
    "settings": {
        "cash": true,
        "code": "USD",
        "panic": "991",
        "symbol": "$",
        "wallet": true,
        "driver_approval": true,
        "otp_secure": false,
        "email_verify": true
    }
}

exports.setup = functions.https.onRequest((request, response) => {
    admin.database().ref('/users').once("value", (snapshot) => {
        if (snapshot.val()) {
            response.send({ message: "Setup is already done" });
        } else {
            admin.auth().createUser({
                email: request.query.email,
                password: request.query.password,
                emailVerified: false
            })
                .then((userRecord) => {
                    let users = {};
                    users[userRecord.uid] = {
                        "firstName": "Admin",
                        "lastName": "Admin",
                        "email":  request.query.email,
                        "usertype" : 'admin',
                        "approved" : true
                    };
                    sample_db["users"] = users;
                    admin.database().ref('/').set(sample_db);
                    response.send({ message: "Setup done sucessfully" });
                    return true;
                })
                .catch((error) => {
                    response.send({ error: error });
                    return true;
                });
        }
    });
});

exports.success = functions.https.onRequest((request, response) => {
    var amount_line = request.query.amount ? `<h3>Your Payment of <strong>${request.query.amount}</strong> was Successfull</h3>` : '';
    var order_line = request.query.order_id ? `<h5>Order No : ${request.query.order_id}</h5>` : '';
    var transaction_line = request.query.transaction_id ? `<h6>Transaction Ref No : ${request.query.transaction_id}</h6>` : '';
    response.status(200).send(`
        <!DOCTYPE HTML>
        <html>
        <head> 
            <meta name='viewport' content='width=device-width, initial-scale=1.0'> 
            <title>Payment Success</title> 
            <style> 
                body { font-family: Verdana, Geneva, Tahoma, sans-serif; } 
                h3, h6, h4 { margin: 0px; } 
                .container { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; padding: 60px 0; } 
                .contentDiv { padding: 40px; box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.3); border-radius: 10px; width: 70%; margin: 0px auto; text-align: center; } 
                .contentDiv img { width: 140px; display: block; margin: 0px auto; margin-bottom: 10px; } 
                .contentDiv h3 { font-size: 22px; } 
                .contentDiv h6 { font-size: 13px; margin: 5px 0; } 
                .contentDiv h4 { font-size: 16px; } 
            </style>
        </head>
        <body> 
            <div class='container'>
                <div class='contentDiv'> 
                    <img src='https://cdn.pixabay.com/photo/2012/05/07/02/13/accept-47587_960_720.png' alt='Icon'> 
                    ${amount_line}
                    ${order_line}
                    ${transaction_line}
                    <h4>Thank you for your payment.</h4>
                </div>
            </div>
        </body>
        </html>
    `);
});

exports.cancel = functions.https.onRequest((request, response) => {
    response.send(`
        <!DOCTYPE HTML>
        <html>
        <head> 
            <meta name='viewport' content='width=device-width, initial-scale=1.0'> 
            <title>Payment Cancelled</title> 
            <style> 
                body { font-family: Verdana, Geneva, Tahoma, sans-serif; } 
                .container { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; padding: 60px 0; } 
                .contentDiv { padding: 40px; box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.3); border-radius: 10px; width: 70%; margin: 0px auto; text-align: center; } 
                .contentDiv img { width: 140px; display: block; margin: 0px auto; margin-bottom: 10px; } 
                h3, h6, h4 { margin: 0px; } .contentDiv h3 { font-size: 22px; } 
                .contentDiv h6 { font-size: 13px; margin: 5px 0; } 
                .contentDiv h4 { font-size: 16px; } 
            </style>
        </head>
        <body> 
            <div class='container'> 
                <div class='contentDiv'> 
                    <img src='https://cdn.pixabay.com/photo/2012/05/07/02/13/cancel-47588_960_720.png' alt='Icon'> 
                    <h3>Your Payment Failed</h3> 
                    <h4>Please try again.</h4>
                </div> 
            </div>
        </body>
        </html>
    `);
});

const getDistance = (lat1, lon1, lat2, lon2) => {
    if ((lat1 === lat2) && (lon1 === lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344;
        return dist;
    }
}

const RequestPushMsg = async (token, title, msg) => {
    let response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'accept-encoding': 'gzip, deflate',
            'host': 'exp.host'
        },
        body: JSON.stringify({
            "to": token,
            "title": title,
            "body": msg,
            "data": { "msg": msg, "title": title },
            "priority": "high",
            "sound": "default",
            "channelId": "messages",
            "_displayInForeground": true
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    } else {
        return await response.json()
    }
}

exports.newBooking = functions.database.ref('/bookings/{bookingId}')
    .onCreate((snapshot, context) => {
        const booking = snapshot.val();
        booking.key = context.params.bookingId;
        if (!booking.bookLater) {
            admin.database().ref('/users').orderByChild("queue").equalTo(false).once("value", (ddata) => {
                let drivers = ddata.val();
                if (drivers) {
                    for (let dkey in drivers) {
                        let driver = drivers[dkey];
                        driver.key = dkey;
                        if (driver.usertype === 'driver' && driver.approved === true && driver.driverActiveStatus === true && driver.location) {
                            let originalDistance = getDistance(booking.pickup.lat, booking.pickup.lng, driver.location.lat, driver.location.lng);
                            if (originalDistance <= 10 && driver.carType === booking.carType) {
                                admin.database().ref('bookings/' + booking.key + '/requestedDrivers/' + driver.key).set(true);
                                RequestPushMsg(driver.pushToken, 'GrabCab Notification', 'You Have A New Booking Request');
                            }
                        }
                    }
                }
            });
        }
    });

exports.bookingScheduler = functions.pubsub.schedule('every 5 minutes').onRun((context) => {
    admin.database().ref('/bookings').orderByChild("status").equalTo('NEW').once("value", (snapshot) => {
        let bookings = snapshot.val();
        if (bookings) {
            for (let key in bookings) {
                let booking = bookings[key];
                booking.key = key;
                let date1 = new Date();
                let date2 = new Date(booking.tripdate);
                let diffTime = date2 - date1;
                let diffMins = diffTime / (1000 * 60);
                if (diffMins > 0 && diffMins < 15 && booking.bookLater && !booking.requestedDrivers) {
                    admin.database().ref('/users').orderByChild("queue").equalTo(false).once("value", (ddata) => {
                        let drivers = ddata.val();
                        if (drivers) {
                            for (let dkey in drivers) {
                                let driver = drivers[dkey];
                                driver.key = dkey;
                                if (driver.usertype === 'driver' && driver.approved === true && driver.driverActiveStatus === true && driver.location) {
                                    let originalDistance = getDistance(booking.pickup.lat, booking.pickup.lng, driver.location.lat, driver.location.lng);
                                    if (originalDistance <= 10 && driver.carType === booking.carType) {
                                        admin.database().ref('bookings/' + booking.key + '/requestedDrivers/' + driver.key).set(true);
                                        RequestPushMsg(driver.pushToken,'GrabCab Notification', 'You Have A New Booking Request');
                                    }
                                }
                            }
                        }
                    });
                }
                if (diffMins < -15) {
                    admin.database().ref("bookings/" + booking.key + "/requestedDrivers").remove();
                    admin.database().ref('bookings/' + booking.key).update({
                        status: 'CANCELLED',
                        reason: 'RIDE AUTO CANCELLED. NO RESPONSE'
                    });
                }
            }
        }
    });
});


exports.send_notification = functions.https.onRequest((request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    RequestPushMsg(request.query.token,request.query.title,request.query.msg).then((responseData)=>{
        response.send(responseData);
        return true;
    }).catch(error=>{   
        response.send({error:error});
    });
});

exports.userDelete = functions.database.ref('/users/{uid}')
    .onDelete((snapshot, context) => {
      let uid = context.params.uid
      return admin.auth().deleteUser(uid);
    });