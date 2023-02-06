const _data = require("./lib");
const handlers = {};

handlers.user = function (data, callBack) {
  const acceptMethods = ["post", "get", "put", "delete"];
  if (acceptMethods.indexOf(data.method) > -1) {
    // console.log(handlers._users[data.method](data, callback));
    handlers._user[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._user = {};

handlers._user = (data, callBack) => {
  callBack(404);
};

handlers.users = function (data, callback) {
  const acceptMethods = ["POST", "GET", "PUT", "DELETE"];
  if (acceptMethods.indexOf(data.method) > -1) {
    // console.log(handlers._users[data.method](data, callback));
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._users = {};

// handlers._users.POST = (data, callBack) => {
//   callBack(404, { user: "mahmoud" });
// };

handlers._users.POST = async function (data, callback) {
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

  if (firstName && lastName && phone && password && tosAgreement) {
    try {
      await _data.read("users", phone);
    } catch (err) {
      const hashedPassword = password;
      const userObject = {
        firstName,
        lastName,
        phone,
        hashedPassword,
        tosAgreement: true,
      };
      await _data.create("users", phone, userObject);
    }
    //  function (err, data) {
    //   if (!err) {
    //     //     const hashedPassword = helpers.hash(password);
    //     //     const userObject = {
    //     //       firstName,
    //     //       lastName,
    //     //       phone,
    //     //       hashedPassword,
    //     //       tosAgreement: true,
    //     //     };
    //     // , function (err) {
    //     //   if (!err) {
    //     //     callback(200);
    //     //   } else {
    //     //     callback(500, { err: "error creating file" });
    //     //   }
    //     // });
    //     // } else {
    //     //   callback(405, { err: "there is an user with phone number" });
    //     // }
    //     // });
    callback(200, { done: "done" });
  } else {
    console.log("callback");
    callback(405, { err: "error please insert main cat" });
  }
};
handlers.sample = (data, callBack) => {
  callBack(406, { name: "sampleHandler" });
};

handlers.notFound = (data, callBack) => {
  callBack(404);
};
module.exports = handlers;
