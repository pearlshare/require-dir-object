require-dir-object
==================
![circleci](https://circleci.com/gh/pearlshare/require-dir-object.png?style=shield)

Turn a directory into a tree of objects with the required version of each file.

Example
-----

Given a directory of JavaScript files:

```
.
├── fish.js
├── folder_with_index
│   ├── index.js
│   └── other_file.js
├── index.js
├── other_file.js
└── other_folder
    ├── badger.js
    └── badger_fish.js
```

**index.js**
```js
module.exports = require("require-dir-object")(__dirname, {case: "camel"});
```

Would be equivalent to:
```js
module.exports = {
    fish: require("./fish"),
    otherFile: require("./other_file"),
    otherFolder: {
        badger: require("./other_folder/badger"),
        badgerFish: require("./other_folder/badger_fish")
    },
    folderWithIndex: require("./folder_with_index")
};
```


Options
-------
| Name          | Description                      | Type                    | Example                 | Default            |
| -------------:|:-------------------------------- |:-----------------------:|:------------------------|:-------------------|
| _**case**_    | Converts file naming method      | _string_                | `{case: "camel"}`       | `null`             |
| _**depth**_   | Limit sub-directory search depth | _int_                   | `{depth: 3}`            | `Number.MAX_VALUE` |
| _**exclude**_ | Exclude files at a specific path | _string_ **or** _array_ | `{exclude: "fish.js"}`  | `[]`               |
| _**ext**_     | Search for a specific extension  | _string_                | `{ext: ".xml"}`         | `".js"`            |
| _**func**_    | Call a function on found file    | _function_              | `{ext: fs.readFileSync}`| `require`          |

Available case conversions are `camel`, `snake`, `kebab`, `capitalize`.


Notes
-----
* Every folder is turned into a sub-object.
* If a folder has an `index` it will load that in favor of folder contents.


License
-------
MIT
