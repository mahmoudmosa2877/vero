const crypto = require("crypto");
const config = require("./config");
const querystring = require("querystring");
const https = require("https");
const path = require("path");
const fs = require("fs");

const helpers = {};
helpers.hash = function (str) {
  if (typeof str == "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

helpers.parseJsonToObject = function (str) {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (err) {
    return {};
  }
};

helpers.createRandomString = function (strLength) {
  strLength = typeof strLength == "number" && strLength > 0 ? strLength : false;
  if (strLength) {
    const possibleCharacters = "abcdefghijklmnopqrstuvwxyz123456789";
    let str = "";
    for (let i = 0; i < strLength; i++) {
      const randomCharacters = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      str += randomCharacters;
    }
    return str;
  } else {
    return false;
  }
};

helpers.sendTwilioSms = function (phone, msg, callback) {
  // Validate parameters
  phone =
    typeof phone == "string" && phone.trim().length == 10
      ? phone.trim()
      : false;
  msg =
    typeof msg == "string" && msg.trim().length > 0 && msg.trim().length <= 1600
      ? msg.trim()
      : false;
  if (phone && msg) {
    // Configure the request payload
    var payload = {
      From: config.twilio.fromPhone,
      To: "+1" + phone,
      Body: msg,
    };
    var stringPayload = querystring.stringify(payload);

    // Configure the request details
    var requestDetails = {
      protocol: "https:",
      hostname: "api.twilio.com",
      method: "POST",
      path:
        "/2010-04-01/Accounts/" + config.twilio.accountSid + "/Messages.json",
      auth: config.twilio.accountSid + ":" + config.twilio.authToken,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(stringPayload),
      },
    };

    // Instantiate the request object
    var req = https.request(requestDetails, function (res) {
      // Grab the status of the sent request
      var status = res.statusCode;
      // Callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback("Status code returned was " + status);
      }
    });

    // Bind to the error event so it doesn't get thrown
    req.on("error", function (e) {
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();
  } else {
    callback("Given parameters were missing or invalid");
  }
};

// Get the string content of a template
helpers.getTemplate = function (templateName) {
  return new Promise((resolve, reject) => {
    templateName =
      typeof templateName == "string" && templateName.length > 0
        ? templateName
        : false;
    if (templateName) {
      var templatesDir = path.join(__dirname, "/../templates/");
      console.log(templatesDir);
      fs.readFile(
        templatesDir + templateName + ".html",
        "utf8",
        function (err, str) {
          console.log(err, str, !err && str && str.length > 0, "fs function");
          if (!err && str && str.length > 0) {
            console.log(str, "string on tem");
            resolve(str);
          } else {
            console.error(err);
            reject("No template could be found");
          }
        }
      );
    } else {
      reject("A valid template name was not specified");
    }
  });
};

// Get the contents of a static (public) asset
helpers.getStaticAsset = function (fileName) {
  return new Promise((resolve, reject) => {
    console.log(fileName, "filename");
    fileName =
      typeof fileName == "string" && fileName.length > 0 ? fileName : false;
    if (fileName) {
      var publicDir = path.join(__dirname, "/../public/");
      console.log(publicDir);

      fs.readFile("./public/logo", function (err, data) {
        console.log(err, data);
        if (!err && data) {
          resolve(false, data);
        } else {
          reject("No file could be found");
        }
      });
    } else {
      reject("A valid file name was not specified");
    }
  });
};

module.exports = helpers;
