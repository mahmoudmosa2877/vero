const http = require("http");
const url = require("url");
const stringDecoder = require("string_decoder").StringDecoder;
const handlers = require("./lib/handlers");

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  const method = req.method.toLocaleLowerCase();
  const queryString = parsedUrl.query;
  const headers = req.headers;
  const decoder = new stringDecoder("utf-8");
  let buffer = "";
  const choosenHandler =
    typeof router[trimmedPath] !== "undefined"
      ? router[trimmedPath]
      : handlers.notFound;
  // console.log(router[users]);

  req.on("data", (data) => {
    buffer += decoder.write(data);
  });
  req.on("end", async () => {
    buffer += decoder.end();
    console.log(buffer, typeof buffer);
    const bufferJson = JSON.parse(buffer);
    const data = {
      trimmedPath,
      queryString,
      method,
      headers,
      payload: bufferJson,
    };
    console.log(data);

    try {
      const respon = await choosenHandler(data);
      // console.log(respon, "respone");
      //   const statusCode =
      //     typeof respon.statusCode == "number" ? respon.statusCode : 200;
      console.log(respon);
      const payload = typeof respon == "object" ? respon : {};
      const payloadString = JSON.stringify(payload);
      res.setHeader("Content-Type", "application/json");
      //   res.writeHead(statusCode);
      console.log(typeof payloadString);
      console.log(respon, "respon");
      res.end(payloadString);
    } catch (err) {
      // console.log(err, typeof err);
      console.log(err, "err in the server");
      res.end(err);
    }
  });
});

server.listen(3000, () => {
  console.log("server is listening");
});

const router = {
  sample: handlers.sample,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks,
};
