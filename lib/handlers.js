const helpers = require("./helper");
const _data = require("./lib");
const handlers = {};
const config = require("./../config");

handlers.users = function (data) {
  return new Promise(async (resolve, reject) => {
    const acceptMethods = ["post", "get", "put", "delete"];
    if (acceptMethods.indexOf(data.method) > -1) {
      // console.log(handlers._users[data.method](data, callback));
      const parsedData = JSON.parse(data);
      try {
        const res = await handlers._users[data.method](parsedData);
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
  console.log(res.firstName);
  const firstName =
    typeof res.firstName == "string" && res.firstName.trim().length > 0
      ? res.firstName.trim()
      : false;
  const lastName =
    typeof res.lastName == "string" && res.lastName.trim().length > 0
      ? res.lastName.trim()
      : false;
  const phone =
    typeof res.phone == "string" && res.phone.trim().length == 10
      ? res.phone.trim()
      : false;
  const password =
    typeof res.password == "string" && res.password.trim().length > 0
      ? res.password.trim()
      : false;
  const tosAgreement =
    typeof res.tosAgreement == "boolean" && res.tosAgreement == true
      ? true
      : false;
  console.log(
    firstName,
    lastName,
    phone,
    password,
    tosAgreement,
    "function is called"
  );
  return new Promise(async (resolve, reject) => {
    if (firstName && lastName && phone && password && tosAgreement) {
      try {
        const res = await _data.read("users", phone);
        console.log(res);
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
      console.log("callback");
      reject("error please insert main cat");
    }
  });
};

handlers._users.get = async function (data) {
  return new Promise(async (resolve, reject) => {
    console.log(data.queryString);
    const phone =
      typeof data.queryString.phone == "string" &&
      data.queryString.phone.trim().length == 10
        ? data.queryString.phone.trim()
        : false;
    console.log(phone, "phone");
    if (phone) {
      try {
        const { data } = await _data.read("users", phone);
        console.log(data, "readed data");
        const dataJson = JSON.parse(data);
        delete dataJson.hashedPassword;
        console.log(dataJson, "after delete data");

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
  console.log(data, "data in put");

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
  console.log(phone);
  return new Promise(async (resolve, reject) => {
    if (phone) {
      if (firstName || lastName || phone) {
        try {
          const usersq = await _data.read("users", phone);

          console.log(usersq, "readed data");
          const userData = JSON.parse(usersq.data);
          console.log(userData, "readed data after Json");

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
        console.log(resolveRes, "resolvedRes");
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
    console.log(phone, password);
    if (phone && password) {
      try {
        const userData = await _data.read("users", phone);
        console.log(typeof userData, "userData");
        const dataJson = JSON.parse(userData);
        console.log(dataJson);
        const hashedPassword = helpers.hash(password);
        console.log(hashedPassword == dataJson.hashedPassword);
        if (password == dataJson.hashedPassword) {
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60 * 15;
          const tokenObject = {
            phone,
            id: tokenId,
            expires,
          };
          try {
            const resCre = await _data.create("tokens", tokenId, tokenObject);
            console.log(resCre);
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
    console.log(data);
    var id =
      typeof data.queryString.id == "string" &&
      data.queryString.id.trim().length == 20
        ? data.queryString.id.trim()
        : false;

    if (id) {
      // Lookup the token
      try {
        const tokenData = await _data.read("tokens", "tokenId");
        console.log(tokenData);
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
    console.log(data);
    if (id && extend) {
      // Lookup the existing token
      try {
        const response = await _data.read("tokens", id);
        const resJson = JSON.parse(response);
        console.log(response, "response");
        // Check to make sure the token isn't already expired
        console.log(
          resJson.expires,
          Date.now(),
          resJson.expires < Date.now(),
          resJson.expires > Date.now()
        );
        if (resJson.expires > Date.now()) {
          //  Store the new updates
          try {
            console.log(id, resJson, "id");
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
      await _data.read("tokens", id);
      // Check that the token is for the given user and has not expired
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        resolve("done");
      } else {
        reject("the token does not match ");
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
  console.log(data);
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
        console.log(tokenData, "tokenDAta");
        var userPhone = tokenData.phone;
        try {
          const userData = await _data.read("users", userPhone);
          var userChecks =
            typeof userData.checks == "object" &&
            userData.checks instanceof Array
              ? userData.checks
              : [];
          // Verify that user has less than the number of max-checks per user
          console.log(userChecks.length, config.maxChecks);
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
// _data.read("tokens", token, function (err, tokenData) {
//   if (!err && tokenData) {
//     var userPhone = tokenData.phone;

//     // Lookup the user data
//     _data.read("users", userPhone, function (err, userData) {
//       if (!err && userData) {
//         var userChecks =
//           typeof userData.checks == "object" &&
//           userData.checks instanceof Array
//             ? userData.checks
//             : [];
//         // Verify that user has less than the number of max-checks per user
//         if (userChecks.length < config.maxChecks) {
//           // Create random id for check
//           var checkId = helpers.createRandomString(20);

//           // Create check object including userPhone
//           var checkObject = {
//             id: checkId,
//             userPhone: userPhone,
//             protocol: protocol,
//             url: url,
//             method: method,
//             successCodes: successCodes,
//             timeoutSeconds: timeoutSeconds,
//           };

//           // Save the object
//           _data.create("checks", checkId, checkObject, function (err) {
//             if (!err) {
//               // Add check id to the user's object
//               userData.checks = userChecks;
//               userData.checks.push(checkId);

//               // Save the new user data
//               _data.update("users", userPhone, userData, function (err) {
//                 if (!err) {
//                   // Return the data about the new check
//                   callback(200, checkObject);
//                 } else {
//                   callback(500, {
//                     Error:
//                       "Could not update the user with the new check.",
//                   });
//                 }
//               });
//             } else {
//               callback(500, { Error: "Could not create the new check" });
//             }
//           });
//         } else {
//           callback(400, {
//             Error:
//               "The user already has the maximum number of checks (" +
//               config.maxChecks +
//               ").",
//           });
//         }
//       } else {
//         callback(403);
//       }
//     });
//   } else {
//     callback(403);
//   }
// });

handlers.sample = (data, callBack) => {
  callBack(406, { name: "sampleHandler" });
};

handlers.notFound = (data, callBack) => {
  callBack(404);
};
module.exports = handlers;
