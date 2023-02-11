const fs = require("fs");
const path = require("path");
const fsProm = require("fs/promises");
const fsPromises = require("fs.promises");
const helpers = require("./helper");

const lib = {};

lib.baseDir = path.join(__dirname, "/../.data/");
console.log(__dirname, lib.baseDir);

// using file system to store data .... here we use fs/promises

lib.createByPromises = async function (dir, file, data) {
  // new Promise((resolve, reject) => {
  // Open the file for writing

  const fileDescriptor = await fsPromises.open(
    lib.baseDir + dir + "/" + file + ".json",
    "wx"
  );
  const stringData = JSON.stringify(data);

  await fsPromises.writeFile(fileDescriptor, stringData);
  console.log(fileDescriptor, "filed");

  // await fs.close(fileDescriptor);
  // function (err, fileDescriptor) {
  //   console.log(fileDescriptor);
  //   if (!err && fileDescriptor) {
  //     // Convert data to string
  //     // var stringData = JSON.stringify(data);
  //     resolve(fileDescriptor);
  //   }
  //   reject("Could not create new file, it may already exist", err);
  // }

  // .then((fileDescriptor) => {
  //   return new Promise((resolve, reject) => {
  //     const stringData = JSON.stringify(data);

  //     fs.writeFile(fileDescriptor, stringData, function (err) {
  //       console.log(fileDescriptor, "file in !err");
  //       if (!err) {
  //         resolve(fileDescriptor);
  //       } else {
  //         reject("Error writing to new file");
  //       }
  //     });
  //   });
  // })
  // .then((fileDescriptor) => {
  //   return new Promise((resolve, reject) => {
  //     console.log(fileDescriptor, "file in close");
  //     fs.close(fileDescriptor, function (err) {
  //       if (!err) {
  //         resolve("done");
  //       } else {
  //         reject("Error closing new file");
  //       }
  //     });
  //   });
  // });
};
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
          const parsedData = helpers.parseJsonToObject(data);
          //  console.log(parsedData, "parseeeeeeeeeeeeed");
          resolve(parsedData);
        } else {
          console.log(err);
          reject("this file is not found");
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

lib.update = function (dir, file, data) {
  return new Promise((resolve, reject) => {
    fs.open(
      lib.baseDir + dir + "/" + file + ".json",
      "r+",
      function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
          resolve(fileDescriptor);
        } else {
          reject("could not open the file for updating");
        }
      }
    );
  })
    .then((fileDescriptor) => {
      return new Promise((resolve, reject) => {
        fs.ftruncate(fileDescriptor, function (err) {
          if (!err) {
            resolve(fileDescriptor);
          } else {
            reject("Error truncating file ");
          }
        });
      });
    })
    .then((fileDescriptor) => {
      const stringData = JSON.stringify(data);
      return new Promise((resolve, reject) => {
        fs.writeFile(fileDescriptor, stringData, function (err) {
          if (!err) {
            resolve(fileDescriptor);
          } else {
            reject("Error writing to existing file");
          }
        });
      });
    })
    .then((fileDescriptor) => {
      return new Promise((resolve, reject) => {
        fs.close(fileDescriptor, function (err) {
          if (!err) {
            resolve("done");
          } else {
            reject("there was an error closing the file");
          }
        });
      });
    });
};

module.exports = lib;
