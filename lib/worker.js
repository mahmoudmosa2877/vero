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
  console.log(originalCheckData);
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
    // Set the keys that may not be set (if the workers have never seen this check before)
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
  console.log(originalCheckData, "in perform");
  return new Promise((resolve, reject) => {
    //prepare the initial check outcome
    let checkOutcome = {
      error: false,
      responceCode: false,
    };

    //Mark that the outcome has not been sent
    let outcomeSent = false;

    //parse the hostname and the path out of the original check
    const parsedUrl = url.parse(
      originalCheckData.protocol + "://" + originalCheckData.url,
      true
    );
    const hostname = parsedUrl.hostname;
    const path = parsedUrl.path;

    //construct the request
    const requestDetails = {
      protocol: originalCheckData.protocol + ":",
      hostname: hostname,
      method: originalCheckData.method.toUpperCase(),
      path: path,
      timeout: originalCheckData.timeoutSeconds * 1000,
    };

    // Instantiate the request object (using either the http or https module)
    var _moduleToUse = originalCheckData.protocol == "http" ? http : https;
    var req = _moduleToUse.request(requestDetails, function (res) {
      // Grab the status of the sent request
      var status = res.statusCode;
      console.log(res.statusCode, "res.statusCode");

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

    // //instantiate the request
    // const _module = originalCheckData.protocol == "https" ? https : http;
    // const req = _module.request(requestDetails, function (res) {
    //   console.log(res.statusCode, "res.statusCode");
    //   //Grap the status of the res
    //   const status = res.statusCode;
    //   //Update the checkoutcome and pass the data along
    //   checkOutcome.responceCode = status;
    //   if (!outcomeSent) {
    //     resolve(originalCheckData, checkOutcome);
    //     outcomeSent = true;
    //   }
    // });
    // // Blind the error event , so it does not get throw
    // req.on("error", function (err) {
    //   //Update the checkoutcome and pass the data along
    //   checkOutcome.error = { err: true, value: err };
    //   if (!outcomeSent) {
    //     console.log(err);
    //     resolve({ originalCheckData, checkOutcome });
    //     outcomeSent = true;
    //   }
    // });
    // // Blind the timeout event , so it does not get throw
    // req.on("timeout", function (err) {
    //   //Update the checkoutcome and pass the data along
    //   checkOutcome.error = { err: true, value: "timeout" };
    //   if (!outcomeSent) {
    //     resolve({ originalCheckData, checkOutcome });
    //     outcomeSent = true;
    //   }
    // });

    // //End the request
    // req.end();
  });
};

//Timer to execute the worker process once per minute
worker.loop = function () {
  setInterval(function () {
    worker.gatherAllChecks();
  }, 1000 * 60);
};

// init script
worker.init = function () {
  //Execute all the checks immediately
  worker.gatherAllChecks();
  //call the loop so the checks will execute later on
  worker.loop();
};

//Export the module
module.exports = worker;
