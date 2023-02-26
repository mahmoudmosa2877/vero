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
helpers.getTemplate = function (templateName, templateData) {
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
          if (!err && str && str.length > 0) {
            const finalResult = helpers.interpolate(str, templateData);
            resolve(finalResult);
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

      fs.readFile(publicDir + fileName, function (err, data) {
        console.log(err, data);
        if (!err && data) {
          resolve(data);
        } else {
          reject("No file could be found");
        }
      });
    } else {
      reject("A valid file name was not specified");
    }
  });
};

// Add the universal header and footer to a string, and pass provided data object to header and footer for interpolation
helpers.addUniversalTemplates = function (str, data) {
  return new Promise(async (resolve, reject) => {
    str = typeof str == "string" && str.length > 0 ? str : "";
    data = typeof data == "object" && data !== null ? data : {};
    try {
      // Get the header
      const headerString = await helpers.getTemplate("_header", data);
      // Get the footer
      const footerString = await helpers.getTemplate("_footer", data);
      // Add them all together
      var fullString = headerString + str + footerString;

      resolve(fullString);
    } catch (err) {
      reject("could not find header or footer");
    }
  });
};

// Take a given string and data object, and find/replace all the keys within it
helpers.interpolate = function (str, data) {
  str = typeof str == "string" && str.length > 0 ? str : "";
  data = typeof data == "object" && data !== null ? data : {};

  // Add the templateGlobals to the data object, prepending their key name with "global."
  for (var keyName in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(keyName)) {
      data["global." + keyName] = config.templateGlobals[keyName];
    }
  }
  // For each key in the data object, insert its value into the string at the corresponding placeholder
  for (var key in data) {
    if (data.hasOwnProperty(key) && typeof (data[key] == "string")) {
      var replace = data[key];
      var find = "{" + key + "}";
      str = str.replace(find, replace);
    }
  }
  return str;
};

module.exports = helpers;
