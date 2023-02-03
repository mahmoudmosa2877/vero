const http = require("http");
const url = require("url");
const stringDecoder = require("string_decoder").StringDecoder;
const handlers = require("./handlers");

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  const method = req.method;
  const queryString = parsedUrl.query;
  const header = req.headers;
  const decoder = new stringDecoder("utf-8");
  let buffer = "";
  const choosenHandler =
    typeof router[trimmedPath] !== "undefined"
      ? router[trimmedPath]
      : handlers.notFound;

  req.on("data", (data) => {
    buffer += decoder.write(data);
  });
  req.on("end", () => {
    buffer += decoder.end();
    console.log(buffer, typeof buffer);
    const data = {
      trimmedPath,
      queryString,
      method,
      header,
      payload: buffer,
    };
    console.log(data);

    choosenHandler(data, (statusCode, payload) => {
      statusCode = typeof statusCode == "number" ? statusCode : 200;
      payload = typeof payload == "object" ? payload : {};
      const payloadString = JSON.stringify(payload);
      res.setHeader("Content-Type", "application/json");
      console.log(typeof payloadString);
      res.end(payloadString);
    });
  });
});

server.listen(3000, () => {
  console.log("server is listening");
});

const router = {
  sample: handlers.sample,
};
