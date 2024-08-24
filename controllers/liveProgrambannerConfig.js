const { fileUpload } = require("../common/aws");
const LiveProgramBannerModel = require("../models/Live Program Banners")

exports.addLiveProgramBanner = (req, res) => {
    try {
        let data = req.body;
        const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;
        if (!thumbnailFile) {
            res.json({ "status": false, message: "Please provide a valid thumbnail file" });
            return;
        }

        LiveProgramBannerModel.findOne({ "title": new RegExp(data.title,"i") }, (err, exLiveProgramBanner) => {
            if (!exLiveProgramBanner) {
                fileUpload(thumbnailFile, (uploadData) => {
                    if (uploadData.status) {
                        data.thumbnail = uploadData.url; 
                        LiveProgramBannerModel.create(data, (err, newLiveProgramBanner) => {
                            if (newLiveProgramBanner) {
                                res.json({ "status": true, "message": "New Live Program Banner added successfully", "data": newLiveProgramBanner });
                            } else {
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
                if (exLiveProgramBanner.title === data.title) {
                    errorMessage += `Title '${data.title}' already exists. `;
                }
                res.json({ "status": false, "message": errorMessage.trim() });
            }
        });
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.editLiveProgramBanner = async (req, res) => {
    try {

        let data = req.body;

        let findLiveProgramBanner = await LiveProgramBannerModel.findById(data.bannerId)

        if (!findLiveProgramBanner) {
            res.json({ "status": false, "message": "Live Program Banner does not exist." });
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

        let updatedLiveProgramBanner = await LiveProgramBannerModel.findByIdAndUpdate(findLiveProgramBanner._id, {
            "bannerFor": data.bannerFor, "videoUrl": data.videoUrl, "thumbnail": thumbnail
        }, { new: true })
        if (updatedLiveProgramBanner) {
            if (updatedLiveProgramBanner) {
                res.json({ "status": true, "message": "Live Program Banner updated successfully", "data": updatedLiveProgramBanner });
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

        let findLiveProgramBanner = await LiveProgramBannerModel.findById(data.bannerId)

        if (!findLiveProgramBanner) {
            res.json({ "status": false, "message": "Live Program Banner does not exist." });
            return;
        }
        
        let updatedLiveProgramBanner = await LiveProgramBannerModel.findByIdAndUpdate(findLiveProgramBanner._id, {
            "isActive": data.isActive
        }, { new: true })
        if (updatedLiveProgramBanner) {
            if (updatedLiveProgramBanner) {
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

exports.fetchLiveProgramBanner = (req, res) => {
    try {
        let data = req.body;

        LiveProgramBannerModel.findById({ "_id": data.bannerId }, (err, exLiveProgramBanner) => {
            if (exLiveProgramBanner) {
                res.json({ "status": true,  "data": exLiveProgramBanner });
            } else {
                res.json({ "status": false, "message": "Live Program Banner does not exist." });
            }
        });
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.LiveProgramBannerList = (req, res) => {

        let data = req.body;

        LiveProgramBannerModel.find().select({"_id":1,"thumbnail":1,"title":1,"videoUrl":1,"isActive":1}).sort({ "createdAt": -1 }).then((exLiveProgramBanner) => {
            if (exLiveProgramBanner.length >0) {

                res.json({ "status": true,"data": exLiveProgramBanner });
            } else {
                res.json({ "status": false, "message": "Live Program Banner list is empty" });
            }
        }).catch((error) => {
            res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
        })

};
exports.activeLiveProgramBannerList = (req, res) => {


    LiveProgramBannerModel.find({"isActive":true}).sort({ "createdAt": -1 }).then((exSubscriptionBanner) => {
        if (exSubscriptionBanner.length >0) {

            res.json({ "status": true,"data": exSubscriptionBanner });
        } else {
            res.json({ "status": false, "message": "SubscriptionBanner list is empty" });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};


exports.deleteLiveProgramBanner = (req, res) => {

    try {

        let BannerId = req.body.bannerId

        LiveProgramBannerModel.findByIdAndDelete({ "_id": BannerId }, { new: true }, (err, exLiveProgramBanner) => {
            if (exLiveProgramBanner) {

                res.json({ "status": true, "message": "Live Program Banner has been deleted successfully" })

            } else {
                res.json({ "status": false, "message": `Live Program Banner does not exists` })
            }
        })

    } catch (error) {

        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
}
