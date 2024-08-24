let domain;
if (process.env.NODE_ENV) {
  domain = process.env.NODE_ENV;
} else {
  domain = "demo";
}

module.exports = require("./" + domain + ".js");
