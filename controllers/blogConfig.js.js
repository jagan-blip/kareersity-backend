const { fileUpload } = require("../common/aws");
const BlogModel = require("../models/blogs")

exports.addBlogs = (req, res) => {
    try {
        let data = req.body;
        const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;
        if (!thumbnailFile) {
            res.json({ "status": false, message: "Please provide a valid thumbnail file" });
            return;
        }

        BlogModel.findOne({ "title": data.title }, (err, exBlogs) => {
            if (!exBlogs) {
                fileUpload(thumbnailFile, (uploadData) => {
                    if (uploadData.status) {
                        data.thumbnail = uploadData.url;
                        BlogModel.create(data, (err, newBlogs) => {
                            if (newBlogs) {
                                res.json({ "status": true, "message": "New Blogs added successfully", "data": newBlogs });
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

                res.json({ "status": false, "message": `Title '${data.title}' already exists. ` });
            }
        });
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.editBlogs = async (req, res) => {
    try {

        let data = req.body;

        let findBlogs = await BlogModel.findById(data.blogId)

        if (!findBlogs) {
            res.json({ "status": false, "message": "Blog does not exist." });
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

        let updatedBlogs = await BlogModel.findByIdAndUpdate(findBlogs._id, {
            "title": data.title, "sDesc": data.sDesc, "dDesc": data.dDesc, "thumbnail": thumbnail
        }, { new: true })
        if (updatedBlogs) {
            if (updatedBlogs) {
                res.json({ "status": true, "message": "Blog updated successfully", "data": updatedBlogs });
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

        let findBlogs = await BlogModel.findById(data.blogId)

        if (!findBlogs) {
            res.json({ "status": false, "message": "Blogs does not exist." });
            return;
        }

        let updatedBlogs = await BlogModel.findByIdAndUpdate(findBlogs._id, {
            "isActive": data.isActive
        }, { new: true })
        if (updatedBlogs) {
            if (updatedBlogs) {
                res.json({ "status": true, "message": "Status updated successfully", "data": updatedBlogs });
            } else {

                res.json({ "status": false, "message": "Please try again." });
            }
        }

    } catch (error) {
        console.log(error)
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.fetchBlogs = (req, res) => {
    try {
        let data = req.body;

        BlogModel.findById({ "_id": data.blogId }, (err, exBlogs) => {
            if (exBlogs) {
                res.json({ "status": true, "message": "Blogs found successfully", "data": exBlogs });
            } else {
                res.json({ "status": false, "message": "Blogs does not exist." });
            }
        });
    } catch (error) {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    }
};

exports.BlogsList = (req, res) => {

    BlogModel.find().select({ "_id": 1, "thumbnail": 1, "title": 1, "sDesc": 1, "isActive": 1, "updatedAt": 1 }).sort({ "createdAt": -1 }).then((exBlogs) => {
        if (exBlogs.length > 0) {

            res.json({ "status": true, "data": exBlogs });
        } else {
            res.json({ "status": false, "message": "Blogs list is empty" });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};

exports.activeBlogsList = (req, res) => {

    BlogModel.find({ "isActive": true }).select({ "_id": 1, "thumbnail": 1, "title": 1, "sDesc": 1, "isActive": 1, "updatedAt": 1 }).sort({ "createdAt": -1 }).then((exBlogs) => {
        if (exBlogs.length > 0) {

            res.json({ "status": true, "data": exBlogs });
        } else {
            res.json({ "status": false, "message": "Blogs list is empty" });
        }
    }).catch((error) => {
        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later." });
    })

};

exports.deleteBlogs = (req, res) => {

    try {

        let BlogsId = req.body.blogId

        BlogModel.findByIdAndDelete({ "_id": BlogsId }, { new: true }, (err, exBlogs) => {
            if (exBlogs) {

                res.json({ "status": true, "message": "Blogs has been deleted successfully", "data": exBlogs })

            } else {
                res.json({ "status": false, "message": `Blogs does not exists` })
            }
        })

    } catch (error) {

        res.json({ "status": false, "message": "Oops! Something went wrong. Please try again later" })
    }
}
