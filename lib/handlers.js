const helpers = require("./helper");
const _data = require("./lib");
const handlers = {};
const config = require("./config");
const client = require("twilio")(
  config.twilio.accountSid,
  config.twilio.authToken
);
const queryString = require("querystring");
const https = require("https");

handlers.users = function (data) {
  return new Promise(async (resolve, reject) => {
    const acceptMethods = ["post", "get", "put", "delete"];
    if (acceptMethods.indexOf(data.method) > -1) {
      //  // console.log(handlers._users[data.method](data, callback));
      console.log(data, typeof data);
      // const parsedData = JSON.parse(data);
      try {
        const res = await handlers._users[data.method](data);
        resolve({ statusCode: 200, res });
      } catch (err) {
        reject(err);
      }
    } else {
      reject("the method is not found ");
    }
  });
};

handlers._users = {};

handlers._users.post = async function (data) {
  console.log(data);
  const firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  const tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false;
  // console.log(
  //   firstName,
  //   lastName,
  //   phone,
  //   password,
  //   tosAgreement,
  //   "function is called"
  // );
  return new Promise(async (resolve, reject) => {
    if (firstName && lastName && phone && password && tosAgreement) {
      try {
        await _data.read("users", phone);

        reject("there is an user with phone number");
      } catch (err) {
        const hashedPassword = helpers.hash(password);
        const userObject = {
          firstName,
          lastName,
          phone,
          hashedPassword,
          tosAgreement: true,
        };
        try {
          await _data.create("users", phone, userObject);
          resolve("done");
        } catch (err) {
          reject("error creating file");
        }
      }
    } else {
      // console.log("callback");
      reject("error please insert main cat");
    }
  });
};

handlers._users.get = async function (data) {
  return new Promise(async (resolve, reject) => {
    // console.log(data.queryString);
    const phone =
      typeof data.queryString.phone == "string" &&
      data.queryString.phone.trim().length == 10
        ? data.queryString.phone.trim()
        : false;
    // console.log(phone, "phone");
    if (phone) {
      try {
        const { data } = await _data.read("users", phone);
        // console.log(data, "readed data");
        const dataJson = JSON.parse(data);
        delete dataJson.hashedPassword;
        // console.log(dataJson, "after delete data");

        resolve(dataJson);
      } catch (err) {
        reject("your email is not found");
      }
    } else {
      reject("Missing required field");
    }
  });
};

handlers._users.put = async function (data) {
  // console.log(data, "data in put");

  const phone =
    typeof dataJson.phone == "string" && dataJson.phone.trim().length == 10
      ? dataJson.phone.trim()
      : false;
  const firstName =
    typeof dataJson.firstName == "string" &&
    dataJson.firstName.trim().length > 0
      ? dataJson.firstName.trim()
      : false;
  const lastName =
    typeof dataJson.lastName == "string" && dataJson.lastName.trim().length > 0
      ? dataJson.lastName.trim()
      : false;
  const password =
    typeof dataJson.password == "string" && dataJson.password.trim().length > 0
      ? dataJson.password.trim()
      : false;
  // console.log(phone);
  return new Promise(async (resolve, reject) => {
    if (phone) {
      if (firstName || lastName || phone) {
        try {
          const usersq = await _data.read("users", phone);

          // console.log(usersq, "readed data");
          const userData = JSON.parse(usersq.data);
          // console.log(userData, "readed data after Json");

          if (userData) {
            if (firstName) {
              userData.firstName = firstName;
            }
            if (lastName) {
              userData.lastName = lastName;
            }
            if (password) {
              userData.hashedpassword = helpers.hash(password);
            }
          }

          try {
            _data.update("users", phone, userData);
            resolve("done");
          } catch (err) {
            reject("could not update the user");
          }
        } catch (err) {
          reject("the specific user does not exist");
        }
      } else {
        reject("Missing fields to update");
      }
    } else {
      reject("Missing a required field");
    }
  });
};

