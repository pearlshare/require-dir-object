# require-dir-object

Turn a directory into an object which requires all files and exports them as an object with keys of file names.

## Usage

Given a dir of node modules:

```
-
 |- index.js
 |- fish.js
 |- other_file.js
 |- other_folder
   |- badger.js
   |- badger_fish.js
```

`require-dir-object` allows this to be exported via the index.js.

index.js
```js
module.exports = require("require-dir-object")(__dirname);
```

Will be equivalent to:

```js
module.exports = {
    fish: require("./fish"),
    otherFile: require("./other_file"),
    otherFolder: {
        badger: require("./other_folder/badger"),
        badgerFish: require("./other_folder/badger_fish")
    }
};
```


## Notes

* The underscored files are camelcased.
* The folder is turned into a sub object.
