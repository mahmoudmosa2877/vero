/**
 *
 * worker related tasks
 */

//Dependancies

const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");
const _data = require("./lib");
const helpers = require("./handlers");
const url = require("url");
const _logs = require("./logs");

//instiantiate the worker
const worker = {};

// Lookup all checks, get thier data, send to a validator
worker.gatherAllChecks = function () {
  return new Promise(async (resolve, reject) => {
    try {
      //Get all checks
      const checks = await _data.list("checks");
      //  console.log(checks);
      checks.message.forEach(async (check) => {
        try {
          //Read in the check data
          const originalCheckData = await _data.read("checks", check);
          //pass it to the check validator
          resolve(originalCheckData);
        } catch (err) {
          reject("Error: reading one of the check's data");
        }
      });
      //, function (err, originalCheckData) {
    } catch (err) {
      reject("Error: could not find any check to the process");
    }
  });
};

// Sanity-check the check-data,
worker.validateCheckData = async function () {
  let originalCheckData = await worker.gatherAllChecks();
  // console.log(originalCheckData);
  return new Promise((resolve, reject) => {
    originalCheckData =
      typeof originalCheckData == "object" && originalCheckData !== null
        ? originalCheckData
        : {};
    originalCheckData.id =
      typeof originalCheckData.id == "string" &&
      originalCheckData.id.trim().length == 20
        ? originalCheckData.id.trim()
        : false;
    originalCheckData.userPhone =
      typeof originalCheckData.userPhone == "string" &&
      originalCheckData.userPhone.trim().length == 10
        ? originalCheckData.userPhone.trim()
        : false;
    originalCheckData.protocol =
      typeof originalCheckData.protocol == "string" &&
      ["http", "https"].indexOf(originalCheckData.protocol) > -1
        ? originalCheckData.protocol
        : false;
    originalCheckData.url =
      typeof originalCheckData.url == "string" &&
      originalCheckData.url.trim().length > 0
        ? originalCheckData.url.trim()
        : false;
    originalCheckData.method =
      typeof originalCheckData.method == "string" &&
      ["post", "get", "put", "delete"].indexOf(originalCheckData.method) > -1
        ? originalCheckData.method
        : false;
    originalCheckData.successCodes =
      typeof originalCheckData.successCodes == "object" &&
      originalCheckData.successCodes instanceof Array &&
      originalCheckData.successCodes.length > 0
        ? originalCheckData.successCodes
        : false;
    originalCheckData.timeoutSeconds =
      typeof originalCheckData.timeoutSeconds == "number" &&
      originalCheckData.timeoutSeconds % 1 === 0 &&
      originalCheckData.timeoutSeconds >= 1 &&
      originalCheckData.timeoutSeconds <= 5
        ? originalCheckData.timeoutSeconds
        : false;
    // Set the keys that may not be set (if the worker have never seen this check before)
    originalCheckData.state =
      typeof originalCheckData.state == "string" &&
      ["up", "down"].indexOf(originalCheckData.state) > -1
        ? originalCheckData.state
        : "down";
    originalCheckData.lastChecked =
      typeof originalCheckData.lastChecked == "number" &&
      originalCheckData.lastChecked > 0
        ? originalCheckData.lastChecked
        : false;

    // If all checks pass, pass the data along to the next step in the process
    if (
      originalCheckData.id &&
      originalCheckData.userPhone &&
      originalCheckData.protocol &&
      originalCheckData.url &&
      originalCheckData.method &&
      originalCheckData.successCodes &&
      originalCheckData.timeoutSeconds
    ) {
      resolve(originalCheckData);
    } else {
      // If checks fail, log the error and fail silently
      reject("Error: one of the checks is not properly formatted. Skipping.");
    }
  });
};

//Perform the check , send the original check data and the outcome of the check process
worker.performCheck = async function () {
  let originalCheckData = await worker.validateCheckData();
  //  console.log(originalCheckData, "in perform");
  return new Promise((resolve, reject) => {
    // Prepare the intial check outcome
    let checkOutcome = {
      error: false,
      responseCode: false,
    };

    // Mark that the outcome has not been sent yet
    let outcomeSent = false;

    // Parse the hostname and path out of the originalCheckData
    const parsedUrl = url.parse(
      originalCheckData.protocol + "://" + originalCheckData.url,
      true
    );
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path; // Using path not pathname because we want the query string

    // Construct the request
    const requestDetails = {
      protocol: originalCheckData.protocol + ":",
      hostname: hostName,
      method: originalCheckData.method.toUpperCase(),
      path: path,
      timeout: originalCheckData.timeoutSeconds * 1000,
    };

    // Instantiate the request object (using either the http or https module)
    const _moduleToUse = originalCheckData.protocol == "http" ? http : https;
    const req = _moduleToUse.request(requestDetails, function (res) {
      // Grab the status of the sent request
      const status = res.statusCode;
      //  console.log(res.statusCode, "res.statusCode");

      // Update the checkOutcome and pass the data along
      checkOutcome.responseCode = status;
      if (!outcomeSent) {
        resolve({ originalCheckData, checkOutcome });
        outcomeSent = true;
      }
    });

    // Bind to the error event so it doesn't get thrown
    req.on("error", function (e) {
      // Update the checkOutcome and pass the data along
      checkOutcome.error = { error: true, value: e };
      if (!outcomeSent) {
        resolve({ originalCheckData, checkOutcome });
        outcomeSent = true;
      }
    });

    // Bind to the timeout event
    req.on("timeout", function () {
      // Update the checkOutcome and pass the data along
      checkOutcome.error = { error: true, value: "timeout" };
      if (!outcomeSent) {
        resolve({ originalCheckData, checkOutcome });
        outcomeSent = true;
      }
    });

    // End the request
    req.end();
  });
};

