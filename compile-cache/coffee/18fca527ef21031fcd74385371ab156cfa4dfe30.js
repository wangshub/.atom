(function() {
  var BufferedProcess, DESCRIPTION, ForkGistIdInputView, GitHubApi, PackageManager, REMOVE_KEYS, SyncSettings, _, fs, ref,
    hasProp = {}.hasOwnProperty;

  BufferedProcess = require('atom').BufferedProcess;

  fs = require('fs');

  _ = require('underscore-plus');

  ref = [], GitHubApi = ref[0], PackageManager = ref[1];

  ForkGistIdInputView = null;

  DESCRIPTION = 'Atom configuration storage operated by http://atom.io/packages/sync-settings';

  REMOVE_KEYS = ['sync-settings.gistId', 'sync-settings.personalAccessToken', 'sync-settings._analyticsUserId', 'sync-settings._lastBackupHash'];

  SyncSettings = {
    config: require('./config.coffee'),
    activate: function() {
      return setImmediate((function(_this) {
        return function() {
          var mandatorySettingsApplied;
          if (GitHubApi == null) {
            GitHubApi = require('github');
          }
          if (PackageManager == null) {
            PackageManager = require('./package-manager');
          }
          atom.commands.add('atom-workspace', "sync-settings:backup", function() {
            return _this.backup();
          });
          atom.commands.add('atom-workspace', "sync-settings:restore", function() {
            return _this.restore();
          });
          atom.commands.add('atom-workspace', "sync-settings:view-backup", function() {
            return _this.viewBackup();
          });
          atom.commands.add('atom-workspace', "sync-settings:check-backup", function() {
            return _this.checkForUpdate();
          });
          atom.commands.add('atom-workspace', "sync-settings:fork", function() {
            return _this.inputForkGistId();
          });
          mandatorySettingsApplied = _this.checkMandatorySettings();
          if (atom.config.get('sync-settings.checkForUpdatedBackup') && mandatorySettingsApplied) {
            return _this.checkForUpdate();
          }
        };
      })(this));
    },
    deactivate: function() {
      var ref1;
      return (ref1 = this.inputView) != null ? ref1.destroy() : void 0;
    },
    serialize: function() {},
    getGistId: function() {
      var gistId;
      gistId = atom.config.get('sync-settings.gistId');
      if (gistId) {
        gistId = gistId.trim();
      }
      return gistId;
    },
    getPersonalAccessToken: function() {
      var token;
      token = atom.config.get('sync-settings.personalAccessToken');
      if (token) {
        token = token.trim();
      }
      return token;
    },
    checkMandatorySettings: function() {
      var missingSettings;
      missingSettings = [];
      if (!this.getGistId()) {
        missingSettings.push("Gist ID");
      }
      if (!this.getPersonalAccessToken()) {
        missingSettings.push("GitHub personal access token");
      }
      if (missingSettings.length) {
        this.notifyMissingMandatorySettings(missingSettings);
      }
      return missingSettings.length === 0;
    },
    checkForUpdate: function(cb) {
      if (cb == null) {
        cb = null;
      }
      if (this.getGistId()) {
        console.debug('checking latest backup...');
        return this.createClient().gists.get({
          id: this.getGistId()
        }, (function(_this) {
          return function(err, res) {
            var SyntaxError, message, ref1, ref2;
            if (err) {
              console.error("error while retrieving the gist. does it exists?", err);
              try {
                message = JSON.parse(err.message).message;
                if (message === 'Not Found') {
                  message = 'Gist ID Not Found';
                }
              } catch (error1) {
                SyntaxError = error1;
                message = err.message;
              }
              atom.notifications.addError("sync-settings: Error retrieving your settings. (" + message + ")");
              return typeof cb === "function" ? cb() : void 0;
            }
            if ((res != null ? (ref1 = res.history) != null ? (ref2 = ref1[0]) != null ? ref2.version : void 0 : void 0 : void 0) == null) {
              console.error("could not interpret result:", res);
              atom.notifications.addError("sync-settings: Error retrieving your settings.");
              return typeof cb === "function" ? cb() : void 0;
            }
            console.debug("latest backup version " + res.history[0].version);
            if (res.history[0].version !== atom.config.get('sync-settings._lastBackupHash')) {
              _this.notifyNewerBackup();
            } else if (!atom.config.get('sync-settings.quietUpdateCheck')) {
              _this.notifyBackupUptodate();
            }
            return typeof cb === "function" ? cb() : void 0;
          };
        })(this));
      } else {
        return this.notifyMissingMandatorySettings(["Gist ID"]);
      }
    },
    notifyNewerBackup: function() {
      var notification, workspaceElement;
      workspaceElement = atom.views.getView(atom.workspace);
      return notification = atom.notifications.addWarning("sync-settings: Your settings are out of date.", {
        dismissable: true,
        buttons: [
          {
            text: "Backup",
            onDidClick: function() {
              atom.commands.dispatch(workspaceElement, "sync-settings:backup");
              return notification.dismiss();
            }
          }, {
            text: "View backup",
            onDidClick: function() {
              return atom.commands.dispatch(workspaceElement, "sync-settings:view-backup");
            }
          }, {
            text: "Restore",
            onDidClick: function() {
              atom.commands.dispatch(workspaceElement, "sync-settings:restore");
              return notification.dismiss();
            }
          }, {
            text: "Dismiss",
            onDidClick: function() {
              return notification.dismiss();
            }
          }
        ]
      });
    },
    notifyBackupUptodate: function() {
      return atom.notifications.addSuccess("sync-settings: Latest backup is already applied.");
    },
    notifyMissingMandatorySettings: function(missingSettings) {
      var context, errorMsg, notification;
      context = this;
      errorMsg = "sync-settings: Mandatory settings missing: " + missingSettings.join(', ');
      return notification = atom.notifications.addError(errorMsg, {
        dismissable: true,
        buttons: [
          {
            text: "Package settings",
            onDidClick: function() {
              context.goToPackageSettings();
              return notification.dismiss();
            }
          }
        ]
      });
    },
    backup: function(cb) {
      var cmtend, cmtstart, ext, file, files, j, len, ref1, ref2, ref3, ref4, ref5, ref6, ref7;
      if (cb == null) {
        cb = null;
      }
      files = {};
      if (atom.config.get('sync-settings.syncSettings')) {
        files["settings.json"] = {
          content: this.getFilteredSettings()
        };
      }
      if (atom.config.get('sync-settings.syncPackages')) {
        files["packages.json"] = {
          content: JSON.stringify(this.getPackages(), null, '\t')
        };
      }
      if (atom.config.get('sync-settings.syncKeymap')) {
        files["keymap.cson"] = {
          content: (ref1 = this.fileContent(atom.keymaps.getUserKeymapPath())) != null ? ref1 : "# keymap file (not found)"
        };
      }
      if (atom.config.get('sync-settings.syncStyles')) {
        files["styles.less"] = {
          content: (ref2 = this.fileContent(atom.styles.getUserStyleSheetPath())) != null ? ref2 : "// styles file (not found)"
        };
      }
      if (atom.config.get('sync-settings.syncInit')) {
        files["init.coffee"] = {
          content: (ref3 = this.fileContent(atom.config.configDirPath + "/init.coffee")) != null ? ref3 : "# initialization file (not found)"
        };
      }
      if (atom.config.get('sync-settings.syncSnippets')) {
        files["snippets.cson"] = {
          content: (ref4 = this.fileContent(atom.config.configDirPath + "/snippets.cson")) != null ? ref4 : "# snippets file (not found)"
        };
      }
      ref6 = (ref5 = atom.config.get('sync-settings.extraFiles')) != null ? ref5 : [];
      for (j = 0, len = ref6.length; j < len; j++) {
        file = ref6[j];
        ext = file.slice(file.lastIndexOf(".")).toLowerCase();
        cmtstart = "#";
        if (ext === ".less" || ext === ".scss" || ext === ".js") {
          cmtstart = "//";
        }
        if (ext === ".css") {
          cmtstart = "/*";
        }
        cmtend = "";
        if (ext === ".css") {
          cmtend = "*/";
        }
        files[file] = {
          content: (ref7 = this.fileContent(atom.config.configDirPath + ("/" + file))) != null ? ref7 : cmtstart + " " + file + " (not found) " + cmtend
        };
      }
      return this.createClient().gists.edit({
        id: this.getGistId(),
        description: atom.config.get('sync-settings.gistDescription'),
        files: files
      }, function(err, res) {
        var SyntaxError, message;
        if (err) {
          console.error("error backing up data: " + err.message, err);
          try {
            message = JSON.parse(err.message).message;
            if (message === 'Not Found') {
              message = 'Gist ID Not Found';
            }
          } catch (error1) {
            SyntaxError = error1;
            message = err.message;
          }
          atom.notifications.addError("sync-settings: Error backing up your settings. (" + message + ")");
        } else {
          atom.config.set('sync-settings._lastBackupHash', res.history[0].version);
          atom.notifications.addSuccess("sync-settings: Your settings were successfully backed up. <br/><a href='" + res.html_url + "'>Click here to open your Gist.</a>");
        }
        return typeof cb === "function" ? cb(err, res) : void 0;
      });
    },
    viewBackup: function() {
      var Shell, gistId;
      Shell = require('shell');
      gistId = this.getGistId();
      return Shell.openExternal("https://gist.github.com/" + gistId);
    },
    getPackages: function() {
      var apmInstallSource, i, metadata, name, packages, ref1, theme, version;
      packages = [];
      ref1 = this._getAvailablePackageMetadataWithoutDuplicates();
      for (i in ref1) {
        metadata = ref1[i];
        name = metadata.name, version = metadata.version, theme = metadata.theme, apmInstallSource = metadata.apmInstallSource;
        packages.push({
          name: name,
          version: version,
          theme: theme,
          apmInstallSource: apmInstallSource
        });
      }
      return _.sortBy(packages, 'name');
    },
    _getAvailablePackageMetadataWithoutDuplicates: function() {
      var i, j, len, package_metadata, packages, path, path2metadata, pkg_name, pkg_path, ref1, ref2;
      path2metadata = {};
      package_metadata = atom.packages.getAvailablePackageMetadata();
      ref1 = atom.packages.getAvailablePackagePaths();
      for (i = j = 0, len = ref1.length; j < len; i = ++j) {
        path = ref1[i];
        path2metadata[fs.realpathSync(path)] = package_metadata[i];
      }
      packages = [];
      ref2 = atom.packages.getAvailablePackageNames();
      for (i in ref2) {
        pkg_name = ref2[i];
        pkg_path = atom.packages.resolvePackagePath(pkg_name);
        if (path2metadata[pkg_path]) {
          packages.push(path2metadata[pkg_path]);
        } else {
          console.error('could not correlate package name, path, and metadata');
        }
      }
      return packages;
    },
    restore: function(cb) {
      if (cb == null) {
        cb = null;
      }
      return this.createClient().gists.get({
        id: this.getGistId()
      }, (function(_this) {
        return function(err, res) {
          var SyntaxError, callbackAsync, file, filename, message, ref1;
          if (err) {
            console.error("error while retrieving the gist. does it exists?", err);
            try {
              message = JSON.parse(err.message).message;
              if (message === 'Not Found') {
                message = 'Gist ID Not Found';
              }
            } catch (error1) {
              SyntaxError = error1;
              message = err.message;
            }
            atom.notifications.addError("sync-settings: Error retrieving your settings. (" + message + ")");
            return;
          }
          callbackAsync = false;
          ref1 = res.files;
          for (filename in ref1) {
            if (!hasProp.call(ref1, filename)) continue;
            file = ref1[filename];
            switch (filename) {
              case 'settings.json':
                if (atom.config.get('sync-settings.syncSettings')) {
                  _this.applySettings('', JSON.parse(file.content));
                }
                break;
              case 'packages.json':
                if (atom.config.get('sync-settings.syncPackages')) {
                  callbackAsync = true;
                  _this.installMissingPackages(JSON.parse(file.content), cb);
                }
                break;
              case 'keymap.cson':
                if (atom.config.get('sync-settings.syncKeymap')) {
                  fs.writeFileSync(atom.keymaps.getUserKeymapPath(), file.content);
                }
                break;
              case 'styles.less':
                if (atom.config.get('sync-settings.syncStyles')) {
                  fs.writeFileSync(atom.styles.getUserStyleSheetPath(), file.content);
                }
                break;
              case 'init.coffee':
                if (atom.config.get('sync-settings.syncInit')) {
                  fs.writeFileSync(atom.config.configDirPath + "/init.coffee", file.content);
                }
                break;
              case 'snippets.cson':
                if (atom.config.get('sync-settings.syncSnippets')) {
                  fs.writeFileSync(atom.config.configDirPath + "/snippets.cson", file.content);
                }
                break;
              default:
                fs.writeFileSync(atom.config.configDirPath + "/" + filename, file.content);
            }
          }
          atom.config.set('sync-settings._lastBackupHash', res.history[0].version);
          atom.notifications.addSuccess("sync-settings: Your settings were successfully synchronized.");
          if (!callbackAsync) {
            return typeof cb === "function" ? cb() : void 0;
          }
        };
      })(this));
    },
    createClient: function() {
      var github, token;
      token = this.getPersonalAccessToken();
      console.debug("Creating GitHubApi client with token = " + token);
      github = new GitHubApi({
        version: '3.0.0',
        protocol: 'https'
      });
      github.authenticate({
        type: 'oauth',
        token: token
      });
      return github;
    },
    getFilteredSettings: function() {
      var blacklistedKey, blacklistedKeys, j, len, ref1, settings;
      settings = JSON.parse(JSON.stringify(atom.config.settings));
      blacklistedKeys = REMOVE_KEYS.concat((ref1 = atom.config.get('sync-settings.blacklistedKeys')) != null ? ref1 : []);
      for (j = 0, len = blacklistedKeys.length; j < len; j++) {
        blacklistedKey = blacklistedKeys[j];
        blacklistedKey = blacklistedKey.split(".");
        this._removeProperty(settings, blacklistedKey);
      }
      return JSON.stringify(settings, null, '\t');
    },
    _removeProperty: function(obj, key) {
      var currentKey, lastKey;
      lastKey = key.length === 1;
      currentKey = key.shift();
      if (!lastKey && _.isObject(obj[currentKey]) && !_.isArray(obj[currentKey])) {
        return this._removeProperty(obj[currentKey], key);
      } else {
        return delete obj[currentKey];
      }
    },
    goToPackageSettings: function() {
      return atom.workspace.open("atom://config/packages/sync-settings");
    },
    applySettings: function(pref, settings) {
      var colorKeys, isColor, key, keyPath, results, value, valueKeys;
      results = [];
      for (key in settings) {
        value = settings[key];
        keyPath = pref + "." + key;
        isColor = false;
        if (_.isObject(value)) {
          valueKeys = Object.keys(value);
          colorKeys = ['alpha', 'blue', 'green', 'red'];
          isColor = _.isEqual(_.sortBy(valueKeys), colorKeys);
        }
        if (_.isObject(value) && !_.isArray(value) && !isColor) {
          results.push(this.applySettings(keyPath, value));
        } else {
          console.debug("config.set " + keyPath.slice(1) + "=" + value);
          results.push(atom.config.set(keyPath.slice(1), value));
        }
      }
      return results;
    },
    installMissingPackages: function(packages, cb) {
      var available_package, available_packages, concurrency, failed, i, installNextPackage, j, k, len, missing_packages, notifications, p, pkg, ref1, results, succeeded;
      available_packages = this.getPackages();
      missing_packages = [];
      for (j = 0, len = packages.length; j < len; j++) {
        pkg = packages[j];
        available_package = (function() {
          var k, len1, results;
          results = [];
          for (k = 0, len1 = available_packages.length; k < len1; k++) {
            p = available_packages[k];
            if (p.name === pkg.name) {
              results.push(p);
            }
          }
          return results;
        })();
        if (available_package.length === 0) {
          missing_packages.push(pkg);
        } else if (!(!!pkg.apmInstallSource === !!available_package[0].apmInstallSource)) {
          missing_packages.push(pkg);
        }
      }
      if (missing_packages.length === 0) {
        atom.notifications.addInfo("Sync-settings: no packages to install");
        return typeof cb === "function" ? cb() : void 0;
      }
      notifications = {};
      succeeded = [];
      failed = [];
      installNextPackage = (function(_this) {
        return function() {
          var count, failedStr, i;
          if (missing_packages.length > 0) {
            pkg = missing_packages.shift();
            i = succeeded.length + failed.length + Object.keys(notifications).length + 1;
            count = i + missing_packages.length;
            notifications[pkg.name] = atom.notifications.addInfo("Sync-settings: installing " + pkg.name + " (" + i + "/" + count + ")", {
              dismissable: true
            });
            return (function(pkg) {
              return _this.installPackage(pkg, function(error) {
                notifications[pkg.name].dismiss();
                delete notifications[pkg.name];
                if (error != null) {
                  failed.push(pkg.name);
                  atom.notifications.addWarning("Sync-settings: failed to install " + pkg.name);
                } else {
                  succeeded.push(pkg.name);
                }
                return installNextPackage();
              });
            })(pkg);
          } else if (Object.keys(notifications).length === 0) {
            if (failed.length === 0) {
              atom.notifications.addSuccess("Sync-settings: finished installing " + succeeded.length + " packages");
            } else {
              failed.sort();
              failedStr = failed.join(', ');
              atom.notifications.addWarning("Sync-settings: finished installing packages (" + failed.length + " failed: " + failedStr + ")", {
                dismissable: true
              });
            }
            return typeof cb === "function" ? cb() : void 0;
          }
        };
      })(this);
      concurrency = Math.min(missing_packages.length, 8);
      results = [];
      for (i = k = 0, ref1 = concurrency; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
        results.push(installNextPackage());
      }
      return results;
    },
    installPackage: function(pack, cb) {
      var packageManager, type;
      type = pack.theme ? 'theme' : 'package';
      console.info("Installing " + type + " " + pack.name + "...");
      packageManager = new PackageManager();
      return packageManager.install(pack, function(error) {
        var ref1;
        if (error != null) {
          console.error("Installing " + type + " " + pack.name + " failed", (ref1 = error.stack) != null ? ref1 : error, error.stderr);
        } else {
          console.info("Installed " + type + " " + pack.name);
        }
        return typeof cb === "function" ? cb(error) : void 0;
      });
    },
    fileContent: function(filePath) {
      var e;
      try {
        return fs.readFileSync(filePath, {
          encoding: 'utf8'
        }) || null;
      } catch (error1) {
        e = error1;
        console.error("Error reading file " + filePath + ". Probably doesn't exist.", e);
        return null;
      }
    },
    inputForkGistId: function() {
      if (ForkGistIdInputView == null) {
        ForkGistIdInputView = require('./fork-gistid-input-view');
      }
      this.inputView = new ForkGistIdInputView();
      return this.inputView.setCallbackInstance(this);
    },
    forkGistId: function(forkId) {
      return this.createClient().gists.fork({
        id: forkId
      }, (function(_this) {
        return function(err, res) {
          var SyntaxError, message;
          if (err) {
            try {
              message = JSON.parse(err.message).message;
              if (message === "Not Found") {
                message = "Gist ID Not Found";
              }
            } catch (error1) {
              SyntaxError = error1;
              message = err.message;
            }
            atom.notifications.addError("sync-settings: Error forking settings. (" + message + ")");
            return typeof cb === "function" ? cb() : void 0;
          }
          if (res.id) {
            atom.config.set("sync-settings.gistId", res.id);
            atom.notifications.addSuccess("sync-settings: Forked successfully to the new Gist ID " + res.id + " which has been saved to your config.");
          } else {
            atom.notifications.addError("sync-settings: Error forking settings");
          }
          return typeof cb === "function" ? cb() : void 0;
        };
      })(this));
    }
  };

  module.exports = SyncSettings;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvc3luYy1zZXR0aW5ncy9saWIvc3luYy1zZXR0aW5ncy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBLG1IQUFBO0lBQUE7O0VBQUMsa0JBQW1CLE9BQUEsQ0FBUSxNQUFSOztFQUNwQixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUE4QixFQUE5QixFQUFDLGtCQUFELEVBQVk7O0VBQ1osbUJBQUEsR0FBc0I7O0VBR3RCLFdBQUEsR0FBYzs7RUFDZCxXQUFBLEdBQWMsQ0FDWixzQkFEWSxFQUVaLG1DQUZZLEVBR1osZ0NBSFksRUFJWiwrQkFKWTs7RUFPZCxZQUFBLEdBQ0U7SUFBQSxNQUFBLEVBQVEsT0FBQSxDQUFRLGlCQUFSLENBQVI7SUFFQSxRQUFBLEVBQVUsU0FBQTthQUVSLFlBQUEsQ0FBYSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFFWCxjQUFBOztZQUFBLFlBQWEsT0FBQSxDQUFRLFFBQVI7OztZQUNiLGlCQUFrQixPQUFBLENBQVEsbUJBQVI7O1VBRWxCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0Msc0JBQXBDLEVBQTRELFNBQUE7bUJBQzFELEtBQUMsQ0FBQSxNQUFELENBQUE7VUFEMEQsQ0FBNUQ7VUFFQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLHVCQUFwQyxFQUE2RCxTQUFBO21CQUMzRCxLQUFDLENBQUEsT0FBRCxDQUFBO1VBRDJELENBQTdEO1VBRUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQywyQkFBcEMsRUFBaUUsU0FBQTttQkFDL0QsS0FBQyxDQUFBLFVBQUQsQ0FBQTtVQUQrRCxDQUFqRTtVQUVBLElBQUksQ0FB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LENBQUEsSUFBQSxDQUZGO0lBRFUsQ0F2V1o7OztFQTRYRixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQTVZakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIGltcG9ydHNcbntCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSAnYXRvbSdcbmZzID0gcmVxdWlyZSAnZnMnXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuW0dpdEh1YkFwaSwgUGFja2FnZU1hbmFnZXJdID0gW11cbkZvcmtHaXN0SWRJbnB1dFZpZXcgPSBudWxsXG5cbiMgY29uc3RhbnRzXG5ERVNDUklQVElPTiA9ICdBdG9tIGNvbmZpZ3VyYXRpb24gc3RvcmFnZSBvcGVyYXRlZCBieSBodHRwOi8vYXRvbS5pby9wYWNrYWdlcy9zeW5jLXNldHRpbmdzJ1xuUkVNT1ZFX0tFWVMgPSBbXG4gICdzeW5jLXNldHRpbmdzLmdpc3RJZCcsXG4gICdzeW5jLXNldHRpbmdzLnBlcnNvbmFsQWNjZXNzVG9rZW4nLFxuICAnc3luYy1zZXR0aW5ncy5fYW5hbHl0aWNzVXNlcklkJywgICMga2VlcCBsZWdhY3kga2V5IGluIGJsYWNrbGlzdFxuICAnc3luYy1zZXR0aW5ncy5fbGFzdEJhY2t1cEhhc2gnLFxuXVxuXG5TeW5jU2V0dGluZ3MgPVxuICBjb25maWc6IHJlcXVpcmUoJy4vY29uZmlnLmNvZmZlZScpXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgIyBzcGVlZHVwIGFjdGl2YXRpb24gYnkgYXN5bmMgaW5pdGlhbGl6aW5nXG4gICAgc2V0SW1tZWRpYXRlID0+XG4gICAgICAjIGFjdHVhbCBpbml0aWFsaXphdGlvbiBhZnRlciBhdG9tIGhhcyBsb2FkZWRcbiAgICAgIEdpdEh1YkFwaSA/PSByZXF1aXJlICdnaXRodWInXG4gICAgICBQYWNrYWdlTWFuYWdlciA/PSByZXF1aXJlICcuL3BhY2thZ2UtbWFuYWdlcidcblxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgXCJzeW5jLXNldHRpbmdzOmJhY2t1cFwiLCA9PlxuICAgICAgICBAYmFja3VwKClcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsIFwic3luYy1zZXR0aW5nczpyZXN0b3JlXCIsID0+XG4gICAgICAgIEByZXN0b3JlKClcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsIFwic3luYy1zZXR0aW5nczp2aWV3LWJhY2t1cFwiLCA9PlxuICAgICAgICBAdmlld0JhY2t1cCgpXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCBcInN5bmMtc2V0dGluZ3M6Y2hlY2stYmFja3VwXCIsID0+XG4gICAgICAgIEBjaGVja0ZvclVwZGF0ZSgpXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCBcInN5bmMtc2V0dGluZ3M6Zm9ya1wiLCA9PlxuICAgICAgICBAaW5wdXRGb3JrR2lzdElkKClcblxuICAgICAgbWFuZGF0b3J5U2V0dGluZ3NBcHBsaWVkID0gQGNoZWNrTWFuZGF0b3J5U2V0dGluZ3MoKVxuICAgICAgQGNoZWNrRm9yVXBkYXRlKCkgaWYgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLmNoZWNrRm9yVXBkYXRlZEJhY2t1cCcpIGFuZCBtYW5kYXRvcnlTZXR0aW5nc0FwcGxpZWRcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBpbnB1dFZpZXc/LmRlc3Ryb3koKVxuXG4gIHNlcmlhbGl6ZTogLT5cblxuICBnZXRHaXN0SWQ6IC0+XG4gICAgZ2lzdElkID0gYXRvbS5jb25maWcuZ2V0ICdzeW5jLXNldHRpbmdzLmdpc3RJZCdcbiAgICBpZiBnaXN0SWRcbiAgICAgIGdpc3RJZCA9IGdpc3RJZC50cmltKClcbiAgICByZXR1cm4gZ2lzdElkXG5cbiAgZ2V0UGVyc29uYWxBY2Nlc3NUb2tlbjogLT5cbiAgICB0b2tlbiA9IGF0b20uY29uZmlnLmdldCAnc3luYy1zZXR0aW5ncy5wZXJzb25hbEFjY2Vzc1Rva2VuJ1xuICAgIGlmIHRva2VuXG4gICAgICB0b2tlbiA9IHRva2VuLnRyaW0oKVxuICAgIHJldHVybiB0b2tlblxuXG4gIGNoZWNrTWFuZGF0b3J5U2V0dGluZ3M6IC0+XG4gICAgbWlzc2luZ1NldHRpbmdzID0gW11cbiAgICBpZiBub3QgQGdldEdpc3RJZCgpXG4gICAgICBtaXNzaW5nU2V0dGluZ3MucHVzaChcIkdpc3QgSURcIilcbiAgICBpZiBub3QgQGdldFBlcnNvbmFsQWNjZXNzVG9rZW4oKVxuICAgICAgbWlzc2luZ1NldHRpbmdzLnB1c2goXCJHaXRIdWIgcGVyc29uYWwgYWNjZXNzIHRva2VuXCIpXG4gICAgaWYgbWlzc2luZ1NldHRpbmdzLmxlbmd0aFxuICAgICAgQG5vdGlmeU1pc3NpbmdNYW5kYXRvcnlTZXR0aW5ncyhtaXNzaW5nU2V0dGluZ3MpXG4gICAgcmV0dXJuIG1pc3NpbmdTZXR0aW5ncy5sZW5ndGggaXMgMFxuXG4gIGNoZWNrRm9yVXBkYXRlOiAoY2I9bnVsbCkgLT5cbiAgICBpZiBAZ2V0R2lzdElkKClcbiAgICAgIGNvbnNvbGUuZGVidWcoJ2NoZWNraW5nIGxhdGVzdCBiYWNrdXAuLi4nKVxuICAgICAgQGNyZWF0ZUNsaWVudCgpLmdpc3RzLmdldFxuICAgICAgICBpZDogQGdldEdpc3RJZCgpXG4gICAgICAsIChlcnIsIHJlcykgPT5cbiAgICAgICAgaWYgZXJyXG4gICAgICAgICAgY29uc29sZS5lcnJvciBcImVycm9yIHdoaWxlIHJldHJpZXZpbmcgdGhlIGdpc3QuIGRvZXMgaXQgZXhpc3RzP1wiLCBlcnJcbiAgICAgICAgICB0cnlcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGVyci5tZXNzYWdlKS5tZXNzYWdlXG4gICAgICAgICAgICBtZXNzYWdlID0gJ0dpc3QgSUQgTm90IEZvdW5kJyBpZiBtZXNzYWdlIGlzICdOb3QgRm91bmQnXG4gICAgICAgICAgY2F0Y2ggU3ludGF4RXJyb3JcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBlcnIubWVzc2FnZVxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcInN5bmMtc2V0dGluZ3M6IEVycm9yIHJldHJpZXZpbmcgeW91ciBzZXR0aW5ncy4gKFwiK21lc3NhZ2UrXCIpXCJcbiAgICAgICAgICByZXR1cm4gY2I/KClcblxuICAgICAgICBpZiBub3QgcmVzPy5oaXN0b3J5P1swXT8udmVyc2lvbj9cbiAgICAgICAgICBjb25zb2xlLmVycm9yIFwiY291bGQgbm90IGludGVycHJldCByZXN1bHQ6XCIsIHJlc1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcInN5bmMtc2V0dGluZ3M6IEVycm9yIHJldHJpZXZpbmcgeW91ciBzZXR0aW5ncy5cIlxuICAgICAgICAgIHJldHVybiBjYj8oKVxuXG4gICAgICAgIGNvbnNvbGUuZGVidWcoXCJsYXRlc3QgYmFja3VwIHZlcnNpb24gI3tyZXMuaGlzdG9yeVswXS52ZXJzaW9ufVwiKVxuICAgICAgICBpZiByZXMuaGlzdG9yeVswXS52ZXJzaW9uIGlzbnQgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLl9sYXN0QmFja3VwSGFzaCcpXG4gICAgICAgICAgQG5vdGlmeU5ld2VyQmFja3VwKClcbiAgICAgICAgZWxzZSBpZiBub3QgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLnF1aWV0VXBkYXRlQ2hlY2snKVxuICAgICAgICAgIEBub3RpZnlCYWNrdXBVcHRvZGF0ZSgpXG5cbiAgICAgICAgY2I/KClcbiAgICBlbHNlXG4gICAgICBAbm90aWZ5TWlzc2luZ01hbmRhdG9yeVNldHRpbmdzKFtcIkdpc3QgSURcIl0pXG5cbiAgbm90aWZ5TmV3ZXJCYWNrdXA6IC0+XG4gICAgIyB3ZSBuZWVkIHRoZSBhY3R1YWwgZWxlbWVudCBmb3IgZGlzcGF0Y2hpbmcgb24gaXRcbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgIG5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIFwic3luYy1zZXR0aW5nczogWW91ciBzZXR0aW5ncyBhcmUgb3V0IG9mIGRhdGUuXCIsXG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgYnV0dG9uczogW3tcbiAgICAgICAgdGV4dDogXCJCYWNrdXBcIlxuICAgICAgICBvbkRpZENsaWNrOiAtPlxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2ggd29ya3NwYWNlRWxlbWVudCwgXCJzeW5jLXNldHRpbmdzOmJhY2t1cFwiXG4gICAgICAgICAgbm90aWZpY2F0aW9uLmRpc21pc3MoKVxuICAgICAgfSwge1xuICAgICAgICB0ZXh0OiBcIlZpZXcgYmFja3VwXCJcbiAgICAgICAgb25EaWRDbGljazogLT5cbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsIFwic3luYy1zZXR0aW5nczp2aWV3LWJhY2t1cFwiXG4gICAgICB9LCB7XG4gICAgICAgIHRleHQ6IFwiUmVzdG9yZVwiXG4gICAgICAgIG9uRGlkQ2xpY2s6IC0+XG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCBcInN5bmMtc2V0dGluZ3M6cmVzdG9yZVwiXG4gICAgICAgICAgbm90aWZpY2F0aW9uLmRpc21pc3MoKVxuICAgICAgfSwge1xuICAgICAgICB0ZXh0OiBcIkRpc21pc3NcIlxuICAgICAgICBvbkRpZENsaWNrOiAtPiBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICB9XVxuXG4gIG5vdGlmeUJhY2t1cFVwdG9kYXRlOiAtPlxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzIFwic3luYy1zZXR0aW5nczogTGF0ZXN0IGJhY2t1cCBpcyBhbHJlYWR5IGFwcGxpZWQuXCJcblxuXG4gIG5vdGlmeU1pc3NpbmdNYW5kYXRvcnlTZXR0aW5nczogKG1pc3NpbmdTZXR0aW5ncykgLT5cbiAgICBjb250ZXh0ID0gdGhpc1xuICAgIGVycm9yTXNnID0gXCJzeW5jLXNldHRpbmdzOiBNYW5kYXRvcnkgc2V0dGluZ3MgbWlzc2luZzogXCIgKyBtaXNzaW5nU2V0dGluZ3Muam9pbignLCAnKVxuXG4gICAgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIGVycm9yTXNnLFxuICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgIGJ1dHRvbnM6IFt7XG4gICAgICAgIHRleHQ6IFwiUGFja2FnZSBzZXR0aW5nc1wiXG4gICAgICAgIG9uRGlkQ2xpY2s6IC0+XG4gICAgICAgICAgICBjb250ZXh0LmdvVG9QYWNrYWdlU2V0dGluZ3MoKVxuICAgICAgICAgICAgbm90aWZpY2F0aW9uLmRpc21pc3MoKVxuICAgICAgfV1cblxuICBiYWNrdXA6IChjYj1udWxsKSAtPlxuICAgIGZpbGVzID0ge31cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3Muc3luY1NldHRpbmdzJylcbiAgICAgIGZpbGVzW1wic2V0dGluZ3MuanNvblwiXSA9IGNvbnRlbnQ6IEBnZXRGaWx0ZXJlZFNldHRpbmdzKClcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3Muc3luY1BhY2thZ2VzJylcbiAgICAgIGZpbGVzW1wicGFja2FnZXMuanNvblwiXSA9IGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KEBnZXRQYWNrYWdlcygpLCBudWxsLCAnXFx0JylcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3Muc3luY0tleW1hcCcpXG4gICAgICBmaWxlc1tcImtleW1hcC5jc29uXCJdID0gY29udGVudDogKEBmaWxlQ29udGVudCBhdG9tLmtleW1hcHMuZ2V0VXNlcktleW1hcFBhdGgoKSkgPyBcIiMga2V5bWFwIGZpbGUgKG5vdCBmb3VuZClcIlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jU3R5bGVzJylcbiAgICAgIGZpbGVzW1wic3R5bGVzLmxlc3NcIl0gPSBjb250ZW50OiAoQGZpbGVDb250ZW50IGF0b20uc3R5bGVzLmdldFVzZXJTdHlsZVNoZWV0UGF0aCgpKSA/IFwiLy8gc3R5bGVzIGZpbGUgKG5vdCBmb3VuZClcIlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jSW5pdCcpXG4gICAgICBmaWxlc1tcImluaXQuY29mZmVlXCJdID0gY29udGVudDogKEBmaWxlQ29udGVudCBhdG9tLmNvbmZpZy5jb25maWdEaXJQYXRoICsgXCIvaW5pdC5jb2ZmZWVcIikgPyBcIiMgaW5pdGlhbGl6YXRpb24gZmlsZSAobm90IGZvdW5kKVwiXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLnN5bmNTbmlwcGV0cycpXG4gICAgICBmaWxlc1tcInNuaXBwZXRzLmNzb25cIl0gPSBjb250ZW50OiAoQGZpbGVDb250ZW50IGF0b20uY29uZmlnLmNvbmZpZ0RpclBhdGggKyBcIi9zbmlwcGV0cy5jc29uXCIpID8gXCIjIHNuaXBwZXRzIGZpbGUgKG5vdCBmb3VuZClcIlxuXG4gICAgZm9yIGZpbGUgaW4gYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLmV4dHJhRmlsZXMnKSA/IFtdXG4gICAgICBleHQgPSBmaWxlLnNsaWNlKGZpbGUubGFzdEluZGV4T2YoXCIuXCIpKS50b0xvd2VyQ2FzZSgpXG4gICAgICBjbXRzdGFydCA9IFwiI1wiXG4gICAgICBjbXRzdGFydCA9IFwiLy9cIiBpZiBleHQgaW4gW1wiLmxlc3NcIiwgXCIuc2Nzc1wiLCBcIi5qc1wiXVxuICAgICAgY210c3RhcnQgPSBcIi8qXCIgaWYgZXh0IGluIFtcIi5jc3NcIl1cbiAgICAgIGNtdGVuZCA9IFwiXCJcbiAgICAgIGNtdGVuZCA9IFwiKi9cIiBpZiBleHQgaW4gW1wiLmNzc1wiXVxuICAgICAgZmlsZXNbZmlsZV0gPVxuICAgICAgICBjb250ZW50OiAoQGZpbGVDb250ZW50IGF0b20uY29uZmlnLmNvbmZpZ0RpclBhdGggKyBcIi8je2ZpbGV9XCIpID8gXCIje2NtdHN0YXJ0fSAje2ZpbGV9IChub3QgZm91bmQpICN7Y210ZW5kfVwiXG5cbiAgICBAY3JlYXRlQ2xpZW50KCkuZ2lzdHMuZWRpdFxuICAgICAgaWQ6IEBnZXRHaXN0SWQoKVxuICAgICAgZGVzY3JpcHRpb246IGF0b20uY29uZmlnLmdldCAnc3luYy1zZXR0aW5ncy5naXN0RGVzY3JpcHRpb24nXG4gICAgICBmaWxlczogZmlsZXNcbiAgICAsIChlcnIsIHJlcykgLT5cbiAgICAgIGlmIGVyclxuICAgICAgICBjb25zb2xlLmVycm9yIFwiZXJyb3IgYmFja2luZyB1cCBkYXRhOiBcIitlcnIubWVzc2FnZSwgZXJyXG4gICAgICAgIHRyeVxuICAgICAgICAgIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGVyci5tZXNzYWdlKS5tZXNzYWdlXG4gICAgICAgICAgbWVzc2FnZSA9ICdHaXN0IElEIE5vdCBGb3VuZCcgaWYgbWVzc2FnZSBpcyAnTm90IEZvdW5kJ1xuICAgICAgICBjYXRjaCBTeW50YXhFcnJvclxuICAgICAgICAgIG1lc3NhZ2UgPSBlcnIubWVzc2FnZVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJzeW5jLXNldHRpbmdzOiBFcnJvciBiYWNraW5nIHVwIHlvdXIgc2V0dGluZ3MuIChcIittZXNzYWdlK1wiKVwiXG4gICAgICBlbHNlXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnc3luYy1zZXR0aW5ncy5fbGFzdEJhY2t1cEhhc2gnLCByZXMuaGlzdG9yeVswXS52ZXJzaW9uKVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyBcInN5bmMtc2V0dGluZ3M6IFlvdXIgc2V0dGluZ3Mgd2VyZSBzdWNjZXNzZnVsbHkgYmFja2VkIHVwLiA8YnIvPjxhIGhyZWY9J1wiK3Jlcy5odG1sX3VybCtcIic+Q2xpY2sgaGVyZSB0byBvcGVuIHlvdXIgR2lzdC48L2E+XCJcbiAgICAgIGNiPyhlcnIsIHJlcylcblxuICB2aWV3QmFja3VwOiAtPlxuICAgIFNoZWxsID0gcmVxdWlyZSAnc2hlbGwnXG4gICAgZ2lzdElkID0gQGdldEdpc3RJZCgpXG4gICAgU2hlbGwub3BlbkV4dGVybmFsIFwiaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vI3tnaXN0SWR9XCJcblxuICBnZXRQYWNrYWdlczogLT5cbiAgICBwYWNrYWdlcyA9IFtdXG4gICAgZm9yIGksIG1ldGFkYXRhIG9mIEBfZ2V0QXZhaWxhYmxlUGFja2FnZU1ldGFkYXRhV2l0aG91dER1cGxpY2F0ZXMoKVxuICAgICAge25hbWUsIHZlcnNpb24sIHRoZW1lLCBhcG1JbnN0YWxsU291cmNlfSA9IG1ldGFkYXRhXG4gICAgICBwYWNrYWdlcy5wdXNoKHtuYW1lLCB2ZXJzaW9uLCB0aGVtZSwgYXBtSW5zdGFsbFNvdXJjZX0pXG4gICAgXy5zb3J0QnkocGFja2FnZXMsICduYW1lJylcblxuICBfZ2V0QXZhaWxhYmxlUGFja2FnZU1ldGFkYXRhV2l0aG91dER1cGxpY2F0ZXM6IC0+XG4gICAgcGF0aDJtZXRhZGF0YSA9IHt9XG4gICAgcGFja2FnZV9tZXRhZGF0YSA9IGF0b20ucGFja2FnZXMuZ2V0QXZhaWxhYmxlUGFja2FnZU1ldGFkYXRhKClcbiAgICBmb3IgcGF0aCwgaSBpbiBhdG9tLnBhY2thZ2VzLmdldEF2YWlsYWJsZVBhY2thZ2VQYXRocygpXG4gICAgICBwYXRoMm1ldGFkYXRhW2ZzLnJlYWxwYXRoU3luYyhwYXRoKV0gPSBwYWNrYWdlX21ldGFkYXRhW2ldXG5cbiAgICBwYWNrYWdlcyA9IFtdXG4gICAgZm9yIGksIHBrZ19uYW1lIG9mIGF0b20ucGFja2FnZXMuZ2V0QXZhaWxhYmxlUGFja2FnZU5hbWVzKClcbiAgICAgIHBrZ19wYXRoID0gYXRvbS5wYWNrYWdlcy5yZXNvbHZlUGFja2FnZVBhdGgocGtnX25hbWUpXG4gICAgICBpZiBwYXRoMm1ldGFkYXRhW3BrZ19wYXRoXVxuICAgICAgICBwYWNrYWdlcy5wdXNoKHBhdGgybWV0YWRhdGFbcGtnX3BhdGhdKVxuICAgICAgZWxzZVxuICAgICAgICBjb25zb2xlLmVycm9yKCdjb3VsZCBub3QgY29ycmVsYXRlIHBhY2thZ2UgbmFtZSwgcGF0aCwgYW5kIG1ldGFkYXRhJylcbiAgICBwYWNrYWdlc1xuXG4gIHJlc3RvcmU6IChjYj1udWxsKSAtPlxuICAgIEBjcmVhdGVDbGllbnQoKS5naXN0cy5nZXRcbiAgICAgIGlkOiBAZ2V0R2lzdElkKClcbiAgICAsIChlcnIsIHJlcykgPT5cbiAgICAgIGlmIGVyclxuICAgICAgICBjb25zb2xlLmVycm9yIFwiZXJyb3Igd2hpbGUgcmV0cmlldmluZyB0aGUgZ2lzdC4gZG9lcyBpdCBleGlzdHM/XCIsIGVyclxuICAgICAgICB0cnlcbiAgICAgICAgICBtZXNzYWdlID0gSlNPTi5wYXJzZShlcnIubWVzc2FnZSkubWVzc2FnZVxuICAgICAgICAgIG1lc3NhZ2UgPSAnR2lzdCBJRCBOb3QgRm91bmQnIGlmIG1lc3NhZ2UgaXMgJ05vdCBGb3VuZCdcbiAgICAgICAgY2F0Y2ggU3ludGF4RXJyb3JcbiAgICAgICAgICBtZXNzYWdlID0gZXJyLm1lc3NhZ2VcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwic3luYy1zZXR0aW5nczogRXJyb3IgcmV0cmlldmluZyB5b3VyIHNldHRpbmdzLiAoXCIrbWVzc2FnZStcIilcIlxuICAgICAgICByZXR1cm5cblxuICAgICAgY2FsbGJhY2tBc3luYyA9IGZhbHNlXG5cbiAgICAgIGZvciBvd24gZmlsZW5hbWUsIGZpbGUgb2YgcmVzLmZpbGVzXG4gICAgICAgIHN3aXRjaCBmaWxlbmFtZVxuICAgICAgICAgIHdoZW4gJ3NldHRpbmdzLmpzb24nXG4gICAgICAgICAgICBAYXBwbHlTZXR0aW5ncyAnJywgSlNPTi5wYXJzZShmaWxlLmNvbnRlbnQpIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jU2V0dGluZ3MnKVxuXG4gICAgICAgICAgd2hlbiAncGFja2FnZXMuanNvbidcbiAgICAgICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jUGFja2FnZXMnKVxuICAgICAgICAgICAgICBjYWxsYmFja0FzeW5jID0gdHJ1ZVxuICAgICAgICAgICAgICBAaW5zdGFsbE1pc3NpbmdQYWNrYWdlcyBKU09OLnBhcnNlKGZpbGUuY29udGVudCksIGNiXG5cbiAgICAgICAgICB3aGVuICdrZXltYXAuY3NvbidcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMgYXRvbS5rZXltYXBzLmdldFVzZXJLZXltYXBQYXRoKCksIGZpbGUuY29udGVudCBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3Muc3luY0tleW1hcCcpXG5cbiAgICAgICAgICB3aGVuICdzdHlsZXMubGVzcydcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMgYXRvbS5zdHlsZXMuZ2V0VXNlclN0eWxlU2hlZXRQYXRoKCksIGZpbGUuY29udGVudCBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3Muc3luY1N0eWxlcycpXG5cbiAgICAgICAgICB3aGVuICdpbml0LmNvZmZlZSdcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMgYXRvbS5jb25maWcuY29uZmlnRGlyUGF0aCArIFwiL2luaXQuY29mZmVlXCIsIGZpbGUuY29udGVudCBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3Muc3luY0luaXQnKVxuXG4gICAgICAgICAgd2hlbiAnc25pcHBldHMuY3NvbidcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMgYXRvbS5jb25maWcuY29uZmlnRGlyUGF0aCArIFwiL3NuaXBwZXRzLmNzb25cIiwgZmlsZS5jb250ZW50IGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jU25pcHBldHMnKVxuXG4gICAgICAgICAgZWxzZSBmcy53cml0ZUZpbGVTeW5jIFwiI3thdG9tLmNvbmZpZy5jb25maWdEaXJQYXRofS8je2ZpbGVuYW1lfVwiLCBmaWxlLmNvbnRlbnRcblxuICAgICAgYXRvbS5jb25maWcuc2V0KCdzeW5jLXNldHRpbmdzLl9sYXN0QmFja3VwSGFzaCcsIHJlcy5oaXN0b3J5WzBdLnZlcnNpb24pXG5cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzIFwic3luYy1zZXR0aW5nczogWW91ciBzZXR0aW5ncyB3ZXJlIHN1Y2Nlc3NmdWxseSBzeW5jaHJvbml6ZWQuXCJcblxuICAgICAgY2I/KCkgdW5sZXNzIGNhbGxiYWNrQXN5bmNcblxuICBjcmVhdGVDbGllbnQ6IC0+XG4gICAgdG9rZW4gPSBAZ2V0UGVyc29uYWxBY2Nlc3NUb2tlbigpXG4gICAgY29uc29sZS5kZWJ1ZyBcIkNyZWF0aW5nIEdpdEh1YkFwaSBjbGllbnQgd2l0aCB0b2tlbiA9ICN7dG9rZW59XCJcbiAgICBnaXRodWIgPSBuZXcgR2l0SHViQXBpXG4gICAgICB2ZXJzaW9uOiAnMy4wLjAnXG4gICAgICAjIGRlYnVnOiB0cnVlXG4gICAgICBwcm90b2NvbDogJ2h0dHBzJ1xuICAgIGdpdGh1Yi5hdXRoZW50aWNhdGVcbiAgICAgIHR5cGU6ICdvYXV0aCdcbiAgICAgIHRva2VuOiB0b2tlblxuICAgIGdpdGh1YlxuXG4gIGdldEZpbHRlcmVkU2V0dGluZ3M6IC0+XG4gICAgIyBfLmNsb25lKCkgZG9lc24ndCBkZWVwIGNsb25lIHRodXMgd2UgYXJlIHVzaW5nIEpTT04gcGFyc2UgdHJpY2tcbiAgICBzZXR0aW5ncyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYXRvbS5jb25maWcuc2V0dGluZ3MpKVxuICAgIGJsYWNrbGlzdGVkS2V5cyA9IFJFTU9WRV9LRVlTLmNvbmNhdChhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3MuYmxhY2tsaXN0ZWRLZXlzJykgPyBbXSlcbiAgICBmb3IgYmxhY2tsaXN0ZWRLZXkgaW4gYmxhY2tsaXN0ZWRLZXlzXG4gICAgICBibGFja2xpc3RlZEtleSA9IGJsYWNrbGlzdGVkS2V5LnNwbGl0KFwiLlwiKVxuICAgICAgQF9yZW1vdmVQcm9wZXJ0eShzZXR0aW5ncywgYmxhY2tsaXN0ZWRLZXkpXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHNldHRpbmdzLCBudWxsLCAnXFx0JylcblxuICBfcmVtb3ZlUHJvcGVydHk6IChvYmosIGtleSkgLT5cbiAgICBsYXN0S2V5ID0ga2V5Lmxlbmd0aCBpcyAxXG4gICAgY3VycmVudEtleSA9IGtleS5zaGlmdCgpXG5cbiAgICBpZiBub3QgbGFzdEtleSBhbmQgXy5pc09iamVjdChvYmpbY3VycmVudEtleV0pIGFuZCBub3QgXy5pc0FycmF5KG9ialtjdXJyZW50S2V5XSlcbiAgICAgIEBfcmVtb3ZlUHJvcGVydHkob2JqW2N1cnJlbnRLZXldLCBrZXkpXG4gICAgZWxzZVxuICAgICAgZGVsZXRlIG9ialtjdXJyZW50S2V5XVxuXG4gIGdvVG9QYWNrYWdlU2V0dGluZ3M6IC0+XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihcImF0b206Ly9jb25maWcvcGFja2FnZXMvc3luYy1zZXR0aW5nc1wiKVxuXG4gIGFwcGx5U2V0dGluZ3M6IChwcmVmLCBzZXR0aW5ncykgLT5cbiAgICBmb3Iga2V5LCB2YWx1ZSBvZiBzZXR0aW5nc1xuICAgICAga2V5UGF0aCA9IFwiI3twcmVmfS4je2tleX1cIlxuICAgICAgaXNDb2xvciA9IGZhbHNlXG4gICAgICBpZiBfLmlzT2JqZWN0KHZhbHVlKVxuICAgICAgICB2YWx1ZUtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSlcbiAgICAgICAgY29sb3JLZXlzID0gWydhbHBoYScsICdibHVlJywgJ2dyZWVuJywgJ3JlZCddXG4gICAgICAgIGlzQ29sb3IgPSBfLmlzRXF1YWwoXy5zb3J0QnkodmFsdWVLZXlzKSwgY29sb3JLZXlzKVxuICAgICAgaWYgXy5pc09iamVjdCh2YWx1ZSkgYW5kIG5vdCBfLmlzQXJyYXkodmFsdWUpIGFuZCBub3QgaXNDb2xvclxuICAgICAgICBAYXBwbHlTZXR0aW5ncyBrZXlQYXRoLCB2YWx1ZVxuICAgICAgZWxzZVxuICAgICAgICBjb25zb2xlLmRlYnVnIFwiY29uZmlnLnNldCAje2tleVBhdGhbMS4uLl19PSN7dmFsdWV9XCJcbiAgICAgICAgYXRvbS5jb25maWcuc2V0IGtleVBhdGhbMS4uLl0sIHZhbHVlXG5cbiAgaW5zdGFsbE1pc3NpbmdQYWNrYWdlczogKHBhY2thZ2VzLCBjYikgLT5cbiAgICBhdmFpbGFibGVfcGFja2FnZXMgPSBAZ2V0UGFja2FnZXMoKVxuICAgIG1pc3NpbmdfcGFja2FnZXMgPSBbXVxuICAgIGZvciBwa2cgaW4gcGFja2FnZXNcbiAgICAgIGF2YWlsYWJsZV9wYWNrYWdlID0gKHAgZm9yIHAgaW4gYXZhaWxhYmxlX3BhY2thZ2VzIHdoZW4gcC5uYW1lIGlzIHBrZy5uYW1lKVxuICAgICAgaWYgYXZhaWxhYmxlX3BhY2thZ2UubGVuZ3RoIGlzIDBcbiAgICAgICAgIyBtaXNzaW5nIGlmIG5vdCB5ZXQgaW5zdGFsbGVkXG4gICAgICAgIG1pc3NpbmdfcGFja2FnZXMucHVzaChwa2cpXG4gICAgICBlbHNlIGlmIG5vdCghIXBrZy5hcG1JbnN0YWxsU291cmNlIGlzICEhYXZhaWxhYmxlX3BhY2thZ2VbMF0uYXBtSW5zdGFsbFNvdXJjZSlcbiAgICAgICAgIyBvciBpbnN0YWxsZWQgYnV0IHdpdGggZGlmZmVyZW50IGFwbSBpbnN0YWxsIHNvdXJjZVxuICAgICAgICBtaXNzaW5nX3BhY2thZ2VzLnB1c2gocGtnKVxuICAgIGlmIG1pc3NpbmdfcGFja2FnZXMubGVuZ3RoIGlzIDBcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvIFwiU3luYy1zZXR0aW5nczogbm8gcGFja2FnZXMgdG8gaW5zdGFsbFwiXG4gICAgICByZXR1cm4gY2I/KClcblxuICAgIG5vdGlmaWNhdGlvbnMgPSB7fVxuICAgIHN1Y2NlZWRlZCA9IFtdXG4gICAgZmFpbGVkID0gW11cbiAgICBpbnN0YWxsTmV4dFBhY2thZ2UgPSA9PlxuICAgICAgaWYgbWlzc2luZ19wYWNrYWdlcy5sZW5ndGggPiAwXG4gICAgICAgICMgc3RhcnQgaW5zdGFsbGluZyBuZXh0IHBhY2thZ2VcbiAgICAgICAgcGtnID0gbWlzc2luZ19wYWNrYWdlcy5zaGlmdCgpXG4gICAgICAgIGkgPSBzdWNjZWVkZWQubGVuZ3RoICsgZmFpbGVkLmxlbmd0aCArIE9iamVjdC5rZXlzKG5vdGlmaWNhdGlvbnMpLmxlbmd0aCArIDFcbiAgICAgICAgY291bnQgPSBpICsgbWlzc2luZ19wYWNrYWdlcy5sZW5ndGhcbiAgICAgICAgbm90aWZpY2F0aW9uc1twa2cubmFtZV0gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyBcIlN5bmMtc2V0dGluZ3M6IGluc3RhbGxpbmcgI3twa2cubmFtZX0gKCN7aX0vI3tjb3VudH0pXCIsIHtkaXNtaXNzYWJsZTogdHJ1ZX1cbiAgICAgICAgZG8gKHBrZykgPT5cbiAgICAgICAgICBAaW5zdGFsbFBhY2thZ2UgcGtnLCAoZXJyb3IpIC0+XG4gICAgICAgICAgICAjIGluc3RhbGxhdGlvbiBvZiBwYWNrYWdlIGZpbmlzaGVkXG4gICAgICAgICAgICBub3RpZmljYXRpb25zW3BrZy5uYW1lXS5kaXNtaXNzKClcbiAgICAgICAgICAgIGRlbGV0ZSBub3RpZmljYXRpb25zW3BrZy5uYW1lXVxuICAgICAgICAgICAgaWYgZXJyb3I/XG4gICAgICAgICAgICAgIGZhaWxlZC5wdXNoKHBrZy5uYW1lKVxuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyBcIlN5bmMtc2V0dGluZ3M6IGZhaWxlZCB0byBpbnN0YWxsICN7cGtnLm5hbWV9XCJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgc3VjY2VlZGVkLnB1c2gocGtnLm5hbWUpXG4gICAgICAgICAgICAjIHRyaWdnZXIgbmV4dCBwYWNrYWdlXG4gICAgICAgICAgICBpbnN0YWxsTmV4dFBhY2thZ2UoKVxuICAgICAgZWxzZSBpZiBPYmplY3Qua2V5cyhub3RpZmljYXRpb25zKS5sZW5ndGggaXMgMFxuICAgICAgICAjIGxhc3QgcGFja2FnZSBpbnN0YWxsYXRpb24gZmluaXNoZWRcbiAgICAgICAgaWYgZmFpbGVkLmxlbmd0aCBpcyAwXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MgXCJTeW5jLXNldHRpbmdzOiBmaW5pc2hlZCBpbnN0YWxsaW5nICN7c3VjY2VlZGVkLmxlbmd0aH0gcGFja2FnZXNcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgZmFpbGVkLnNvcnQoKVxuICAgICAgICAgIGZhaWxlZFN0ciA9IGZhaWxlZC5qb2luKCcsICcpXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgXCJTeW5jLXNldHRpbmdzOiBmaW5pc2hlZCBpbnN0YWxsaW5nIHBhY2thZ2VzICgje2ZhaWxlZC5sZW5ndGh9IGZhaWxlZDogI3tmYWlsZWRTdHJ9KVwiLCB7ZGlzbWlzc2FibGU6IHRydWV9XG4gICAgICAgIGNiPygpXG4gICAgIyBzdGFydCBhcyBtYW55IHBhY2thZ2UgaW5zdGFsbGF0aW9ucyBpbiBwYXJhbGxlbCBhcyBkZXNpcmVkXG4gICAgY29uY3VycmVuY3kgPSBNYXRoLm1pbiBtaXNzaW5nX3BhY2thZ2VzLmxlbmd0aCwgOFxuICAgIGZvciBpIGluIFswLi4uY29uY3VycmVuY3ldXG4gICAgICBpbnN0YWxsTmV4dFBhY2thZ2UoKVxuXG4gIGluc3RhbGxQYWNrYWdlOiAocGFjaywgY2IpIC0+XG4gICAgdHlwZSA9IGlmIHBhY2sudGhlbWUgdGhlbiAndGhlbWUnIGVsc2UgJ3BhY2thZ2UnXG4gICAgY29uc29sZS5pbmZvKFwiSW5zdGFsbGluZyAje3R5cGV9ICN7cGFjay5uYW1lfS4uLlwiKVxuICAgIHBhY2thZ2VNYW5hZ2VyID0gbmV3IFBhY2thZ2VNYW5hZ2VyKClcbiAgICBwYWNrYWdlTWFuYWdlci5pbnN0YWxsIHBhY2ssIChlcnJvcikgLT5cbiAgICAgIGlmIGVycm9yP1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiSW5zdGFsbGluZyAje3R5cGV9ICN7cGFjay5uYW1lfSBmYWlsZWRcIiwgZXJyb3Iuc3RhY2sgPyBlcnJvciwgZXJyb3Iuc3RkZXJyKVxuICAgICAgZWxzZVxuICAgICAgICBjb25zb2xlLmluZm8oXCJJbnN0YWxsZWQgI3t0eXBlfSAje3BhY2submFtZX1cIilcbiAgICAgIGNiPyhlcnJvcilcblxuICBmaWxlQ29udGVudDogKGZpbGVQYXRoKSAtPlxuICAgIHRyeVxuICAgICAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwge2VuY29kaW5nOiAndXRmOCd9KSBvciBudWxsXG4gICAgY2F0Y2ggZVxuICAgICAgY29uc29sZS5lcnJvciBcIkVycm9yIHJlYWRpbmcgZmlsZSAje2ZpbGVQYXRofS4gUHJvYmFibHkgZG9lc24ndCBleGlzdC5cIiwgZVxuICAgICAgbnVsbFxuXG4gIGlucHV0Rm9ya0dpc3RJZDogLT5cbiAgICBGb3JrR2lzdElkSW5wdXRWaWV3ID89IHJlcXVpcmUgJy4vZm9yay1naXN0aWQtaW5wdXQtdmlldydcbiAgICBAaW5wdXRWaWV3ID0gbmV3IEZvcmtHaXN0SWRJbnB1dFZpZXcoKVxuICAgIEBpbnB1dFZpZXcuc2V0Q2FsbGJhY2tJbnN0YW5jZSh0aGlzKVxuXG4gIGZvcmtHaXN0SWQ6IChmb3JrSWQpIC0+XG4gICAgQGNyZWF0ZUNsaWVudCgpLmdpc3RzLmZvcmtcbiAgICAgIGlkOiBmb3JrSWRcbiAgICAsIChlcnIsIHJlcykgPT5cbiAgICAgIGlmIGVyclxuICAgICAgICB0cnlcbiAgICAgICAgICBtZXNzYWdlID0gSlNPTi5wYXJzZShlcnIubWVzc2FnZSkubWVzc2FnZVxuICAgICAgICAgIG1lc3NhZ2UgPSBcIkdpc3QgSUQgTm90IEZvdW5kXCIgaWYgbWVzc2FnZSBpcyBcIk5vdCBGb3VuZFwiXG4gICAgICAgIGNhdGNoIFN5bnRheEVycm9yXG4gICAgICAgICAgbWVzc2FnZSA9IGVyci5tZXNzYWdlXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcInN5bmMtc2V0dGluZ3M6IEVycm9yIGZvcmtpbmcgc2V0dGluZ3MuIChcIittZXNzYWdlK1wiKVwiXG4gICAgICAgIHJldHVybiBjYj8oKVxuXG4gICAgICBpZiByZXMuaWRcbiAgICAgICAgYXRvbS5jb25maWcuc2V0IFwic3luYy1zZXR0aW5ncy5naXN0SWRcIiwgcmVzLmlkXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzIFwic3luYy1zZXR0aW5nczogRm9ya2VkIHN1Y2Nlc3NmdWxseSB0byB0aGUgbmV3IEdpc3QgSUQgXCIgKyByZXMuaWQgKyBcIiB3aGljaCBoYXMgYmVlbiBzYXZlZCB0byB5b3VyIGNvbmZpZy5cIlxuICAgICAgZWxzZVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJzeW5jLXNldHRpbmdzOiBFcnJvciBmb3JraW5nIHNldHRpbmdzXCJcblxuICAgICAgY2I/KClcblxubW9kdWxlLmV4cG9ydHMgPSBTeW5jU2V0dGluZ3NcbiJdfQ==
