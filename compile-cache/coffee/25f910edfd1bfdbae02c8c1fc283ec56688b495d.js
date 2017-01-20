(function() {
  var _, child, filteredEnvironment, fs, path, pty, systemLanguage;

  pty = require('pty.js');

  path = require('path');

  fs = require('fs');

  _ = require('underscore');

  child = require('child_process');

  systemLanguage = (function() {
    var language;
    language = "en_US.UTF-8";
    return language;
  })();

  filteredEnvironment = (function() {
    var env;
    env = _.omit(process.env, 'ATOM_HOME', 'ATOM_SHELL_INTERNAL_RUN_AS_NODE', 'GOOGLE_API_KEY', 'NODE_ENV', 'NODE_PATH', 'userAgent', 'taskPath');
    if (env.LANG == null) {
      env.LANG = systemLanguage;
    }
    env.TERM_PROGRAM = 'terminal-fusion';
    return env;
  })();

  module.exports = function(pwd, shell, args, options) {
    var callback, emitTitle, ptyProcess, title;
    if (options == null) {
      options = {};
    }
    callback = this.async();
    if (/zsh|bash/.test(shell) && args.indexOf('--login') === -1) {
      args.unshift('--login');
    }
    ptyProcess = pty.fork(shell, args, {
      cwd: pwd,
      env: filteredEnvironment,
      name: 'xterm-256color'
    });
    title = shell = path.basename(shell);
    emitTitle = _.throttle(function() {
      return emit('terminal-fusion:title', ptyProcess.process);
    }, 500, true);
    ptyProcess.on('data', function(data) {
      emit('terminal-fusion:data', data);
      return emitTitle();
    });
    ptyProcess.on('exit', function() {
      emit('terminal-fusion:exit');
      return callback();
    });
    return process.on('message', function(arg) {
      var cols, event, ref, rows, text;
      ref = arg != null ? arg : {}, event = ref.event, cols = ref.cols, rows = ref.rows, text = ref.text;
      switch (event) {
        case 'resize':
          return ptyProcess.resize(cols, rows);
        case 'input':
          return ptyProcess.write(text);
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvdGVybWluYWwtZnVzaW9uL2xpYi9wcm9jZXNzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFRLE9BQUEsQ0FBUSxRQUFSOztFQUNSLElBQUEsR0FBUSxPQUFBLENBQVEsTUFBUjs7RUFDUixFQUFBLEdBQVEsT0FBQSxDQUFRLElBQVI7O0VBQ1IsQ0FBQSxHQUFRLE9BQUEsQ0FBUSxZQUFSOztFQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsZUFBUjs7RUFFUixjQUFBLEdBQW9CLENBQUEsU0FBQTtBQUNsQixRQUFBO0lBQUEsUUFBQSxHQUFXO0FBQ1gsV0FBTztFQUZXLENBQUEsQ0FBSCxDQUFBOztFQUlqQixtQkFBQSxHQUF5QixDQUFBLFNBQUE7QUFDdkIsUUFBQTtJQUFBLEdBQUEsR0FBb0IsQ0FBQyxDQUFDLElBQUYsQ0FBTyxPQUFPLENBQUMsR0FBZixFQUFvQixXQUFwQixFQUFpQyxpQ0FBakMsRUFBb0UsZ0JBQXBFLEVBQXNGLFVBQXRGLEVBQWtHLFdBQWxHLEVBQStHLFdBQS9HLEVBQTRILFVBQTVIOztNQUNwQixHQUFHLENBQUMsT0FBZ0I7O0lBQ3BCLEdBQUcsQ0FBQyxZQUFKLEdBQW9CO0FBQ3BCLFdBQU87RUFKZ0IsQ0FBQSxDQUFILENBQUE7O0VBTXRCLE1BQU0sQ0FBQyxPQUFQLEdBQXNCLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxJQUFiLEVBQW1CLE9BQW5CO0FBQ3BCLFFBQUE7O01BRHVDLFVBQVE7O0lBQy9DLFFBQUEsR0FBb0IsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQUVwQixJQUFHLFVBQVUsQ0FBQyxJQUFYLENBQWdCLEtBQWhCLENBQUEsSUFBMkIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLENBQUEsS0FBMkIsQ0FBQyxDQUExRDtNQUNFLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQURGOztJQUdBLFVBQUEsR0FBb0IsR0FBRyxDQUFDLElBQUosQ0FBUyxLQUFULEVBQWdCLElBQWhCLEVBQ2xCO01BQUEsR0FBQSxFQUFrQixHQUFsQjtNQUNBLEdBQUEsRUFBa0IsbUJBRGxCO01BRUEsSUFBQSxFQUFrQixnQkFGbEI7S0FEa0I7SUFLcEIsS0FBQSxHQUFvQixLQUFBLEdBQVEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFkO0lBRTVCLFNBQUEsR0FBb0IsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxTQUFBO2FBQzdCLElBQUEsQ0FBSyx1QkFBTCxFQUE4QixVQUFVLENBQUMsT0FBekM7SUFENkIsQ0FBWCxFQUVsQixHQUZrQixFQUViLElBRmE7SUFJcEIsVUFBVSxDQUFDLEVBQVgsQ0FBYyxNQUFkLEVBQXNCLFNBQUMsSUFBRDtNQUNwQixJQUFBLENBQUssc0JBQUwsRUFBNkIsSUFBN0I7YUFDQSxTQUFBLENBQUE7SUFGb0IsQ0FBdEI7SUFJQSxVQUFVLENBQUMsRUFBWCxDQUFjLE1BQWQsRUFBc0IsU0FBQTtNQUNwQixJQUFBLENBQUssc0JBQUw7YUFDQSxRQUFBLENBQUE7SUFGb0IsQ0FBdEI7V0FJQSxPQUFPLENBQUMsRUFBUixDQUFXLFNBQVgsRUFBc0IsU0FBQyxHQUFEO0FBQ3BCLFVBQUE7MEJBRHFCLE1BQTBCLElBQXpCLG1CQUFPLGlCQUFNLGlCQUFNO0FBQ3pDLGNBQU8sS0FBUDtBQUFBLGFBQ08sUUFEUDtpQkFDcUIsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsSUFBbEIsRUFBd0IsSUFBeEI7QUFEckIsYUFFTyxPQUZQO2lCQUVvQixVQUFVLENBQUMsS0FBWCxDQUFpQixJQUFqQjtBQUZwQjtJQURvQixDQUF0QjtFQXpCb0I7QUFoQnRCIiwic291cmNlc0NvbnRlbnQiOlsicHR5ICAgPSByZXF1aXJlICdwdHkuanMnXG5wYXRoICA9IHJlcXVpcmUgJ3BhdGgnXG5mcyAgICA9IHJlcXVpcmUgJ2ZzJ1xuXyAgICAgPSByZXF1aXJlICd1bmRlcnNjb3JlJ1xuY2hpbGQgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuXG5zeXN0ZW1MYW5ndWFnZSA9IGRvIC0+XG4gIGxhbmd1YWdlID0gXCJlbl9VUy5VVEYtOFwiXG4gIHJldHVybiBsYW5ndWFnZVxuXG5maWx0ZXJlZEVudmlyb25tZW50ID0gZG8gLT5cbiAgZW52ICAgICAgICAgICAgICAgPSBfLm9taXQgcHJvY2Vzcy5lbnYsICdBVE9NX0hPTUUnLCAnQVRPTV9TSEVMTF9JTlRFUk5BTF9SVU5fQVNfTk9ERScsICdHT09HTEVfQVBJX0tFWScsICdOT0RFX0VOVicsICdOT0RFX1BBVEgnLCAndXNlckFnZW50JywgJ3Rhc2tQYXRoJ1xuICBlbnYuTEFORyAgICAgICAgID89IHN5c3RlbUxhbmd1YWdlXG4gIGVudi5URVJNX1BST0dSQU0gID0gJ3Rlcm1pbmFsLWZ1c2lvbidcbiAgcmV0dXJuIGVudlxuXG5tb2R1bGUuZXhwb3J0cyAgICAgID0gKHB3ZCwgc2hlbGwsIGFyZ3MsIG9wdGlvbnM9e30pIC0+XG4gIGNhbGxiYWNrICAgICAgICAgID0gQGFzeW5jKClcblxuICBpZiAvenNofGJhc2gvLnRlc3Qoc2hlbGwpIGFuZCBhcmdzLmluZGV4T2YoJy0tbG9naW4nKSA9PSAtMVxuICAgIGFyZ3MudW5zaGlmdCAnLS1sb2dpbidcblxuICBwdHlQcm9jZXNzICAgICAgICA9IHB0eS5mb3JrIHNoZWxsLCBhcmdzLFxuICAgIGN3ZDogICAgICAgICAgICAgIHB3ZCxcbiAgICBlbnY6ICAgICAgICAgICAgICBmaWx0ZXJlZEVudmlyb25tZW50LFxuICAgIG5hbWU6ICAgICAgICAgICAgICd4dGVybS0yNTZjb2xvcidcblxuICB0aXRsZSAgICAgICAgICAgICA9IHNoZWxsID0gcGF0aC5iYXNlbmFtZSBzaGVsbFxuXG4gIGVtaXRUaXRsZSAgICAgICAgID0gXy50aHJvdHRsZSAtPlxuICAgIGVtaXQoJ3Rlcm1pbmFsLWZ1c2lvbjp0aXRsZScsIHB0eVByb2Nlc3MucHJvY2VzcylcbiAgLCA1MDAsIHRydWVcblxuICBwdHlQcm9jZXNzLm9uICdkYXRhJywgKGRhdGEpIC0+XG4gICAgZW1pdCgndGVybWluYWwtZnVzaW9uOmRhdGEnLCBkYXRhKVxuICAgIGVtaXRUaXRsZSgpXG5cbiAgcHR5UHJvY2Vzcy5vbiAnZXhpdCcsIC0+XG4gICAgZW1pdCgndGVybWluYWwtZnVzaW9uOmV4aXQnKVxuICAgIGNhbGxiYWNrKClcblxuICBwcm9jZXNzLm9uICdtZXNzYWdlJywgKHtldmVudCwgY29scywgcm93cywgdGV4dH09e30pIC0+XG4gICAgc3dpdGNoIGV2ZW50XG4gICAgICB3aGVuICdyZXNpemUnIHRoZW4gcHR5UHJvY2Vzcy5yZXNpemUoY29scywgcm93cylcbiAgICAgIHdoZW4gJ2lucHV0JyB0aGVuIHB0eVByb2Nlc3Mud3JpdGUodGV4dClcbiJdfQ==
