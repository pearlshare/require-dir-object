var fs = require("fs");
var path = require("path");

/**
 * Determine if the path is a directory
 * @param {String} pth  the path of the possible directory
 * @returns {Boolean} whether or not the path given is a directory
 */
function isDir(pth) {
  if (fs.existsSync(pth)) {
    return fs.lstatSync(pth).isDirectory();
  }
}

/**
 * Convert the case of a string to snake, camel, capitalized
 * @param {String} str   the string to convert
 * @param {String} type  the format to convert to
 * @returns {String} the converted string
 */
function convertCase(str, type) {
  switch (type) {
    case "camel":
      return str.replace(/[_-\s]([a-zA-Z1-9])/g, function(g) {
        return g[1].toUpperCase();
      });

    case "snake":
      return str.replace(/[_-\s]([a-zA-Z1-9])/g, function(g) {
        return "_" + g[1].toLowerCase();
      });

    case "kebab":
      return str.replace(/[_-\s]([a-zA-Z1-9])/g, function(g) {
        return "-" + g[1].toLowerCase();
      });

    case "capitalize":
      return str.replace(/^./, function (g) {
        return g.toUpperCase();
      }).replace(/[_-\s]([a-zA-Z1-9])/g, function(g) {
        return g[1].toUpperCase();
      });

    default:
      return str;
  }
}


/**
 * Recurse through a folder structure requiring files and adding them to an object
 * @param {String}   startPath       the filepath to the folder
 * @param {Options}  opts            options to configure the output
 * @param {String}   opts.case       the conversion of object key case
 * @param {Number}   opts.depth      the depth of recursion to go to
 * @param {Array}    opts.exclude    files to be skipped over
 * @param {String}   opts.ext        the extension to find (default: .js)
 * @param {Function} opts.func       the function used on path (default: require)
 * @returns {Object} returns an object with all paths required
 */
module.exports = function requireDirObject(startPath, opts) {
  if (!opts) {
    opts = {};
  }

  if(!opts.hasOwnProperty("depth")) {
    opts.depth = Number.MAX_VALUE;
  } else {
    opts.depth = parseInt(opts.depth, 10);
  }

  if (!opts.exclude) {
    opts.exclude = [];
  }
  else {
    [].concat(opts.exclude);
  }

  opts.ext = opts.ext || ".js";
  if (opts.ext[0] !== ".") {
    opts.ext = "." + opts.ext;
  }

  opts.func = opts.func || require;
  if (typeof opts.func !== "function") {
    throw new Error("'opts.func' should be a function.");
  }

  // Ensure that the given path is actually a directory
  if (!isDir(startPath)) {
    throw new Error("The 'startPath' provided must be a directory.");
  }

  var out = {};

  /**
   * Build an object to represent the directory structure of the given file path
   * @param {String} filePath  the path to reach in the object
   * @returns {Object} returns the 'obj' object with the needed changes
   */
  function addPathToObj(filePath) {

    // Remove the trailing '/'
    filePath = filePath.replace(startPath, "");

    // Get a list of path components to traverse
    var dirs = filePath.split(path.sep).map(function (j) {
      return convertCase(path.basename(j, opts.ext), opts.case);
    });

    // Discard the first empty string caused by splitting the first / of the filepath
    dirs.shift();

    // Start traversal from the top
    var currObj = out;

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
   * Explores the given directory adding all files to the given object
   * @param {String} pth    the file name
   * @param {Number} depth  the recursion depth
   * @returns {Object} returns the 'obj' object with the needed changes
   */
  function explore(pth, depth) {
    var cont = fs.readdirSync(pth); // Contents of directory

    if (depth > opts.depth) {
      return;
    }

    if (depth > 0 && cont.indexOf("index" + opts.ext) >= 0) {

      var pathComponents = pth.split(path.sep);
      var dirName = pathComponents.pop();
      var formatted = convertCase(dirName, opts.case);
      var pathToDir = pathComponents.join(path.sep);

      addPathToObj(pathToDir)[formatted] = require(pth);

    } else {
      cont.forEach(function(item) {

        // Check if this file has been excluded
        for (var i = 0; i < opts.exclude.length; i++) {
          var relPath = path.join(pth.replace(startPath, ""), item);
          if (relPath[0] === "/") {
            relPath = relPath.slice(1, relPath.length);
          }

          if (relPath === opts.exclude[i]) {

            if (i === opts.exclude.length - 1) {
              // If the last object is ignored, initate the path just in case
              addPathToObj(pth);
            }
            return;
          }
        }

        var newPath = path.join(pth, item); // Get the full path

        if (isDir(newPath)) {
          // Explore this new directory
          explore(newPath, depth + 1);

        } else if (item !== "index" + opts.ext) {

          // The current item is not a directory (we can read it)
          var file = item.match(/[^\\]*\.(\w+)$/); // Separate file and extension

          // Check extension to see that it is a JS file
          if (file == null || file[1] !== opts.ext.substring(1)) {
            return;
          }

          // Base name of the file
          var formattedKey = convertCase(path.basename(item, opts.ext), opts.case);

          // Require the JS file add it to the final object
          addPathToObj(pth)[formattedKey] = opts.func(newPath);
        }
      });
    }
  }

  // Start exploring the root directory
  explore(startPath, 0);

  return out;
};
