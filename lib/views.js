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
      var templateData = {
        "head.title": "This is the title",
        "head.description": "This is the meta description",
        "body.title": "Hello templated world!",
        "body.class": "index",
      };
      try {
        // Read in a template as a string
        const str = await helpers.getTemplate("index", templateData);
        console.log(str, "str");
        // Add the universal header and footer
        const finalStr = await helpers.addUniversalTemplates(str, templateData);
        resolve({ statusCode: 200, payload: finalStr, contentType: "html" });
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

// static serving handler

views.public = function (data) {
  return new Promise((resolve, reject) => {});
};

// Favicon
views.favicon = function (data, callback) {
  return new Promise(async (resolve, reject) => {
    // Reject any request that isn't a GET
    if (data.method == "get") {
      try {
        // Read in the favicon's data
        const data = await helpers.getStaticAsset("favicon.ico");

        // Callback the data
        resolve({ statusCode: 200, payload: data, contentType: "favicon" });
      } catch (err) {
        reject({ statusCode: 500 });
      }
    } else {
      reject({ statusCode: 405 });
    }
  });
};

// Public assets
views.public = function (data) {
  console.log(data);
  return new Promise(async (resolve, reject) => {
    // Reject any request that isn't a GET
    if (data.method == "get") {
      // Get the filename being requested
      var trimmedAssetName = data.trimmedPath.replace("public/", "").trim();
      if (trimmedAssetName.length > 0) {
        try {
          // Read in the asset's data
          console.log(trimmedAssetName, "|trimmedAssetName");
          const data = await helpers.getStaticAsset(trimmedAssetName);
          console.log(data, "data.payload");
          // Determine the content type (default to plain text)
          var contentType = "plain";

          if (trimmedAssetName.indexOf(".css") > -1) {
            contentType = "css";
          }

          if (trimmedAssetName.indexOf(".png") > -1) {
            contentType = "png";
          }

          if (trimmedAssetName.indexOf(".jpg") > -1) {
            contentType = "jpg";
          }

          if (trimmedAssetName.indexOf(".ico") > -1) {
            contentType = "favicon";
          }

          // Callback the data
          resolve({ statusCode: 200, payload: data, contentType });
        } catch (err) {
          console.log(err);
        }
      } else {
        reject(404);
      }
    } else {
      reject(405);
    }
  });
};

module.exports = views;
