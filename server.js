const http = require("http");
const url = require("url");
const stringDecoder = require("string_decoder").StringDecoder;
const handlers = require("./lib/handlers");

// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
const accountSid = "AC99f60c5cfbcffd55ea2605ad2ee1ff95";
const authToken = "b193145532966038aa2ed92dec15f943";
const client = require("twilio")(accountSid, authToken);

client.messages
  .create({
    body: " Mahmoud gamal",
    from: "+16205829145",
    to: "+201002363642",
  })
  .then((message) => console.log(message));

// handlers.sendTwilioSms("+201002363642", "Hello!", function (err) {
//   console.log("this was the err", err);
// });

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
  // //console.log(router[users]);

  req.on("data", (data) => {
    buffer += decoder.write(data);
  });
  req.on("end", async () => {
    buffer += decoder.end();
    ////console.log(buffer, typeof buffer);
    // const bufferJson = JSON.parse(buffer);
    const data = {
      trimmedPath,
      queryString,
      method,
      headers,
      payload: JSON.parse(buffer),
    };
    // //console.log(data);

    try {
      const respon = await choosenHandler(data);
      // //console.log(respon, "respone");
      //   const statusCode =
      //     typeof respon.statusCode == "number" ? respon.statusCode : 200;
      //console.log(respon);
      const payload = typeof respon == "object" ? respon : {};
      const payloadString = JSON.stringify(payload);
      res.setHeader("Content-Type", "application/json");
      //   res.writeHead(statusCode);
      //console.log(typeof payloadString);
      //console.log(respon, "respon");
      res.end(payloadString);
    } catch (err) {
      // //console.log(err, typeof err);
      const payloadString = JSON.stringify(err);
      //console.log(err, "err in the server");
      res.end(payloadString);
    }
  });
});

handlers.sendTwilioSms = function (phone, msg, callback) {
  phone =
    typeof phone == "string" && phone.trim().length == 10
      ? phone.trim()
      : false;
  msg =
    typeof msg == "string" && msg.trim().length > 0 && msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (phone && msg) {
    const payload = {
      From: config.twilio.fromPhone,
      To: "+1" + phone,
      Body: msg,
    };
    const stringPayload = queryString.stringify(payload);

    const requestDetails = {
      protocol: "https:",
      hostname: "api.twilio.com",
      method: "POST",
      path:
        "/2010-04-01/Accouonts/" + config.twilio.accountSid + "/Messages.json",
      auth: config.twilio.accountSid + ":" + config.twilio.authToken,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(stringPayload),
      },
    };

    const req = https.request(requestDetails, function (res) {
      var status = res.statusCode;

      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback("status returned was");
        console.log(res.error);
      }
    });

    req.on("error", function (e) {
      callback(e);
    });
    req.write(stringPayload);
    req.end();
  } else {
  }
};

server.listen(3000, () => {
  //console.log("server is listening");
});

const router = {
  sample: handlers.sample,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks,
};
