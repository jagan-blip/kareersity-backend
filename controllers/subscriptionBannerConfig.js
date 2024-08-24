const { fileUpload } = require("../common/aws");
const SubscriptionBannerModel = require("../models/subscriptionBanner")

exports.addSubscriptionBanner = (req, res) => {
    try {
        let data = req.body;
        const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;
        if (!thumbnailFile) {
            res.json({ "status": false, message: "Please provide a valid thumbnail file" });
            return;
        }

        SubscriptionBannerModel.findOne({ "title": new RegExp(data.title,"i") }, (err, exSubscriptionBanner) => {
            if (!exSubscriptionBanner) {
                fileUpload(thumbnailFile, (uploadData) => {
                    if (uploadData.status) {
                        data.thumbnail = uploadData.url; 
                        SubscriptionBannerModel.create(data, (err, newSubscriptionBanner) => {
                            if (newSubscriptionBanner) {
                                res.json({ "status": true, "message": "New SubscriptionBanner added successfully", "data": newSubscriptionBanner });
                            } else {
                                console.log(err)
                                res.json({ "status": false, "message": "Please try again." });
                            }
                        });
                    } else {
                        res.json({ "status": false, message: "Error occurred while uploading the thumbnail file, please try again" });
                        return;
                    }
                });
            } else {
                let errorMessage = "";
                if (exSubscriptionBanner.title === data.title) {
                    errorMessage += `Title '${data.title}' already exists. `;
                }
                res.json({ "status": false, "message": errorMessage.trim() });
            }
        });
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.editSubscriptionBanner = async (req, res) => {
    try {

        let data = req.body;

        let findSubscriptionBanner = await SubscriptionBannerModel.findById(data.subscription_bannerId)

        if (!findSubscriptionBanner) {
            res.json({ "status": false, "message": "SubscriptionBanner does not exist." });
            return;
        }
        const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;
        let thumbnail
        if (thumbnailFile) {
            thumbnail = await new Promise((resolve) => {
                fileUpload(thumbnailFile, (uploadData) => {
                    if (uploadData.status) {
                        resolve(uploadData.url);
                    } else {
                        res.json({ "status": false, message: "Error occurred while uploading video, please try again" });
                        return;
                    }
                });
            });
        }

        let updatedSubscriptionBanner = await SubscriptionBannerModel.findByIdAndUpdate(findSubscriptionBanner._id, {
            "title": data.title, "content1": data.content1, "content2": data.content2, "url": data.url,"thumbnail": thumbnail,"bannerFor": data.bannerFor
        }, { new: true })
        if (updatedSubscriptionBanner) {
            if (updatedSubscriptionBanner) {
                res.json({ "status": true, "message": "Subscription Banner updated successfully", "data": updatedSubscriptionBanner });
            } else {

                res.json({ "status": false, "message": "Please try again." });
            }
        }

    } catch (error) {
        console.log(error)
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.changeStatus = async (req, res) => {
    try {

        let data = req.body;

        let findSubscriptionBanner = await SubscriptionBannerModel.findById(data.subscription_bannerId)

        if (!findSubscriptionBanner) {
            res.json({ "status": false, "message": "Subscription Banner does not exist." });
            return;
        }
        
        let updatedSubscriptionBanner = await SubscriptionBannerModel.findByIdAndUpdate(findSubscriptionBanner._id, {
            "isActive": data.isActive
        }, { new: true })
        if (updatedSubscriptionBanner) {
            if (updatedSubscriptionBanner) {
                res.json({ "status": true, "message": "Status updated successfully" });
            } else {

                res.json({ "status": false, "message": "Please try again." });
            }
        }

    } catch (error) {
        console.log(error)
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.fetchSubscriptionBanner = (req, res) => {
    try {
        let data = req.body;

        SubscriptionBannerModel.findById({ "_id": data.subscription_bannerId }, (err, exSubscriptionBanner) => {
            if (exSubscriptionBanner) {
                res.json({ "status": true,  "data": exSubscriptionBanner });
            } else {
                res.json({ "status": false, "message": "SubscriptionBanner does not exist." });
            }
        });
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.SubscriptionBannerList = (req, res) => {

      
        SubscriptionBannerModel.find().sort({ "createdAt": -1 }).then((exSubscriptionBanner) => {
            if (exSubscriptionBanner.length >0) {

                res.json({ "status": true,"data": exSubscriptionBanner });
            } else {
                res.json({ "status": false, "message": "SubscriptionBanner list is empty" });
            }
        }).catch((error) => {
            res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
        })

};
exports.activeSubscriptionBannerList = (req, res) => {


        SubscriptionBannerModel.find({"isActive":true}).sort({ "createdAt": -1 }).then((exSubscriptionBanner) => {
            if (exSubscriptionBanner.length >0) {

                res.json({ "status": true,"data": exSubscriptionBanner });
            } else {
                res.json({ "status": false, "message": "SubscriptionBanner list is empty" });
            }
        }).catch((error) => {
            res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
        })

};


exports.deleteSubscriptionBanner = (req, res) => {

    try {

        let SubscriptionBannerId = req.body.subscription_bannerId

        SubscriptionBannerModel.findByIdAndDelete({ "_id": SubscriptionBannerId }, { new: true }, (err, exSubscriptionBanner) => {
            if (exSubscriptionBanner) {

                res.json({ "status": true, "message": "SubscriptionBanner has been deleted successfully" })

            } else {
                res.json({ "status": false, "message": `SubscriptionBanner does not exists` })
            }
        })

    } catch (error) {

        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
}
