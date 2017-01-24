(function() {
  var Q, SymbolGenView, fs, path, spawn, swapFile;

  path = require('path');

  fs = require('fs');

  Q = require('q');

  spawn = require('child_process').spawn;

  swapFile = '.tags_swap';

  module.exports = SymbolGenView = (function() {
    SymbolGenView.prototype.isActive = false;

    function SymbolGenView(serializeState) {
      atom.commands.add('atom-workspace', "symbol-gen:generate", (function(_this) {
        return function() {
          return _this.generate();
        };
      })(this));
      atom.commands.add('atom-workspace', "symbol-gen:purge", (function(_this) {
        return function() {
          return _this.purge();
        };
      })(this));
      this.activate_for_projects((function(_this) {
        return function(activate) {
          if (!activate) {
            return;
          }
          _this.isActive = true;
          return _this.watch_for_changes();
        };
      })(this));
    }

    SymbolGenView.prototype.serialize = function() {};

    SymbolGenView.prototype.destroy = function() {};

    SymbolGenView.prototype.tagfilePath = function() {
      return atom.config.get('symbol-gen.tagFile');
    };

    SymbolGenView.prototype.consumeStatusBar = function(statusBar) {
      var element;
      this.statusBar = statusBar;
      element = document.createElement('div');
      element.classList.add('inline-block');
      element.textContent = 'Generating symbols';
      element.style.display = 'none';
      return this.statusBarTile = this.statusBar.addRightTile({
        item: element,
        priority: 100
      });
    };

    SymbolGenView.prototype.watch_for_changes = function() {
      atom.commands.add('atom-workspace', 'core:save', (function(_this) {
        return function() {
          return _this.check_for_on_save();
        };
      })(this));
      atom.commands.add('atom-workspace', 'core:save-as', (function(_this) {
        return function() {
          return _this.check_for_on_save();
        };
      })(this));
      return atom.commands.add('atom-workspace', 'window:save-all', (function(_this) {
        return function() {
          return _this.check_for_on_save();
        };
      })(this));
    };

    SymbolGenView.prototype.check_for_on_save = function() {
      var editor, onDidSave;
      if (!this.isActive) {
        return;
      }
      editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        return onDidSave = editor.onDidSave((function(_this) {
          return function() {
            _this.generate();
            return onDidSave.dispose();
          };
        })(this));
      }
    };

    SymbolGenView.prototype.activate_for_projects = function(callback) {
      var projectPaths, shouldActivate;
      projectPaths = atom.project.getPaths();
      shouldActivate = projectPaths.some((function(_this) {
        return function(projectPath) {
          var tagsFilePath;
          tagsFilePath = path.resolve(projectPath, _this.tagfilePath());
          try {
            fs.accessSync(tagsFilePath);
            return true;
          } catch (error) {}
        };
      })(this));
      return callback(shouldActivate);
    };

    SymbolGenView.prototype.purge_for_project = function(projectPath) {
      var swapFilePath, tagsFilePath;
      swapFilePath = path.resolve(projectPath, swapFile);
      tagsFilePath = path.resolve(projectPath, this.tagfilePath());
      fs.unlink(tagsFilePath, function() {});
      return fs.unlink(swapFilePath, function() {});
    };

    SymbolGenView.prototype.generate_for_project = function(deferred, projectPath) {
      var args, command, ctags, defaultCtagsFile, excludes, swapFilePath, tagsFilePath;
      swapFilePath = path.resolve(projectPath, swapFile);
      tagsFilePath = path.resolve(projectPath, this.tagfilePath());
      command = path.resolve(__dirname, '..', 'vendor', "ctags-" + process.platform);
      defaultCtagsFile = require.resolve('./.ctags');
      excludes = this.get_ctags_excludes(projectPath);
      args = ["--options=" + defaultCtagsFile, '-R', "-f" + swapFilePath].concat(excludes);
      ctags = spawn(command, args, {
        cwd: projectPath
      });
      ctags.stderr.on('data', function(data) {
        return console.error('symbol-gen:', 'ctag:stderr ' + data);
      });
      return ctags.on('close', (function(_this) {
        return function(data) {
          return fs.rename(swapFilePath, tagsFilePath, function(err) {
            if (err) {
              console.warn('symbol-gen:', 'Error swapping file: ', err);
            }
            return deferred.resolve();
          });
        };
      })(this));
    };

    SymbolGenView.prototype.get_ctags_excludes = function(projectPath) {
      var ignoredNames;
      ignoredNames = atom.config.get("core.ignoredNames");
      if (atom.config.get("core.excludeVcsIgnoredPaths")) {
        ignoredNames = ignoredNames.concat(this.get_vcs_excludes(projectPath));
      }
      return ignoredNames.map((function(_this) {
        return function(glob) {
          return "--exclude=" + glob;
        };
      })(this));
    };

    SymbolGenView.prototype.get_vcs_excludes = function(projectPath) {
      var gitIgnorePath;
      gitIgnorePath = path.resolve(projectPath, '.gitignore');
      return require('ignored')(gitIgnorePath);
    };

    SymbolGenView.prototype.purge = function() {
      var projectPaths;
      projectPaths = atom.project.getPaths();
      projectPaths.forEach((function(_this) {
        return function(path) {
          return _this.purge_for_project(path);
        };
      })(this));
      return this.isActive = false;
    };

    SymbolGenView.prototype.generate = function() {
      var isGenerating, projectPaths, promises, showStatus;
      if (!this.isActive) {
        this.isActive = true;
        this.watch_for_changes();
      }
      isGenerating = true;
      showStatus = (function(_this) {
        return function() {
          var ref;
          if (!isGenerating) {
            return;
          }
          return (ref = _this.statusBarTile) != null ? ref.getItem().style.display = 'inline-block' : void 0;
        };
      })(this);
      setTimeout(showStatus, 300);
      promises = [];
      projectPaths = atom.project.getPaths();
      projectPaths.forEach((function(_this) {
        return function(path) {
          var p;
          p = Q.defer();
          _this.generate_for_project(p, path);
          return promises.push(p.promise);
        };
      })(this));
      return Q.all(promises).then((function(_this) {
        return function() {
          var ref;
          if ((ref = _this.statusBarTile) != null) {
            ref.getItem().style.display = 'none';
          }
          return isGenerating = false;
        };
      })(this));
    };

    return SymbolGenView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvc3ltYm9sLWdlbi9saWIvc3ltYm9sLWdlbi12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxDQUFBLEdBQUksT0FBQSxDQUFRLEdBQVI7O0VBQ0osS0FBQSxHQUFRLE9BQUEsQ0FBUSxlQUFSLENBQXdCLENBQUM7O0VBRWpDLFFBQUEsR0FBVzs7RUFFWCxNQUFNLENBQUMsT0FBUCxHQUNNOzRCQUVKLFFBQUEsR0FBVTs7SUFFRyx1QkFBQyxjQUFEO01BQ1gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxxQkFBcEMsRUFBMkQsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxRQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0Q7TUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLGtCQUFwQyxFQUF3RCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLEtBQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4RDtNQUNBLElBQUMsQ0FBQSxxQkFBRCxDQUF1QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsUUFBRDtVQUNyQixJQUFBLENBQWMsUUFBZDtBQUFBLG1CQUFBOztVQUNBLEtBQUMsQ0FBQSxRQUFELEdBQVk7aUJBQ1osS0FBQyxDQUFBLGlCQUFELENBQUE7UUFIcUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCO0lBSFc7OzRCQVNiLFNBQUEsR0FBVyxTQUFBLEdBQUE7OzRCQUdYLE9BQUEsR0FBUyxTQUFBLEdB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QWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ1gsY0FBQTtVQUFBLElBQUEsQ0FBYyxZQUFkO0FBQUEsbUJBQUE7OzBEQUNjLENBQUUsT0FBaEIsQ0FBQSxDQUF5QixDQUFDLEtBQUssQ0FBQyxPQUFoQyxHQUEwQztRQUYvQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFHYixVQUFBLENBQVcsVUFBWCxFQUF1QixHQUF2QjtNQUVBLFFBQUEsR0FBVztNQUNYLFlBQUEsR0FBZSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQTtNQUNmLFlBQVksQ0FBQyxPQUFiLENBQXFCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO0FBQ25CLGNBQUE7VUFBQSxDQUFBLEdBQUksQ0FBQyxDQUFDLEtBQUYsQ0FBQTtVQUNKLEtBQUMsQ0FBQSxvQkFBRCxDQUFzQixDQUF0QixFQUF5QixJQUF6QjtpQkFDQSxRQUFRLENBQUMsSUFBVCxDQUFjLENBQUMsQ0FBQyxPQUFoQjtRQUhtQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckI7YUFLQSxDQUFDLENBQUMsR0FBRixDQUFNLFFBQU4sQ0FBZSxDQUFDLElBQWhCLENBQXFCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUVuQixjQUFBOztlQUFjLENBQUUsT0FBaEIsQ0FBQSxDQUF5QixDQUFDLEtBQUssQ0FBQyxPQUFoQyxHQUEwQzs7aUJBQzFDLFlBQUEsR0FBZTtRQUhJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtJQW5CUTs7Ozs7QUE5RloiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5mcyA9IHJlcXVpcmUoJ2ZzJylcblEgPSByZXF1aXJlKCdxJylcbnNwYXduID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLnNwYXduXG5cbnN3YXBGaWxlID0gJy50YWdzX3N3YXAnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFN5bWJvbEdlblZpZXdcblxuICBpc0FjdGl2ZTogZmFsc2VcblxuICBjb25zdHJ1Y3RvcjogKHNlcmlhbGl6ZVN0YXRlKSAtPlxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsIFwic3ltYm9sLWdlbjpnZW5lcmF0ZVwiLCA9PiBAZ2VuZXJhdGUoKVxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsIFwic3ltYm9sLWdlbjpwdXJnZVwiLCA9PiBAcHVyZ2UoKVxuICAgIEBhY3RpdmF0ZV9mb3JfcHJvamVjdHMgKGFjdGl2YXRlKSA9PlxuICAgICAgcmV0dXJuIHVubGVzcyBhY3RpdmF0ZVxuICAgICAgQGlzQWN0aXZlID0gdHJ1ZVxuICAgICAgQHdhdGNoX2Zvcl9jaGFuZ2VzKClcblxuICAjIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHJldHJpZXZlZCB3aGVuIHBhY2thZ2UgaXMgYWN0aXZhdGVkXG4gIHNlcmlhbGl6ZTogLT5cblxuICAjIFRlYXIgZG93biBhbnkgc3RhdGUgYW5kIGRldGFjaFxuICBkZXN0cm95OiAtPlxuXG4gIHRhZ2ZpbGVQYXRoOiAtPlxuICAgIGF0b20uY29uZmlnLmdldCgnc3ltYm9sLWdlbi50YWdGaWxlJylcblxuICBjb25zdW1lU3RhdHVzQmFyOiAoQHN0YXR1c0JhcikgLT5cbiAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnZGl2J1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaW5saW5lLWJsb2NrJylcbiAgICBlbGVtZW50LnRleHRDb250ZW50ID0gJ0dlbmVyYXRpbmcgc3ltYm9scydcbiAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICBAc3RhdHVzQmFyVGlsZSA9IEBzdGF0dXNCYXIuYWRkUmlnaHRUaWxlKGl0ZW06IGVsZW1lbnQsIHByaW9yaXR5OiAxMDApXG5cbiAgd2F0Y2hfZm9yX2NoYW5nZXM6IC0+XG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2NvcmU6c2F2ZScsID0+IEBjaGVja19mb3Jfb25fc2F2ZSgpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2NvcmU6c2F2ZS1hcycsID0+IEBjaGVja19mb3Jfb25fc2F2ZSgpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3dpbmRvdzpzYXZlLWFsbCcsID0+IEBjaGVja19mb3Jfb25fc2F2ZSgpXG5cbiAgY2hlY2tfZm9yX29uX3NhdmU6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaXNBY3RpdmVcbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpZiAoZWRpdG9yKVxuICAgICAgb25EaWRTYXZlID1cbiAgICAgICAgZWRpdG9yLm9uRGlkU2F2ZSA9PlxuICAgICAgICAgIEBnZW5lcmF0ZSgpXG4gICAgICAgICAgb25EaWRTYXZlLmRpc3Bvc2UoKVxuXG4gIGFjdGl2YXRlX2Zvcl9wcm9qZWN0czogKGNhbGxiYWNrKSAtPlxuICAgIHByb2plY3RQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgc2hvdWxkQWN0aXZhdGUgPSBwcm9qZWN0UGF0aHMuc29tZSAocHJvamVjdFBhdGgpID0+XG4gICAgICB0YWdzRmlsZVBhdGggPSBwYXRoLnJlc29sdmUocHJvamVjdFBhdGgsIEB0YWdmaWxlUGF0aCgpKVxuICAgICAgdHJ5IGZzLmFjY2Vzc1N5bmMgdGFnc0ZpbGVQYXRoOyByZXR1cm4gdHJ1ZVxuICAgIGNhbGxiYWNrIHNob3VsZEFjdGl2YXRlXG5cbiAgcHVyZ2VfZm9yX3Byb2plY3Q6IChwcm9qZWN0UGF0aCkgLT5cbiAgICBzd2FwRmlsZVBhdGggPSBwYXRoLnJlc29sdmUocHJvamVjdFBhdGgsIHN3YXBGaWxlKVxuICAgIHRhZ3NGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9qZWN0UGF0aCwgQHRhZ2ZpbGVQYXRoKCkpXG4gICAgZnMudW5saW5rIHRhZ3NGaWxlUGF0aCwgLT4gIyBuby1vcFxuICAgIGZzLnVubGluayBzd2FwRmlsZVBhdGgsIC0+ICMgbm8tb3BcblxuICBnZW5lcmF0ZV9mb3JfcHJvamVjdDogKGRlZmVycmVkLCBwcm9qZWN0UGF0aCkgLT5cbiAgICBzd2FwRmlsZVBhdGggPSBwYXRoLnJlc29sdmUocHJvamVjdFBhdGgsIHN3YXBGaWxlKVxuICAgIHRhZ3NGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9qZWN0UGF0aCwgQHRhZ2ZpbGVQYXRoKCkpXG4gICAgY29tbWFuZCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLicsICd2ZW5kb3InLCBcImN0YWdzLSN7cHJvY2Vzcy5wbGF0Zm9ybX1cIilcbiAgICBkZWZhdWx0Q3RhZ3NGaWxlID0gcmVxdWlyZS5yZXNvbHZlKCcuLy5jdGFncycpXG4gICAgZXhjbHVkZXMgPSBAZ2V0X2N0YWdzX2V4Y2x1ZGVzKHByb2plY3RQYXRoKVxuICAgIGFyZ3MgPSBbXCItLW9wdGlvbnM9I3tkZWZhdWx0Q3RhZ3NGaWxlfVwiLCAnLVInLCBcIi1mI3tzd2FwRmlsZVBhdGh9XCJdLmNvbmNhdCBleGNsdWRlc1xuICAgIGN0YWdzID0gc3Bhd24oY29tbWFuZCwgYXJncywge2N3ZDogcHJvamVjdFBhdGh9KVxuXG4gICAgY3RhZ3Muc3RkZXJyLm9uICdkYXRhJywgKGRhdGEpIC0+IGNvbnNvbGUuZXJyb3IoJ3N5bWJvbC1nZW46JywgJ2N0YWc6c3RkZXJyICcgKyBkYXRhKVxuICAgIGN0YWdzLm9uICdjbG9zZScsIChkYXRhKSA9PlxuICAgICAgZnMucmVuYW1lIHN3YXBGaWxlUGF0aCwgdGFnc0ZpbGVQYXRoLCAoZXJyKSA9PlxuICAgICAgICBpZiBlcnIgdGhlbiBjb25zb2xlLndhcm4oJ3N5bWJvbC1nZW46JywgJ0Vycm9yIHN3YXBwaW5nIGZpbGU6ICcsIGVycilcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpXG5cbiAgZ2V0X2N0YWdzX2V4Y2x1ZGVzOiAocHJvamVjdFBhdGgpIC0+XG4gICAgaWdub3JlZE5hbWVzID0gYXRvbS5jb25maWcuZ2V0KFwiY29yZS5pZ25vcmVkTmFtZXNcIilcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoXCJjb3JlLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHNcIilcbiAgICAgIGlnbm9yZWROYW1lcyA9IGlnbm9yZWROYW1lcy5jb25jYXQgQGdldF92Y3NfZXhjbHVkZXMocHJvamVjdFBhdGgpXG4gICAgaWdub3JlZE5hbWVzLm1hcCAoZ2xvYikgPT4gXCItLWV4Y2x1ZGU9I3tnbG9ifVwiXG5cbiAgZ2V0X3Zjc19leGNsdWRlczogKHByb2plY3RQYXRoKSAtPlxuICAgIGdpdElnbm9yZVBhdGggPSBwYXRoLnJlc29sdmUocHJvamVjdFBhdGgsICcuZ2l0aWdub3JlJylcbiAgICByZXF1aXJlKCdpZ25vcmVkJykoZ2l0SWdub3JlUGF0aClcblxuICBwdXJnZTogLT5cbiAgICBwcm9qZWN0UGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgIHByb2plY3RQYXRocy5mb3JFYWNoIChwYXRoKSA9PlxuICAgICAgQHB1cmdlX2Zvcl9wcm9qZWN0KHBhdGgpXG4gICAgQGlzQWN0aXZlID0gZmFsc2VcblxuICBnZW5lcmF0ZTogKCkgLT5cbiAgICBpZiBub3QgQGlzQWN0aXZlXG4gICAgICBAaXNBY3RpdmUgPSB0cnVlXG4gICAgICBAd2F0Y2hfZm9yX2NoYW5nZXMoKVxuXG4gICAgaXNHZW5lcmF0aW5nID0gdHJ1ZVxuICAgICMgc2hvdyBzdGF0dXMgYmFyIHRpbGUgaWYgaXQgdGFrZXMgYSB3aGlsZSB0byBnZW5lcmF0ZSB0YWdzXG4gICAgc2hvd1N0YXR1cyA9ID0+XG4gICAgICByZXR1cm4gdW5sZXNzIGlzR2VuZXJhdGluZ1xuICAgICAgQHN0YXR1c0JhclRpbGU/LmdldEl0ZW0oKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jaydcbiAgICBzZXRUaW1lb3V0IHNob3dTdGF0dXMsIDMwMFxuXG4gICAgcHJvbWlzZXMgPSBbXVxuICAgIHByb2plY3RQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgcHJvamVjdFBhdGhzLmZvckVhY2ggKHBhdGgpID0+XG4gICAgICBwID0gUS5kZWZlcigpXG4gICAgICBAZ2VuZXJhdGVfZm9yX3Byb2plY3QocCwgcGF0aClcbiAgICAgIHByb21pc2VzLnB1c2gocC5wcm9taXNlKVxuXG4gICAgUS5hbGwocHJvbWlzZXMpLnRoZW4gPT5cbiAgICAgICMgaGlkZSBzdGF0dXMgYmFyIHRpbGVcbiAgICAgIEBzdGF0dXNCYXJUaWxlPy5nZXRJdGVtKCkuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgICAgaXNHZW5lcmF0aW5nID0gZmFsc2VcbiJdfQ==
