const fs = require("fs");
const path = require("path");

const lib = {};

lib.baseDir = path.join(__dirname, "/../.data/");
console.log(__dirname, lib.baseDir);
lib.create = function (dir, file, data) {
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
lib.read = function (dir, file) {
  return new Promise((resolve, reject) => {
    fs.readFile(
      lib.baseDir + dir + "/" + file + ".json",
      "utf-8",
      function (err, data) {
        if (!err && data) {
          // const parsedData = helpers.parseJsonToObject(data);
          console.log(data);
          resolve({ result: false, data });
        } else {
          reject(err, data);
        }
      }
    );
  });
};

lib.delete = function (dir, file) {
  return new Promise((resolve, reject) => {
    fs.unlink(lib.baseDir + dir + "/" + file + ".json", function (err) {
      if (!err) {
        resolve(false);
      } else {
        reject("Error deleting file");
      }
    });
  });
};

const fun = async () => {
  try {
    await lib.delete("test", "newFile");
    console.log(data);
  } catch (err) {
    console.log(err);
  }
};
fun();
