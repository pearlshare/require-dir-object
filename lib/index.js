var fs = require("fs");
var path = require("path");

/**
 * Build an object to represent the directory structure of the given file path
 * @param {Object} obj  the object to be looked into
 * @param {String} pth  the path to reach in the object
 * @param {String} start  the original starting path
 * @returns {Object} returns the 'obj' object with the needed changes
 */
function addPathToObj(obj, pth, start) {

  // Remove the begging of the absolute path
  var dirs = pth.split(start)[1];

  // TODO: Add windows support
  // Remove the trailing '/'
  dirs = dirs.slice(1, dirs.length).split(path.sep);
  var currObj = obj;

  // Ignore goint deeper if this is the root
  if (dirs[0].length === 0) {
    return currObj;
  }

  // Go down to the corresponding directory in the final object
  for (var i = 0; i < dirs.length; i++) {
    if (currObj[dirs[i]] === undefined) {
      currObj[dirs[i]] = {};
    }
    currObj = currObj[dirs[i]];
  }

  return currObj;
}

/**
 * Determine if the path is a directory
 * @param {String} pth  the path of the possible directory
 * @returns {Boolean} whether or not the path given is a directory
 */
function isDir(pth) {
  return fs.lstatSync(pth).isDirectory();
}

/**
 * Explores the given directory adding all files to the given object
 * @param {Object} obj    the object that all the current information will be added to
 * @param {String} pth    the file name
 * @param {String} start  the original starting path
 * @returns {Object} returns the 'obj' object with the needed changes
 */
function explore(obj, pth, start) {
  var currPath = pth;
  var cont = fs.readdirSync(currPath); // Contents of directory

  if (cont.length === 0) { // Handle empty directories
    addPathToObj(obj, pth, start); // Setup empty object
  }

  cont.forEach(function(item) {
    var newPath = path.join(pth, item); // Get the full path
    if (isDir(newPath)) {

      // Explore this new directory
      explore(obj, newPath, start);
    }
    else {
      // The current item is not a directory (we can read it)

      var file = item.match(/[^\\]*\.(\w+)$/); // Separate file and extension

      // Check extension to see that it is a JS file
      if (file == null || file[1] !== "js") {
        return;
      }

      var b = path.basename(item, ".js"); // Base name of the file

      var camel = b.replace(/_([a-zA-Z1-9])/g, function(g) {
        return g[1].toUpperCase();
      });

      // Require the JS file add it to the final object
      addPathToObj(obj, pth, start)[camel] = require(path.join(pth, b));
    }
  });
}

module.exports = function requireDirObject(startPath) {
  var out = {};

  // Ensure that the given path is actually a directory
  if (!isDir(startPath)) {
    throw new Error("The 'path' provided must be a directory.");
  }

  // Start exploring the root directory
  explore(out, startPath, startPath);

  return out;
};
