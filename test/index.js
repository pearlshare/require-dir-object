var expect = require("expect.js");
var path = require("path");
var fs = require("fs");
var reqDir = require("../");

describe("require-dir-object", function() {
  describe("configuration", function() {
    it("should throw an error if non-existent directory is given", function() {
      try {
        reqDir("not-a-dir");
        expect().fail("Error not thrown!");
      }
      catch (err) {
        expect(err).to.be.an(Error);
        expect(err.message).to.match(/directory/);
      }
    });

    it("should throw an error if a file is given instead of a directory", function() {
      try {
        reqDir(path.join(__dirname, "test-dir", "fileWithDir.js"));
        expect().fail("Error not thrown!");
      }
      catch (err) {
        expect(err).to.be.an(Error);
        expect(err.message).to.match(/directory/);
      }
    });

    it("should return an object", function() {
      expect(reqDir(__dirname)).to.be.an("object");
    });
  });

  describe("usage", function() {
    it("should ignore the index.js in the root directory", function() {
      var testDir = path.join(__dirname, "test-dir");
      var contents = reqDir(testDir);

      expect(contents).to.be.an("object");
      expect(Object.keys(contents)).to.have.length(5);
    });

    describe("depth", function () {
      it("should limit the recursion depth to 0", function() {
        var testDir = path.join(__dirname, "test-dir");
        var contents = reqDir(testDir, {depth: 0});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(2);
        expect(contents["two-files"]).to.be(undefined);
      });
      it("should limit the recursion depth to 1", function() {
        var testDir = path.join(__dirname, "test-dir");
        var contents = reqDir(testDir, {depth: 1});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(5);
        expect(contents["two-files"]).to.be.a("object");
      });
    });

    describe("func", function() {
      it("should throw an error if not a function", function() {
        var testDir = path.join(__dirname, "test-dir", "two-files");

        try {
          reqDir(testDir, {func: "THIS ISIN'T A FUNCTION"});
        } catch (err) {
          expect(err);
          expect(err.message).to.match(/func/);
          return;
        }

        expect().fail("No error was thrown");
      });

      it("should call a custom function on files", function() {
        var testDir = path.join(__dirname, "test-dir", "two-files");
        var contents = reqDir(testDir, {func: function(pth) {
          return fs.readFileSync(pth).toString();
        }});

        expect(contents.one).to.be.a("string");
      });
    });

    describe("ext", function() {
      it("should default to .js", function() {
        var testDir = path.join(__dirname, "test-dir", "non_js");
        var contents = reqDir(testDir);

        expect(Object.keys(contents).length).to.eql(0);
      });

      it("should read files of a different extension", function() {
        var testDir = path.join(__dirname, "test-dir", "non_js");
        var contents = reqDir(testDir, {
          ext: ".txt",
          func: function(pth) {
            return fs.readFileSync(pth).toString();
          }
        });

        expect(Object.keys(contents).length).to.eql(2);
        expect(contents.someFile).to.be.a("string");
        expect(contents.anotherFile).to.be.a("string");
      });
    });

    describe("camelCase", function () {
      it("should return an empty object if the directory is empty", function() {
        var testDir = path.join(__dirname, "test-dir", "empty");
        var contents = reqDir(testDir, {case: "camel"});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(0);
      });

      it("should show the contents of a file within the directory", function() {
        var testDir = path.join(__dirname, "test-dir", "one-file");
        var contents = reqDir(testDir, {case: "camel"});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(1);
        expect(contents.one).to.eql(require(path.join(testDir, "one")));
      });

      it("should support multiple files in a single directory", function() {
        var testDir = path.join(__dirname, "test-dir", "two-files");
        var contents = reqDir(testDir, {case: "camel"});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(2);
        expect(contents.one).to.eql(require(path.join(testDir, "one")));
        expect(contents.two).to.eql(require(path.join(testDir, "two")));
      });

      it("should read a file even when there are directories along side it", function() {
        var testDir = path.join(__dirname, "test-dir");
        var contents = reqDir(testDir, {case: "camel"});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(5);

        expect(contents.empty).to.be(undefined);
        expect(contents["oneFile"]).to.be.an("object");
        expect(contents["twoFiles"]).to.be.an("object");
      });

      it("should convert a file with underscores in the name to use camel case", function() {
        var testDir = path.join(__dirname, "test-dir");
        var contents = reqDir(testDir, {case: "camel"});

        expect(contents).to.be.an("object");
        expect(contents.fileWithUnderscores).to.eql(require(path.join(testDir, "file_with_underscores")));
      });

      it("should use the index from a directory with an index file", function() {
        var testDir = path.join(__dirname, "test-dir");
        var contents = reqDir(testDir, {case: "camel"});

        expect(contents).to.be.an("object");
        expect(contents.withIndex).to.eql(require(path.join(testDir, "with_index")));
      });
    });

    describe("snake_case", function () {
      it("should return an empty object if the directory is empty", function() {
        var testDir = path.join(__dirname, "test-dir", "empty");
        var contents = reqDir(testDir, {case: "snake"});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(0);
      });

      it("should show the contents of a file within the directory", function() {
        var testDir = path.join(__dirname, "test-dir", "one-file");
        var contents = reqDir(testDir, {case: "snake"});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(1);
        expect(contents.one).to.eql(require(path.join(testDir, "one")));
      });

      it("should support multiple files in a single directory", function() {
        var testDir = path.join(__dirname, "test-dir", "two-files");
        var contents = reqDir(testDir, {case: "snake"});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(2);
        expect(contents.one).to.eql(require(path.join(testDir, "one")));
        expect(contents.two).to.eql(require(path.join(testDir, "two")));
      });

      it("should read a file even when there are directories along side it", function() {
        var testDir = path.join(__dirname, "test-dir");
        var contents = reqDir(testDir, {case: "snake"});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(5);

        expect(contents.empty).to.be(undefined);
        expect(contents["one_file"]).to.be.an("object");
        expect(contents["two_files"]).to.be.an("object");
      });

      it("should convert a file with underscores in the name to use snake case", function() {
        var testDir = path.join(__dirname, "test-dir");
        var contents = reqDir(testDir, {case: "snake"});

        expect(contents).to.be.an("object");
        expect(contents.file_with_underscores).to.eql(require(path.join(testDir, "file_with_underscores")));
      });

      it("should use the index from a directory with an index file", function() {
        var testDir = path.join(__dirname, "test-dir");
        var contents = reqDir(testDir, {case: "snake"});

        expect(contents).to.be.an("object");
        expect(contents.with_index).to.eql(require(path.join(testDir, "with_index")));
      });
    });

    describe("kebab_case", function () {
      it("should return an empty object if the directory is empty", function() {
        var testDir = path.join(__dirname, "test-dir", "empty");
        var contents = reqDir(testDir, {case: "kebab"});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(0);
      });

      it("should show the contents of a file within the directory", function() {
        var testDir = path.join(__dirname, "test-dir", "one-file");
        var contents = reqDir(testDir, {case: "kebab"});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(1);
        expect(contents.one).to.eql(require(path.join(testDir, "one")));
      });

      it("should support multiple files in a single directory", function() {
        var testDir = path.join(__dirname, "test-dir", "two-files");
        var contents = reqDir(testDir, {case: "kebab"});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(2);
        expect(contents.one).to.eql(require(path.join(testDir, "one")));
        expect(contents.two).to.eql(require(path.join(testDir, "two")));
      });

      it("should read a file even when there are directories along side it", function() {
        var testDir = path.join(__dirname, "test-dir");
        var contents = reqDir(testDir, {case: "kebab"});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(5);

        expect(contents.empty).to.be(undefined);
        expect(contents["one-file"]).to.be.an("object");
        expect(contents["two-files"]).to.be.an("object");
      });

      it("should convert a file with underscores in the name to use kebab case", function() {
        var testDir = path.join(__dirname, "test-dir");
        var contents = reqDir(testDir, {case: "kebab"});

        expect(contents).to.be.an("object");
        expect(contents["file-with-underscores"]).to.eql(require(path.join(testDir, "file_with_underscores")));
      });

      it("should use the index from a directory with an index file", function() {
        var testDir = path.join(__dirname, "test-dir");
        var contents = reqDir(testDir, {case: "kebab"});

        expect(contents).to.be.an("object");
        expect(contents["with-index"]).to.eql(require(path.join(testDir, "with_index")));
      });
    });

    describe("capitalize", function () {
      it("should return an empty object if the directory is empty", function() {
        var testDir = path.join(__dirname, "test-dir", "empty");
        var contents = reqDir(testDir, {case: "capitalize"});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(0);
      });

      it("should show the contents of a file within the directory", function() {
        var testDir = path.join(__dirname, "test-dir", "one-file");
        var contents = reqDir(testDir, {case: "capitalize"});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(1);
        expect(contents["One"]).to.eql(require(path.join(testDir, "one")));
      });

      it("should support multiple files in a single directory", function() {
        var testDir = path.join(__dirname, "test-dir", "two-files");
        var contents = reqDir(testDir, {case: "capitalize"});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(2);
        expect(contents["One"]).to.eql(require(path.join(testDir, "one")));
        expect(contents["Two"]).to.eql(require(path.join(testDir, "two")));
      });

      it("should read a file even when there are directories along side it", function() {
        var testDir = path.join(__dirname, "test-dir");
        var contents = reqDir(testDir, {case: "capitalize"});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(5);

        expect(contents.empty).to.be(undefined);
        expect(contents["OneFile"]).to.be.an("object");
        expect(contents["TwoFiles"]).to.be.an("object");
      });

      it("should convert a file with underscores in the name to use capitalize", function() {
        var testDir = path.join(__dirname, "test-dir");
        var contents = reqDir(testDir, {case: "capitalize"});

        expect(contents).to.be.an("object");
        expect(contents["FileWithUnderscores"]).to.eql(require(path.join(testDir, "file_with_underscores")));
      });

      it("should use the index from a directory with an index file", function() {
        var testDir = path.join(__dirname, "test-dir");
        var contents = reqDir(testDir, {case: "capitalize"});

        expect(contents).to.be.an("object");
        expect(contents["WithIndex"]).to.eql(require(path.join(testDir, "with_index")));
      });
    });

    describe("exclude", function() {
      it("should return an empty object if the directory is empty", function() {
        var testDir = path.join(__dirname, "test-dir", "empty");
        var contents = reqDir(testDir, {exclude: ["one.js"]});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(0);
      });

      it("should skip over the file if it was specified in 'exclude'", function() {
        var testDir = path.join(__dirname, "test-dir", "one-file");
        var contents = reqDir(testDir, {exclude: ["one.js"]});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(0);
      });

      it("should skip over only the file to exclude, leaving all other files", function() {
        var testDir = path.join(__dirname, "test-dir", "two-files");
        var contents = reqDir(testDir, {exclude: ["one.js"]});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(1);
        expect(contents["one"]).to.eql(undefined);
        expect(contents["two"]).to.eql(require(path.join(testDir, "two")));
      });

      it("should skip over files even with other directories alongside it", function() {
        var testDir = path.join(__dirname, "test-dir");
        var contents = reqDir(testDir, {exclude: ["fileWithDir.js"]});

        expect(contents).to.be.an("object");
        expect(Object.keys(contents)).to.have.length(4);
      });

      it("should skip over file even when within a sub-directory", function() {
        var testDir = path.join(__dirname, "test-dir");
        var contents = reqDir(testDir, {exclude: ["one-file/one.js"]});

        expect(contents).to.be.an("object");
        expect(contents["one-file"].one).to.eql(undefined);
      });
    });
  });
});
