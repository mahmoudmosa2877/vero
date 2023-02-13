/****
 *
 * Primary file for the API
 *
 *
 */

//Dependancies
const server = require("./lib/server");
const worker = require("./lib/worker");

//Declare the app
const app = {};

// init function
app.init = function () {
  //start the server
  server.init();
  //start the workers
  // worker.init();
};

//Execute
app.init();

module.exports = app;