handlers._users.delete = async function (data) {
  return new Promise(async (resolve, reject) => {
    const phone =
      typeof data.queryString.phone == "string" &&
      data.queryString.phone.trim().length == 10
        ? data.queryString.phone.trim()
        : false;
    if (phone) {
      try {
        await _data.read("users", phone);
        try {
          await _data.delete("users", phone);
          resolve("done");
        } catch (err) {
          reject("could not delete this user");
        }
      } catch (err) {
        reject("that specific user is not found");
      }
    } else {
      reject("Missing required field");
    }
  });
};

handlers.tokens = function (data) {
  return new Promise(async (resolve, reject) => {
    const acceptMethods = ["post", "get", "put", "delete"];
    if (acceptMethods.indexOf(data.method) > -1) {
      try {
        const resolveRes = await handlers._tokens[data.method](data);
        // console.log(resolveRes, "resolvedRes");
        resolve(resolveRes);
      } catch (err) {
        reject(err);
      }
    } else {
      reject("err __ this method does not match");
    }
  });
};

handlers._tokens = {};

handlers._tokens.post = function (data) {
  return new Promise(async (resolve, reject) => {
    const dataJson = data.payload;
    const phone =
      typeof dataJson.phone == "string" && dataJson.phone.trim().length == 10
        ? dataJson.phone.trim()
        : false;
    const password =
      typeof dataJson.password == "string" &&
      dataJson.password.trim().length > 0
        ? dataJson.password.trim()
        : false;
    // console.log(phone, password);
    if (phone && password) {
      try {
        const userData = await _data.read("users", phone);
        // console.log(typeof userData, userData, "userData");
        //  const dataJson = JSON.parse(userData);
        // console.log(userData);
        const hashedPassword = helpers.hash(password);
        // console.log(hashedPassword == userData.hashedPassword);
        if (password == userData.hashedPassword) {
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60 * 15;
          const tokenObject = {
            phone,
            id: tokenId,
            expires,
          };
          try {
            const resCre = await _data.create("tokens", tokenId, tokenObject);
            // console.log(resCre);
            resolve("done");
          } catch (err) {
            reject(err);
          }
        } else {
          reject("password does not match ");
        }
      } catch (err) {
        reject("could not find the spacific user");
      }
    } else {
      reject("Missing required fields");
    }
  });
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = function (data) {
  return new Promise(async (resolve, reject) => {
    // Check that id is valid
    // console.log(data);
    var id =
      typeof data.queryString.id == "string" &&
      data.queryString.id.trim().length == 20
        ? data.queryString.id.trim()
        : false;

    if (id) {
      // Lookup the token
      try {
        const tokenData = await _data.read("tokens", "tokenId");
        // console.log(tokenData);
        resolve(tokenData);
      } catch (err) {
        reject("can not read ");
      }
    } else {
      callback(400, { Error: "Missing required field, or field invalid" });
    }
  });
};

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function (data) {
  return new Promise(async (resolve, reject) => {
    var id =
      typeof data.payload.id == "string" && data.payload.id.trim().length == 20
        ? data.payload.id.trim()
        : false;
    var extend =
      typeof data.payload.extend == "boolean" && data.payload.extend == true
        ? true
        : false;
    // console.log(data);
    if (id && extend) {
      // Lookup the existing token
      try {
        const response = await _data.read("tokens", id);
        const resJson = JSON.parse(response);
        // console.log(response, "response");
        // Check to make sure the token isn't already expired
        // console.log(
        //   resJson.expires,
        //   Date.now(),
        //   resJson.expires < Date.now(),
        //   resJson.expires > Date.now()
        // );
        if (resJson.expires > Date.now()) {
          //  Store the new updates
          try {
            // console.log(id, resJson, "id");
            resJson.expires = Date.now() + 1000 * 60 * 60;
            await _data.update("tokens", id, resJson);
            resolve("done");
          } catch (err) {
            reject("Could not update the token's expiration.");
          }
        } else {
          reject("The token has already expired, and cannot be extended.");
        }
      } catch (err) {
        reject(`Specified user does not exist....${err}`);
      }
    } else {
      reject("Missing required field(s) or field(s) are invalid.");
    }
  });
};

// // Tokens - delete
// // Required data: id
// // Optional data: none
handlers._tokens.delete = function (data, callback) {
  return new Promise(async (resolve, reject) => {
    // Check that id is valid
    var id =
      typeof data.queryString.id == "string" &&
      data.queryString.id.trim().length == 20
        ? data.queryString.id.trim()
        : false;
    if (id) {
      // Lookup the token
      try {
        await _data.read("tokens", id);
        try {
          await _data.delete("tokens", id);
          resolve("done");
        } catch (err) {
          reject("Could not delete the specified token");
        }
      } catch (err) {
        reject("Could not find the specified token.");
      }
    } else {
      reject("Missing required field");
    }
  });
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function (id, phone) {
  return new Promise(async (resolve, reject) => {
    try {
      // Lookup the token
      const tokenData = await _data.read("tokens", id);
      // Check that the token is for the given user and has not expired
      // console.log(
      //   tokenData.phone == phone,
      //   tokenData.expires > Date.now(),
      //   "hereeee"
      // );
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        resolve(true);
      } else {
        reject("the token does not match or expired ");
      }
    } catch (err) {
      reject("this tokens is not found ");
    }
  });
};

// Checks
handlers.checks = function (data) {
  return new Promise(async (resolve, reject) => {
    var acceptableMethods = ["post", "get", "put", "delete"];
    if (acceptableMethods.indexOf(data.method) > -1) {
      try {
        const response = await handlers._checks[data.method](data);
        resolve(response);
      } catch (err) {
        reject(err);
      }
    } else {
      reject({ statusCode: 405, err: "this method is not found" });
    }
  });
};

// Container for all the checks methods
handlers._checks = {};

// Checks - post
// Required data: protocol,url,method,successCodes,timeoutSeconds
// Optional data: none
handlers._checks.post = function (data) {
  // console.log(data);
  return new Promise(async (resolve, reject) => {
    // Validate inputs
    var protocol =
      typeof data.payload.protocol == "string" &&
      ["https", "http"].indexOf(data.payload.protocol) > -1
        ? data.payload.protocol
        : false;
    var url =
      typeof data.payload.url == "string" && data.payload.url.trim().length > 0
        ? data.payload.url.trim()
        : false;
    var method =
      typeof data.payload.method == "string" &&
      ["post", "get", "put", "delete"].indexOf(data.payload.method) > -1
        ? data.payload.method
        : false;
    var successCodes =
      typeof data.payload.successCodes == "object" &&
      data.payload.successCodes instanceof Array &&
      data.payload.successCodes.length > 0
        ? data.payload.successCodes
        : false;
    var timeoutSeconds =
      typeof data.payload.timeoutSeconds == "number" &&
      data.payload.timeoutSeconds % 1 === 0 &&
      data.payload.timeoutSeconds >= 1 &&
      data.payload.timeoutSeconds <= 5
        ? data.payload.timeoutSeconds
        : false;
    if (protocol && url && method && successCodes && timeoutSeconds) {
      // get token from headers
      var token =
        typeof data.headers.token == "string" ? data.headers.token : false;
      try {
        const tokenData = await _data.read("tokens", token);
        // console.log(tokenData, "tokenDAta");
        var userPhone = tokenData.phone;
        try {
          const userData = await _data.read("users", userPhone);
          var userChecks =
            typeof userData.checks == "object" &&
            userData.checks instanceof Array
              ? userData.checks
              : [];
          // Verify that user has less than the number of max-checks per user
          // console.log(userChecks.length, config.maxChecks);
          if (userChecks.length < config.maxChecks) {
            // Create random id for check
            var checkId = helpers.createRandomString(20);

            // Create check object including userPhone
            var checkObject = {
              id: checkId,
              userPhone: userPhone,
              protocol: protocol,
              url: url,
              method: method,
              successCodes: successCodes,
              timeoutSeconds: timeoutSeconds,
            };
            try {
              await _data.create("checks", checkId, checkObject);
              // Add check id to the user's object
              userData.checks = userChecks;
              userData.checks.push(checkId);
              // Save the new user data
              try {
                await _data.update("users", userPhone, userData);
                // Return the data about the new check
                resolve({ statusCode: 200, checkObject });
              } catch (err) {
                reject({
                  statusCode: 500,
                  err: "Could not update the user with the new check.",
                });
              }
            } catch (err) {
              reject({
                successCodes: 500,
                err: "Could not create the new check",
              });
            }
          } else {
            reject({
              successCodes: 400,
              err:
                "The user already has the maximum number of checks (" +
                config.maxChecks +
                ").",
            });
          }
        } catch (err) {
          reject({ statusCode: 403, err });
        }
      } catch (err) {
        reject({ statusCode: 403, err });
      }
      // Lookup the user phone by reading the token
    } else {
      reject({
        statusCode: 400,
        Error: "Missing required inputs, or inputs are invalid",
      });
    }
  });
};

// Checks - get
// Required data: id
// Optional data: none
handlers._checks.get = function (data) {
  return new Promise(async (resolve, reject) => {
    // Check that id is valid
    //   // console.log(data.queryString, typeof data.queryString, "heerreee");
    var id =
      typeof data.queryString.id == "string" &&
      data.queryString.id.trim().length == 20
        ? data.queryString.id.trim()
        : false;
    if (id) {
      try {
        // Lookup the check
        const checkData = await _data.read("checks", id);
        // console.log(checkData, "cheeeeeeck");
        //  Get the token that sent the request
        var token =
          typeof data.headers.token == "string" ? data.headers.token : false;
        // Verify that the given token is valid and belongs to the user who created the check
        // console.log("This is check data", checkData);
        try {
          const tokenIsValid = await handlers._tokens.verifyToken(
            token,
            checkData.userPhone
          );
          // console.log(tokenIsValid, "tokenIsValid");
          if (tokenIsValid) {
            // Return check data
            resolve({ statusCode: 200, checkData });
          } else {
            reject({ statusCode: 403, err });
          }
        } catch (err) {
          reject({ statusCode: 403, err });
        }
      } catch (err) {
        reject({ statusCode: 404, err });
      }
    } else {
      reject({
        statusCode: 400,
        err: "Missing required field, or field invalid",
      });
    }
  });
};

// Checks - put
// Required data: id
// Optional data: protocol,url,method,successCodes,timeoutSeconds (one must be sent)
handlers._checks.put = function (data) {
  return new Promise(async (resolve, reject) => {
    // Check for required field
    var id =
      typeof data.payload.id == "string" && data.payload.id.trim().length == 20
        ? data.payload.id.trim()
        : false;

    // Check for optional fields
    var protocol =
      typeof data.payload.protocol == "string" &&
      ["https", "http"].indexOf(data.payload.protocol) > -1
        ? data.payload.protocol
        : false;
    var url =
      typeof data.payload.url == "string" && data.payload.url.trim().length > 0
        ? data.payload.url.trim()
        : false;
    var method =
      typeof data.payload.method == "string" &&
      ["post", "get", "put", "delete"].indexOf(data.payload.method) > -1
        ? data.payload.method
        : false;
    var successCodes =
      typeof data.payload.successCodes == "object" &&
      data.payload.successCodes instanceof Array &&
      data.payload.successCodes.length > 0
        ? data.payload.successCodes
        : false;
    var timeoutSeconds =
      typeof data.payload.timeoutSeconds == "number" &&
      data.payload.timeoutSeconds % 1 === 0 &&
      data.payload.timeoutSeconds >= 1 &&
      data.payload.timeoutSeconds <= 5
        ? data.payload.timeoutSeconds
        : false;

    // Error if id is invalid
    if (id) {
      // Error if nothing is sent to update
      if (protocol || url || method || successCodes || timeoutSeconds) {
        try {
          console.log(id);
          // Lookup the check
          const checkData = await _data.read("checks", id);
          console.log(checkData, "checkData");

          // Get the token that sent the request
          var token =
            typeof data.headers.token == "string" ? data.headers.token : false;
          // Verify that the given token is valid and belongs to the user who created the check
          console.log(token, checkData.userPhone);
          const tokenIsValid = handlers._tokens.verifyToken(
            token,
            checkData.userPhone
          );
          if (tokenIsValid) {
            // Update check data where necessary
            if (protocol) {
              checkData.protocol = protocol;
            }
            if (url) {
              checkData.url = url;
            }
            if (method) {
              checkData.method = method;
            }
            if (successCodes) {
              checkData.successCodes = successCodes;
            }
            if (timeoutSeconds) {
              checkData.timeoutSeconds = timeoutSeconds;
            }
            // Store the new updates
            try {
              await _data.update("checks", id, checkData);
              resolve({ successCodes: 200, mess: "done" });
            } catch (err) {
              reject({ statusCode: 500, err: "Could not update the check." });
            }
          }
        } catch (err) {
          reject({ successCodes: 400, err: "Check ID did not exist." });
        }
      } else {
        reject({ statusCode: 400, err: "Missing fields to update." });
      }
    } else {
      reject({ statusCode: 400, err: "Missing required field." });
    }
  });
};

// Checks - delete
// Required data: id
// Optional data: none
handlers._checks.delete = function (data) {
  return new Promise(async (resolve, reject) => {
    // Check that id is valid
    var id =
      typeof data.queryString.id == "string" &&
      data.queryString.id.trim().length == 20
        ? data.queryString.id.trim()
        : false;
    if (id) {
      // Get the token that sent the request
      var token =
        typeof data.headers.token == "string" ? data.headers.token : false;
      // Verify that the given token is valid and belongs to the user who created the check

      try {
        const checkData = await _data.read("checks", id);
        console.log(token, checkData.userPhone);

        const tokenIsValid = await handlers._tokens.verifyToken(
          token,
          checkData.userPhone
        );

        if (tokenIsValid) {
          try {
            const check = await _data.read("checks", id);
            try {
              await _data.delete("checks", id);
              try {
                const user = await _data.read("users", check.userPhone);
                const newUser = user.checks.filter((el) => el !== id);
                user.checks = newUser;
                try {
                  await _data.update("users", check.userPhone, user);
                } catch (err) {}
              } catch (err) {}
            } catch (err) {
              reject({ statusCode: 404, err: "can not delete" });
            }
            resolve({ statusCode: 200, check });
          } catch (err) {
            reject({
              statusCode: 404,
              err: "there is no check with that id ",
            });
          }
        } else {
          reject({
            statusCode: 404,
            err: "Check ID did not exist.  token is not valid",
          });
        }
      } catch (err) {}
    } else {
      reject({ statusCode: 404, err: "Missing required field" });
    }
  });
};

handlers.sendTwilioSms = function (msg) {
  return new Promise((resolve, reject) => {
    phone =
      typeof phone == "string" && phone.trim().length == 10
        ? phone.trim()
        : false;
    msg =
      typeof msg == "string" &&
      msg.trim().length > 0 &&
      msg.trim().length <= 1600
        ? msg.trim()
        : false;

    if (phone && msg) {
      client.messages
        .create({
          body: msg,
          from: "+16205829145",
          to: "+201002363642",
        })
        .then((message) => {
          console.log(message);
          resolve({ statusCode: 200, message: "done" });
        })
        .catch((err) => reject({ statusCode: 404, err }));
    } else {
      reject({ statusCode: 404, err: "Missing required field" });
    }
  });
};
// const payload = {
//   From: config.twilio.fromPhone,
//   To: phone,
//   Body: msg,
// };
// const stringPayload = queryString.stringify(payload);

// const requestDetails = {
//   protocol: "https:",
//   hostname: "api.twilio.com",
//   method: "POST",
//   path: "/2010-04-01/Accounts/AC99f60c5cfbcffd55ea2605ad2ee1ff95/Messages.json",
//   auth: config.twilio.accountSid + ":" + config.twilio.authToken,
//   headers: {
//     "Content-Type": "application/x-www-form-urlencoded",
//     "Content-Length": Buffer.byteLength(stringPayload),
//   },
// };

// const req = https.request(requestDetails, function (res) {
//   var status = res.statusCode;
//   console.log(status, res.error);
//   if (status == 200 || status == 201) {
//     callback(false);
//   } else {
//     callback("status returned was");
//     console.log(res.error);
//   }
// });

// req.on("error", function (e) {
//   callback(e);
// });
// req.write(stringPayload);
// req.end();
handlers.sample = (data, callBack) => {
  callBack(406, { name: "sampleHandler" });
};

handlers.notFound = (data, callBack) => {
  callBack(404);
};
module.exports = handlers;
