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
 |- folder_with_index
   |- index.js
   |- other_file.js
```

`require-dir-object` allows this to be exported via the index.js.

index.js
```js
module.exports = require("require-dir-object")(__dirname, {case: "camel"});
```

Will be equivalent to:

```js
module.exports = {
    fish: require("./fish"),
    otherFile: require("./other_file"),
    otherFolder: {
        badger: require("./other_folder/badger"),
        badgerFish: require("./other_folder/badger_fish")
    },
    folder_with_index: "contents of index.js"
};
```


## Notes

* Items can be 
    * 'camelCasedWords' `{case: "camel"}`
    * 'CapitalizedWords' `{case: "capitalized}`
    * 'snake_cased_words' `{case: "nake}`
* Each folder is turned into a sub object.
* If a folder has an `index.js` it will load that in favour of folder contents

