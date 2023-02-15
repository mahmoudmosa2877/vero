/****
 *
 * Primary file for the API
 *
 *
 */

//Dependancies
const server = require("./lib/server");
const worker = require("./lib/worker");
const _data = require("./lib/lib");

_data.list("users");

//Declare the app
const app = {};

// init function
app.init = async function () {
  //start the server
  server.init();
  //start the workers
  // worker.init();
  try {
    const checks = await worker.performCheck();
    console.log(checks);
  } catch (err) {
    console.log(err);
  }
};

//Execute
app.init();

module.exports = app;
