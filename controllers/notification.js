const cron = require('node-cron')
const UserMyCourses = require('../models/userMyCourses');
const User = require('../models/user');
const Notification = require('../models/Notification');
const cartModel = require('../models/cart');
const { SendSMail } = require('../common/aws');
const EmailTempModel = require("../models/emailTemplates");
const config = require("../nodedetails/config");
const { UpdateTemplate } = require('../common/nommoc');

// const sendPriceDropNotifications = async () => {
//     try {
//         // Check for price drops in courses.
//         const coursesWithPriceDrops = await Courses.find({ priceDropped: true });

//         if (coursesWithPriceDrops.length > 0) {
//             // Send notifications to all users about price drops.
//             const users = await User.find();
//             users.forEach(async (user) => {
//                 const message = `Price has dropped in the following courses: ${coursesWithPriceDrops.map(Courses => Courses.courseName).join(', ')}`;
//                 const notification = new Notification({
//                     userId: user._id,
//                     message,
//                     timestamp: new Date(),
//                 });
//                 await notification.save();
//             });
//         }
//     } catch (error) {
//         console.error('Error sending price drop notifications:', error);
//     }
// };

const sendMyCoursesExpiryNotificationsToUser = async () => {
    try {
        // Calculate the dates for 1, 2, and 3 days from now.
        const today = new Date();
        const oneDayFromNow = new Date(today);
        oneDayFromNow.setDate(today.getDate() + 1);
        const twoDaysFromNow = new Date(today);
        twoDaysFromNow.setDate(today.getDate() + 2);
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);


        const expiredCourses = await UserMyCourses.find({
            validTill: {
                $lte: threeDaysFromNow,
                $gt: today,
            },
        });
        if (expiredCourses.length > 0) {
            // Send notifications to users with courses about to expire.
            expiredCourses.forEach(async (course) => {
                const user = await User.findById(course.userId);
                if (user) {
                    const daysUntilExpiry = Math.ceil(
                        (course.validTill - today) / (1000 * 60 * 60 * 24)
                    );
                    const message = `Your purchased course ${course.courseName} will expire in ${daysUntilExpiry} day(s).`;
                    const notification = new Notification({
                        userId: course.userId,
                        message,
                        timestamp: new Date(),
                    });
                    const exTemp = await EmailTempModel.findOne({ "templateName": "To send mails for  the course which is about to expire (Accessed by User)" });


                    if (!exTemp) {
                        return res.json({ "status": false, message: 'Template does not exist.!!!' });
                    }
                    let dataToReplace = {
                        user: user.fullName,
                        coursename: course.courseName


                    }
                    let newTemp = UpdateTemplate(exTemp, dataToReplace)
                    const template = newTemp.body, subject = newTemp.subject


                    SendSMail(subject, template, [user.email], config.krsAWSOptions.senderOrReplyTo, config.krsAWSOptions.senderOrReplyTo).then(async () => {
                        await notification.save();
                    }).catch(err => {
                        console.error(err)
                        res.json({ "status": false, "message": "Unable to send notification" })
                    })

                }
            });
        }
    } catch (error) {
        console.error('Error sending course expiration notifications:', error);
    }
};

const sendPriceDropNotifications = async (course, action) => {
    try {
        // Get all users.
        const users = await User.find();

        // Define the notification message based on the action (price drop or approval).
        let message = '';

        if (action === 'priceDrop') {
            message = `Price has dropped in the course: ${course.courseName}`;
        } else if (action === 'approval') {
            message = `New course approved: ${course.courseName}`;
        }

        // Create a notification for each user.
        const notifications = users.map((user) => ({
            userId: user._id,
            message,
            timestamp: new Date(),
        }));


        users.forEach(async (user) => {

            const subject = "Price drop alert for Karrer Sity courses!!!";

            try {
                await SendSMail(subject, message, [user.email]);
            } catch (err) {
                console.error(err);
            }
        });


        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
};


const sendUserNotificationsToCompleteProfile = async (res) => {
    try {
        const users = await User.find({ "profilePerCompleted": { $lt: 75 } });
        // const notifications = users.map((user) => ({
        //     userId: user._id,
        //     message: `Your profile score is ${user.profilePerCompleted}%. Please complete your profile to improve your score.`,
        // }));

    

        users.forEach(async (user) => {

            const exTemp = await EmailTempModel.findOne({ "templateName": "To Improve user profile score (Accessed by User)" });


            if (!exTemp) {
                return res.json({ "status": false, message: 'Template does not exist.!!!' });
            }

            let dataToReplace = {
                user: user.fullName,
                link: config.userContents.website

            }
            let newTemp = UpdateTemplate(exTemp, dataToReplace)
            const template = newTemp.body, subject = newTemp.subject
            //console.log(template)

            try {
                await SendSMail(subject, template, [user.email], config.krsAWSOptions.senderOrReplyTo, config.krsAWSOptions.senderOrReplyTo);

                const notification = new Notification({
                    userId: user._id,
                    message: `Your profile score is ${user.profilePerCompleted}%. Please complete your profile to improve your score.`,
                });
                await notification.save();
            } catch (err) {
                console.error(err);
            }
        });

        //await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error sending notifications:', error);
        res.json({ "status": false, "message": "Error sending notifications" });
    }
};

const cartProductReminder = async () => {
    try {

        const today = new Date();
        const before3Days = new Date(today);
        before3Days.setDate(today.getDate() - 3);

        //console.log(today , before3Days,today > before3Days,"sms")
        const existingProductsInCart = await cartModel.find({
            updatedAt: {
                $lte: today,
                $gt: before3Days,
            }
            , $and: [
                { items: { $ne: [] } }
            ]
        });
        // console.log(existingProductsInCart,"sms")
        if (existingProductsInCart.length > 0) {
           
            existingProductsInCart.forEach(async (cart) => {
                const user = await User.findById(cart.userId);
                if (user) {

                    const message = `Recently , you have added course(s) in your cart, but haven't purchase it yet...`;
                    const notification = new Notification({
                        userId: cart.userId,
                        message,
                        timestamp: new Date(),
                    });

                    let dataToReplace = {
                        user: user.fullName
                       
                    }
                    const exTemp = await EmailTempModel.findOne({ "templateName": "To send mail reminder if user has added course(s) in his cart, but hasn't purchase it yet  (Accessed by User)" });


                    if (!exTemp) {
                        return res.json({ "status": false, message: 'Template does not exist.!!!' });
                    }

                    let newTemp = UpdateTemplate(exTemp, dataToReplace)
                    const template = newTemp.body, subject = newTemp.subject
                    SendSMail(subject, template, [user.email], config.krsAWSOptions.senderOrReplyTo, config.krsAWSOptions.senderOrReplyTo).then(async () => {
                        await notification.save();
                    }).catch(err => {
                        console.error(err)
                        res.json({ "status": false, "message": "Unable to send notification" })
                    })
                }
            });
        }
    } catch (error) {
        console.error('Error sending course expiration notifications:', error);
    }
};

//setInterval(cartProductReminder, 8 * 60 * 60 * 1000);
cron.schedule('0 */8 * * *', () => {
    // Your task to be executed every 8 hours goes here
    cartProductReminder()
})

module.exports = { sendPriceDropNotifications, sendMyCoursesExpiryNotificationsToUser, sendUserNotificationsToCompleteProfile, cartProductReminder };
