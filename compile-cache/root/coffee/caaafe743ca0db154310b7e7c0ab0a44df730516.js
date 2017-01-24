(function() {
  var TagsFile, _, ctags, debug, getSize, pathWatcher, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  ref = require('./helper'), getSize = ref.getSize, debug = ref.debug;

  ref1 = [], ctags = ref1[0], pathWatcher = ref1[1];

  module.exports = TagsFile = (function() {
    TagsFile.prototype.cachedTags = [];

    TagsFile.prototype.watchSubscription = null;

    function TagsFile(filePath) {
      this.filePath = filePath;
      this.watch = bind(this.watch, this);
      this.updateCachedTags = bind(this.updateCachedTags, this);
      this.toggleCache = bind(this.toggleCache, this);
      this.configSubscription = atom.config.observe('autocomplete-ctags.useFuzzy', this.toggleCache);
      this.debouncedUpdateCachedTags = _.debounce(this.updateCachedTags, 1000);
    }

    TagsFile.prototype.destroy = function() {
      this.configSubscription.dispose();
      this.configSubscription = null;
      return this.disableCache();
    };

    TagsFile.prototype.toggleCache = function(enabled) {
      if (enabled == null) {
        return;
      }
      if (enabled) {
        return this.enableCache();
      } else {
        return this.disableCache();
      }
    };

    TagsFile.prototype.enableCache = function() {
      debug('enableCache');
      this.updateCachedTags();
      return this.watch();
    };

    TagsFile.prototype.disableCache = function() {
      var ref2;
      debug('disableCache');
      this.cachedTags = [];
      if ((ref2 = this.watchSubscription) != null) {
        ref2.close();
      }
      return this.watchSubscription = null;
    };

    TagsFile.prototype.updateCachedTags = function() {
      this.cachedTags = [];
      return getSize(this.filePath).then((function(_this) {
        return function(fileSize) {
          debug('tagsFilesize', fileSize);
          if (fileSize >= _this.maximumTagFileSize()) {
            return Promise.reject(new Error('large tagsFile'));
          }
          return _this.readTags().then(function(tags) {
            _this.cachedTags = tags;
            return debug('updateCachedTags', _this.cachedTags);
          });
        };
      })(this));
    };

    TagsFile.prototype.readTags = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var result, stream;
          if (ctags == null) {
            ctags = require('ctags');
          }
          stream = ctags.createReadStream(_this.filePath);
          result = [];
          stream.on('error', function(error) {
            return reject(error);
          });
          stream.on('data', function(tags) {
            return result.push.apply(result, tags);
          });
          return stream.on('end', function() {
            return resolve(result);
          });
        };
      })(this));
    };

    TagsFile.prototype.watch = function() {
      var error;
      try {
        if (pathWatcher == null) {
          pathWatcher = require('pathwatcher');
        }
        return this.watchSubscription != null ? this.watchSubscription : this.watchSubscription = pathWatcher.watch(this.filePath, (function(_this) {
          return function(eventType) {
            debug('watch', eventType);
            switch (eventType) {
              case 'change':
                if (_this.watchSubscription != null) {
                  return _this.debouncedUpdateCachedTags();
                }
                break;
              case 'delete':
                _this.disableCache();
                _this.watch();
                return _this.debouncedUpdateCachedTags();
            }
          };
        })(this));
      } catch (error1) {
        error = error1;
        return console.error(error);
      }
    };

    TagsFile.prototype.getPath = function() {
      return this.filePath;
    };

    TagsFile.prototype.toString = function() {
      return this.getPath();
    };

    TagsFile.prototype.getCachedTags = function() {
      return this.cachedTags;
    };

    TagsFile.prototype.maximumTagFileSize = function() {
      return atom.config.get('autocomplete-ctags.maximumTagFileSize') * 1048576;
    };

    return TagsFile;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWN0YWdzL2xpYi90YWdzLWZpbGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwwREFBQTtJQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBbUIsT0FBQSxDQUFRLFVBQVIsQ0FBbkIsRUFBQyxxQkFBRCxFQUFVOztFQUNWLE9BQXVCLEVBQXZCLEVBQUMsZUFBRCxFQUFROztFQUVSLE1BQU0sQ0FBQyxPQUFQLEdBQ007dUJBQ0osVUFBQSxHQUFZOzt1QkFDWixpQkFBQSxHQUFtQjs7SUFFTixrQkFBQyxRQUFEO01BQUMsSUFBQyxDQUFBLFdBQUQ7Ozs7TUFDWixJQUFDLENBQUEsa0JBQUQsR0FBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLDZCQUFwQixFQUFtRCxJQUFDLENBQUEsV0FBcEQ7TUFDdEIsSUFBQyxDQUFBLHlCQUFELEdBQTZCLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBQyxDQUFBLGdCQUFaLEVBQThCLElBQTlCO0lBRmxCOzt1QkFJYixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxPQUFwQixDQUFBO01BQ0EsSUFBQyxDQUFBLGtCQUFELEdBQXNCO2FBQ3RCLElBQUMsQ0FBQSxZQUFELENBQUE7SUFITzs7dUJBS1QsV0FBQSxHQUFhLFNBQUMsT0FBRDtNQUNYLElBQWMsZUFBZDtBQUFBLGVBQUE7O01BRUEsSUFBRyxPQUFIO2VBQ0UsSUFBQyxDQUFBLFdBQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxZQUFELENBQUEsRUFIRjs7SUFIVzs7dUJBUWIsV0FBQSxHQUFhLFNBQUE7TUFDWCxLQUFBLENBQU0sYUFBTjtNQUNBLElBQUMsQ0FBQSxnQkFBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLEtB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QTVGdEIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue2dldFNpemUsIGRlYnVnfSA9IHJlcXVpcmUgJy4vaGVscGVyJ1xuW2N0YWdzLCBwYXRoV2F0Y2hlcl0gPSBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBUYWdzRmlsZVxuICBjYWNoZWRUYWdzOiBbXVxuICB3YXRjaFN1YnNjcmlwdGlvbjogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQGZpbGVQYXRoKSAtPlxuICAgIEBjb25maWdTdWJzY3JpcHRpb24gPSBhdG9tLmNvbmZpZy5vYnNlcnZlKCdhdXRvY29tcGxldGUtY3RhZ3MudXNlRnV6enknLCBAdG9nZ2xlQ2FjaGUpXG4gICAgQGRlYm91bmNlZFVwZGF0ZUNhY2hlZFRhZ3MgPSBfLmRlYm91bmNlKEB1cGRhdGVDYWNoZWRUYWdzLCAxMDAwKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGNvbmZpZ1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICBAY29uZmlnU3Vic2NyaXB0aW9uID0gbnVsbFxuICAgIEBkaXNhYmxlQ2FjaGUoKVxuXG4gIHRvZ2dsZUNhY2hlOiAoZW5hYmxlZCkgPT5cbiAgICByZXR1cm4gdW5sZXNzIGVuYWJsZWQ/XG5cbiAgICBpZiBlbmFibGVkXG4gICAgICBAZW5hYmxlQ2FjaGUoKVxuICAgIGVsc2VcbiAgICAgIEBkaXNhYmxlQ2FjaGUoKVxuXG4gIGVuYWJsZUNhY2hlOiAtPlxuICAgIGRlYnVnICdlbmFibGVDYWNoZSdcbiAgICBAdXBkYXRlQ2FjaGVkVGFncygpXG4gICAgQHdhdGNoKClcblxuICBkaXNhYmxlQ2FjaGU6IC0+XG4gICAgZGVidWcgJ2Rpc2FibGVDYWNoZSdcbiAgICBAY2FjaGVkVGFncyA9IFtdXG4gICAgQHdhdGNoU3Vic2NyaXB0aW9uPy5jbG9zZSgpXG4gICAgQHdhdGNoU3Vic2NyaXB0aW9uID0gbnVsbFxuXG4gIHVwZGF0ZUNhY2hlZFRhZ3M6ID0+XG4gICAgQGNhY2hlZFRhZ3MgPSBbXVxuXG4gICAgZ2V0U2l6ZShAZmlsZVBhdGgpLnRoZW4oKGZpbGVTaXplKSA9PlxuICAgICAgZGVidWcgJ3RhZ3NGaWxlc2l6ZScsIGZpbGVTaXplXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdsYXJnZSB0YWdzRmlsZScpKSBpZiBmaWxlU2l6ZSA+PSBAbWF4aW11bVRhZ0ZpbGVTaXplKClcbiAgICAgIEByZWFkVGFncygpLnRoZW4oKHRhZ3MpID0+XG4gICAgICAgIEBjYWNoZWRUYWdzID0gdGFnc1xuICAgICAgICBkZWJ1ZyAndXBkYXRlQ2FjaGVkVGFncycsIEBjYWNoZWRUYWdzXG4gICAgICApXG4gICAgKVxuXG4gIHJlYWRUYWdzOiAtPlxuICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBjdGFncyA/PSByZXF1aXJlICdjdGFncydcbiAgICAgIHN0cmVhbSA9IGN0YWdzLmNyZWF0ZVJlYWRTdHJlYW0oQGZpbGVQYXRoKVxuICAgICAgcmVzdWx0ID0gW11cblxuICAgICAgc3RyZWFtLm9uICdlcnJvcicsIChlcnJvciktPlxuICAgICAgICByZWplY3QoZXJyb3IpXG5cbiAgICAgIHN0cmVhbS5vbiAnZGF0YScsICh0YWdzKS0+XG4gICAgICAgIHJlc3VsdC5wdXNoKHRhZ3MuLi4pXG5cbiAgICAgIHN0cmVhbS5vbiAnZW5kJywgLT5cbiAgICAgICAgcmVzb2x2ZShyZXN1bHQpXG4gICAgKVxuXG4gIHdhdGNoOiA9PlxuICAgIHRyeVxuICAgICAgcGF0aFdhdGNoZXIgPz0gcmVxdWlyZSAncGF0aHdhdGNoZXInXG4gICAgICBAd2F0Y2hTdWJzY3JpcHRpb24gPz0gcGF0aFdhdGNoZXIud2F0Y2goQGZpbGVQYXRoLCAoZXZlbnRUeXBlKSA9PlxuICAgICAgICBkZWJ1ZyAnd2F0Y2gnLCBldmVudFR5cGVcbiAgICAgICAgc3dpdGNoIGV2ZW50VHlwZVxuICAgICAgICAgIHdoZW4gJ2NoYW5nZSdcbiAgICAgICAgICAgIEBkZWJvdW5jZWRVcGRhdGVDYWNoZWRUYWdzKCkgaWYgQHdhdGNoU3Vic2NyaXB0aW9uP1xuICAgICAgICAgICMgc3VwcG9ydCBtdlxuICAgICAgICAgIHdoZW4gJ2RlbGV0ZSdcbiAgICAgICAgICAgIEBkaXNhYmxlQ2FjaGUoKVxuICAgICAgICAgICAgQHdhdGNoKClcbiAgICAgICAgICAgIEBkZWJvdW5jZWRVcGRhdGVDYWNoZWRUYWdzKClcbiAgICAgIClcbiAgICBjYXRjaCBlcnJvclxuICAgICAgY29uc29sZS5lcnJvciBlcnJvclxuXG5cbiAgZ2V0UGF0aDogLT5cbiAgICBAZmlsZVBhdGhcblxuICB0b1N0cmluZzogLT5cbiAgICBAZ2V0UGF0aCgpXG5cbiAgZ2V0Q2FjaGVkVGFnczogLT5cbiAgICBAY2FjaGVkVGFnc1xuXG4gIG1heGltdW1UYWdGaWxlU2l6ZTogLT5cbiAgICBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1jdGFncy5tYXhpbXVtVGFnRmlsZVNpemUnKSAqIDEwNDg1NzZcbiJdfQ==
