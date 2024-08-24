const { fileUpload } = require("../common/aws");
const ShorstModel = require("../models/listenToExperts")

exports.addShorts = (req, res) => {
    try {
        let data = req.body;
        const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;
        if (!thumbnailFile) {
            res.json({ "status": false, message: "Please provide a valid thumbnail file" });
            return;
        }

        ShorstModel.findOne({ "title": new RegExp(data.title,"i") }, (err, exShorts) => {
            if (!exShorts) {
                fileUpload(thumbnailFile, (uploadData) => {
                    if (uploadData.status) {
                        data.thumbnail = uploadData.url; 
                        ShorstModel.create(data, (err, newShorts) => {
                            if (newShorts) {
                                res.json({ "status": true, "message": "New Shorts added successfully", "data": newShorts });
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
               
                res.json({ "status": false, "message":`Title '${data.title}' already exists. ` });
            }
        });
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.editShorts = async (req, res) => {
    try {

        let data = req.body;

        let findshorts = await ShorstModel.findById(data.shortsId)

        if (!findshorts) {
            res.json({ "status": false, "message": "shorts does not exist." });
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

        let updatedshorts = await ShorstModel.findByIdAndUpdate(findshorts._id, {
            "title": data.title, "videoUrl": data.videoUrl, "thumbnail": thumbnail
        }, { new: true })
        if (updatedshorts) {
            if (updatedshorts) {
                res.json({ "status": true, "message": "shorts updated successfully", "data": updatedshorts });
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

        let findshorts = await ShorstModel.findById(data.shortsId)

        if (!findshorts) {
            res.json({ "status": false, "message": "shorts does not exist." });
            return;
        }
        
        let updatedshorts = await ShorstModel.findByIdAndUpdate(findshorts._id, {
            "isActive": data.isActive
        }, { new: true })
        if (updatedshorts) {
            if (updatedshorts) {
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

exports.fetchShorts = (req, res) => {
    try {
        let data = req.body;

        ShorstModel.findById({ "_id": data.shortsId }, (err, exshorts) => {
            if (exshorts) {
                res.json({ "status": true, "message": "shorts found successfully", "data": exshorts });
            } else {
                res.json({ "status": false, "message": "shorts does not exist." });
            }
        });
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.shortsList = (req, res) => {

        let data = req.body;

        ShorstModel.find().select({"_id":1,"thumbnail":1,"title":1,"videoUrl":1,"isActive":1}).sort({ "createdAt": -1 }).then((exshorts) => {
            if (exshorts.length >0) {

                res.json({ "status": true,"data": exshorts });
            } else {
                res.json({ "status": false, "message": "shorts list is empty" });
            }
        }).catch((error) => {
            res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
        })

};


exports.deleteshorts = (req, res) => {

    try {

        let shortsId = req.body.shortsId

        ShorstModel.findByIdAndDelete({ "_id": shortsId }, { new: true }, (err, exshorts) => {
            if (exshorts) {

                res.json({ "status": true, "message": "shorts has been deleted successfully" })

            } else {
                res.json({ "status": false, "message": `shorts does not exists` })
            }
        })

    } catch (error) {

        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
}
