/*
 * handlers req of page by html
 *
 */

//Dependencies

const helpers = require("./helper");
const config = require("./config");

const views = {};

// index view handler
views.index = function (data) {
  return new Promise(async (resolve, reject) => {
    // Reject any request that isn't a GET
    if (data.method == "get") {
      try {
        // Read in a template as a string
        const str = await helpers.getTemplate("index");
        console.log(str, "str");
        resolve({ statusCode: 200, payload: str, contentType: "html" });
      } catch (err) {
        reject({ statusCode: 500, payload: err, contentType: "html" });
      }
      // Return that template as HTML
    } else {
      reject({
        statusCode: 405,
        payload: "there is no data",
        contentType: "html",
      });
    }
  });
};

module.exports = views;
