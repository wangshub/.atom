(function() {
  var Tags, es;

  Tags = require(process.resourcesPath + '/app.asar.unpacked/node_modules/ctags/build/Release/ctags.node').Tags;

  es = require('event-stream');

  exports.findTags = function(tagsFilePath, tag, options, callback) {
    var caseInsensitive, partialMatch, ref, tagsWrapper;
    if (typeof tagsFilePath !== 'string') {
      throw new TypeError('tagsFilePath must be a string');
    }
    if (typeof tag !== 'string') {
      throw new TypeError('tag must be a string');
    }
    if (typeof options === 'function') {
      callback = options;
      options = null;
    }
    ref = options != null ? options : {}, partialMatch = ref.partialMatch, caseInsensitive = ref.caseInsensitive;
    tagsWrapper = new Tags(tagsFilePath);
    tagsWrapper.findTags(tag, partialMatch, caseInsensitive, function(error, tags) {
      tagsWrapper.end();
      return typeof callback === "function" ? callback(error, tags) : void 0;
    });
    return void 0;
  };

  exports.createReadStream = function(tagsFilePath, options) {
    var chunkSize, tagsWrapper;
    if (options == null) {
      options = {};
    }
    if (typeof tagsFilePath !== 'string') {
      throw new TypeError('tagsFilePath must be a string');
    }
    chunkSize = options.chunkSize;
    if (typeof chunkSize !== 'number') {
      chunkSize = 100;
    }
    tagsWrapper = new Tags(tagsFilePath);
    return es.readable(function(count, callback) {
      if (!tagsWrapper.exists()) {
        return callback(new Error("Tags file could not be opened: " + tagsFilePath));
      }
      return tagsWrapper.getTags(chunkSize, (function(_this) {
        return function(error, tags) {
          if ((error != null) || tags.length === 0) {
            tagsWrapper.end();
          }
          callback(error, tags);
          if ((error != null) || tags.length === 0) {
            return _this.emit('end');
          }
        };
      })(this));
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvYXRvbS1jdGFncy9ub2RlX21vZHVsZXMvY3RhZ3Mvc3JjL2N0YWdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsT0FBUSxPQUFBLENBQVEsT0FBTyxDQUFDLGFBQVIsR0FBd0IsZ0VBQWhDOztFQUNULEVBQUEsR0FBSyxPQUFBLENBQVEsY0FBUjs7RUFFTCxPQUFPLENBQUMsUUFBUixHQUFtQixTQUFDLFlBQUQsRUFBZSxHQUFmLEVBQW9CLE9BQXBCLEVBQTZCLFFBQTdCO0FBQ2pCLFFBQUE7SUFBQSxJQUFPLE9BQU8sWUFBUCxLQUF1QixRQUE5QjtBQUNFLFlBQVUsSUFBQSxTQUFBLENBQVUsK0JBQVYsRUFEWjs7SUFHQSxJQUFPLE9BQU8sR0FBUCxLQUFjLFFBQXJCO0FBQ0UsWUFBVSxJQUFBLFNBQUEsQ0FBVSxzQkFBVixFQURaOztJQUdBLElBQUcsT0FBTyxPQUFQLEtBQWtCLFVBQXJCO01BQ0UsUUFBQSxHQUFXO01BQ1gsT0FBQSxHQUFVLEtBRlo7O0lBSUEsd0JBQWtDLFVBQVUsRUFBNUMsRUFBQywrQkFBRCxFQUFlO0lBRWYsV0FBQSxHQUFrQixJQUFBLElBQUEsQ0FBSyxZQUFMO0lBQ2xCLFdBQVcsQ0FBQyxRQUFaLENBQXFCLEdBQXJCLEVBQTBCLFlBQTFCLEVBQXdDLGVBQXhDLEVBQXlELFNBQUMsS0FBRCxFQUFRLElBQVI7TUFDdkQsV0FBVyxDQUFDLEdBQVosQ0FBQTs4Q0FDQSxTQUFVLE9BQU87SUFGc0MsQ0FBekQ7V0FJQTtFQWxCaUI7O0VBb0JuQixPQUFPLENBQUMsZ0JBQVIsR0FBMkIsU0FBQyxZQUFELEVBQWUsT0FBZjtBQUN6QixRQUFBOztNQUR3QyxVQUFROztJQUNoRCxJQUFPLE9BQU8sWUFBUCxLQUF1QixRQUE5QjtBQUNFLFlBQVUsSUFBQSxTQUFBLENBQVUsK0JBQVYsRUFEWjs7SUFHQyxZQUFhO0lBQ2QsSUFBbUIsT0FBTyxTQUFQLEtBQXNCLFFBQXpDO01BQUEsU0FBQSxHQUFZLElBQVo7O0lBRUEsV0FBQSxHQUFrQixJQUFBLElBQUEsQ0FBSyxZQUFMO1dBQ2xCLEVBQUUsQ0FBQyxRQUFILENBQVksU0FBQyxLQUFELEVBQVEsUUFBUjtNQUNWLElBQUEsQ0FBTyxXQUFXLENBQUMsTUFBWixDQUFBLENBQVA7QUFDRSxlQUFPLFFBQUEsQ0FBYSxJQUFBLEtBQUEsQ0FBTSxpQ0FBQSxHQUFrQyxZQUF4QyxDQUFiLEVBRFQ7O2FBR0EsV0FBVyxDQUFDLE9BQVosQ0FBb0IsU0FBcEIsRUFBK0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQsRUFBUSxJQUFSO1VBQzdCLElBQXFCLGVBQUEsSUFBVSxJQUFJLENBQUMsTUFBTCxLQUFlLENBQTlDO1lBQUEsV0FBVyxDQUFDLEdBQVosQ0FBQSxFQUFBOztVQUNBLFFBQUEsQ0FBUyxLQUFULEVBQWdCLElBQWhCO1VBQ0EsSUFBZ0IsZUFBQSxJQUFVLElBQUksQ0FBQyxNQUFMLEtBQWUsQ0FBekM7bUJBQUEsS0FBQyxDQUFBLElBQUQsQ0FBTSxLQUFOLEVBQUE7O1FBSDZCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQjtJQUpVLENBQVo7RUFSeUI7QUF2QjNCIiwic291cmNlc0NvbnRlbnQiOlsie1RhZ3N9ID0gcmVxdWlyZShwcm9jZXNzLnJlc291cmNlc1BhdGggKyAnL2FwcC5hc2FyLnVucGFja2VkL25vZGVfbW9kdWxlcy9jdGFncy9idWlsZC9SZWxlYXNlL2N0YWdzLm5vZGUnKVxuZXMgPSByZXF1aXJlICdldmVudC1zdHJlYW0nXG5cbmV4cG9ydHMuZmluZFRhZ3MgPSAodGFnc0ZpbGVQYXRoLCB0YWcsIG9wdGlvbnMsIGNhbGxiYWNrKSAtPlxuICB1bmxlc3MgdHlwZW9mIHRhZ3NGaWxlUGF0aCBpcyAnc3RyaW5nJ1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RhZ3NGaWxlUGF0aCBtdXN0IGJlIGEgc3RyaW5nJylcblxuICB1bmxlc3MgdHlwZW9mIHRhZyBpcyAnc3RyaW5nJ1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RhZyBtdXN0IGJlIGEgc3RyaW5nJylcblxuICBpZiB0eXBlb2Ygb3B0aW9ucyBpcyAnZnVuY3Rpb24nXG4gICAgY2FsbGJhY2sgPSBvcHRpb25zXG4gICAgb3B0aW9ucyA9IG51bGxcblxuICB7cGFydGlhbE1hdGNoLCBjYXNlSW5zZW5zaXRpdmV9ID0gb3B0aW9ucyA/IHt9XG5cbiAgdGFnc1dyYXBwZXIgPSBuZXcgVGFncyh0YWdzRmlsZVBhdGgpXG4gIHRhZ3NXcmFwcGVyLmZpbmRUYWdzIHRhZywgcGFydGlhbE1hdGNoLCBjYXNlSW5zZW5zaXRpdmUsIChlcnJvciwgdGFncykgLT5cbiAgICB0YWdzV3JhcHBlci5lbmQoKVxuICAgIGNhbGxiYWNrPyhlcnJvciwgdGFncylcblxuICB1bmRlZmluZWRcblxuZXhwb3J0cy5jcmVhdGVSZWFkU3RyZWFtID0gKHRhZ3NGaWxlUGF0aCwgb3B0aW9ucz17fSkgLT5cbiAgdW5sZXNzIHR5cGVvZiB0YWdzRmlsZVBhdGggaXMgJ3N0cmluZydcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd0YWdzRmlsZVBhdGggbXVzdCBiZSBhIHN0cmluZycpXG5cbiAge2NodW5rU2l6ZX0gPSBvcHRpb25zXG4gIGNodW5rU2l6ZSA9IDEwMCBpZiB0eXBlb2YgY2h1bmtTaXplIGlzbnQgJ251bWJlcidcblxuICB0YWdzV3JhcHBlciA9IG5ldyBUYWdzKHRhZ3NGaWxlUGF0aClcbiAgZXMucmVhZGFibGUgKGNvdW50LCBjYWxsYmFjaykgLT5cbiAgICB1bmxlc3MgdGFnc1dyYXBwZXIuZXhpc3RzKClcbiAgICAgIHJldHVybiBjYWxsYmFjayhuZXcgRXJyb3IoXCJUYWdzIGZpbGUgY291bGQgbm90IGJlIG9wZW5lZDogI3t0YWdzRmlsZVBhdGh9XCIpKVxuXG4gICAgdGFnc1dyYXBwZXIuZ2V0VGFncyBjaHVua1NpemUsIChlcnJvciwgdGFncykgPT5cbiAgICAgIHRhZ3NXcmFwcGVyLmVuZCgpIGlmIGVycm9yPyBvciB0YWdzLmxlbmd0aCBpcyAwXG4gICAgICBjYWxsYmFjayhlcnJvciwgdGFncylcbiAgICAgIEBlbWl0KCdlbmQnKSBpZiBlcnJvcj8gb3IgdGFncy5sZW5ndGggaXMgMFxuIl19
