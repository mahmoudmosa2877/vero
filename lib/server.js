// Dependencies
var http = require("http");
var url = require("url");
var StringDecoder = require("string_decoder").StringDecoder;
var config = require("./config");
var handlers = require("./handlers");
var helpers = require("./helper");
const path = require("path");

const server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer((req, res) => {
  // Instantiate the HTTP server
  server.unifiedServer(req, res);
});

// All the server logic for both the http  server
server.unifiedServer = function (req, res) {
  // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, "");

  // Get the query string as an object
  var queryString = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

  // Get the payload,if any
  var decoder = new StringDecoder("utf-8");
  var buffer = "";
  req.on("data", function (data) {
    buffer += decoder.write(data);
  });
  req.on("end", async function () {
    buffer += decoder.end();
    // Construct the data object to send to the handler
    const data = {
      trimmedPath,
      queryString,
      method,
      headers,
      payload: helpers.parseJsonToObject(buffer),
    };

    // Check the server.router for a matching path for a handler.
    // If one is not found, use the notFound handler instead.
    const choosenHandler =
      typeof server.router[trimmedPath] !== "undefined"
        ? server.router[trimmedPath]
        : handlers.notFound;

    try {
      // Route the request to the handler specified in the server.router
      const respon = await choosenHandler(data);
      // Use the status code returned from the handler, or set the default status code to 200
      //   const statusCode =
      //     typeof respon.statusCode == "number" ? respon.statusCode : 200;
      // Use the payload returned from the handler, or set the default payload to an empty object
      const payload = typeof respon == "object" ? respon : {};
      // Convert the payload to a string
      const payloadString = JSON.stringify(payload);
      // Return the response
      res.setHeader("Content-Type", "application/json");
      //   res.writeHead(statusCode);
      res.end(payloadString);
    } catch (err) {
      const payloadString = JSON.stringify(err);
      console.log(err, "err in the server");
      // Return the response on error
      res.end(payloadString);
    }
  });
};

// Define the request server.router
server.router = {
  sample: handlers.sample,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks,
};

server.init = function () {
  // Start the HTTP server
  server.httpServer.listen(3000, () => {
    console.log("server is listening");
  });
};

module.exports = server;

// const parsedUrl = url.parse(req.url, true);
// const path = parsedUrl.pathname;
// const trimmedPath = path.replace(/^\/+|\/+$/g, "");
// const method = req.method.toLocaleLowerCase();
// const queryString = parsedUrl.query;
// const headers = req.headers;
// const decoder = new stringDecoder("utf-8");
// let buffer = "";
// const choosenHandler =
//   typeof server.router[trimmedPath] !== "undefined"
//     ? server.router[trimmedPath]
//     : handlers.notFound;
// //console.log(server.router[users]);

// req.on("data", (data) => {
//   buffer += decoder.write(data);
// });
// req.on("end", async () => {
//   buffer += decoder.end();
//   const data = {
//     trimmedPath,
//     queryString,
//     method,
//     headers,
//     payload: JSON.parse(buffer),
//   };

//   try {
//     const respon = await choosenHandler(data);
//     //   const statusCode =
//     //     typeof respon.statusCode == "number" ? respon.statusCode : 200;
//     const payload = typeof respon == "object" ? respon : {};
//     const payloadString = JSON.stringify(payload);
//     res.setHeader("Content-Type", "application/json");
//     //   res.writeHead(statusCode);
//     res.end(payloadString);
//   } catch (err) {
//     const payloadString = JSON.stringify(err);
//     console.log(err, "err in the server");
//     res.end(payloadString);
//   }
// });
