(function() {
  var TagGenerator, ctags, fs, getTagsFile, matchOpt, path;

  TagGenerator = require('./tag-generator');

  ctags = require('ctags');

  fs = require("fs");

  path = require("path");

  getTagsFile = function(directoryPath) {
    var tagsFile;
    tagsFile = path.join(directoryPath, ".tags");
    if (fs.existsSync(tagsFile)) {
      return tagsFile;
    }
  };

  matchOpt = {
    matchBase: true
  };

  module.exports = {
    activate: function() {
      this.cachedTags = {};
      return this.extraTags = {};
    },
    deactivate: function() {
      return this.cachedTags = null;
    },
    initTags: function(paths, auto) {
      var i, len, p, results, tagsFile;
      if (paths.length === 0) {
        return;
      }
      this.cachedTags = {};
      results = [];
      for (i = 0, len = paths.length; i < len; i++) {
        p = paths[i];
        tagsFile = getTagsFile(p);
        if (tagsFile) {
          results.push(this.readTags(tagsFile, this.cachedTags));
        } else {
          if (auto) {
            results.push(this.generateTags(p));
          } else {
            results.push(void 0);
          }
        }
      }
      return results;
    },
    initExtraTags: function(paths) {
      var i, len, p, results;
      this.extraTags = {};
      results = [];
      for (i = 0, len = paths.length; i < len; i++) {
        p = paths[i];
        p = p.trim();
        if (!p) {
          continue;
        }
        results.push(this.readTags(p, this.extraTags));
      }
      return results;
    },
    readTags: function(p, container, callback) {
      var startTime, stream;
      console.log("[atom-ctags:readTags] " + p + " start...");
      startTime = Date.now();
      stream = ctags.createReadStream(p);
      stream.on('error', function(error) {
        return console.error('atom-ctags: ', error);
      });
      stream.on('data', function(tags) {
        var data, i, len, results, tag;
        results = [];
        for (i = 0, len = tags.length; i < len; i++) {
          tag = tags[i];
          if (!tag.pattern) {
            continue;
          }
          data = container[tag.file];
          if (!data) {
            data = [];
            container[tag.file] = data;
          }
          results.push(data.push(tag));
        }
        return results;
      });
      return stream.on('end', function() {
        console.log("[atom-ctags:readTags] " + p + " cost: " + (Date.now() - startTime) + "ms");
        return typeof callback === "function" ? callback() : void 0;
      });
    },
    findTags: function(prefix, options) {
      var tags;
      tags = [];
      if (this.findOf(this.cachedTags, tags, prefix, options)) {
        return tags;
      }
      if (this.findOf(this.extraTags, tags, prefix, options)) {
        return tags;
      }
      if (tags.length === 0) {
        console.warn("[atom-ctags:findTags] tags empty, did you RebuildTags or set extraTagFiles?");
      }
      return tags;
    },
    findOf: function(source, tags, prefix, options) {
      var i, key, len, tag, value;
      for (key in source) {
        value = source[key];
        for (i = 0, len = value.length; i < len; i++) {
          tag = value[i];
          if ((options != null ? options.partialMatch : void 0) && tag.name.indexOf(prefix) === 0) {
            tags.push(tag);
          } else if (tag.name === prefix) {
            tags.push(tag);
          }
          if ((options != null ? options.maxItems : void 0) && tags.length === options.maxItems) {
            return true;
          }
        }
      }
      return false;
    },
    generateTags: function(p, isAppend, callback) {
      var cmdArgs, startTime;
      delete this.cachedTags[p];
      startTime = Date.now();
      console.log("[atom-ctags:rebuild] start @" + p + "@ tags...");
      cmdArgs = atom.config.get("atom-ctags.cmdArgs");
      if (cmdArgs) {
        cmdArgs = cmdArgs.split(" ");
      }
      return TagGenerator(p, isAppend, this.cmdArgs || cmdArgs, (function(_this) {
        return function(tagpath) {
          console.log("[atom-ctags:rebuild] command done @" + p + "@ tags. cost: " + (Date.now() - startTime) + "ms");
          startTime = Date.now();
          return _this.readTags(tagpath, _this.cachedTags, callback);
        };
      })(this));
    },
    getOrCreateTags: function(filePath, callback) {
      var tags;
      tags = this.cachedTags[filePath];
      if (tags) {
        return typeof callback === "function" ? callback(tags) : void 0;
      }
      return this.generateTags(filePath, true, (function(_this) {
        return function() {
          tags = _this.cachedTags[filePath];
          return typeof callback === "function" ? callback(tags) : void 0;
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvYXRvbS1jdGFncy9saWIvY3RhZ3MtY2FjaGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQTs7RUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNmLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUjs7RUFDUixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLFdBQUEsR0FBYyxTQUFDLGFBQUQ7QUFDWixRQUFBO0lBQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxJQUFMLENBQVUsYUFBVixFQUF5QixPQUF6QjtJQUNYLElBQW1CLEVBQUUsQ0FBQyxVQUFILENBQWMsUUFBZCxDQUFuQjtBQUFBLGFBQU8sU0FBUDs7RUFGWTs7RUFJZCxRQUFBLEdBQVc7SUFBQyxTQUFBLEVBQVcsSUFBWjs7O0VBQ1gsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxTQUFBO01BQ1IsSUFBQyxDQUFBLFVBQUQsR0FBYzthQUNkLElBQUMsQ0FBQSxTQUFELEdBQWE7SUFGTCxDQUFWO0lBSUEsVUFBQSxFQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsVUFBRCxHQUFjO0lBREosQ0FKWjtJQU9BLFFBQUEsRUFBVSxTQUFDLEtBQUQsRUFBUSxJQUFSO0FBQ1IsVUFBQTtNQUFBLElBQVUsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBMUI7QUFBQSxlQUFBOztNQUNBLElBQUMsQ0FBQSxVQUFELEdBQWM7QUFDZDtXQUFBLHVDQUFBOztRQUNFLFFBQUEsR0FBVyxXQUFBLENBQVksQ0FBWjtRQUNYLElBQUcsUUFBSDt1QkFDRSxJQUFDLENBQUEsUUFBRCxDQUFVLFFBQVYsRUFBb0IsSUFBQyxDQUFBLFVBQXJCLEdBREY7U0FBQSxNQUFBO1VBR0UsSUFBb0IsSUFBcEI7eUJBQUEsSUFB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SUFBQSxHQUFPLEtBQUMsQ0FBQSxVQUFXLENBQUEsUUFBQTtrREFDbkIsU0FBVTtRQUZrQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUI7SUFKZSxDQWhGakI7O0FBWEYiLCJzb3VyY2VzQ29udGVudCI6WyJcblRhZ0dlbmVyYXRvciA9IHJlcXVpcmUgJy4vdGFnLWdlbmVyYXRvcidcbmN0YWdzID0gcmVxdWlyZSAnY3RhZ3MnXG5mcyA9IHJlcXVpcmUgXCJmc1wiXG5wYXRoID0gcmVxdWlyZSBcInBhdGhcIlxuXG5nZXRUYWdzRmlsZSA9IChkaXJlY3RvcnlQYXRoKSAtPlxuICB0YWdzRmlsZSA9IHBhdGguam9pbihkaXJlY3RvcnlQYXRoLCBcIi50YWdzXCIpXG4gIHJldHVybiB0YWdzRmlsZSBpZiBmcy5leGlzdHNTeW5jKHRhZ3NGaWxlKVxuXG5tYXRjaE9wdCA9IHttYXRjaEJhc2U6IHRydWV9XG5tb2R1bGUuZXhwb3J0cyA9XG4gIGFjdGl2YXRlOiAoKSAtPlxuICAgIEBjYWNoZWRUYWdzID0ge31cbiAgICBAZXh0cmFUYWdzID0ge31cblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBjYWNoZWRUYWdzID0gbnVsbFxuXG4gIGluaXRUYWdzOiAocGF0aHMsIGF1dG8pLT5cbiAgICByZXR1cm4gaWYgcGF0aHMubGVuZ3RoID09IDBcbiAgICBAY2FjaGVkVGFncyA9IHt9XG4gICAgZm9yIHAgaW4gcGF0aHNcbiAgICAgIHRhZ3NGaWxlID0gZ2V0VGFnc0ZpbGUocClcbiAgICAgIGlmIHRhZ3NGaWxlXG4gICAgICAgIEByZWFkVGFncyh0YWdzRmlsZSwgQGNhY2hlZFRhZ3MpXG4gICAgICBlbHNlXG4gICAgICAgIEBnZW5lcmF0ZVRhZ3MocCkgaWYgYXV0b1xuXG4gIGluaXRFeHRyYVRhZ3M6IChwYXRocykgLT5cbiAgICBAZXh0cmFUYWdzID0ge31cbiAgICBmb3IgcCBpbiBwYXRoc1xuICAgICAgcCA9IHAudHJpbSgpXG4gICAgICBjb250aW51ZSB1bmxlc3MgcFxuICAgICAgQHJlYWRUYWdzKHAsIEBleHRyYVRhZ3MpXG5cbiAgcmVhZFRhZ3M6IChwLCBjb250YWluZXIsIGNhbGxiYWNrKSAtPlxuICAgIGNvbnNvbGUubG9nIFwiW2F0b20tY3RhZ3M6cmVhZFRhZ3NdICN7cH0gc3RhcnQuLi5cIlxuICAgIHN0YXJ0VGltZSA9IERhdGUubm93KClcblxuICAgIHN0cmVhbSA9IGN0YWdzLmNyZWF0ZVJlYWRTdHJlYW0ocClcblxuICAgIHN0cmVhbS5vbiAnZXJyb3InLCAoZXJyb3IpLT5cbiAgICAgIGNvbnNvbGUuZXJyb3IgJ2F0b20tY3RhZ3M6ICcsIGVycm9yXG5cbiAgICBzdHJlYW0ub24gJ2RhdGEnLCAodGFncyktPlxuICAgICAgZm9yIHRhZyBpbiB0YWdzXG4gICAgICAgIGNvbnRpbnVlIHVubGVzcyB0YWcucGF0dGVyblxuICAgICAgICBkYXRhID0gY29udGFpbmVyW3RhZy5maWxlXVxuICAgICAgICBpZiBub3QgZGF0YVxuICAgICAgICAgIGRhdGEgPSBbXVxuICAgICAgICAgIGNvbnRhaW5lclt0YWcuZmlsZV0gPSBkYXRhXG4gICAgICAgIGRhdGEucHVzaCB0YWdcbiAgICBzdHJlYW0ub24gJ2VuZCcsICgpLT5cbiAgICAgIGNvbnNvbGUubG9nIFwiW2F0b20tY3RhZ3M6cmVhZFRhZ3NdICN7cH0gY29zdDogI3tEYXRlLm5vdygpIC0gc3RhcnRUaW1lfW1zXCJcbiAgICAgIGNhbGxiYWNrPygpXG5cbiAgI29wdGlvbnMgPSB7IHBhcnRpYWxNYXRjaDogdHJ1ZSwgbWF4SXRlbXMgfVxuICBmaW5kVGFnczogKHByZWZpeCwgb3B0aW9ucykgLT5cbiAgICB0YWdzID0gW11cbiAgICByZXR1cm4gdGFncyBpZiBAZmluZE9mKEBjYWNoZWRUYWdzLCB0YWdzLCBwcmVmaXgsIG9wdGlvbnMpXG4gICAgcmV0dXJuIHRhZ3MgaWYgQGZpbmRPZihAZXh0cmFUYWdzLCB0YWdzLCBwcmVmaXgsIG9wdGlvbnMpXG5cbiAgICAjVE9ETzogcHJvbXB0IGluIGVkaXRvclxuICAgIGNvbnNvbGUud2FybihcIlthdG9tLWN0YWdzOmZpbmRUYWdzXSB0YWdzIGVtcHR5LCBkaWQgeW91IFJlYnVpbGRUYWdzIG9yIHNldCBleHRyYVRhZ0ZpbGVzP1wiKSBpZiB0YWdzLmxlbmd0aCA9PSAwXG4gICAgcmV0dXJuIHRhZ3NcblxuICBmaW5kT2Y6IChzb3VyY2UsIHRhZ3MsIHByZWZpeCwgb3B0aW9ucyktPlxuICAgIGZvciBrZXksIHZhbHVlIG9mIHNvdXJjZVxuICAgICAgZm9yIHRhZyBpbiB2YWx1ZVxuICAgICAgICBpZiBvcHRpb25zPy5wYXJ0aWFsTWF0Y2ggYW5kIHRhZy5uYW1lLmluZGV4T2YocHJlZml4KSA9PSAwXG4gICAgICAgICAgICB0YWdzLnB1c2ggdGFnXG4gICAgICAgIGVsc2UgaWYgdGFnLm5hbWUgPT0gcHJlZml4XG4gICAgICAgICAgdGFncy5wdXNoIHRhZ1xuICAgICAgICByZXR1cm4gdHJ1ZSBpZiBvcHRpb25zPy5tYXhJdGVtcyBhbmQgdGFncy5sZW5ndGggPT0gb3B0aW9ucy5tYXhJdGVtc1xuICAgIHJldHVybiBmYWxzZVxuXG4gIGdlbmVyYXRlVGFnczoocCwgaXNBcHBlbmQsIGNhbGxiYWNrKSAtPlxuICAgIGRlbGV0ZSBAY2FjaGVkVGFnc1twXVxuXG4gICAgc3RhcnRUaW1lID0gRGF0ZS5ub3coKVxuICAgIGNvbnNvbGUubG9nIFwiW2F0b20tY3RhZ3M6cmVidWlsZF0gc3RhcnQgQCN7cH1AIHRhZ3MuLi5cIlxuXG4gICAgY21kQXJncyA9IGF0b20uY29uZmlnLmdldChcImF0b20tY3RhZ3MuY21kQXJnc1wiKVxuICAgIGNtZEFyZ3MgPSBjbWRBcmdzLnNwbGl0KFwiIFwiKSBpZiBjbWRBcmdzXG5cbiAgICBUYWdHZW5lcmF0b3IgcCwgaXNBcHBlbmQsIEBjbWRBcmdzIHx8IGNtZEFyZ3MsICh0YWdwYXRoKSA9PlxuICAgICAgY29uc29sZS5sb2cgXCJbYXRvbS1jdGFnczpyZWJ1aWxkXSBjb21tYW5kIGRvbmUgQCN7cH1AIHRhZ3MuIGNvc3Q6ICN7RGF0ZS5ub3coKSAtIHN0YXJ0VGltZX1tc1wiXG5cbiAgICAgIHN0YXJ0VGltZSA9IERhdGUubm93KClcbiAgICAgIEByZWFkVGFncyh0YWdwYXRoLCBAY2FjaGVkVGFncywgY2FsbGJhY2spXG5cbiAgZ2V0T3JDcmVhdGVUYWdzOiAoZmlsZVBhdGgsIGNhbGxiYWNrKSAtPlxuICAgIHRhZ3MgPSBAY2FjaGVkVGFnc1tmaWxlUGF0aF1cbiAgICByZXR1cm4gY2FsbGJhY2s/KHRhZ3MpIGlmIHRhZ3NcblxuICAgIEBnZW5lcmF0ZVRhZ3MgZmlsZVBhdGgsIHRydWUsID0+XG4gICAgICB0YWdzID0gQGNhY2hlZFRhZ3NbZmlsZVBhdGhdXG4gICAgICBjYWxsYmFjaz8odGFncylcbiJdfQ==
