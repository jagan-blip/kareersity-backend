//const fs = require("fs");
const common = require("../common/nommoc");

const dbConnection = common.decrypt(
  "d70b4df1343fe019cd70e0f76cafd2d01a7a9b63607ba3d6f658292fd2273147232100406eb53d08beb834b79d36d5e41ad355fb6365ba8c1badbc8df5078a0782c1f39a616d85952e4e60942bbf024cd90b408903"
);
console.log(dbConnection);

module.exports = {
  dbConnection: common.decrypt(
    "d70b4df1343fe019cd70e0f76cafd2d01a7a9b63607ba3d6f658292fd2273147232100406eb53d08beb834b79d36d5e41ad355fb6365ba8c1badbc8df5078a0782c1f39a616d85952e4e60942bbf024cd90b408903"
  ),

  port: 4000,

  serverType: "http",
  dbPrefix: common.decrypt("f11670ff2f22dd"),
  cryptoKey: common.decrypt(
    "e91060f71e29d053e463d4a30aeff283592dcc455c4194ebfd53543bab293155"
  ),
  cryptoIv: common.decrypt("f15513a41268ec06df58f49400f8fdc6"),
  jwtTokenSuperAdmin: common.decrypt(
    "f10571f31e29d15bea7bc5b813e5ebd02c72b77f2224e79efd345744a8593420"
  ),
  jwtTokenAdmin: common.decrypt(
    "f10571f31e29d15bea7bd7a90ee9f7805e2fcf202723e69ffd315644a1513424"
  ),
  jwtTokenEducator: common.decrypt(
    "f10571f31e29d15bea7bd3a916e3f8c5276dcf272323e69bfd315644a9583429"
  ),
  jwtTokenNewRole: common.decrypt(
    "f10571f31e29d15bea7bd8a814f2f6dd2d2fcf272323e69bfd315644a9583429"
  ),
  jwtTokenUser: common.decrypt(
    "c20f1bd73e1ee379f26de2a129e4edd739589a297642efdcfa375541fd2e437b7b05226373a9392c"
  ),

  awsOptionsfiles: {
    secretAccessKey: common.decrypt(
      "f5317ae27015e9198d50f4b939b888c80d2aa4527266b9c298392712f23a77595e71175f3c8b311b"
    ),
    accessKeyId: common.decrypt("fb2f6ad70c0bce76f34ed8fb76d08afa5a4ecd56"),
    Bucket: common.decrypt("d10551f33e29f15bca7bbbab2aecdcc2"),
    region: common.decrypt("db140ee5342ef65a9333"),
  },

  awsOptionsCourseVideos: {
    secretAccessKey: common.decrypt(
      "f5317ae27015e9198d50f4b939b888c80d2aa4527266b9c298392712f23a77595e71175f3c8b311b"
    ),
    accessKeyId: common.decrypt("fb2f6ad70c0bce76f34ed8fb76d08afa5a4ecd56"),
    Bucket: common.decrypt("d10551f33e29f15bca7bf5a236f2cad41e769a747c"),
    region: common.decrypt("db140ee5342ef65a9333"),
  },

  krsAWSOptions: {
    secretAccessKey: common.decrypt(
      "fc3067e16d6ccc6af264a49d3bf1f3c92050cb6b2a238edc83365543e81f46582e0829067edc0f25"
    ),
    accessKeyId: common.decrypt("fb2f6ad70c0bce76f34ed8fb11d58c833a29aa5c"),
    Bucket: common.decrypt("d10551f33e29f15bca7b"),
    senderOrReplyTo: common.decrypt(
      "f10551f33e29d15bca7bb6f122f3d2c41b5f95706177b2ddbf69120cb60b6a7d24"
    ),
    doNotReply: common.decrypt(
      "f10551f33e29d15bca7bb6f12defcbd4187387517873a5caa972151cec112b73752f6d"
    ),
  },
  ccAvenuePG: {
    merchantId: common.decrypt("895514a06f63b1"),
    accessCode: common.decrypt("fb3268c06f63ce738734d79472b7effa315e"),
    workingKey: common.decrypt(
      "8d5c1aaf686eb0778b37d0fc73b88f832c26cd212524e59b8e392533a1583d21"
    ),
  },
  orderURLs: {
    payment_gateway:
      "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
    payment_success: "https://www.backend.kareersity.com/order/payment_success",
    payment_success_page: "https://kareersity.com/purchased_course",
    payment_failed_page: "https://www.kareersity.com/payment_failed",
  },
  subsPlansURLs: {
    payment_success:
      "https://www.backend.kareersity.com/my_subscription_plan/payment_success",
    payment_success_page: "https://kareersity.com/subscribe",
  },
  userContents: {
    website: "https://kareersity.com",
    resetPassword: "https://kareersity.com/password-reseted/",
    accountActivated: "https://kareersity.com/account-activated/",
  },
  directTrainingURLs: {
    payment_success:
      "https://www.backend.kareersity.com/direct_training/payment_success",
    pay_now_payment_success:
      "https://www.backend.kareersity.com/direct_training/pay_now_payment_success",
    payment_success_page: "https://kareersity.com/payment_success",
    payment_failed_page: "https://kareersity.com/payment_failed",
  },
  expertOnBoardURLs: {
    payment_success_page: "https://www.kareersity.com/eob/payment_success",
    payment_failed_page: "https://www.kareersity.com/eob/payment_failed",
  },
};
