var fs = require("fs");
var path = require("path");

module.exports = function(startPath) {
  var out = {};

  /**
   Removes the extension from a file, leaving only the base name.
   * @param {String} fileName  the file name
   * @returns {String} the base file name
   */
  function base(fileName) {
    return fileName.replace(/\.[^/.]+$/, "");
  }

  /**
    Explores the given directory adding all files to the given object
   * @param {Object} obj  the object to be looked into
   * @param {String} pth  the path to reach in the object
   * @returns {Object} returns the 'obj' object with the needed changes
   */
  function atPath(obj, pth) {

    // Remove the begginging of the absolute path
    var dirs = pth.split(startPath)[1];

    // TODO: Add windows support
    // Remove the trailing '/'
    dirs = dirs.slice(1, dirs.length).split(path.sep);
    var currObj = obj;

    // Ignore goint deeper if this is the root
    if (dirs[0].length === 0) {
      return currObj;
    }

    // Go down to the corrisponding directory in the final object
    for (var i = 0; i < dirs.length; i++) {
      if (currObj[dirs[i]] === undefined) {
        currObj[dirs[i]] = {};
      }
      currObj = currObj[dirs[i]];
    }

    return currObj;
  }

  /**
    Provides a simple function to determine if the path given is a directory
   * @param {String} pth  the path of the possible directory
   * @returns {Boolean} wether or not the path given is a directory
   */
  function isDir(pth) {
    return fs.lstatSync(pth).isDirectory();
  }

  /**
    Explores the given directory adding all files to the given object
   * @param {Object} obj  the object that all the current information will be added to
   * @param {String} pth  the file name
   * @returns {Object} returns the 'obj' object with the needed changes
   */
  function explore(obj, pth) {
    var currPath = pth;
    var cont = fs.readdirSync(currPath); // Contents of directory

    if (cont.length === 0) { // Handle empty directories
      atPath(obj, pth); // Setup empty object
    }

    for (var i = 0; i < cont.length; i++) {
      var newPath = path.join(pth, cont[i]); // Get the full path
      if (isDir(newPath)) {

        // Explore this new directory
        explore(out, newPath);
      }
      else {
        // The current item is not a directory (we can read it)

        var file = cont[i].match(/[^\\]*\.(\w+)$/); // Seperate file and extension

        // Check extension to see that it is a JS file
        if (file == null || file[1] !== "js") {
          continue;
        }

        var b = base(cont[i]); // Base name of the file

        // Require the JS file add it to the final object
        atPath(obj, pth)[b] = require(path.join(pth, b));
      }
    }
  }

  // Ensure that the given path is actaully a directory
  if (!isDir(startPath)) {
    throw new Error("The 'path' provided must be a directory.");
  }

  // Start exploring the root directory
  explore(out, startPath);

  return out;
};