// Process the check outcome, update the check data as needed, trigger an alert if needed
// Special logic for accomodating a check that has never been tested before (don't alert on that one)
worker.processCheckOutcome = async function () {
  const { originalCheckData, checkOutcome } = await worker.performCheck();
  return new Promise(async (resolve, reject) => {
    console.log(originalCheckData);

    // Decide if the check is considered up or down
    const state =
      !checkOutcome.error &&
      checkOutcome.responseCode &&
      originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1
        ? "up"
        : "down";

    // Decide if an alert is warranted
    const alertWarranted =
      originalCheckData.lastChecked && originalCheckData.state !== state
        ? true
        : false;

    // Log the outcome
    const timeOfCheck = Date.now();
    worker.log(
      originalCheckData,
      checkOutcome,
      state,
      alertWarranted,
      timeOfCheck
    );

    // Update the check data
    const newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = timeOfCheck;
    newCheckData.alertWarranted = alertWarranted;
    try {
      //  Save the updates
      await _data.update("checks", newCheckData.id, newCheckData);
      resolve(newCheckData);
    } catch (err) {
      console.log("Error trying to save updates to one of the checks");
    }
  });
};

// Alert the user as to a change in their check status
worker.alertUserToStatusChange = async function (newCheckData) {
  const msg = "Alert: Your check for check ";
  try {
    await helpers.sendTwilioSms(msg);
    console.log(
      "Success: User was alerted to a status change in their check, via sms: ",
      msg
    );
  } catch (err) {
    console.log(
      "Error: Could not send sms alert to user who had a state change in their check",
      err
    );
  }
};

worker.alertUserToStatusChange = function (newCheckData) {
  var msg =
    "Alert: Your check for " +
    newCheckData.method.toUpperCase() +
    " " +
    newCheckData.protocol +
    "://" +
    newCheckData.url +
    " is currently " +
    newCheckData.state;
  helpers.sendTwilioSms(newCheckData.userPhone, msg, function (err) {
    if (!err) {
      console.log(
        "Success: User was alerted to a status change in their check, via sms: ",
        msg
      );
    } else {
      console.log(
        "Error: Could not send sms alert to user who had a state change in their check",
        err
      );
    }
  });
};

// Send check data to a log file
worker.log = function (
  originalCheckData,
  checkOutcome,
  state,
  alertWarranted,
  timeOfCheck
) {
  // Form the log data
  var logData = {
    check: originalCheckData,
    outcome: checkOutcome,
    state: state,
    alert: alertWarranted,
    time: timeOfCheck,
  };

  // Convert the data to a string
  var logString = JSON.stringify(logData);

  // Determine the name of the log file
  var logFileName = originalCheckData.id;

  // Append the log string to the file
  _logs.append(logFileName, logString, function (err) {
    if (!err) {
      console.log("Logging to file succeeded");
    } else {
      console.log("Logging to file failed");
    }
  });
};

//Timer to execute the worker process once per minute
worker.loop = function () {
  setInterval(async function () {
    // console.log("loop");

    const res = await worker.processCheckOutcome();
    if (res.alertWarranted) {
      worker.alertUserToStatusChange(newCheckData);
    } else {
      console.log("Check outcome has not changed, no alert needed");
    }
  }, 1000 * 5);
};

// Rotate (compress) the log files
worker.rotateLogs = function () {
  // List all the (non compressed) log files
  _logs.list(false, function (err, logs) {
    if (!err && logs && logs.length > 0) {
      logs.forEach(function (logName) {
        // Compress the data to a different file
        var logId = logName.replace(".log", "");
        var newFileId = logId + "-" + Date.now();
        _logs.compress(logId, newFileId, function (err) {
          if (!err) {
            // Truncate the log
            _logs.truncate(logId, function (err) {
              if (!err) {
                console.log("Success truncating logfile");
              } else {
                console.log("Error truncating logfile");
              }
            });
          } else {
            console.log("Error compressing one of the log files.", err);
          }
        });
      });
    } else {
      console.log("Error: Could not find any logs to rotate");
    }
  });
};

// Timer to execute the log-rotation process once per day
worker.logRotationLoop = function () {
  setInterval(function () {
    worker.rotateLogs();
  }, 1000 * 60 * 60 * 24);
};

// init script
worker.init = async function () {
  //Execute all the checks immediately
  try {
    console.log("init");
    const res = await worker.processCheckOutcome();
    console.log("init22222", res);
    if (res.alertWarranted) {
      worker.alertUserToStatusChange(newCheckData);
    } else {
      console.log("Check outcome has not changed, no alert needed");
    }
    //call the loop so the checks will execute later on
    worker.loop();

    // Compress all the logs immediately
    worker.rotateLogs();

    // Call the compression loop so checks will execute later on
    worker.logRotationLoop();
  } catch (err) {
    console.log(err);
  }
};

//Export the module
module.exports = worker;
