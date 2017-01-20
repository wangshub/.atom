(function() {
  var fs, isFileAsync, path;

  path = require('path');

  fs = require('fs');

  isFileAsync = function(filePath) {
    return new Promise(function(resolve, reject) {
      return fs.stat(filePath, function(err, stats) {
        if (err) {
          return resolve(false);
        } else {
          return resolve(stats.isFile());
        }
      });
    });
  };

  module.exports = function(directoryPath) {
    if (directoryPath == null) {
      return Promise.reject();
    }
    return new Promise(function(resolve) {
      var filePaths, promises;
      filePaths = ['tags', 'TAGS', '.tags', '.TAGS', '.git/tags', '.git/TAGS'].map(function(fileName) {
        return path.join(directoryPath, fileName);
      });
      promises = filePaths.map(function(filePath) {
        return isFileAsync(filePath);
      });
      return Promise.all(promises).then(function(results) {
        var i, idx, len, result;
        for (idx = i = 0, len = results.length; i < len; idx = ++i) {
          result = results[idx];
          if (result) {
            return resolve(filePaths[idx]);
          }
        }
        return resolve(false);
      });
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWN0YWdzL2xpYi9nZXQtdGFncy1maWxlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFFTCxXQUFBLEdBQWMsU0FBQyxRQUFEO1dBQ1IsSUFBQSxPQUFBLENBQVEsU0FBQyxPQUFELEVBQVUsTUFBVjthQUNWLEVBQUUsQ0FBQyxJQUFILENBQVEsUUFBUixFQUFrQixTQUFDLEdBQUQsRUFBTSxLQUFOO1FBQ2hCLElBQUcsR0FBSDtpQkFDRSxPQUFBLENBQVEsS0FBUixFQURGO1NBQUEsTUFBQTtpQkFHRSxPQUFBLENBQVEsS0FBSyxDQUFDLE1BQU4sQ0FBQSxDQUFSLEVBSEY7O01BRGdCLENBQWxCO0lBRFUsQ0FBUjtFQURROztFQVVkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsYUFBRDtJQUNmLElBQStCLHFCQUEvQjtBQUFBLGFBQU8sT0FBTyxDQUFDLE1BQVIsQ0FBQSxFQUFQOztXQUVJLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRDtBQUNWLFVBQUE7TUFBQSxTQUFBLEdBQVksQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixPQUFqQixFQUEwQixPQUExQixFQUFtQyxXQUFuQyxFQUFnRCxXQUFoRCxDQUE0RCxDQUFDLEdBQTdELENBQWlFLFNBQUMsUUFBRDtlQUMzRSxJQUFJLENBQUMsSUFBTCxDQUFVLGFBQVYsRUFBeUIsUUFBekI7TUFEMkUsQ0FBakU7TUFHWixRQUFBLEdBQVcsU0FBUyxDQUFDLEdBQVYsQ0FBYyxTQUFDLFFBQUQ7ZUFDdkIsV0FBQSxDQUFZLFFBQVo7TUFEdUIsQ0FBZDthQUlYLE9BQU8sQ0FBQyxHQUFSLENBQVksUUFBWixDQUFxQixDQUFDLElBQXRCLENBQTJCLFNBQUMsT0FBRDtBQUN6QixZQUFBO0FBQUEsYUFBQSxxREFBQTs7VUFDRSxJQUFrQyxNQUFsQztBQUFBLG1CQUFPLE9BQUEsQ0FBUSxTQUFVLENBQUEsR0FBQSxDQUFsQixFQUFQOztBQURGO2VBR0EsT0FBQSxDQUFRLEtBQVI7TUFKeUIsQ0FBM0I7SUFSVSxDQUFSO0VBSFc7QUFiakIiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMnXG5cbmlzRmlsZUFzeW5jID0gKGZpbGVQYXRoKSAtPlxuICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIGZzLnN0YXQoZmlsZVBhdGgsIChlcnIsIHN0YXRzKSAtPlxuICAgICAgaWYgZXJyXG4gICAgICAgIHJlc29sdmUoZmFsc2UpXG4gICAgICBlbHNlXG4gICAgICAgIHJlc29sdmUoc3RhdHMuaXNGaWxlKCkpXG4gICAgKVxuICApXG5cbm1vZHVsZS5leHBvcnRzID0gKGRpcmVjdG9yeVBhdGgpIC0+XG4gIHJldHVybiBQcm9taXNlLnJlamVjdCgpIHVubGVzcyBkaXJlY3RvcnlQYXRoP1xuXG4gIG5ldyBQcm9taXNlIChyZXNvbHZlKSAtPlxuICAgIGZpbGVQYXRocyA9IFsndGFncycsICdUQUdTJywgJy50YWdzJywgJy5UQUdTJywgJy5naXQvdGFncycsICcuZ2l0L1RBR1MnXS5tYXAoKGZpbGVOYW1lKSAtPlxuICAgICAgcGF0aC5qb2luKGRpcmVjdG9yeVBhdGgsIGZpbGVOYW1lKVxuICAgIClcbiAgICBwcm9taXNlcyA9IGZpbGVQYXRocy5tYXAoKGZpbGVQYXRoKSAtPlxuICAgICAgaXNGaWxlQXN5bmMoZmlsZVBhdGgpXG4gICAgKVxuXG4gICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oKHJlc3VsdHMpIC0+XG4gICAgICBmb3IgcmVzdWx0LCBpZHggaW4gcmVzdWx0c1xuICAgICAgICByZXR1cm4gcmVzb2x2ZShmaWxlUGF0aHNbaWR4XSkgaWYgcmVzdWx0XG5cbiAgICAgIHJlc29sdmUoZmFsc2UpXG4gICAgKVxuIl19
