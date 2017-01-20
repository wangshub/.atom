(function() {
  var BufferedProcess, Emitter, PackageManager, Q, _, semver, url;

  _ = require('underscore-plus');

  BufferedProcess = require('atom').BufferedProcess;

  Emitter = require('emissary').Emitter;

  Q = require('q');

  semver = require('semver');

  url = require('url');

  Q.stopUnhandledRejectionTracking();

  module.exports = PackageManager = (function() {
    Emitter.includeInto(PackageManager);

    function PackageManager() {
      this.packagePromises = [];
    }

    PackageManager.prototype.runCommand = function(args, callback) {
      var command, errorLines, exit, outputLines, stderr, stdout;
      command = atom.packages.getApmPath();
      outputLines = [];
      stdout = function(lines) {
        return outputLines.push(lines);
      };
      errorLines = [];
      stderr = function(lines) {
        return errorLines.push(lines);
      };
      exit = function(code) {
        return callback(code, outputLines.join('\n'), errorLines.join('\n'));
      };
      args.push('--no-color');
      return new BufferedProcess({
        command: command,
        args: args,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
    };

    PackageManager.prototype.loadFeatured = function(callback) {
      var args, version;
      args = ['featured', '--json'];
      version = atom.getVersion();
      if (semver.valid(version)) {
        args.push('--compatible', version);
      }
      return this.runCommand(args, function(code, stdout, stderr) {
        var error, packages, ref;
        if (code === 0) {
          try {
            packages = (ref = JSON.parse(stdout)) != null ? ref : [];
          } catch (error1) {
            error = error1;
            callback(error);
            return;
          }
          return callback(null, packages);
        } else {
          error = new Error('Fetching featured packages and themes failed.');
          error.stdout = stdout;
          error.stderr = stderr;
          return callback(error);
        }
      });
    };

    PackageManager.prototype.loadOutdated = function(callback) {
      var args, version;
      args = ['outdated', '--json'];
      version = atom.getVersion();
      if (semver.valid(version)) {
        args.push('--compatible', version);
      }
      return this.runCommand(args, function(code, stdout, stderr) {
        var error, packages, ref;
        if (code === 0) {
          try {
            packages = (ref = JSON.parse(stdout)) != null ? ref : [];
          } catch (error1) {
            error = error1;
            callback(error);
            return;
          }
          return callback(null, packages);
        } else {
          error = new Error('Fetching outdated packages and themes failed.');
          error.stdout = stdout;
          error.stderr = stderr;
          return callback(error);
        }
      });
    };

    PackageManager.prototype.loadPackage = function(packageName, callback) {
      var args;
      args = ['view', packageName, '--json'];
      return this.runCommand(args, function(code, stdout, stderr) {
        var error, packages, ref;
        if (code === 0) {
          try {
            packages = (ref = JSON.parse(stdout)) != null ? ref : [];
          } catch (error1) {
            error = error1;
            callback(error);
            return;
          }
          return callback(null, packages);
        } else {
          error = new Error("Fetching package '" + packageName + "' failed.");
          error.stdout = stdout;
          error.stderr = stderr;
          return callback(error);
        }
      });
    };

    PackageManager.prototype.getFeatured = function() {
      return this.featuredPromise != null ? this.featuredPromise : this.featuredPromise = Q.nbind(this.loadFeatured, this)();
    };

    PackageManager.prototype.getOutdated = function() {
      return this.outdatedPromise != null ? this.outdatedPromise : this.outdatedPromise = Q.nbind(this.loadOutdated, this)();
    };

    PackageManager.prototype.getPackage = function(packageName) {
      var base;
      return (base = this.packagePromises)[packageName] != null ? base[packageName] : base[packageName] = Q.nbind(this.loadPackage, this, packageName)();
    };

    PackageManager.prototype.search = function(query, options) {
      var args, deferred;
      if (options == null) {
        options = {};
      }
      deferred = Q.defer();
      args = ['search', query, '--json'];
      if (options.themes) {
        args.push('--themes');
      } else if (options.packages) {
        args.push('--packages');
      }
      this.runCommand(args, function(code, stdout, stderr) {
        var error, packages, ref;
        if (code === 0) {
          try {
            packages = (ref = JSON.parse(stdout)) != null ? ref : [];
            return deferred.resolve(packages);
          } catch (error1) {
            error = error1;
            return deferred.reject(error);
          }
        } else {
          error = new Error("Searching for \u201C" + query + "\u201D failed.");
          error.stdout = stdout;
          error.stderr = stderr;
          return deferred.reject(error);
        }
      });
      return deferred.promise;
    };

    PackageManager.prototype.update = function(pack, newVersion, callback) {
      var activateOnFailure, activateOnSuccess, args, exit, name, theme;
      name = pack.name, theme = pack.theme;
      activateOnSuccess = !theme && !atom.packages.isPackageDisabled(name);
      activateOnFailure = atom.packages.isPackageActive(name);
      if (atom.packages.isPackageActive(name)) {
        atom.packages.deactivatePackage(name);
      }
      if (atom.packages.isPackageLoaded(name)) {
        atom.packages.unloadPackage(name);
      }
      args = ['install', name + "@" + newVersion];
      exit = (function(_this) {
        return function(code, stdout, stderr) {
          var error;
          if (code === 0) {
            if (activateOnSuccess) {
              atom.packages.activatePackage(name);
            } else {
              atom.packages.loadPackage(name);
            }
            if (typeof callback === "function") {
              callback();
            }
            return _this.emitPackageEvent('updated', pack);
          } else {
            if (activateOnFailure) {
              atom.packages.activatePackage(name);
            }
            error = new Error("Updating to \u201C" + name + "@" + newVersion + "\u201D failed.");
            error.stdout = stdout;
            error.stderr = stderr;
            error.packageInstallError = !theme;
            _this.emitPackageEvent('update-failed', pack, error);
            return callback(error);
          }
        };
      })(this);
      this.emit('package-updating', pack);
      return this.runCommand(args, exit);
    };

    PackageManager.prototype.install = function(pack, callback) {
      var activateOnFailure, activateOnSuccess, apmInstallSource, args, exit, name, packageRef, theme, version;
      name = pack.name, version = pack.version, theme = pack.theme, apmInstallSource = pack.apmInstallSource;
      activateOnSuccess = !theme && !atom.packages.isPackageDisabled(name);
      activateOnFailure = atom.packages.isPackageActive(name);
      if (atom.packages.isPackageActive(name)) {
        atom.packages.deactivatePackage(name);
      }
      if (atom.packages.isPackageLoaded(name)) {
        atom.packages.unloadPackage(name);
      }
      packageRef = apmInstallSource ? apmInstallSource.source : name + "@" + version;
      args = ['install', packageRef];
      exit = (function(_this) {
        return function(code, stdout, stderr) {
          var error;
          if (code === 0) {
            if (activateOnSuccess) {
              atom.packages.activatePackage(name);
            } else {
              atom.packages.loadPackage(name);
            }
            if (typeof callback === "function") {
              callback();
            }
            return _this.emitPackageEvent('installed', pack);
          } else {
            if (activateOnFailure) {
              atom.packages.activatePackage(name);
            }
            error = new Error("Installing \u201C" + packageRef + "\u201D failed.");
            error.stdout = stdout;
            error.stderr = stderr;
            error.packageInstallError = !theme;
            _this.emitPackageEvent('install-failed', pack, error);
            return callback(error);
          }
        };
      })(this);
      return this.runCommand(args, exit);
    };

    PackageManager.prototype.uninstall = function(pack, callback) {
      var name;
      name = pack.name;
      if (atom.packages.isPackageActive(name)) {
        atom.packages.deactivatePackage(name);
      }
      return this.runCommand(['uninstall', '--hard', name], (function(_this) {
        return function(code, stdout, stderr) {
          var error;
          if (code === 0) {
            if (atom.packages.isPackageLoaded(name)) {
              atom.packages.unloadPackage(name);
            }
            if (typeof callback === "function") {
              callback();
            }
            return _this.emitPackageEvent('uninstalled', pack);
          } else {
            error = new Error("Uninstalling \u201C" + name + "\u201D failed.");
            error.stdout = stdout;
            error.stderr = stderr;
            _this.emitPackageEvent('uninstall-failed', pack, error);
            return callback(error);
          }
        };
      })(this));
    };

    PackageManager.prototype.canUpgrade = function(installedPackage, availableVersion) {
      var installedVersion;
      if (installedPackage == null) {
        return false;
      }
      installedVersion = installedPackage.metadata.version;
      if (!semver.valid(installedVersion)) {
        return false;
      }
      if (!semver.valid(availableVersion)) {
        return false;
      }
      return semver.gt(availableVersion, installedVersion);
    };

    PackageManager.prototype.getPackageTitle = function(arg) {
      var name;
      name = arg.name;
      return _.undasherize(_.uncamelcase(name));
    };

    PackageManager.prototype.getRepositoryUrl = function(arg) {
      var metadata, ref, ref1, repoUrl, repository;
      metadata = arg.metadata;
      repository = metadata.repository;
      repoUrl = (ref = (ref1 = repository != null ? repository.url : void 0) != null ? ref1 : repository) != null ? ref : '';
      return repoUrl.replace(/\.git$/, '').replace(/\/+$/, '');
    };

    PackageManager.prototype.getAuthorUserName = function(pack) {
      var chunks, repoName, repoUrl;
      if (!(repoUrl = this.getRepositoryUrl(pack))) {
        return null;
      }
      repoName = url.parse(repoUrl).pathname;
      chunks = repoName.match('/(.+?)/');
      return chunks != null ? chunks[1] : void 0;
    };

    PackageManager.prototype.checkNativeBuildTools = function() {
      var deferred;
      deferred = Q.defer();
      this.runCommand(['install', '--check'], function(code, stdout, stderr) {
        if (code === 0) {
          return deferred.resolve();
        } else {
          return deferred.reject(new Error());
        }
      });
      return deferred.promise;
    };

    PackageManager.prototype.emitPackageEvent = function(eventName, pack, error) {
      var ref, ref1, theme;
      theme = (ref = pack.theme) != null ? ref : (ref1 = pack.metadata) != null ? ref1.theme : void 0;
      eventName = theme ? "theme-" + eventName : "package-" + eventName;
      return this.emit(eventName, pack, error);
    };

    return PackageManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvc3luYy1zZXR0aW5ncy9saWIvcGFja2FnZS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSCxrQkFBbUIsT0FBQSxDQUFRLE1BQVI7O0VBQ25CLFVBQVcsT0FBQSxDQUFRLFVBQVI7O0VBQ1osQ0FBQSxHQUFJLE9BQUEsQ0FBUSxHQUFSOztFQUNKLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDVCxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7O0VBRU4sQ0FBQyxDQUFDLDhCQUFGLENBQUE7O0VBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNKLE9BQU8sQ0FBQyxXQUFSLENBQW9CLGNBQXBCOztJQUVhLHdCQUFBO01BQ1gsSUFBQyxDQUFBLGVBQUQsR0FBbUI7SUFEUjs7NkJBR2IsVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLFFBQVA7QUFDVixVQUFBO01BQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBZCxDQUFBO01BQ1YsV0FBQSxHQUFjO01BQ2QsTUFBQSxHQUFTLFNBQUMsS0FBRDtlQUFXLFdBQVcsQ0FBQyxJQUFaLENBQWlCLEtBQWpCO01BQVg7TUFDVCxVQUFBLEdBQWE7TUFDYixNQUFBLEdBQVMsU0FBQyxLQUFEO2VBQVcsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsS0FBaEI7TUFBWDtNQUNULElBQUEsR0FBTyxTQUFDLElBQUQ7ZUFDTCxRQUFBLENBQVMsSUFBVCxFQUFlLFdBQVcsQ0FBQyxJQUFaLENBQWlCLElBQWpCLENBQWYsRUFBdUMsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsSUFBaEIsQ0FBdkM7TUFESztNQUdQLElBQUksQ0FBQyxJQUFMLENBQVUsWUFBVjthQUNJLElBQUEsZUFBQSxDQUFnQjtRQUFDLFNBQUEs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alBwQiIsInNvdXJjZXNDb250ZW50IjpbIiMjIGNvcGllZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL3NldHRpbmdzLXZpZXdcblxuXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0J1ZmZlcmVkUHJvY2Vzc30gPSByZXF1aXJlICdhdG9tJ1xue0VtaXR0ZXJ9ID0gcmVxdWlyZSAnZW1pc3NhcnknXG5RID0gcmVxdWlyZSAncSdcbnNlbXZlciA9IHJlcXVpcmUgJ3NlbXZlcidcbnVybCA9IHJlcXVpcmUgJ3VybCdcblxuUS5zdG9wVW5oYW5kbGVkUmVqZWN0aW9uVHJhY2tpbmcoKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBQYWNrYWdlTWFuYWdlclxuICBFbWl0dGVyLmluY2x1ZGVJbnRvKHRoaXMpXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQHBhY2thZ2VQcm9taXNlcyA9IFtdXG5cbiAgcnVuQ29tbWFuZDogKGFyZ3MsIGNhbGxiYWNrKSAtPlxuICAgIGNvbW1hbmQgPSBhdG9tLnBhY2thZ2VzLmdldEFwbVBhdGgoKVxuICAgIG91dHB1dExpbmVzID0gW11cbiAgICBzdGRvdXQgPSAobGluZXMpIC0+IG91dHB1dExpbmVzLnB1c2gobGluZXMpXG4gICAgZXJyb3JMaW5lcyA9IFtdXG4gICAgc3RkZXJyID0gKGxpbmVzKSAtPiBlcnJvckxpbmVzLnB1c2gobGluZXMpXG4gICAgZXhpdCA9IChjb2RlKSAtPlxuICAgICAgY2FsbGJhY2soY29kZSwgb3V0cHV0TGluZXMuam9pbignXFxuJyksIGVycm9yTGluZXMuam9pbignXFxuJykpXG5cbiAgICBhcmdzLnB1c2goJy0tbm8tY29sb3InKVxuICAgIG5ldyBCdWZmZXJlZFByb2Nlc3Moe2NvbW1hbmQsIGFyZ3MsIHN0ZG91dCwgc3RkZXJyLCBleGl0fSlcblxuICBsb2FkRmVhdHVyZWQ6IChjYWxsYmFjaykgLT5cbiAgICBhcmdzID0gWydmZWF0dXJlZCcsICctLWpzb24nXVxuICAgIHZlcnNpb24gPSBhdG9tLmdldFZlcnNpb24oKVxuICAgIGFyZ3MucHVzaCgnLS1jb21wYXRpYmxlJywgdmVyc2lvbikgaWYgc2VtdmVyLnZhbGlkKHZlcnNpb24pXG5cbiAgICBAcnVuQ29tbWFuZCBhcmdzLCAoY29kZSwgc3Rkb3V0LCBzdGRlcnIpIC0+XG4gICAgICBpZiBjb2RlIGlzIDBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgcGFja2FnZXMgPSBKU09OLnBhcnNlKHN0ZG91dCkgPyBbXVxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIGNhbGxiYWNrKGVycm9yKVxuICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHBhY2thZ2VzKVxuICAgICAgZWxzZVxuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcignRmV0Y2hpbmcgZmVhdHVyZWQgcGFja2FnZXMgYW5kIHRoZW1lcyBmYWlsZWQuJylcbiAgICAgICAgZXJyb3Iuc3Rkb3V0ID0gc3Rkb3V0XG4gICAgICAgIGVycm9yLnN0ZGVyciA9IHN0ZGVyclxuICAgICAgICBjYWxsYmFjayhlcnJvcilcblxuICBsb2FkT3V0ZGF0ZWQ6IChjYWxsYmFjaykgLT5cbiAgICBhcmdzID0gWydvdXRkYXRlZCcsICctLWpzb24nXVxuICAgIHZlcnNpb24gPSBhdG9tLmdldFZlcnNpb24oKVxuICAgIGFyZ3MucHVzaCgnLS1jb21wYXRpYmxlJywgdmVyc2lvbikgaWYgc2VtdmVyLnZhbGlkKHZlcnNpb24pXG5cbiAgICBAcnVuQ29tbWFuZCBhcmdzLCAoY29kZSwgc3Rkb3V0LCBzdGRlcnIpIC0+XG4gICAgICBpZiBjb2RlIGlzIDBcbiAgICAgICAgdHJ5XG4gICAgICAgICAgcGFja2FnZXMgPSBKU09OLnBhcnNlKHN0ZG91dCkgPyBbXVxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIGNhbGxiYWNrKGVycm9yKVxuICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHBhY2thZ2VzKVxuICAgICAgZWxzZVxuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcignRmV0Y2hpbmcgb3V0ZGF0ZWQgcGFja2FnZXMgYW5kIHRoZW1lcyBmYWlsZWQuJylcbiAgICAgICAgZXJyb3Iuc3Rkb3V0ID0gc3Rkb3V0XG4gICAgICAgIGVycm9yLnN0ZGVyciA9IHN0ZGVyclxuICAgICAgICBjYWxsYmFjayhlcnJvcilcblxuICBsb2FkUGFja2FnZTogKHBhY2thZ2VOYW1lLCBjYWxsYmFjaykgLT5cbiAgICBhcmdzID0gWyd2aWV3JywgcGFja2FnZU5hbWUsICctLWpzb24nXVxuXG4gICAgQHJ1bkNvbW1hbmQgYXJncywgKGNvZGUsIHN0ZG91dCwgc3RkZXJyKSAtPlxuICAgICAgaWYgY29kZSBpcyAwXG4gICAgICAgIHRyeVxuICAgICAgICAgIHBhY2thZ2VzID0gSlNPTi5wYXJzZShzdGRvdXQpID8gW11cbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICBjYWxsYmFjayhlcnJvcilcbiAgICAgICAgICByZXR1cm5cblxuICAgICAgICBjYWxsYmFjayhudWxsLCBwYWNrYWdlcylcbiAgICAgIGVsc2VcbiAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoXCJGZXRjaGluZyBwYWNrYWdlICcje3BhY2thZ2VOYW1lfScgZmFpbGVkLlwiKVxuICAgICAgICBlcnJvci5zdGRvdXQgPSBzdGRvdXRcbiAgICAgICAgZXJyb3Iuc3RkZXJyID0gc3RkZXJyXG4gICAgICAgIGNhbGxiYWNrKGVycm9yKVxuXG4gIGdldEZlYXR1cmVkOiAtPlxuICAgIEBmZWF0dXJlZFByb21pc2UgPz0gUS5uYmluZChAbG9hZEZlYXR1cmVkLCB0aGlzKSgpXG5cbiAgZ2V0T3V0ZGF0ZWQ6IC0+XG4gICAgQG91dGRhdGVkUHJvbWlzZSA/PSBRLm5iaW5kKEBsb2FkT3V0ZGF0ZWQsIHRoaXMpKClcblxuICBnZXRQYWNrYWdlOiAocGFja2FnZU5hbWUpIC0+XG4gICAgQHBhY2thZ2VQcm9taXNlc1twYWNrYWdlTmFtZV0gPz0gUS5uYmluZChAbG9hZFBhY2thZ2UsIHRoaXMsIHBhY2thZ2VOYW1lKSgpXG5cbiAgc2VhcmNoOiAocXVlcnksIG9wdGlvbnMgPSB7fSkgLT5cbiAgICBkZWZlcnJlZCA9IFEuZGVmZXIoKVxuXG4gICAgYXJncyA9IFsnc2VhcmNoJywgcXVlcnksICctLWpzb24nXVxuICAgIGlmIG9wdGlvbnMudGhlbWVzXG4gICAgICBhcmdzLnB1c2ggJy0tdGhlbWVzJ1xuICAgIGVsc2UgaWYgb3B0aW9ucy5wYWNrYWdlc1xuICAgICAgYXJncy5wdXNoICctLXBhY2thZ2VzJ1xuXG4gICAgQHJ1bkNvbW1hbmQgYXJncywgKGNvZGUsIHN0ZG91dCwgc3RkZXJyKSAtPlxuICAgICAgaWYgY29kZSBpcyAwXG4gICAgICAgIHRyeVxuICAgICAgICAgIHBhY2thZ2VzID0gSlNPTi5wYXJzZShzdGRvdXQpID8gW11cbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHBhY2thZ2VzKVxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcilcbiAgICAgIGVsc2VcbiAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoXCJTZWFyY2hpbmcgZm9yIFxcdTIwMUMje3F1ZXJ5fVxcdTIwMUQgZmFpbGVkLlwiKVxuICAgICAgICBlcnJvci5zdGRvdXQgPSBzdGRvdXRcbiAgICAgICAgZXJyb3Iuc3RkZXJyID0gc3RkZXJyXG4gICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcilcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICB1cGRhdGU6IChwYWNrLCBuZXdWZXJzaW9uLCBjYWxsYmFjaykgLT5cbiAgICB7bmFtZSwgdGhlbWV9ID0gcGFja1xuXG4gICAgYWN0aXZhdGVPblN1Y2Nlc3MgPSBub3QgdGhlbWUgYW5kIG5vdCBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZURpc2FibGVkKG5hbWUpXG4gICAgYWN0aXZhdGVPbkZhaWx1cmUgPSBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZShuYW1lKVxuICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UobmFtZSkgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUobmFtZSlcbiAgICBhdG9tLnBhY2thZ2VzLnVubG9hZFBhY2thZ2UobmFtZSkgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VMb2FkZWQobmFtZSlcblxuICAgIGFyZ3MgPSBbJ2luc3RhbGwnLCBcIiN7bmFtZX1AI3tuZXdWZXJzaW9ufVwiXVxuICAgIGV4aXQgPSAoY29kZSwgc3Rkb3V0LCBzdGRlcnIpID0+XG4gICAgICBpZiBjb2RlIGlzIDBcbiAgICAgICAgaWYgYWN0aXZhdGVPblN1Y2Nlc3NcbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShuYW1lKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZShuYW1lKVxuXG4gICAgICAgIGNhbGxiYWNrPygpXG4gICAgICAgIEBlbWl0UGFja2FnZUV2ZW50ICd1cGRhdGVkJywgcGFja1xuICAgICAgZWxzZVxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShuYW1lKSBpZiBhY3RpdmF0ZU9uRmFpbHVyZVxuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcihcIlVwZGF0aW5nIHRvIFxcdTIwMUMje25hbWV9QCN7bmV3VmVyc2lvbn1cXHUyMDFEIGZhaWxlZC5cIilcbiAgICAgICAgZXJyb3Iuc3Rkb3V0ID0gc3Rkb3V0XG4gICAgICAgIGVycm9yLnN0ZGVyciA9IHN0ZGVyclxuICAgICAgICBlcnJvci5wYWNrYWdlSW5zdGFsbEVycm9yID0gbm90IHRoZW1lXG4gICAgICAgIEBlbWl0UGFja2FnZUV2ZW50ICd1cGRhdGUtZmFpbGVkJywgcGFjaywgZXJyb3JcbiAgICAgICAgY2FsbGJhY2soZXJyb3IpXG5cbiAgICBAZW1pdCgncGFja2FnZS11cGRhdGluZycsIHBhY2spXG4gICAgQHJ1bkNvbW1hbmQoYXJncywgZXhpdClcblxuICBpbnN0YWxsOiAocGFjaywgY2FsbGJhY2spIC0+XG4gICAge25hbWUsIHZlcnNpb24sIHRoZW1lLCBhcG1JbnN0YWxsU291cmNlfSA9IHBhY2tcbiAgICBhY3RpdmF0ZU9uU3VjY2VzcyA9IG5vdCB0aGVtZSBhbmQgbm90IGF0b20ucGFja2FnZXMuaXNQYWNrYWdlRGlzYWJsZWQobmFtZSlcbiAgICBhY3RpdmF0ZU9uRmFpbHVyZSA9IGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKG5hbWUpXG4gICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShuYW1lKSBpZiBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZShuYW1lKVxuICAgIGF0b20ucGFja2FnZXMudW5sb2FkUGFja2FnZShuYW1lKSBpZiBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUxvYWRlZChuYW1lKVxuXG4gICAgcGFja2FnZVJlZiA9XG4gICAgICBpZiBhcG1JbnN0YWxsU291cmNlIHRoZW4gYXBtSW5zdGFsbFNvdXJjZS5zb3VyY2VcbiAgICAgIGVsc2UgXCIje25hbWV9QCN7dmVyc2lvbn1cIlxuICAgIGFyZ3MgPSBbJ2luc3RhbGwnLCBwYWNrYWdlUmVmXVxuICAgIGV4aXQgPSAoY29kZSwgc3Rkb3V0LCBzdGRlcnIpID0+XG4gICAgICBpZiBjb2RlIGlzIDBcbiAgICAgICAgaWYgYWN0aXZhdGVPblN1Y2Nlc3NcbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShuYW1lKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZShuYW1lKVxuXG4gICAgICAgIGNhbGxiYWNrPygpXG4gICAgICAgIEBlbWl0UGFja2FnZUV2ZW50ICdpbnN0YWxsZWQnLCBwYWNrXG4gICAgICBlbHNlXG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKG5hbWUpIGlmIGFjdGl2YXRlT25GYWlsdXJlXG4gICAgICAgIGVycm9yID0gbmV3IEVycm9yKFwiSW5zdGFsbGluZyBcXHUyMDFDI3twYWNrYWdlUmVmfVxcdTIwMUQgZmFpbGVkLlwiKVxuICAgICAgICBlcnJvci5zdGRvdXQgPSBzdGRvdXRcbiAgICAgICAgZXJyb3Iuc3RkZXJyID0gc3RkZXJyXG4gICAgICAgIGVycm9yLnBhY2thZ2VJbnN0YWxsRXJyb3IgPSBub3QgdGhlbWVcbiAgICAgICAgQGVtaXRQYWNrYWdlRXZlbnQgJ2luc3RhbGwtZmFpbGVkJywgcGFjaywgZXJyb3JcbiAgICAgICAgY2FsbGJhY2soZXJyb3IpXG5cbiAgICBAcnVuQ29tbWFuZChhcmdzLCBleGl0KVxuXG4gIHVuaW5zdGFsbDogKHBhY2ssIGNhbGxiYWNrKSAtPlxuICAgIHtuYW1lfSA9IHBhY2tcblxuICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UobmFtZSkgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUobmFtZSlcblxuICAgIEBydW5Db21tYW5kIFsndW5pbnN0YWxsJywgJy0taGFyZCcsIG5hbWVdLCAoY29kZSwgc3Rkb3V0LCBzdGRlcnIpID0+XG4gICAgICBpZiBjb2RlIGlzIDBcbiAgICAgICAgYXRvbS5wYWNrYWdlcy51bmxvYWRQYWNrYWdlKG5hbWUpIGlmIGF0b20ucGFja2FnZXMuaXNQYWNrYWdlTG9hZGVkKG5hbWUpXG4gICAgICAgIGNhbGxiYWNrPygpXG4gICAgICAgIEBlbWl0UGFja2FnZUV2ZW50ICd1bmluc3RhbGxlZCcsIHBhY2tcbiAgICAgIGVsc2VcbiAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoXCJVbmluc3RhbGxpbmcgXFx1MjAxQyN7bmFtZX1cXHUyMDFEIGZhaWxlZC5cIilcbiAgICAgICAgZXJyb3Iuc3Rkb3V0ID0gc3Rkb3V0XG4gICAgICAgIGVycm9yLnN0ZGVyciA9IHN0ZGVyclxuICAgICAgICBAZW1pdFBhY2thZ2VFdmVudCAndW5pbnN0YWxsLWZhaWxlZCcsIHBhY2ssIGVycm9yXG4gICAgICAgIGNhbGxiYWNrKGVycm9yKVxuXG4gIGNhblVwZ3JhZGU6IChpbnN0YWxsZWRQYWNrYWdlLCBhdmFpbGFibGVWZXJzaW9uKSAtPlxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgaW5zdGFsbGVkUGFja2FnZT9cblxuICAgIGluc3RhbGxlZFZlcnNpb24gPSBpbnN0YWxsZWRQYWNrYWdlLm1ldGFkYXRhLnZlcnNpb25cbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIHNlbXZlci52YWxpZChpbnN0YWxsZWRWZXJzaW9uKVxuICAgIHJldHVybiBmYWxzZSB1bmxlc3Mgc2VtdmVyLnZhbGlkKGF2YWlsYWJsZVZlcnNpb24pXG5cbiAgICBzZW12ZXIuZ3QoYXZhaWxhYmxlVmVyc2lvbiwgaW5zdGFsbGVkVmVyc2lvbilcblxuICBnZXRQYWNrYWdlVGl0bGU6ICh7bmFtZX0pIC0+XG4gICAgXy51bmRhc2hlcml6ZShfLnVuY2FtZWxjYXNlKG5hbWUpKVxuXG4gIGdldFJlcG9zaXRvcnlVcmw6ICh7bWV0YWRhdGF9KSAtPlxuICAgIHtyZXBvc2l0b3J5fSA9IG1ldGFkYXRhXG4gICAgcmVwb1VybCA9IHJlcG9zaXRvcnk/LnVybCA/IHJlcG9zaXRvcnkgPyAnJ1xuICAgIHJlcG9VcmwucmVwbGFjZSgvXFwuZ2l0JC8sICcnKS5yZXBsYWNlKC9cXC8rJC8sICcnKVxuXG4gIGdldEF1dGhvclVzZXJOYW1lOiAocGFjaykgLT5cbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcmVwb1VybCA9IEBnZXRSZXBvc2l0b3J5VXJsKHBhY2spXG4gICAgcmVwb05hbWUgPSB1cmwucGFyc2UocmVwb1VybCkucGF0aG5hbWVcbiAgICBjaHVua3MgPSByZXBvTmFtZS5tYXRjaCAnLyguKz8pLydcbiAgICBjaHVua3M/WzFdXG5cbiAgY2hlY2tOYXRpdmVCdWlsZFRvb2xzOiAtPlxuICAgIGRlZmVycmVkID0gUS5kZWZlcigpXG5cbiAgICBAcnVuQ29tbWFuZCBbJ2luc3RhbGwnLCAnLS1jaGVjayddLCAoY29kZSwgc3Rkb3V0LCBzdGRlcnIpIC0+XG4gICAgICBpZiBjb2RlIGlzIDBcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpXG4gICAgICBlbHNlXG4gICAgICAgIGRlZmVycmVkLnJlamVjdChuZXcgRXJyb3IoKSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICAjIEVtaXRzIHRoZSBhcHByb3ByaWF0ZSBldmVudCBmb3IgdGhlIGdpdmVuIHBhY2thZ2UuXG4gICNcbiAgIyBBbGwgZXZlbnRzIGFyZSBlaXRoZXIgb2YgdGhlIGZvcm0gYHRoZW1lLWZvb2Agb3IgYHBhY2thZ2UtZm9vYCBkZXBlbmRpbmcgb25cbiAgIyB3aGV0aGVyIHRoZSBldmVudCBpcyBmb3IgYSB0aGVtZSBvciBhIG5vcm1hbCBwYWNrYWdlLiBUaGlzIG1ldGhvZCBzdGFuZGFyZGl6ZXNcbiAgIyB0aGUgbG9naWMgdG8gZGV0ZXJtaW5lIGlmIGEgcGFja2FnZSBpcyBhIHRoZW1lIG9yIG5vdCBhbmQgZm9ybWF0cyB0aGUgZXZlbnRcbiAgIyBuYW1lIGFwcHJvcHJpYXRlbHkuXG4gICNcbiAgIyBldmVudE5hbWUgLSBUaGUgZXZlbnQgbmFtZSBzdWZmaXgge1N0cmluZ30gb2YgdGhlIGV2ZW50IHRvIGVtaXQuXG4gICMgcGFjayAtIFRoZSBwYWNrYWdlIGZvciB3aGljaCB0aGUgZXZlbnQgaXMgYmVpbmcgZW1pdHRlZC5cbiAgIyBlcnJvciAtIEFueSBlcnJvciBpbmZvcm1hdGlvbiB0byBiZSBpbmNsdWRlZCBpbiB0aGUgY2FzZSBvZiBhbiBlcnJvci5cbiAgZW1pdFBhY2thZ2VFdmVudDogKGV2ZW50TmFtZSwgcGFjaywgZXJyb3IpIC0+XG4gICAgdGhlbWUgPSBwYWNrLnRoZW1lID8gcGFjay5tZXRhZGF0YT8udGhlbWVcbiAgICBldmVudE5hbWUgPSBpZiB0aGVtZSB0aGVuIFwidGhlbWUtI3tldmVudE5hbWV9XCIgZWxzZSBcInBhY2thZ2UtI3tldmVudE5hbWV9XCJcbiAgICBAZW1pdCBldmVudE5hbWUsIHBhY2ssIGVycm9yXG4iXX0=
