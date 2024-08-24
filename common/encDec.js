const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const config = require("../nodedetails/config");
const nommoc = require("./nommoc");
let key_data = CryptoJS.enc.Base64.parse(config.cryptoKey);
let iv_data = CryptoJS.enc.Base64.parse(config.cryptoIv);
let jwtTokenSuperAdmin = config.jwtTokenSuperAdmin;
let jwtTokenAdmin = config.jwtTokenAdmin;
let jwtTokenEducator = config.jwtTokenEducator;
let jwtTokenNewRole = config.jwtTokenNewRole;
let jwtTokenUser = config.jwtTokenUser;


exports.encrypt = (value) => {
  let cipher = CryptoJS.AES.encrypt(value, key_data, { iv: iv_data }).toString();
  return cipher;
};

exports.decrypt = (value) => {
  let decipher = CryptoJS.AES.decrypt(value, key_data, { iv: iv_data });
  let decrypt_val = decipher.toString(CryptoJS.enc.Utf8);
  return decrypt_val;
};



let decrypt = exports.decrypt = (value) => {
  let decipher = CryptoJS.AES.decrypt(value, key_data, { iv: iv_data });
  let decrypt_val = decipher.toString(CryptoJS.enc.Utf8);
  return decrypt_val;
};
//=================================================== Admin ====================================================

exports.createPayloadSuperAdmin = (value) => {
  let payload = { subject: value };
  let token = jwt.sign(payload, jwtTokenSuperAdmin, { "expiresIn": "60m" });
  return token;
}
exports.createPayloadAdmin = (value) => {
  let payload = { subject: value };
  let token = jwt.sign(payload, jwtTokenAdmin, { "expiresIn": "120m" });
  return token;
}
exports.createPayloadEducator = (value) => {
  let payload = { subject: value };
  let token = jwt.sign(payload, jwtTokenEducator, { "expiresIn": "240m" });
  return token;
}

exports.createPayloadforAll = (value , secret , expiresIn) => {
  let payload = { subject: value };
  let token = jwt.sign(payload, secret , { "expiresIn": expiresIn });
  return token;
}

// exports.tokenMiddlewareAdmin = (req, res, next) => {
//     if (req.headers.authorization) {
//         let token = req.headers.authorization.split(' ')[1];

//         if (token != null) {
//             jwt.verify(token, jwtTokenSuperAdmin, (err, payload) => {
//                 if (payload) {
//                     let userid = decrypt(payload.subject);
//                     req.userId = userid;
//                     req.role = 'superAdmin';

//                     next();
//                 } else {
//                     jwt.verify(token, jwtTokenAdmin, (err, adminPayload) => {
//                         if (adminPayload) {
//                             let userid = decrypt(adminPayload.subject);
//                             req.userid = userid; 
//                             req.role = 'admin';                         
//                                 next(); // Authorized as Admin

//                         } else {
//                             res.json({ "status": false, "message": "Unauthorized" });
//                         }
//                     });
//                 }
//             })
//         } else {
//             res.json({ "status": false, "message": "Unauthorized" })
//         }
//     } else {
//         res.json({ "status": false, "message": "Unauthorized" })
//     }
// }



//=================================================== USER ====================================================
exports.tokenMiddlewareAdmin = (req, res, next) => {
  if (req.headers.authorization) {
    let token = req.headers.authorization.split(' ')[1];

    if (token != null) {
      jwt.verify(token, jwtTokenSuperAdmin, (err, payload) => {
        if (payload) {
          let decPayload = decrypt(payload.subject);
          let userid = decPayload.substring(0, 24);
          let roleId = decPayload.substring(24, 48);
          req.userId = userid;
          req.roleId = roleId;
          next();
        } else {
          jwt.verify(token, jwtTokenAdmin, (err, adminPayload) => {
            if (adminPayload) {
              let decPayload = decrypt(adminPayload.subject);
              let userid = decPayload.substring(0, 24);
              let roleId = decPayload.substring(24, 48);
              req.userId = userid;
              req.roleId = roleId;
              next(); // Authorized as Admin
            } else {
              jwt.verify(token, jwtTokenEducator, (err, educatorPayload) => {
                if (educatorPayload) {
                  let decPayload = decrypt(educatorPayload.subject);
                  let userid = decPayload.substring(0, 24);
                  let roleId = decPayload.substring(24, 48);
                  req.userId = userid;
                  req.roleId = roleId;
                  next(); // Authorized as Educator
                } else {
                  jwt.verify(token, jwtTokenNewRole, (err, oneNewUserPayload) => {
                    if (oneNewUserPayload) {
                      let decPayload = decrypt(oneNewUserPayload.subject);
                      let userid = decPayload.substring(0, 24);
                      let roleId = decPayload.substring(24, 48);
                      req.userId = userid;
                      req.roleId = roleId;
                      next(); // Authorized as One New User
                    } else {
                      res.json({ "status": false, "message": "Unauthorized" });
                    }
                  });
                }
              });
            }
          });
        }
      });
    } else {
      res.json({ "status": false, "message": "Unauthorized" });
    }
  } else {
    res.json({ "status": false, "message": "Unauthorized" });
  }
};



exports.createPayloadUser = (value) => {
  let payload = { subject: value };
  let token = jwt.sign(payload, jwtTokenUser, { "expiresIn": '7d' });
  return token;
}



exports.tokenMiddlewareUser = (req, res, next) => {
  if (req.headers.authorization) {
    let token = req.headers.authorization.split(' ')[1];

    if (token != null) {
      jwt.verify(token, jwtTokenUser, (err, payload) => {
        if (payload) {
          let userid = nommoc.decrypt(payload.subject);

          req.userid = userid;
          next();
        } else {
          res.json({ "status": false, "message": "Please login first to access this feature." })
        }
      })
    } else {
      res.json({ "status": false, "message": "Please login first to access this feature." })
    }
  } else {
    res.json({ "status": false, "message": "Please login first to access this feature." })
  }
}
