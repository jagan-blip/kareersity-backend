const TrainingModel = require("../models/directTraining");
const InstallmentModel = require("../models/directTrainingInstallment");
const orderHistoryModel = require("../models/purchaseHistoryForDirectTraining");
const EmailTempModel = require("../models/emailTemplates");
const Notification = require("../models/Notification");
const AdminNotification = require("../models/adminNotifications");
const AdminModel = require("../models/admin");
const UserModel = require("../models/user");
const { SendSMail } = require("../common/aws");
const config = require("../nodedetails/config");
//const { ccAvenuePG, orderURLs, directTrainingURLs, userContents } = require("../nodedetails/local");
const CCAvenue = require("node-ccavenue");
const {
  GeneratePassword,
  UpdateTemplate,
  encrypt,
} = require("../common/nommoc");
const ccav = new CCAvenue.Configure({
  merchant_id: config.ccAvenuePG.merchantId,
  access_code: config.ccAvenuePG.accessCode,
  working_key: config.ccAvenuePG.workingKey,
});

exports.add_direct_training_installment = (req, res) => {
  try {
    let data = req.body;

    InstallmentModel.findOne(
      { title: new RegExp(data.title, "i") },
      (err, exInstallment) => {
        if (!exInstallment) {
          InstallmentModel.create(data, (err, newInstallment) => {
            if (newInstallment) {
              res.json({ status: true, message: "Added successfully" });
            } else {
              res.json({ status: false, message: "Please try again." });
            }
          });
        } else {
          res.json({
            status: false,
            message: `This installment already added. `,
          });
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

exports.apply_for_direct_training = async (req, res) => {
  try {
    let data = req.body;

    if (data && data.email) {
      data.email = data.email.toLowerCase();
    }

    let exTrainingApplicant = await TrainingModel.findOne({
      $or: [{ email: data.email }, { mobileNumber: data.mobileNumber }],
    });
    // console.log(exTrainingApplicant);
    if (exTrainingApplicant) {
      const checkExOrder = await orderHistoryModel.findOne({
        traineeId: exTrainingApplicant._id,
        "paymentDetails.order_status": "Success",
      });
      //console.log(checkExOrder)

      if (checkExOrder) {
        return res.json({
          status: false,
          message: "Account already exists. Please log in.",
        });
      } else if (
        checkExOrder &&
        Object.keys(checkExOrder.paymentDetails).length === 0
      ) {
        //console.log("checkExOrder")
        await TrainingModel.findByIdAndRemove(exTrainingApplicant._id);
        await orderHistoryModel.findByIdAndRemove(checkExOrder._id);
      } else {
        await TrainingModel.findByIdAndRemove(exTrainingApplicant._id);
      }
    }

    let allSelectedInstallments = [];
    if (data && data.selectedInstallments) {
      allSelectedInstallments = [...data.selectedInstallments];
    }

    const Installments = await InstallmentModel.find({
      title: { $in: [...allSelectedInstallments] },
    }).select({ title: 1, amount: 1 });
    let ttlPrice = Installments.reduce((a, b) => a + b.amount, 0);
    let billing_summary = {};
    let newTrainingApplicant = await TrainingModel.create(data);
    if (newTrainingApplicant) {
      let upGST = (ttlPrice > 0 ? ttlPrice * 0.18 : 0).toFixed(2);
      billing_summary.traineeId = newTrainingApplicant._id;
      billing_summary.subTotal = `₹ ${ttlPrice.toFixed(2)}`;
      billing_summary.gst = `₹ ${upGST}`;
      billing_summary.grandTotal = `₹ ${(
        Number(ttlPrice) + Number(upGST)
      ).toFixed(2)}`;
      billing_summary.selectedInstallments = Installments;

      return res.json({
        status: true,
        data: { traineeId: newTrainingApplicant._id },
      });
    } else {
      return res.json({ status: false, message: "Please try again." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
      error: error,
    });
  }
};

exports.edit_selected_installments = (req, res) => {
  let { traineeId, installmentTitle } = req.body;

  TrainingModel.findById(traineeId)
    .then((exApplicants) => {
      if (exApplicants) {
        if (installmentTitle == "1st") {
          exApplicants.selectedInstallments =
            exApplicants.selectedInstallments.length == 0
              ? ["1st"]
              : exApplicants.selectedInstallments;
          exApplicants.save();
          return res.json({
            status: false,
            message: "You can not remove first installment .!!!",
            data: exApplicants.selectedInstallments,
          });
        }
        const selectedInstallments = exApplicants.selectedInstallments;

        const lastInstallment =
          selectedInstallments[selectedInstallments.length - 1];

        if (installmentTitle === lastInstallment) {
          exApplicants.selectedInstallments = selectedInstallments.slice(0, -1);
          exApplicants.save();
          return res.json({
            status: true,
            message: "The installment removed successfully.",
          });
        } else {
          return res.json({
            status: false,
            message: "You can only remove installments in descending order.",
          });
        }
      } else {
        return res.json({
          status: false,
          message: "Applicant Info not available.!!!",
        });
      }
    })
    .catch((error) => {
      res.json({
        status: false,
        message: "Oops! Something went wrong. Please try again later.",
      });
    });
};

exports.make_payment = async (req, res) => {
  try {
    let { traineeId } = req.body;

    let exTrainingApplicant = await TrainingModel.findOne({ _id: traineeId });
    //console.log(exTrainingApplicant)

    let selectedInstallments = exTrainingApplicant.selectedInstallments;

    const Installments = await InstallmentModel.find({
      title: { $in: [...selectedInstallments] },
    }).select({ title: 1, amount: 1 });
    let ttlPrice = Installments.reduce((a, b) => a + b.amount, 0);
    let alreadyPaid = 0,
      notPaid = 0;
    let billing_summary = {};
    //console.log(Installments)
    let orderInstallments = [];

    if (exTrainingApplicant) {
      const checkInstallments = await InstallmentModel.find({});
      const currentDate = new Date();
      let formattedDate;
      for (let i = 0; i < checkInstallments.length; i++) {
        const nextDate = new Date(currentDate);
        nextDate.setMonth(
          currentDate.getMonth() + (checkInstallments[i].title - 1)
        );
        formattedDate = nextDate.toISOString();
        const matchingInstallment = Installments.find(
          (inst) => String(inst._id) === String(checkInstallments[i]._id)
        );

        if (matchingInstallment) {
          const checkInstallmentPayment = await orderHistoryModel.findOne({
            traineeId: exTrainingApplicant._id,
            installmentId: matchingInstallment._id,
            paidForMonth: {
              $gte: new Date(formattedDate).toISOString(),
              $lt: new Date(formattedDate).toISOString(),
            },
            "paymentDetails.order_status": "Success",
          });

          if (checkInstallmentPayment) {
            alreadyPaid += Number(checkInstallmentPayment.amount);
          } else {
            alreadyPaid += 0;
          }

          orderInstallments.push({
            traineeId: exTrainingApplicant._id,
            installmentInfo: matchingInstallment._id,
            paidForMonth: formattedDate,
            status: "pending",
          });
        } else {
          orderInstallments.push({
            traineeId: exTrainingApplicant._id,
            installmentInfo: checkInstallments[i]._id,
            paidForMonth: formattedDate,
            status: "due",
          });
        }
      }

      let finalPrice =
        ttlPrice > alreadyPaid ? ttlPrice - alreadyPaid : ttlPrice;
      let upGST = (finalPrice > 0 ? finalPrice * 0.18 : 0).toFixed(2);
      billing_summary.traineeId = exTrainingApplicant._id;
      billing_summary.subTotal = `₹ ${finalPrice.toFixed(2)}`;
      billing_summary.gst = `₹ ${upGST}`;
      billing_summary.grandTotal = `₹ ${(
        Number(finalPrice) + Number(upGST)
      ).toFixed(2)}`;
      billing_summary.selectedInstallments = Installments;
      let checkExOrders = await orderHistoryModel.deleteMany({
        traineeId: exTrainingApplicant._id,
      });
      // console.log(checkExOrders)
      const newOrder = await orderHistoryModel.insertMany(orderInstallments);

      const pgOrderData = {
        order_id: exTrainingApplicant._id,
        amount: `${(Number(finalPrice) + Number(upGST)).toFixed(2)}`,
        currency: "INR",
        redirect_url: `${config.directTrainingURLs.payment_success}`,
        cancel_url: `${config.directTrainingURLs.payment_success}`,
        language: "EN",
        billing_name: exTrainingApplicant.fullName,
        billing_address: exTrainingApplicant.permanentAddress,
        billing_city: "OPTIONAL",
        billing_state: "OPTIONAL",
        billing_country: "India",
        billing_pincode: "OPTIONAL",
        billing_tel: exTrainingApplicant.mobileNumber,
        billing_email: exTrainingApplicant.email,
        // merchant_param1 :`Paid for installment(s) ${String(selectedInstallments)} `
      };
      let paymentDetail = ccav.getEncryptedOrder(pgOrderData);

      return res.json({
        status: true,
        message: "Make payment",
        data: `${config.orderURLs.payment_gateway}&encRequest=${paymentDetail}&access_code=${config.ccAvenuePG.accessCode}`,
      });
    } else {
      res.json({
        status: false,
        message: "Oops! Something went wrong. Please try again later.",
      });
    }
  } catch (error) {
    console.error("error", error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.billing_summary = async (req, res) => {
  try {
    let { traineeId } = req.body;

    let exTrainingApplicant = await TrainingModel.findOne({ _id: traineeId });

    let selectedInstallments = exTrainingApplicant
      ? exTrainingApplicant.selectedInstallments
      : [];

    const Installments = await InstallmentModel.find({
      title: { $in: [...selectedInstallments] },
    }).select({ title: 1, amount: 1 });
    let ttlPrice = Installments.reduce((a, b) => a + b.amount, 0);
    let alreadyPaid = 0,
      notPaid = 0;
    let billing_summary = {};

    if (exTrainingApplicant) {
      const currentDate = new Date();
      for (let i = 0; i < Installments.length; i++) {
        const nextMonth = currentDate.getMonth() + i + 1;
        const monthName = new Date(
          currentDate.getFullYear(),
          nextMonth - 1,
          1
        ).toLocaleString("default", { month: "long" });
        //console.log(alreadyPaid, notPaid,Installments[i].amount,monthName);
        const checkInstallmentPayment = await orderHistoryModel.findOne({
          traineeId: exTrainingApplicant._id,
          installments: [
            {
              installmentId: Installments[i]._id,
              paidForMonth: monthName,
            },
          ],
          "paymentDetails.order_status": "Success",
        });
        alreadyPaid += checkInstallmentPayment
          ? Number(checkInstallmentPayment.amount)
          : 0;
        const checkInstallmentPaymentFailed = await orderHistoryModel.findOne({
          traineeId: exTrainingApplicant._id,
          installments: [
            {
              installmentId: Installments[i]._id,
              paidForMonth: monthName,
            },
          ],
          "paymentDetails.order_status": { $ne: "Success" },
        });
        notPaid += checkInstallmentPaymentFailed
          ? Number(checkInstallmentPaymentFailed.amount)
          : Installments[i].amount;
      }

      let finalPrice = notPaid > alreadyPaid ? notPaid - alreadyPaid : ttlPrice;
      let upGST = (finalPrice > 0 ? finalPrice * 0.18 : 0).toFixed(2);
      billing_summary.traineeId = exTrainingApplicant._id;
      billing_summary.subTotal = `₹ ${finalPrice.toFixed(2)}`;
      billing_summary.gst = `₹ ${upGST}`;
      billing_summary.grandTotal = `₹ ${(
        Number(finalPrice) + Number(upGST)
      ).toFixed(2)}`;
      billing_summary.selectedInstallments = Installments;

      return res.json({ status: true, data: billing_summary });
    }

    res.json({ status: false, message: "Invalid traineeId .!!!" });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
      error: error,
    });
  }
};

exports.paymentSuccesssResponse = async (req, res) => {
  try {
    const { encResp } = req.body;

    console.log("encResp", encResp);
    const decryptedJsonResponse = ccav.redirectResponseToJson(encResp);

    if (decryptedJsonResponse.order_status == "Success") {
      // traineeId =   decryptedJsonResponse.order_id
      let fetchInsments = await orderHistoryModel
        .findById(decryptedJsonResponse.order_id)
        .select("installments");
      console.log(
        "decryptedJsonResponse.order_id",
        decryptedJsonResponse.order_id
      );
      let updateDetail = await orderHistoryModel.updateMany(
        {
          traineeId: decryptedJsonResponse.order_id,
          status: "pending",
        },
        {
          $set: {
            status: "success",
            paymentDetails: decryptedJsonResponse,
          },
        },
        {
          arrayFilters: [{ "element.status": "pending" }],
          new: true,
        }
      );

      // console.log("updateDetail", updateDetail);

      let exTrainingApplicant = await TrainingModel.findOne({
        _id: decryptedJsonResponse.order_id,
      }).select("mobileNumber email");

      let exUser = await UserModel.findOne({
        email: exTrainingApplicant.email,
      });

      if (exUser) {
        await UserModel.findOneAndUpdate(
          { _id: exUser._id },
          {
            traineeId: decryptedJsonResponse.order_id,
            isExUser: true,
            isEnrolledInDirectTraining: true,
          },
          { new: true }
        );
        let x = await Notification.create({
          userId: exUser._id,
          message: `Your order has been successfully placed with Order Id: #${String(
            decryptedJsonResponse.order_id
          ).slice(0, 7)} .`,
        });
        let adminList = await AdminModel.findOne({ type: "super_admin" });
        let y = await AdminNotification.create({
          userId: exUser._id,
          adminId: adminList._id,
          redirectId: decryptedJsonResponse.order_id,
          message: `${decryptedJsonResponse.billing_name} has  placed new order.`,
        });
        return res.redirect(
          `${config.directTrainingURLs.payment_success_page}`
        );
      }

      const exTemp = await EmailTempModel.findOne({
        templateName:
          "To send Login credentials from Kareersity for direct training trainee",
      });

      // console.log(exTemp.body)
      if (!exTemp) {
        return res.json({
          status: false,
          message: "Template does not exist.!!!",
        });
      }
      let newPassword = GeneratePassword(10);
      let dataToReplace = {
        user: decryptedJsonResponse.billing_name,
        username: decryptedJsonResponse.billing_email,
        password: newPassword,
        loginLink: config.userContents.website,
      };
      let newTemp = UpdateTemplate(exTemp, dataToReplace);
      const template = newTemp.body,
        subject = newTemp.subject;

      SendSMail(
        subject,
        template,
        [decryptedJsonResponse.billing_email],
        config.krsAWSOptions.senderOrReplyTo,
        config.krsAWSOptions.senderOrReplyTo
      )
        .then(async (resp22) => {
          let newUser = await UserModel.create({
            _id: decryptedJsonResponse.order_id,
            traineeId: decryptedJsonResponse.order_id,
            fullName: decryptedJsonResponse.billing_name,
            isExUser: false,
            isEnrolledInDirectTraining: true,
            password: encrypt(newPassword),
            phoneNumber: decryptedJsonResponse.billing_tel,
            email: decryptedJsonResponse.billing_email,
            isAccountVerified: true,
          });
          //console.log("newUser" ,newUser,updateDetail)
          let x = await Notification.create({
            userId: newUser._id,
            message: `Your order has been successfully placed with Order Id: #${String(
              decryptedJsonResponse.order_id
            ).slice(0, 7)} .`,
          });
          let adminList = await AdminModel.findOne({ type: "super_admin" });
          let y = await AdminNotification.create({
            userId: newUser._id,
            adminId: adminList._id,
            redirectId: decryptedJsonResponse.order_id,
            message: `${decryptedJsonResponse.billing_name} has  placed new order.`,
          });
          //console.log("updateDetail" ,x,y)
          // let message = `Dear ${decryptedJsonResponse.billing_name}, you have successfully purchased course Order Id - #${String(decryptedJsonResponse.order_id).slice(0, 7)} - Kareer Sity`
          // SendMessage(decryptedJsonResponse.billing_tel, message);
          //return res.json({ "status": true, "message": "User successfully added! Credentials have been sent to the user's email address." });
          return res.redirect(
            `${config.directTrainingURLs.payment_success_page}`
          );
        })
        .catch(async (err) => {
          console.error(err);
          //return res.json({ "status": false, "message": "Unable to send login Credentials.!!!" });
          await orderHistoryModel.updateMany(
            {
              traineeId: decryptedJsonResponse.order_id,
              status: { $ne: "success" },
            },
            {
              $set: {
                paymentDetails: decryptedJsonResponse,
              },
            },
            {
              arrayFilters: [{ "element.status": "due" }],
              new: true,
            }
          );

          return res.redirect(
            `${config.directTrainingURLs.payment_failed_page}`
          );
        });
    } else {
      await orderHistoryModel.updateMany(
        {
          traineeId: decryptedJsonResponse.order_id,
          status: { $ne: "success" },
        },
        {
          $set: {
            paymentDetails: decryptedJsonResponse,
          },
        },
        {
          arrayFilters: [{ "element.status": "due" }],
          new: true,
        }
      );
      return res.redirect(`${config.directTrainingURLs.payment_failed_page}`);
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Error processing payment response", err: err });
  }
};

exports.pay_now = async (req, res) => {
  try {
    let { orderId } = req.body;

    let chkOrder = await orderHistoryModel.findById(orderId);
    if (!chkOrder) {
      res.json({ status: false, message: "Invalid request.!!!" });
    }
    let chkExUserOrTrainee = await TrainingModel.findOne(chkOrder.traineeId);
    if (!chkExUserOrTrainee) {
      return res.json({ status: false, message: "User does not exist.!!!" });
    }

    const Installments = await InstallmentModel.findById(
      chkOrder.installmentInfo
    );
    // console.log(Installments)
    if (Installments) {
      const pgOrderData = {
        order_id: chkOrder._id,
        amount: `${(
          Number(Installments.amount) + Number(Installments.amount * 0.18)
        ).toFixed(2)}`,
        currency: "INR",
        redirect_url: `${config.directTrainingURLs.pay_now_payment_success}`,
        cancel_url: `${config.directTrainingURLs.pay_now_payment_success}`,
        language: "EN",
        billing_name: chkExUserOrTrainee.fullName,
        billing_address: chkExUserOrTrainee.permanentAddress,
        billing_city: "OPTIONAL",
        billing_state: "OPTIONAL",
        billing_country: "India",
        billing_pincode: "OPTIONAL",
        billing_tel: chkExUserOrTrainee.mobileNumber,
        billing_email: chkExUserOrTrainee.email,
      };
      //console.log(pgOrderData)
      let paymentDetail = ccav.getEncryptedOrder(pgOrderData);

      return res.json({
        status: true,
        message: "Make payment",
        data: `${config.orderURLs.payment_gateway}&encRequest=${paymentDetail}&access_code=${config.ccAvenuePG.accessCode}`,
      });
    } else {
      res.json({ status: false, message: "Installment does not exist.!!!" });
    }
  } catch (error) {
    console.error("error", error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.pay_now_paymentSuccesssResponse = async (req, res) => {
  try {
    const { encResp } = req.body;
    const decryptedJsonResponse = ccav.redirectResponseToJson(encResp);

    if (decryptedJsonResponse.order_status === "Success") {
      // Check if the order is not already marked as "Success"
      console.log(decryptedJsonResponse);
      const existingOrder = await orderHistoryModel.findOne({
        _id: decryptedJsonResponse.order_id,
      });

      if (existingOrder) {
        // Update order status and payment details
        const updateDetail = await orderHistoryModel.findOneAndUpdate(
          {
            _id: decryptedJsonResponse.order_id,
          },
          {
            $set: {
              status: "success",
              paymentDetails: decryptedJsonResponse,
            },
          },
          {
            new: true,
          }
        );

        // Update user details if the order exists
        const exUser = await UserModel.findOne({
          $or: [
            { traineeId: existingOrder.traineeId },
            { _id: existingOrder.traineeId },
          ],
        });

        if (exUser) {
          await UserModel.findOneAndUpdate(
            { _id: existingOrder.traineeId },
            { isExUser: true, isEnrolledInDirectTraining: true },
            { new: true }
          );
          await Notification.create({
            userId: exUser._id,
            message: `Your order has been successfully placed with Order Id: #${String(
              existingOrder._id
            ).slice(0, 7)} .`,
          });

          const adminList = await AdminModel.findOne({ type: "super_admin" });
          await AdminNotification.create({
            userId: exUser._id,
            adminId: adminList._id,
            redirectId: existingOrder._id,
            message: `${decryptedJsonResponse.billing_name} has placed a new order.`,
          });

          return res.redirect(
            `${config.directTrainingURLs.payment_success_page}`
          );
        } else {
          console.error("User not found for the order:", existingOrder);
          return res.redirect(
            `${config.directTrainingURLs.payment_success_page}`
          );
        }
      } else {
        console.log(
          `Order ${decryptedJsonResponse.order_id} is already marked as "Success".`
        );
        return res.redirect(
          `${config.directTrainingURLs.payment_success_page}`
        );
      }
    } else {
      console.error('Order status is not "Success".');
      return res.redirect(`${config.directTrainingURLs.payment_failed_page}`);
    }
  } catch (err) {
    console.error("Error processing payment response:", err);
    res
      .status(500)
      .json({ error: "Error processing payment response", err: err });
  }
};

exports.listOfDirectTrainingOrdersForUser = async (req, res) => {
  try {
    let userId = req.userid;
    //console.log(userId);

    const exUser = await UserModel.findOne({ _id: userId });
    if (!exUser || !exUser.traineeId) {
      return res.send({ status: true, data: [] });
    }
    const getlist = await orderHistoryModel
      .find({ $or: [{ traineeId: exUser.traineeId }, { traineeId: userId }] })
      .populate({
        path: "installmentInfo",
        model: InstallmentModel,
      })
      .select(
        "traineeId installmentInfo paidForMonth paymentDetails.order_id paymentDetails.tracking_id paymentDetails.payment_mode paymentDetails.card_name paymentDetails.currency paymentDetails.amount paymentDetails.billing_name paymentDetails.billing_address paymentDetails.billing_city paymentDetails.billing_state paymentDetails.billing_country paymentDetailsbilling_pincode paymentDetails.billing_tel paymentDetails.billing_email paymentDetails.trans_date status  createdAt updatedAt"
      )
      .sort({ installmentInfo: 1 });

    return res.send({ status: true, data: getlist });
  } catch (e) {
    console.error(e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.listOfOrdersForAdmin = async (req, res) => {
  try {
    let { search, status } = req.body;

    const query = {};

    if (status) {
      query["status"] = { $regex: new RegExp(status, "i") };
    } else {
      query["status"] = "success";
    }

    if (search) {
      let exTrainingApplicant = await TrainingModel.findOne({
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      });
      if (exTrainingApplicant) {
        query["traineeId"] = exTrainingApplicant._id;
      }
    }

    const distinctTraineeIds = await orderHistoryModel.distinct(
      "traineeId",
      query
    );

    const getlist = await Promise.all(
      distinctTraineeIds.map(async (traineeId) => {
        const orders = await orderHistoryModel
          .find({ traineeId, ...query })
          .populate({
            path: "traineeId",
            model: TrainingModel,
          })
          .populate({
            path: "installmentInfo",
            model: InstallmentModel,
          })
          .sort({ updatedAt: -1 });

        return orders.map((order) => {
          const traineeInfo = order.traineeId;
          const installmentInfo = order.installmentInfo;
          const status = order.status;
          const amount =
            order.paymentDetails.order_status === "Success"
              ? order.paymentDetails.amount
              : 0;
          const trans_date = order.paymentDetails.trans_date;

          return { traineeInfo, installmentInfo, status, amount, trans_date };
        });
      })
    );

    // Merge orders by traineeId
    const combinedList = getlist.reduce((accumulator, orders) => {
      orders.forEach((order) => {
        const traineeId = order.traineeInfo._id;
        if (!accumulator[traineeId]) {
          accumulator[traineeId] = {
            traineeInfo: order.traineeInfo,
            installmentInfo: [order.installmentInfo],
            status: order.status,
            amount: Number(order.amount),
            trans_date: order.trans_date,
          };
        } else {
          accumulator[traineeId].installmentInfo.push(order.installmentInfo);
          accumulator[traineeId].amount += Number(order.amount);
        }
      });
      return accumulator;
    }, {});

    // Convert the combined object back to an array
    const finalList = Object.values(combinedList);

    res.send({
      status: true,
      message: `Total ${finalList.length} trainee(s) found`,
      data: finalList,
    });
  } catch (e) {
    console.error(e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};

exports.fetchOrderInfoForAdmin = async (req, res) => {
  try {
    const traineeId = req.body.traineeId;

    const orders = await orderHistoryModel
      .find({ traineeId })
      .populate({
        path: "traineeId",
        model: TrainingModel,
      })
      .populate({
        path: "installmentInfo",
        model: InstallmentModel,
      });

    // Sort the list based on the trans_date
    const sortedList = orders.sort(
      (a, b) =>
        Number(a.installmentInfo.title) - Number(b.installmentInfo.title)
    );

    res.send({ status: true, data: sortedList });
  } catch (e) {
    console.error(e);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later",
    });
  }
};
