const courseCategory = require("../models/courseCategory");
const courseMain = require("../models/courseMain");
exports.addCategory = async (req, res) => {
  try {
    let data = req.body;

    courseCategory.findOne({ name: data.name }, (err, exCat) => {
      if (!exCat) {
        courseCategory.create(data, (err, newCat) => {
          if (newCat) {
            res.json({
              status: true,
              message: "New category added successfully",
              data: newCat,
            });
          } else {
            res.json({
              status: false,
              message: "Please try after some time",
              error: err,
            });
          }
        });
      } else {
        res.json({ status: false, message: `${exCat.name} already exists` });
      }
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.editCategory = async (req, res) => {
  try {
    let data = req.body;

    courseCategory.findById(data._id, (err, exCat) => {
      if (exCat) {
        courseCategory.findByIdAndUpdate(
          data._id,
          {
            name: data.name,
            description: data.description,
            isHidden: data.isHidden,
          },
          { new: true },
          (err, newCat) => {
            if (newCat) {
              res.json({
                status: true,
                message: "Category updated successfully",
                data: newCat,
              });
            } else {
              res.json({
                status: false,
                message: "Please try after some time",
              });
            }
          }
        );
      } else {
        res.json({ status: false, message: `Category does not exists` });
      }
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.getCategoryInfo = async (req, res) => {
  try {
    let data = req.params.id;

    courseCategory.findById(data, (err, exCat) => {
      if (exCat) {
        res.json({
          status: true,
          message: "Category Information",
          data: exCat,
        });
      } else {
        res.json({ status: false, message: `Category does not exists` });
      }
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
exports.categories = async (req, res) => {
  try {
    courseCategory.find({}, (err, exCat) => {
      if (exCat) {
        res.json({
          status: true,
          message: `${exCat.length} category(ies) found`,
          data: exCat,
        });
      } else {
        res.json({
          status: false,
          message: "Please try after some time",
          error: err.message,
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
exports.activeCategories = async (req, res) => {
  try {
    courseCategory.find({ isHidden: false }, (err, exCat) => {
      if (exCat) {
        res.json({
          status: true,
          message: `${exCat.length} category(ies) found`,
          data: exCat,
        });
      } else {
        res.json({
          status: false,
          message: "Please try after some time",
          error: err.message,
        });
      }
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
exports.deleteCategory = async (req, res) => {
  try {
    courseMain.findOne({ category: req.body._id }, (err, exCourse) => {
      if (!exCourse) {
        courseCategory.findByIdAndDelete(
          req.body._id,
          { new: true },
          (err, exCat) => {
            if (exCat) {
              res.json({
                status: true,
                message: "Category deleted successfully",
                data: exCat,
              });
            } else {
              res.json({
                status: false,
                message: `Failed to delete category !!!`,
              });
            }
          }
        );
      } else {
        res.json({
          status: false,
          message:
            "Cannot delete the category because it is linked to other courses.",
        });
      }
    });
  } catch (error) {
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
