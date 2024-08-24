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

exports.StartPayment = async (req, res) => {
  try {
    let {
      order_id,
      amount,
      billing_name,
      permanent_address,
      mobile_number,
      email,
    } = req.body;

    const pgOrderData = {
      order_id: order_id,
      amount: parseInt(amount),
      currency: "INR",
      redirect_url: `${config.expertOnBoardURLs.payment_success_page}?order_id=${order_id}`,
      cancel_url: `${config.expertOnBoardURLs.payment_failed_page}?order_id=${order_id}`,
      language: "EN",
      billing_name: billing_name,
      billing_tel: mobile_number,
      billing_email: email,
    };
    console.log(pgOrderData);
    let paymentDetail = ccav.getEncryptedOrder(pgOrderData);
    return res.json({
      status: true,
      message: "Make payment",
      data: `${config.orderURLs.payment_gateway}&encRequest=${paymentDetail}&access_code=${config.ccAvenuePG.accessCode}`,
    });
  } catch (error) {
    console.error("error", error);
    res.json({
      status: false,
      message: "Oops! Something went wrong. Please try again later.",
    });
  }
};

exports.PaymentCallback = async (req, res) => {
  try {
    const { encResp } = req.body;
    const decryptedJsonResponse = ccav.redirectResponseToJson(encResp);

    if (decryptedJsonResponse.order_status === "Success") {
      // Check if the order is not already marked as "Success"

      console.log(
        `Order ${decryptedJsonResponse.order_id} is already marked as "Success".`
      );
      return;
      res.redirect(
        `${config.expertOnBoardURLs.payment_success_page}?order_id=${decryptedJsonResponse.order_id}`
      );
    } else {
      return;
      res.redirect(
        `${config.expertOnBoardURLs.payment_failed_page}?order_id=${decryptedJsonResponse.order_id}`
      );
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error processing payment response", err: err });
  }
};
