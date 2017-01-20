(function() {
  var _, child, filteredEnvironment, fs, path, pty, systemLanguage;

  pty = require('pty.js');

  path = require('path');

  fs = require('fs');

  _ = require('underscore');

  child = require('child_process');

  systemLanguage = (function() {
    var command, language;
    language = "en_US.UTF-8";
    if (process.platform === 'darwin') {
      try {
        command = 'plutil -convert json -o - ~/Library/Preferences/.GlobalPreferences.plist';
        language = (JSON.parse(child.execSync(command).toString()).AppleLocale) + ".UTF-8";
      } catch (error) {}
    }
    return language;
  })();

  filteredEnvironment = (function() {
    var env;
    env = _.omit(process.env, 'ATOM_HOME', 'ATOM_SHELL_INTERNAL_RUN_AS_NODE', 'GOOGLE_API_KEY', 'NODE_ENV', 'NODE_PATH', 'userAgent', 'taskPath');
    if (env.LANG == null) {
      env.LANG = systemLanguage;
    }
    env.TERM_PROGRAM = 'Terminal-Plus';
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
      return emit('terminal-plus:title', ptyProcess.process);
    }, 500, true);
    ptyProcess.on('data', function(data) {
      emit('terminal-plus:data', data);
      return emitTitle();
    });
    ptyProcess.on('exit', function() {
      emit('terminal-plus:exit');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvdGVybWluYWwtcGx1cy9saWIvcHJvY2Vzcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUjs7RUFDSixLQUFBLEdBQVEsT0FBQSxDQUFRLGVBQVI7O0VBRVIsY0FBQSxHQUFvQixDQUFBLFNBQUE7QUFDbEIsUUFBQTtJQUFBLFFBQUEsR0FBVztJQUNYLElBQUcsT0FBTyxDQUFDLFFBQVIsS0FBb0IsUUFBdkI7QUFDRTtRQUNFLE9BQUEsR0FBVTtRQUNWLFFBQUEsR0FBYSxDQUFDLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBSyxDQUFDLFFBQU4sQ0FBZSxPQUFmLENBQXVCLENBQUMsUUFBeEIsQ0FBQSxDQUFYLENBQThDLENBQUMsV0FBaEQsQ0FBQSxHQUE0RCxTQUYzRTtPQUFBLGlCQURGOztBQUlBLFdBQU87RUFOVyxDQUFBLENBQUgsQ0FBQTs7RUFRakIsbUJBQUEsR0FBeUIsQ0FBQSxTQUFBO0FBQ3ZCLFFBQUE7SUFBQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLElBQUYsQ0FBTyxPQUFPLENBQUMsR0FBZixFQUFvQixXQUFwQixFQUFpQyxpQ0FBakMsRUFBb0UsZ0JBQXBFLEVBQXNGLFVBQXRGLEVBQWtHLFdBQWxHLEVBQStHLFdBQS9HLEVBQTRILFVBQTVIOztNQUNOLEdBQUcsQ0FBQyxPQUFROztJQUNaLEdBQUcsQ0FBQyxZQUFKLEdBQW1CO0FBQ25CLFdBQU87RUFKZ0IsQ0FBQSxDQUFILENBQUE7O0VBTXRCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxJQUFiLEVBQW1CLE9BQW5CO0FBQ2YsUUFBQTs7TUFEa0MsVUFBUTs7SUFDMUMsUUFBQSxHQUFXLElBQUMsQ0FBQSxLQUFELENBQUE7SUFFWCxJQUFHLFVBQVUsQ0FBQyxJQUFYLENBQWdCLEtBQWhCLENBQUEsSUFBMkIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLENBQUEsS0FBMkIsQ0FBQyxDQUExRDtNQUNFLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQURGOztJQUdBLFVBQUEsR0FBYSxHQUFHLENBQUMsSUFBSixDQUFTLEtBQVQsRUFBZ0IsSUFBaEIsRUFDWDtNQUFBLEdBQUEsRUFBSyxHQUFMO01BQ0EsR0FBQSxFQUFLLG1CQURMO01BRUEsSUFBQSxFQUFNLGdCQUZOO0tBRFc7SUFLYixLQUFBLEdBQVEsS0FBQSxHQUFRLElBQUksQ0FBQyxRQUFMLENBQWMsS0FBZDtJQUVoQixTQUFBLEdBQVksQ0FBQyxDQUFDLFFBQUYsQ0FBVyxTQUFBO2FBQ3JCLElBQUEsQ0FBSyxxQkFBTCxFQUE0QixVQUFVLENBQUMsT0FBdkM7SUFEcUIsQ0FBWCxFQUVWLEdBRlUsRUFFTCxJQUZLO0lBSVosVUFBVSxDQUFDLEVBQVgsQ0FBYyxNQUFkLEVBQXNCLFNBQUMsSUFBRDtNQUNwQixJQUFBLENBQUssb0JBQUwsRUFBMkIsSUFBM0I7YUFDQSxTQUFBLENBQUE7SUFGb0IsQ0FBdEI7SUFJQSxVQUFVLENBQUMsRUFBWCxDQUFjLE1BQWQsRUFBc0IsU0FBQTtNQUNwQixJQUFBLENBQUssb0JBQUw7YUFDQSxRQUFBLENBQUE7SUFGb0IsQ0FBdEI7V0FJQSxPQUFPLENBQUMsRUFBUixDQUFXLFNBQVgsRUFBc0IsU0FBQyxHQUFEO0FBQ3BCLFVBQUE7MEJBRHFCLE1BQTBCLElBQXpCLG1CQUFPLGlCQUFNLGlCQUFNO0FBQ3pDLGNBQU8sS0FBUDtBQUFBLGFBQ08sUUFEUDtpQkFDcUIsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsSUFBbEIsRUFBd0IsSUFBeEI7QUFEckIsYUFFTyxPQUZQO2lCQUVvQixVQUFVLENBQUMsS0FBWCxDQUFpQixJQUFqQjtBQUZwQjtJQURvQixDQUF0QjtFQXpCZTtBQXBCakIiLCJzb3VyY2VzQ29udGVudCI6WyJwdHkgPSByZXF1aXJlICdwdHkuanMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMnXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZSdcbmNoaWxkID0gcmVxdWlyZSAnY2hpbGRfcHJvY2Vzcydcblxuc3lzdGVtTGFuZ3VhZ2UgPSBkbyAtPlxuICBsYW5ndWFnZSA9IFwiZW5fVVMuVVRGLThcIlxuICBpZiBwcm9jZXNzLnBsYXRmb3JtIGlzICdkYXJ3aW4nXG4gICAgdHJ5XG4gICAgICBjb21tYW5kID0gJ3BsdXRpbCAtY29udmVydCBqc29uIC1vIC0gfi9MaWJyYXJ5L1ByZWZlcmVuY2VzLy5HbG9iYWxQcmVmZXJlbmNlcy5wbGlzdCdcbiAgICAgIGxhbmd1YWdlID0gXCIje0pTT04ucGFyc2UoY2hpbGQuZXhlY1N5bmMoY29tbWFuZCkudG9TdHJpbmcoKSkuQXBwbGVMb2NhbGV9LlVURi04XCJcbiAgcmV0dXJuIGxhbmd1YWdlXG5cbmZpbHRlcmVkRW52aXJvbm1lbnQgPSBkbyAtPlxuICBlbnYgPSBfLm9taXQgcHJvY2Vzcy5lbnYsICdBVE9NX0hPTUUnLCAnQVRPTV9TSEVMTF9JTlRFUk5BTF9SVU5fQVNfTk9ERScsICdHT09HTEVfQVBJX0tFWScsICdOT0RFX0VOVicsICdOT0RFX1BBVEgnLCAndXNlckFnZW50JywgJ3Rhc2tQYXRoJ1xuICBlbnYuTEFORyA/PSBzeXN0ZW1MYW5ndWFnZVxuICBlbnYuVEVSTV9QUk9HUkFNID0gJ1Rlcm1pbmFsLVBsdXMnXG4gIHJldHVybiBlbnZcblxubW9kdWxlLmV4cG9ydHMgPSAocHdkLCBzaGVsbCwgYXJncywgb3B0aW9ucz17fSkgLT5cbiAgY2FsbGJhY2sgPSBAYXN5bmMoKVxuXG4gIGlmIC96c2h8YmFzaC8udGVzdChzaGVsbCkgYW5kIGFyZ3MuaW5kZXhPZignLS1sb2dpbicpID09IC0xXG4gICAgYXJncy51bnNoaWZ0ICctLWxvZ2luJ1xuXG4gIHB0eVByb2Nlc3MgPSBwdHkuZm9yayBzaGVsbCwgYXJncyxcbiAgICBjd2Q6IHB3ZCxcbiAgICBlbnY6IGZpbHRlcmVkRW52aXJvbm1lbnQsXG4gICAgbmFtZTogJ3h0ZXJtLTI1NmNvbG9yJ1xuXG4gIHRpdGxlID0gc2hlbGwgPSBwYXRoLmJhc2VuYW1lIHNoZWxsXG5cbiAgZW1pdFRpdGxlID0gXy50aHJvdHRsZSAtPlxuICAgIGVtaXQoJ3Rlcm1pbmFsLXBsdXM6dGl0bGUnLCBwdHlQcm9jZXNzLnByb2Nlc3MpXG4gICwgNTAwLCB0cnVlXG5cbiAgcHR5UHJvY2Vzcy5vbiAnZGF0YScsIChkYXRhKSAtPlxuICAgIGVtaXQoJ3Rlcm1pbmFsLXBsdXM6ZGF0YScsIGRhdGEpXG4gICAgZW1pdFRpdGxlKClcblxuICBwdHlQcm9jZXNzLm9uICdleGl0JywgLT5cbiAgICBlbWl0KCd0ZXJtaW5hbC1wbHVzOmV4aXQnKVxuICAgIGNhbGxiYWNrKClcblxuICBwcm9jZXNzLm9uICdtZXNzYWdlJywgKHtldmVudCwgY29scywgcm93cywgdGV4dH09e30pIC0+XG4gICAgc3dpdGNoIGV2ZW50XG4gICAgICB3aGVuICdyZXNpemUnIHRoZW4gcHR5UHJvY2Vzcy5yZXNpemUoY29scywgcm93cylcbiAgICAgIHdoZW4gJ2lucHV0JyB0aGVuIHB0eVByb2Nlc3Mud3JpdGUodGV4dClcbiJdfQ==
