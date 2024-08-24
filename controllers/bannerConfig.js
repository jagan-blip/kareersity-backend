const { fileUpload } = require("../common/aws");
const BannerModel = require("../models/banner");

exports.addBanner = (req, res) => {
  try {
    let data = req.body;
    const thumbnailFile = req.files["thumbnail"]
      ? req.files["thumbnail"][0]
      : null;
    if (!thumbnailFile) {
      res.json({
        status: false,
        message: "Please provide a valid thumbnail file",
      });
      return;
    }

    BannerModel.findOne(
      { title: new RegExp(data.title, "i") },
      (err, exBanner) => {
        if (!exBanner) {
          fileUpload(thumbnailFile, (uploadData) => {
            if (uploadData.status) {
              data.thumbnail = uploadData.url;
              BannerModel.create(data, (err, newBanner) => {
                if (newBanner) {
                  res.json({
                    status: true,
                    message: "New Banner added successfully",
                    data: newBanner,
                  });
                } else {
                  res.json({ status: false, message: "Please try again." });
                }
              });
            } else {
              res.json({
                status: false,
                message:
                  "Error occurred while uploading the thumbnail file, please try again",
              });
              return;
            }
          });
        } else {
          let errorMessage = "";
          if (exBanner.title === data.title) {
            errorMessage += `Title '${data.title}' already exists. `;
          }
          res.json({ status: false, message: errorMessage.trim() });
        }
      }
    );
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.editBanner = async (req, res) => {
  try {
    let data = req.body;

    let findBanner = await BannerModel.findById(data.bannerId);

    if (!findBanner) {
      res.json({ status: false, message: "Banner does not exist." });
      return;
    }
    const thumbnailFile = req.files["thumbnail"]
      ? req.files["thumbnail"][0]
      : null;
    let thumbnail;
    if (thumbnailFile) {
      thumbnail = await new Promise((resolve) => {
        fileUpload(thumbnailFile, (uploadData) => {
          if (uploadData.status) {
            resolve(uploadData.url);
          } else {
            res.json({
              status: false,
              message: "Error occurred while uploading video, please try again",
            });
            return;
          }
        });
      });
    }

    let updatedBanner = await BannerModel.findByIdAndUpdate(
      findBanner._id,
      {
        bannerFor: data.bannerFor,
        videoUrl: data.videoUrl,
        thumbnail: thumbnail,
      },
      { new: true }
    );
    if (updatedBanner) {
      if (updatedBanner) {
        res.json({
          status: true,
          message: "Banner updated successfully",
          data: updatedBanner,
        });
      } else {
        res.json({ status: false, message: "Please try again." });
      }
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    let data = req.body;

    let findBanner = await BannerModel.findById(data.bannerId);

    if (!findBanner) {
      res.json({ status: false, message: "Banner does not exist." });
      return;
    }

    let updatedBanner = await BannerModel.findByIdAndUpdate(
      findBanner._id,
      {
        isActive: data.isActive,
      },
      { new: true }
    );
    if (updatedBanner) {
      if (updatedBanner) {
        res.json({ status: true, message: "Status updated successfully" });
      } else {
        res.json({ status: false, message: "Please try again." });
      }
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.fetchBanner = (req, res) => {
  try {
    let data = req.body;

    BannerModel.findById({ _id: data.bannerId }, (err, exBanner) => {
      if (exBanner) {
        res.json({ status: true, data: exBanner });
      } else {
        res.json({ status: false, message: "Banner does not exist." });
      }
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.BannerList = (req, res) => {
  let data = req.body;

  BannerModel.find()
    .select({
      _id: 1,
      thumbnail: 1,
      title: 1,
      videoUrl: 1,
      isActive: 1,
      bannerFor: 1,
      corporate: 1,
    })
    .sort({ createdAt: -1 })
    .then((exBanner) => {
      if (exBanner.length > 0) {
        res.json({ status: true, data: exBanner });
      } else {
        res.json({ status: false, message: "Banner list is empty" });
      }
    })
    .catch((error) => {
      res.json({
        status: false,
        message: "Oops! Something went wrong. Please try again later.",
      });
    });
};

exports.deleteBanner = (req, res) => {
  try {
    let BannerId = req.body.bannerId;

    BannerModel.findByIdAndDelete(
      { _id: BannerId },
      { new: true },
      (err, exBanner) => {
        if (exBanner) {
          res.json({
            status: true,
            message: "Banner has been deleted successfully",
          });
        } else {
          res.json({ status: false, message: `Banner does not exists` });
        }
      }
    );
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
