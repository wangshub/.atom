(function() {
  var BufferedProcess, PlainMessageView, error, exec, fs, getProjectPath, panel, path, simpleExec,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  BufferedProcess = require('atom').BufferedProcess;

  path = require('path');

  fs = require("fs");

  exec = require('child_process').exec;

  PlainMessageView = null;

  panel = null;

  error = function(message, className) {
    var MessagePanelView, ref;
    if (!panel) {
      ref = require("atom-message-panel"), MessagePanelView = ref.MessagePanelView, PlainMessageView = ref.PlainMessageView;
      panel = new MessagePanelView({
        title: "Atom Ctags"
      });
    }
    panel.attach();
    return panel.add(new PlainMessageView({
      message: message,
      className: className || "text-error",
      raw: true
    }));
  };

  simpleExec = function(command, exit) {
    return exec(command, function(error, stdout, stderr) {
      if (stdout) {
        console.log('stdout: ' + stdout);
      }
      if (stderr) {
        console.log('stderr: ' + stderr);
      }
      if (error) {
        return console.log('exec error: ' + error);
      }
    });
  };

  getProjectPath = function(codepath) {
    var dirPath, directory, i, len, ref;
    ref = atom.project.getDirectories();
    for (i = 0, len = ref.length; i < len; i++) {
      directory = ref[i];
      dirPath = directory.getPath();
      if (dirPath === codepath || directory.contains(codepath)) {
        return dirPath;
      }
    }
  };

  module.exports = function(codepath, isAppend, cmdArgs, callback) {
    var args, childProcess, command, ctagsFile, exit, genPath, projectCtagsFile, projectPath, stderr, t, tags, tagsPath, timeout;
    tags = [];
    command = atom.config.get("atom-ctags.cmd").trim();
    if (command === "") {
      command = path.resolve(__dirname, '..', 'vendor', "ctags-" + process.platform);
    }
    ctagsFile = require.resolve('./.ctags');
    projectPath = getProjectPath(codepath);
    projectCtagsFile = path.join(projectPath, ".ctags");
    if (fs.existsSync(projectCtagsFile)) {
      ctagsFile = projectCtagsFile;
    }
    tagsPath = path.join(projectPath, ".tags");
    if (isAppend) {
      genPath = path.join(projectPath, ".tags1");
    } else {
      genPath = tagsPath;
    }
    args = [];
    if (cmdArgs) {
      args.push.apply(args, cmdArgs);
    }
    args.push("--options=" + ctagsFile, '--fields=+KSn', '--excmd=p');
    args.push('-u', '-R', '-f', genPath, codepath);
    stderr = function(data) {
      return console.error("atom-ctags: command error, " + data, genPath);
    };
    exit = function() {
      var ref;
      clearTimeout(t);
      if (isAppend) {
        if (ref = process.platform, indexOf.call('win32', ref) >= 0) {
          simpleExec("type '" + tagsPath + "' | findstr /V /C:'" + codepath + "' > '" + tagsPath + "2' & ren '" + tagsPath + "2' '" + tagsPath + "' & more +6 '" + genPath + "' >> '" + tagsPath + "'");
        } else {
          simpleExec("grep -v '" + codepath + "' '" + tagsPath + "' > '" + tagsPath + "2'; mv '" + tagsPath + "2' '" + tagsPath + "'; tail -n +7 '" + genPath + "' >> '" + tagsPath + "'");
        }
      }
      return callback(genPath);
    };
    childProcess = new BufferedProcess({
      command: command,
      args: args,
      stderr: stderr,
      exit: exit
    });
    timeout = atom.config.get('atom-ctags.buildTimeout');
    return t = setTimeout(function() {
      childProcess.kill();
      return error("Stopped: Build more than " + (timeout / 1000) + " seconds, check if " + codepath + " contain too many files.<br>\n        Suggest that add CmdArgs at atom-ctags package setting, example:<br>\n            --exclude=some/path --exclude=some/other");
    }, timeout);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvYXRvbS1jdGFncy9saWIvdGFnLWdlbmVyYXRvci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJGQUFBO0lBQUE7O0VBQUMsa0JBQW1CLE9BQUEsQ0FBUSxNQUFSOztFQUNwQixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQUF3QixDQUFDOztFQUVoQyxnQkFBQSxHQUFtQjs7RUFDbkIsS0FBQSxHQUFROztFQUNSLEtBQUEsR0FBUSxTQUFDLE9BQUQsRUFBVSxTQUFWO0FBQ04sUUFBQTtJQUFBLElBQUcsQ0FBSSxLQUFQO01BQ0UsTUFBdUMsT0FBQSxDQUFRLG9CQUFSLENBQXZDLEVBQUMsdUNBQUQsRUFBbUI7TUFDbkIsS0FBQSxHQUFZLElBQUEsZ0JBQUEsQ0FBaUI7UUFBQSxLQUFBLEVBQU8sWUFBUDtPQUFqQixFQUZkOztJQUlBLEtBQUssQ0FBQyxNQUFOLENBQUE7V0FDQSxLQUFLLENBQUMsR0FBTixDQUFjLElBQUEsZ0JBQUEsQ0FDWjtNQUFBLE9BQUEsRUFBUyxPQUFUO01BQ0EsU0FBQSxFQUFXLFNBQUEsSUFBYSxZQUR4QjtNQUVBLEdBQUEsRUFBSyxJQUZMO0tBRFksQ0FBZDtFQU5NOztFQVdSLFVBQUEsR0FBYSxTQUFDLE9BQUQsRUFBVSxJQUFWO1dBQ1gsSUFBQSxDQUFLLE9BQUwsRUFBYyxTQUFDLEtBQUQsRUFBUSxNQUFSLEVBQWdCLE1BQWhCO01BQ1osSUFBb0MsTUFBcEM7UUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFVBQUEsR0FBYSxNQUF6QixFQUFBOztNQUNBLElBQW9DLE1BQXBDO1FBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFBLEdBQWEsTUFBekIsRUFBQTs7TUFDQSxJQUF1QyxL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VjtNQUFnQixRQUFBLE1BQWhCO01BQXdCLE1BQUEsSUFBeEI7S0FBaEI7SUFFbkIsT0FBQSxHQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5QkFBaEI7V0FDVixDQUFBLEdBQUksVUFBQSxDQUFXLFNBQUE7TUFDYixZQUFZLENBQUMsSUFBYixDQUFBO2FBQ0EsS0FBQSxDQUFNLDJCQUFBLEdBQ29CLENBQUMsT0FBQSxHQUFRLElBQVQsQ0FEcEIsR0FDa0MscUJBRGxDLEdBQ3VELFFBRHZELEdBQ2dFLGtLQUR0RTtJQUZhLENBQVgsRUFNRixPQU5FO0VBekNXO0FBN0JqQiIsInNvdXJjZXNDb250ZW50IjpbIntCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSAnYXRvbSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlIFwiZnNcIlxuZXhlYyA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5leGVjXG5cblBsYWluTWVzc2FnZVZpZXcgPSBudWxsXG5wYW5lbCA9IG51bGxcbmVycm9yID0gKG1lc3NhZ2UsIGNsYXNzTmFtZSkgLT5cbiAgaWYgbm90IHBhbmVsXG4gICAge01lc3NhZ2VQYW5lbFZpZXcsIFBsYWluTWVzc2FnZVZpZXd9ID0gcmVxdWlyZSBcImF0b20tbWVzc2FnZS1wYW5lbFwiXG4gICAgcGFuZWwgPSBuZXcgTWVzc2FnZVBhbmVsVmlldyB0aXRsZTogXCJBdG9tIEN0YWdzXCJcblxuICBwYW5lbC5hdHRhY2goKVxuICBwYW5lbC5hZGQgbmV3IFBsYWluTWVzc2FnZVZpZXdcbiAgICBtZXNzYWdlOiBtZXNzYWdlXG4gICAgY2xhc3NOYW1lOiBjbGFzc05hbWUgfHwgXCJ0ZXh0LWVycm9yXCJcbiAgICByYXc6IHRydWVcblxuc2ltcGxlRXhlYyA9IChjb21tYW5kLCBleGl0KS0+XG4gIGV4ZWMgY29tbWFuZCwgKGVycm9yLCBzdGRvdXQsIHN0ZGVyciktPlxuICAgIGNvbnNvbGUubG9nKCdzdGRvdXQ6ICcgKyBzdGRvdXQpIGlmIHN0ZG91dFxuICAgIGNvbnNvbGUubG9nKCdzdGRlcnI6ICcgKyBzdGRlcnIpIGlmIHN0ZGVyclxuICAgIGNvbnNvbGUubG9nKCdleGVjIGVycm9yOiAnICsgZXJyb3IpIGlmIGVycm9yXG5cbmdldFByb2plY3RQYXRoID0gKGNvZGVwYXRoKSAtPlxuICBmb3IgZGlyZWN0b3J5IGluIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpXG4gICAgZGlyUGF0aCA9IGRpcmVjdG9yeS5nZXRQYXRoKClcbiAgICByZXR1cm4gZGlyUGF0aCBpZiBkaXJQYXRoIGlzIGNvZGVwYXRoIG9yIGRpcmVjdG9yeS5jb250YWlucyhjb2RlcGF0aClcblxubW9kdWxlLmV4cG9ydHMgPSAoY29kZXBhdGgsIGlzQXBwZW5kLCBjbWRBcmdzLCBjYWxsYmFjayktPlxuICB0YWdzID0gW11cbiAgY29tbWFuZCA9IGF0b20uY29uZmlnLmdldChcImF0b20tY3RhZ3MuY21kXCIpLnRyaW0oKVxuICBpZiBjb21tYW5kID09IFwiXCJcbiAgICBjb21tYW5kID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJ3ZlbmRvcicsIFwiY3RhZ3MtI3twcm9jZXNzLnBsYXRmb3JtfVwiKVxuICBjdGFnc0ZpbGUgPSByZXF1aXJlLnJlc29sdmUoJy4vLmN0YWdzJylcblxuICBwcm9qZWN0UGF0aCA9IGdldFByb2plY3RQYXRoKGNvZGVwYXRoKVxuICBwcm9qZWN0Q3RhZ3NGaWxlID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCBcIi5jdGFnc1wiKVxuICBpZiBmcy5leGlzdHNTeW5jKHByb2plY3RDdGFnc0ZpbGUpXG4gICAgY3RhZ3NGaWxlID0gcHJvamVjdEN0YWdzRmlsZVxuXG4gIHRhZ3NQYXRoID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCBcIi50YWdzXCIpXG4gIGlmIGlzQXBwZW5kXG4gICAgZ2VuUGF0aCA9IHBhdGguam9pbihwcm9qZWN0UGF0aCwgXCIudGFnczFcIilcbiAgZWxzZVxuICAgIGdlblBhdGggPSB0YWdzUGF0aFxuXG4gIGFyZ3MgPSBbXVxuICBhcmdzLnB1c2ggY21kQXJncy4uLiBpZiBjbWRBcmdzXG5cbiAgYXJncy5wdXNoKFwiLS1vcHRpb25zPSN7Y3RhZ3NGaWxlfVwiLCAnLS1maWVsZHM9K0tTbicsICctLWV4Y21kPXAnKVxuICBhcmdzLnB1c2goJy11JywgJy1SJywgJy1mJywgZ2VuUGF0aCwgY29kZXBhdGgpXG5cbiAgc3RkZXJyID0gKGRhdGEpLT5cbiAgICBjb25zb2xlLmVycm9yKFwiYXRvbS1jdGFnczogY29tbWFuZCBlcnJvciwgXCIgKyBkYXRhLCBnZW5QYXRoKVxuXG4gIGV4aXQgPSAtPlxuICAgIGNsZWFyVGltZW91dCh0KVxuXG4gICAgaWYgaXNBcHBlbmRcbiAgICAgIGlmIHByb2Nlc3MucGxhdGZvcm0gaW4gJ3dpbjMyJ1xuICAgICAgICBzaW1wbGVFeGVjIFwidHlwZSAnI3t0YWdzUGF0aH0nIHwgZmluZHN0ciAvViAvQzonI3tjb2RlcGF0aH0nID4gJyN7dGFnc1BhdGh9MicgJiByZW4gJyN7dGFnc1BhdGh9MicgJyN7dGFnc1BhdGh9JyAmIG1vcmUgKzYgJyN7Z2VuUGF0aH0nID4+ICcje3RhZ3NQYXRofSdcIlxuICAgICAgZWxzZVxuICAgICAgICBzaW1wbGVFeGVjIFwiZ3JlcCAtdiAnI3tjb2RlcGF0aH0nICcje3RhZ3NQYXRofScgPiAnI3t0YWdzUGF0aH0yJzsgbXYgJyN7dGFnc1BhdGh9MicgJyN7dGFnc1BhdGh9JzsgdGFpbCAtbiArNyAnI3tnZW5QYXRofScgPj4gJyN7dGFnc1BhdGh9J1wiXG5cbiAgICBjYWxsYmFjayhnZW5QYXRoKVxuXG4gIGNoaWxkUHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3Moe2NvbW1hbmQsIGFyZ3MsIHN0ZGVyciwgZXhpdH0pXG5cbiAgdGltZW91dCA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jdGFncy5idWlsZFRpbWVvdXQnKVxuICB0ID0gc2V0VGltZW91dCAtPlxuICAgIGNoaWxkUHJvY2Vzcy5raWxsKClcbiAgICBlcnJvciBcIlwiXCJcbiAgICBTdG9wcGVkOiBCdWlsZCBtb3JlIHRoYW4gI3t0aW1lb3V0LzEwMDB9IHNlY29uZHMsIGNoZWNrIGlmICN7Y29kZXBhdGh9IGNvbnRhaW4gdG9vIG1hbnkgZmlsZXMuPGJyPlxuICAgICAgICAgICAgU3VnZ2VzdCB0aGF0IGFkZCBDbWRBcmdzIGF0IGF0b20tY3RhZ3MgcGFja2FnZSBzZXR0aW5nLCBleGFtcGxlOjxicj5cbiAgICAgICAgICAgICAgICAtLWV4Y2x1ZGU9c29tZS9wYXRoIC0tZXhjbHVkZT1zb21lL290aGVyXCJcIlwiXG4gICwgdGltZW91dFxuIl19
