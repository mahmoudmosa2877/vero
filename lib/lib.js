const { resolve4 } = require("dns");
const fs = require("fs");
const path = require("path");

const lib = {};

lib.baseDir = path.join(__dirname, "/../.data/");
console.log(__dirname, lib.baseDir);
lib.create = function (dir, file, data, callback) {
  // new Promise((resolve, reject) => {
  // Open the file for writing

  return new Promise((resolve, reject) => {
    fs.open(
      lib.baseDir + dir + "/" + file + ".json",
      "wx",
      function (err, fileDescriptor) {
        console.log(fileDescriptor);
        if (!err && fileDescriptor) {
          // Convert data to string
          // var stringData = JSON.stringify(data);
          resolve(fileDescriptor);
        }
        reject("Could not create new file, it may already exist", err);
      }
    );
  })
    .then((fileDescriptor) => {
      return new Promise((resolve, reject) => {
        const stringData = JSON.stringify(data);

        fs.writeFile(fileDescriptor, stringData, function (err) {
          console.log(fileDescriptor, "file in !err");
          if (!err) {
            resolve(fileDescriptor);
          } else {
            reject("Error writing to new file");
          }
        });
      });
    })
    .then((fileDescriptor) => {
      return new Promise((resolve, reject) => {
        console.log(fileDescriptor, "file in close");
        fs.close(fileDescriptor, function (err) {
          if (!err) {
            resolve("done");
          } else {
            reject("Error closing new file");
          }
        });
      });
    });
};

const fun = async () => {
  try {
    const res = await lib.create(
      "test",
      "newFile",
      { foo: "bar" },
      function (err) {
        console.log(err, res);
      }
    );
    console.log(res);
  } catch (err) {
    console.log(err);
  }
};
fun();
