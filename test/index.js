var expect = require("expect.js");
var path = require("path");
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
    it("should return an empty object if the directory is empty", function() {
      var testDir = path.join(__dirname, "test-dir", "empty");
      var contents = reqDir(testDir);

      expect(contents).to.be.an("object");
      expect(Object.keys(contents)).to.have.length(0);
    });

    it("should show the contents of a file within the directory", function() {
      var testDir = path.join(__dirname, "test-dir", "one-file");
      var contents = reqDir(testDir);

      expect(contents).to.be.an("object");
      expect(Object.keys(contents)).to.have.length(1);
      expect(contents.one).to.eql(require(path.join(testDir, "one")));
    });

    it("should support multiple files in a single directory", function() {
      var testDir = path.join(__dirname, "test-dir", "two-files");
      var contents = reqDir(testDir);

      expect(contents).to.be.an("object");
      expect(Object.keys(contents)).to.have.length(2);
      expect(contents.one).to.eql(require(path.join(testDir, "one")));
      expect(contents.two).to.eql(require(path.join(testDir, "two")));
    });

    it("should read a file even when there are directories along side it", function() {
      var testDir = path.join(__dirname, "test-dir");
      var contents = reqDir(testDir);

      expect(contents).to.be.an("object");
      expect(Object.keys(contents)).to.have.length(5);

      expect(contents.empty).to.be.an("object");
      expect(contents["one-file"]).to.be.an("object");
      expect(contents["two-files"]).to.be.an("object");
    });

    it("should convert a file with underscores in the name to use camel case", function() {
      var testDir = path.join(__dirname, "test-dir");
      var contents = reqDir(testDir);

      expect(contents).to.be.an("object");
      expect(contents.fileWithUnderscores).to.eql(require(path.join(testDir, "file_with_underscores")));
    });
  });
});
