/****
 *
 * Primary file for the API
 *
 *
 */

//Dependancies
const server = require("./lib/server");
const worker = require("./lib/worker");
// const _data = require("./lib/lib");
// const http = require("http");
// const url = require("url");
// const handlers = require("./lib/handlers");

// _data.list("users");

//Declare the app
const app = {};

// init function
app.init = async function () {
  //start the server
  server.init();
  //start the workers
  worker.init();
};

//Execute
app.init();

module.exports = app;
