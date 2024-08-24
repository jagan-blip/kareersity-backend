
const courseModel = require('../models/courseMain');
const User = require('../models/user');
const AdminNotification = require('../models/adminNotifications');
const cartModel = require('../models/cart');
const AdminModel = require('../models/admin');
const OrderModel = require('../models/order');
const cron = require('node-cron')

const listOfNotificationsForAdminUsers = async (req,res) => {
    try {
        
        let id = req.userId
        
        const findAdminNotification = await AdminNotification.find({ "adminId": id }).select({ "_id": 1, "message": 1, "createdAt": 1 }).sort({ "createdAt": -1 }).limit(20);

        if (findAdminNotification && findAdminNotification.length > 0) {
            return res.json({ "status": true, "data": findAdminNotification })
        } else {
            return res.json({ "status": true, "data": [] })
        }
    } catch (error) {
        console.error('Error sending course expiration AdminNotifications:', error);
    }
};




const cartCoursesReminderForAdmin = async () => {
    try {
        
        const today = new Date();
        const before5Minutes = new Date(today);
        before5Minutes.setMinutes(today.getMinutes() - 5);
        const before10Minutes = new Date(today);
        before10Minutes.setMinutes(today.getMinutes() - 15);
       
        //console.log(today , before5Minutes,today > before5Minutes,"sms")
        const existingProductsInCart = await cartModel.find({
            updatedAt: {
                $lte:before5Minutes , 
                $gt: before10Minutes,
            }
            ,  $and: [
                { items: { $ne: [] } }
            ]
        });
       // console.log(existingProductsInCart,"sms")
        if (existingProductsInCart.length > 0) {
           
            existingProductsInCart.forEach(async (cart) => {
                const user = await User.findById(cart.userId);
                if (user) {
                    let adminUsers = await AdminModel.find({$or :[{type:"superAdmin"},{type:"admin"}]}).select({_id:1,type:1})
                    const message = `Recently , ${user.fullName} has added course(s) in cart.`;
                    let bulkNotifications = adminUsers.map(x=>{
                        return ({
                        userId: cart.userId,
                        adminId: x._id,
                        redirectId: cart._id,
                        message
                        })
                    })

                    //console.log(bulkNotifications,"bulkNotifications")
                    await AdminNotification.insertMany(bulkNotifications);
                }
            });
        }
    } catch (error) {
        console.error('Error sending course expiration AdminNotifications:', error);
    }
};
cron.schedule('*/11 * * * *', () => {
    //console.log('Running Notification every 11 , Min...');
    cartCoursesReminderForAdmin();
    
})
// setInterval(cartCoursesReminderForAdmin, 5 * 1000);


module.exports = { cartCoursesReminderForAdmin, listOfNotificationsForAdminUsers};
