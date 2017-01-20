(function() {
  var CompositeDisposable, CtagsProvider, Snippers, TagsFile, ctags, debug, filter, ref;

  CompositeDisposable = require('atom').CompositeDisposable;

  debug = require('./helper').debug;

  TagsFile = require('./tags-file');

  ref = [], ctags = ref[0], Snippers = ref[1], filter = ref[2];

  module.exports = CtagsProvider = (function() {
    CtagsProvider.kinds = {
      f: 'function',
      v: 'variable'
    };

    CtagsProvider.prototype.selector = '.source';

    CtagsProvider.prototype.disableForSelector = '.comment, .string, .source.gfm';

    CtagsProvider.prototype.inclusionPriority = 1;

    CtagsProvider.prototype.suggestionPriority = 1;

    CtagsProvider.prototype.tagsFiles = [];

    CtagsProvider.prototype.snippers = null;

    function CtagsProvider(tagsFiles) {
      if (tagsFiles == null) {
        tagsFiles = [];
      }
      this.subscriptions = new CompositeDisposable;
      this.observeConfig();
      this.setTagsFiles(tagsFiles);
    }

    CtagsProvider.prototype.observeConfig = function() {
      this.subscriptions.add(atom.config.observe('autocomplete-ctags.useSnippers', (function(_this) {
        return function(value) {
          if (value) {
            if (Snippers == null) {
              Snippers = require('./snippers');
            }
            return _this.snippers = new Snippers;
          } else {
            return _this.snippers = null;
          }
        };
      })(this)));
      return this.subscriptions.add(atom.config.observe('autocomplete-ctags.disableBuiltinProvider', (function(_this) {
        return function(disable) {
          return _this.excludeLowerPriority = disable;
        };
      })(this)));
    };

    CtagsProvider.prototype.setTagsFiles = function(tagsFiles) {
      this.clearTagsFiles();
      return this.tagsFiles = tagsFiles.map(function(filePath) {
        return new TagsFile(filePath);
      });
    };

    CtagsProvider.prototype.dispose = function() {
      var ref1;
      if ((ref1 = this.subscriptions) != null) {
        ref1.dispose();
      }
      this.subscriptions = null;
      this.clearTagsFiles();
      return this.snippers = null;
    };

    CtagsProvider.prototype.getSuggestions = function(arg) {
      var bufferPosition, editor, prefix, promises, scopeDescriptor;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      if (this.tagsFiles.length === 0) {
        return Promise.resolve([]);
      }
      if (prefix.length < atom.config.get('autocomplete-ctags.minimumPrefixLength')) {
        return Promise.resolve([]);
      }
      promises = this.tagsFiles.map((function(_this) {
        return function(tagsFile) {
          return _this.findTags(tagsFile, prefix);
        };
      })(this));
      return Promise.all(promises).then((function(_this) {
        return function(tags) {
          var suggestions;
          suggestions = tags.reduce(function(a, b) {
            return a.push.apply(a, b);
          }).map(function(tag) {
            var ref1, ref2;
            return {
              text: tag.name,
              description: tag.pattern,
              type: (ref1 = _this.constructor.kinds[tag.kind]) != null ? ref1 : null,
              snippet: (ref2 = _this.snippers) != null ? ref2.generate(tag) : void 0
            };
          });
          debug('getSuggestions', suggestions);
          return suggestions;
        };
      })(this));
    };

    CtagsProvider.prototype.findTags = function(tagsFile, prefix) {
      if (ctags == null) {
        ctags = require('ctags');
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var options;
          options = {
            partialMatch: true,
            caseInsensitive: atom.config.get('autocomplete-ctags.caseInsensitive')
          };
          return ctags.findTags(tagsFile.getPath(), prefix, options, function(error, tags) {
            if (tags == null) {
              tags = [];
            }
            debug('findTags', error, tags);
            if (error) {
              return reject(error);
            }
            if (tags.length === 0 && atom.config.get('autocomplete-ctags.useFuzzy')) {
              tags = _this.fuzzyFindTags(tagsFile, prefix);
            }
            return resolve(tags);
          });
        };
      })(this));
    };

    CtagsProvider.prototype.fuzzyFindTags = function(tagsFile, prefix) {
      var cachedTags, results;
      cachedTags = tagsFile.getCachedTags();
      if (cachedTags.length === 0) {
        return [];
      }
      if (filter == null) {
        filter = require('fuzzaldrin').filter;
      }
      results = filter(cachedTags, prefix, {
        key: 'name'
      });
      debug('fuzzyFindTags', results);
      return Promise.resolve(results);
    };

    CtagsProvider.prototype.clearTagsFiles = function() {
      var i, len, ref1, tagsFile;
      ref1 = this.tagsFiles;
      for (i = 0, len = ref1.length; i < len; i++) {
        tagsFile = ref1[i];
        tagsFile.destroy();
      }
      return this.tagsFiles = [];
    };

    return CtagsProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWN0YWdzL2xpYi9jdGFncy1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF3QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsUUFBUyxPQUFBLENBQVEsVUFBUjs7RUFDVixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsTUFBNEIsRUFBNUIsRUFBQyxjQUFELEVBQVEsaUJBQVIsRUFBa0I7O0VBRWxCLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDSixhQUFDLENBQUEsS0FBRCxHQUFTO01BQ1AsQ0FBQSxFQUFHLFVBREk7TUFFUCxDQUFBLEVBQUcsVUFGSTs7OzRCQUtULFFBQUEsR0FBVTs7NEJBQ1Ysa0JBQUEsR0FBb0I7OzRCQUNwQixpQkFBQSxHQUFtQjs7NEJBQ25CLGtCQUFBLEdBQW9COzs0QkFHcEIsU0FBQSxHQUFXOzs0QkFDWCxRQUFBLEdBQVU7O0lBRUcsdUJBQUMsU0FBRDs7UUFBQyxZQUFZOztNQUN4QixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxhQUFELENBQUE7TUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLFNBQWQ7SUFIVzs7NEJBS2IsYUFBQSxHQUFlLFNBQUE7TUFDYixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLGdDQUFwQixFQUFzRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtVQUN2RSxJQUFHLEtBQUg7O2NBQ0UsV0FBWSxPQUFBLENBQVEsWUFBUjs7bUJBQ1osS0FBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLFNBRmxCO1dBQUEsTUFBQTttQkFJRSxLQUFDLENBQUEsUUFBRCxHQUFZLEtBSmQ7O1FBRHVFO01BQUEsQ0FBQSxDQUFBLENBQUEs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Q0FBTyxLQUFQLEVBQVA7O1lBQ0EsSUFBRyxJQUFJLENBQUMsTUFBTCxLQUFlLENBQWYsSUFBcUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZCQUFoQixDQUF4QjtjQUNFLElBQUEsR0FBTyxLQUFDLENBQUEsYUFBRCxDQUFlLFFBQWYsRUFBeUIsTUFBekIsRUFEVDs7bUJBR0EsT0FBQSxDQUFRLElBQVI7VUFQa0QsQ0FBcEQ7UUFKVTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUjtJQUhJOzs0QkFrQlYsYUFBQSxHQUFlLFNBQUMsUUFBRCxFQUFXLE1BQVg7QUFDYixVQUFBO01BQUEsVUFBQSxHQUFhLFFBQVEsQ0FBQyxhQUFULENBQUE7TUFDYixJQUFhLFVBQVUsQ0FBQyxNQUFYLEtBQXFCLENBQWxDO0FBQUEsZUFBTyxHQUFQOzs7UUFDQSxTQUFVLE9BQUEsQ0FBUSxZQUFSLENBQXFCLENBQUM7O01BQ2hDLE9BQUEsR0FBVSxNQUFBLENBQU8sVUFBUCxFQUFtQixNQUFuQixFQUEyQjtRQUFBLEdBQUEsRUFBSyxNQUFMO09BQTNCO01BQ1YsS0FBQSxDQUFNLGVBQU4sRUFBdUIsT0FBdkI7YUFDQSxPQUFPLENBQUMsT0FBUixDQUFnQixPQUFoQjtJQU5hOzs0QkFRZixjQUFBLEdBQWdCLFNBQUE7QUFDZCxVQUFBO0FBQUE7QUFBQSxXQUFBLHNDQUFBOztRQUNFLFFBQVEsQ0FBQyxPQUFULENBQUE7QUFERjthQUVBLElBQUMsQ0FBQSxTQUFELEdBQWE7SUFIQzs7Ozs7QUF0R2xCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ICA9IHJlcXVpcmUgJ2F0b20nXG57ZGVidWd9ID0gcmVxdWlyZSAnLi9oZWxwZXInXG5UYWdzRmlsZSA9IHJlcXVpcmUgJy4vdGFncy1maWxlJ1xuW2N0YWdzLCBTbmlwcGVycywgZmlsdGVyXSA9IFtdXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEN0YWdzUHJvdmlkZXJcbiAgQGtpbmRzID0ge1xuICAgIGY6ICdmdW5jdGlvbidcbiAgICB2OiAndmFyaWFibGUnXG4gIH1cblxuICBzZWxlY3RvcjogJy5zb3VyY2UnXG4gIGRpc2FibGVGb3JTZWxlY3RvcjogJy5jb21tZW50LCAuc3RyaW5nLCAuc291cmNlLmdmbSdcbiAgaW5jbHVzaW9uUHJpb3JpdHk6IDFcbiAgc3VnZ2VzdGlvblByaW9yaXR5OiAxXG4gICMgZXhjbHVkZUxvd2VyUHJpb3JpdHk6IGZhbHNlXG5cbiAgdGFnc0ZpbGVzOiBbXVxuICBzbmlwcGVyczogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAodGFnc0ZpbGVzID0gW10pIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBvYnNlcnZlQ29uZmlnKClcbiAgICBAc2V0VGFnc0ZpbGVzKHRhZ3NGaWxlcylcblxuICBvYnNlcnZlQ29uZmlnOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdhdXRvY29tcGxldGUtY3RhZ3MudXNlU25pcHBlcnMnLCAodmFsdWUpID0+XG4gICAgICBpZiB2YWx1ZVxuICAgICAgICBTbmlwcGVycyA/PSByZXF1aXJlICcuL3NuaXBwZXJzJ1xuICAgICAgICBAc25pcHBlcnMgPSBuZXcgU25pcHBlcnNcbiAgICAgIGVsc2VcbiAgICAgICAgQHNuaXBwZXJzID0gbnVsbFxuICAgICkpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnYXV0b2NvbXBsZXRlLWN0YWdzLmRpc2FibGVCdWlsdGluUHJvdmlkZXInLCAoZGlzYWJsZSkgPT5cbiAgICAgIEBleGNsdWRlTG93ZXJQcmlvcml0eSA9IGRpc2FibGVcbiAgICApKVxuXG4gIHNldFRhZ3NGaWxlczogKHRhZ3NGaWxlcykgLT5cbiAgICBAY2xlYXJUYWdzRmlsZXMoKVxuICAgIEB0YWdzRmlsZXMgPSB0YWdzRmlsZXMubWFwKChmaWxlUGF0aCkgLT5cbiAgICAgIG5ldyBUYWdzRmlsZShmaWxlUGF0aClcbiAgICApXG5cbiAgZGlzcG9zZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBudWxsXG4gICAgQGNsZWFyVGFnc0ZpbGVzKClcbiAgICBAc25pcHBlcnMgPSBudWxsXG5cbiAgZ2V0U3VnZ2VzdGlvbnM6ICh7ZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgc2NvcGVEZXNjcmlwdG9yLCBwcmVmaXh9KSAtPlxuICAgIGlmIEB0YWdzRmlsZXMubGVuZ3RoIGlzIDBcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pXG5cbiAgICBpZiBwcmVmaXgubGVuZ3RoIDwgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtY3RhZ3MubWluaW11bVByZWZpeExlbmd0aCcpXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKVxuXG4gICAgcHJvbWlzZXMgPSBAdGFnc0ZpbGVzLm1hcCgodGFnc0ZpbGUpID0+XG4gICAgICBAZmluZFRhZ3ModGFnc0ZpbGUsIHByZWZpeClcbiAgICApXG5cbiAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbigodGFncykgPT5cbiAgICAgIHN1Z2dlc3Rpb25zID0gdGFncy5yZWR1Y2UoKGEsIGIpIC0+XG4gICAgICAgIGEucHVzaChiLi4uKVxuICAgICAgKS5tYXAoKHRhZykgPT5cbiAgICAgICAgdGV4dDogdGFnLm5hbWVcbiAgICAgICAgZGVzY3JpcHRpb246IHRhZy5wYXR0ZXJuXG4gICAgICAgIHR5cGU6IEBjb25zdHJ1Y3Rvci5raW5kc1t0YWcua2luZF0gPyBudWxsXG4gICAgICAgIHNuaXBwZXQ6IEBzbmlwcGVycz8uZ2VuZXJhdGUodGFnKVxuICAgICAgKVxuXG4gICAgICBkZWJ1ZygnZ2V0U3VnZ2VzdGlvbnMnLCBzdWdnZXN0aW9ucylcbiAgICAgIHN1Z2dlc3Rpb25zXG4gICAgKVxuXG4gIGZpbmRUYWdzOiAodGFnc0ZpbGUsIHByZWZpeCkgLT5cbiAgICBjdGFncyA/PSByZXF1aXJlICdjdGFncydcblxuICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBvcHRpb25zID1cbiAgICAgICAgcGFydGlhbE1hdGNoOiB0cnVlXG4gICAgICAgIGNhc2VJbnNlbnNpdGl2ZTogYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtY3RhZ3MuY2FzZUluc2Vuc2l0aXZlJylcbiAgICAgIGN0YWdzLmZpbmRUYWdzKHRhZ3NGaWxlLmdldFBhdGgoKSwgcHJlZml4LCBvcHRpb25zLCAoZXJyb3IsIHRhZ3MgPSBbXSkgPT5cbiAgICAgICAgZGVidWcoJ2ZpbmRUYWdzJywgZXJyb3IsIHRhZ3MpXG5cbiAgICAgICAgcmV0dXJuIHJlamVjdChlcnJvcikgaWYgZXJyb3JcbiAgICAgICAgaWYgdGFncy5sZW5ndGggaXMgMCBhbmQgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtY3RhZ3MudXNlRnV6enknKVxuICAgICAgICAgIHRhZ3MgPSBAZnV6enlGaW5kVGFncyh0YWdzRmlsZSwgcHJlZml4KVxuXG4gICAgICAgIHJlc29sdmUodGFncylcbiAgICAgIClcbiAgICApXG5cbiAgZnV6enlGaW5kVGFnczogKHRhZ3NGaWxlLCBwcmVmaXgpIC0+XG4gICAgY2FjaGVkVGFncyA9IHRhZ3NGaWxlLmdldENhY2hlZFRhZ3MoKVxuICAgIHJldHVybiBbXSBpZiBjYWNoZWRUYWdzLmxlbmd0aCBpcyAwXG4gICAgZmlsdGVyID89IHJlcXVpcmUoJ2Z1enphbGRyaW4nKS5maWx0ZXJcbiAgICByZXN1bHRzID0gZmlsdGVyKGNhY2hlZFRhZ3MsIHByZWZpeCwga2V5OiAnbmFtZScpXG4gICAgZGVidWcoJ2Z1enp5RmluZFRhZ3MnLCByZXN1bHRzKVxuICAgIFByb21pc2UucmVzb2x2ZShyZXN1bHRzKVxuXG4gIGNsZWFyVGFnc0ZpbGVzOiAtPlxuICAgIGZvciB0YWdzRmlsZSBpbiBAdGFnc0ZpbGVzXG4gICAgICB0YWdzRmlsZS5kZXN0cm95KClcbiAgICBAdGFnc0ZpbGVzID0gW11cbiJdfQ==
