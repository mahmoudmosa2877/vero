const _data = require("./lib");
const handlers = {};

handlers.users = function (data) {
  return new Promise(async (resolve, reject) => {
    const acceptMethods = ["POST", "GET", "PUT", "DELETE"];
    if (acceptMethods.indexOf(data.method) > -1) {
      // console.log(handlers._users[data.method](data, callback));
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

handlers._users.POST = async function (data) {
  const res = JSON.parse(data.payload);
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
        const hashedPassword = password;
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

handlers._users.GET = async function (data) {
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

handlers._users.PUT = async function (data) {
  console.log(data, "data in put");
  const dataJson = JSON.parse(data.payload);
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

handlers._users.DELETE = async function (data) {
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
// , function (err, data) {
//   if (!err) {
//     _data.delete("users", phone, function (err) {
//       if (!err) {
//         resolve(200);
//       } else {
//         reject(500, { Error: "could not delete this user" });
//       }
//     });
//   } else {
//     console.log(err);
//     reject(400, { error: "that specific user is not found" });
//   }
// });

// handlers.tokens = function (data, callback) {
//   const acceptMethods = ["post", "get", "put", "delete"];
//   if (acceptMethods.indexOf(data.method) > -1) {
//     handlers._tokens[data.method](data, callback);
//   } else {
//     callback(405);
//   }
// };

// handlers._tokens = {};

// handlers._tokens.post = function (data, callBack) {
//   const phone =
//     typeof data.payload.phone == "string" &&
//     data.payload.phone.trim().length == 10
//       ? data.payload.phone.trim()
//       : false;
//   const password =
//     typeof data.payload.password == "string" &&
//     data.payload.password.trim().length > 0
//       ? data.payload.password.trim()
//       : false;
//   console.log(phone, password);
//   if (phone && password) {
//     _data.read("users", phone, function (err, userData) {
//       if (!err && userData) {
//         const hashedPassword = helpers.hash(password);
//         if (hashedPassword == userData.hashedPassword) {
//           const tokenId = helpers.createRandomString(20);
//           const expires = Date.now() + 1000 * 60 * 60;
//           const tokenObject = {
//             phone,
//             id: tokenId,
//             expires,
//           };
//           _data.create("tokens", tokenId, tokenObject, function (err) {
//             if (!err) {
//               callBack(200, tokenObject);
//             } else {
//               callBack(500, { Error: "could not create" });
//             }
//           });
//         } else {
//           callBack(400, { Error: "password does not match " });
//         }
//       } else {
//         callBack(400, { Error: "could not find the spacific user" });
//       }
//     });
//   } else {
//     callBack(400, { Error: "Missing required fields" });
//   }
// };

// // Tokens - get
// // Required data: id
// // Optional data: none
// handlers._tokens.get = function (data, callback) {
//   // Check that id is valid
//   var id =
//     typeof data.queryStringObject.id == "string" &&
//     data.queryStringObject.id.trim().length == 20
//       ? data.queryStringObject.id.trim()
//       : false;
//   if (id) {
//     // Lookup the token
//     _data.read("tokens", id, function (err, tokenData) {
//       if (!err && tokenData) {
//         callback(200, tokenData);
//       } else {
//         callback(404);
//       }
//     });
//   } else {
//     callback(400, { Error: "Missing required field, or field invalid" });
//   }
// };

// // Tokens - put
// // Required data: id, extend
// // Optional data: none
// handlers._tokens.put = function (data, callback) {
//   var id =
//     typeof data.payload.id == "string" && data.payload.id.trim().length == 20
//       ? data.payload.id.trim()
//       : false;
//   var extend =
//     typeof data.payload.extend == "boolean" && data.payload.extend == true
//       ? true
//       : false;
//   if (id && extend) {
//     // Lookup the existing token
//     _data.read("tokens", id, function (err, tokenData) {
//       if (!err && tokenData) {
//         // Check to make sure the token isn't already expired
//         if (tokenData.expires > Date.now()) {
//           // Set the expiration an hour from now
//           tokenData.expires = Date.now() + 1000 * 60 * 60;
//           // Store the new updates
//           _data.update("tokens", id, tokenData, function (err) {
//             if (!err) {
//               callback(200);
//             } else {
//               callback(500, {
//                 Error: "Could not update the token's expiration.",
//               });
//             }
//           });
//         } else {
//           callback(400, {
//             Error: "The token has already expired, and cannot be extended.",
//           });
//         }
//       } else {
//         callback(400, { Error: "Specified user does not exist." });
//       }
//     });
//   } else {
//     callback(400, {
//       Error: "Missing required field(s) or field(s) are invalid.",
//     });
//   }
// };

// // Tokens - delete
// // Required data: id
// // Optional data: none
// handlers._tokens.delete = function (data, callback) {
//   // Check that id is valid
//   var id =
//     typeof data.queryStringObject.id == "string" &&
//     data.queryStringObject.id.trim().length == 20
//       ? data.queryStringObject.id.trim()
//       : false;
//   if (id) {
//     // Lookup the token
//     _data.read("tokens", id, function (err, tokenData) {
//       if (!err && tokenData) {
//         // Delete the token
//         _data.delete("tokens", id, function (err) {
//           if (!err) {
//             callback(200);
//           } else {
//             callback(500, { Error: "Could not delete the specified token" });
//           }
//         });
//       } else {
//         callback(400, { Error: "Could not find the specified token." });
//       }
//     });
//   } else {
//     callback(400, { Error: "Missing required field" });
//   }
// };

// // Verify if a given token id is currently valid for a given user
// handlers._tokens.verifyToken = function (id, phone, callback) {
//   // Lookup the token
//   _data.read("tokens", id, function (err, tokenData) {
//     if (!err && tokenData) {
//       // Check that the token is for the given user and has not expired
//       if (tokenData.phone == phone && tokenData.expires > Date.now()) {
//         callback(true);
//       } else {
//         callback(false);
//       }
//     } else {
//       callback(false);
//     }
//   });
// };

handlers.sample = (data, callBack) => {
  callBack(406, { name: "sampleHandler" });
};

handlers.notFound = (data, callBack) => {
  callBack(404);
};
module.exports = handlers;
