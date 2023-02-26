/****
 *
 * Primary file for the API
 *
 *
 */

//Dependancies
const server = require("./lib/server");
const worker = require("./lib/worker");
const cli = require("./lib/cli");

//Declare the app
const app = {};

// init function
app.init = async function () {
  //start the server
  server.init();

  //start the workers
  // worker.init();
  // Start the CLI, but make sure it starts last
  setTimeout(function () {
    cli.init();
  }, 50);
};

//Execute
app.init();

module.exports = app;
