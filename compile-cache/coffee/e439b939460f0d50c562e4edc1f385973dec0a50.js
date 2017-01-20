(function() {
  var $, CompositeDisposable, Emitter, InputDialog, Pty, Task, Terminal, TerminalPlusView, View, lastActiveElement, lastOpenedView, os, path, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Task = ref.Task, CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, View = ref1.View;

  Pty = require.resolve('./process');

  Terminal = require('term.js');

  InputDialog = null;

  path = require('path');

  os = require('os');

  lastOpenedView = null;

  lastActiveElement = null;

  module.exports = TerminalPlusView = (function(superClass) {
    extend(TerminalPlusView, superClass);

    function TerminalPlusView() {
      this.blurTerminal = bind(this.blurTerminal, this);
      this.focusTerminal = bind(this.focusTerminal, this);
      this.blur = bind(this.blur, this);
      this.focus = bind(this.focus, this);
      this.resizePanel = bind(this.resizePanel, this);
      this.resizeStopped = bind(this.resizeStopped, this);
      this.resizeStarted = bind(this.resizeStarted, this);
      this.onWindowResize = bind(this.onWindowResize, this);
      this.hide = bind(this.hide, this);
      this.open = bind(this.open, this);
      this.recieveItemOrFile = bind(this.recieveItemOrFile, this);
      this.setAnimationSpeed = bind(this.setAnimationSpeed, this);
      return TerminalPlusView.__super__.constructor.apply(this, arguments);
    }

    TerminalPlusView.prototype.animating = false;

    TerminalPlusView.prototype.id = '';

    TerminalPlusView.prototype.maximized = false;

    TerminalPlusView.prototype.opened = false;

    TerminalPlusView.prototype.pwd = '';

    TerminalPlusView.prototype.windowHeight = $(window).height();

    TerminalPlusView.prototype.rowHeight = 20;

    TerminalPlusView.prototype.shell = '';

    TerminalPlusView.prototype.tabView = false;

    TerminalPlusView.content = function() {
      return this.div({
        "class": 'terminal-plus terminal-view',
        outlet: 'terminalPlusView'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-divider',
            outlet: 'panelDivider'
          });
          _this.div({
            "class": 'btn-toolbar',
            outlet: 'toolbar'
          }, function() {
            _this.button({
              outlet: 'closeBtn',
              "class": 'btn inline-block-tight right',
              click: 'destroy'
            }, function() {
              return _this.span({
                "class": 'icon icon-x'
              });
            });
            _this.button({
              outlet: 'hideBtn',
              "class": 'btn inline-block-tight right',
              click: 'hide'
            }, function() {
              return _this.span({
                "class": 'icon icon-chevron-down'
              });
            });
            _this.button({
              outlet: 'maximizeBtn',
              "class": 'btn inline-block-tight right',
              click: 'maximize'
            }, function() {
              return _this.span({
                "class": 'icon icon-screen-full'
              });
            });
            return _this.button({
              outlet: 'inputBtn',
              "class": 'btn inline-block-tight left',
              click: 'inputDialog'
            }, function() {
              return _this.span({
                "class": 'icon icon-keyboard'
              });
            });
          });
          return _this.div({
            "class": 'xterm',
            outlet: 'xterm'
          });
        };
      })(this));
    };

    TerminalPlusView.getFocusedTerminal = function() {
      return Terminal.Terminal.focus;
    };

    TerminalPlusView.prototype.initialize = function(id, pwd, statusIcon, statusBar, shell, args) {
      var bottomHeight, override, percent;
      this.id = id;
      this.pwd = pwd;
      this.statusIcon = statusIcon;
      this.statusBar = statusBar;
      this.shell = shell;
      this.args = args != null ? args : [];
      this.subscriptions = new CompositeDisposable;
      this.emitter = new Emitter;
      this.subscriptions.add(atom.tooltips.add(this.closeBtn, {
        title: 'Close'
      }));
      this.subscriptions.add(atom.tooltips.add(this.hideBtn, {
        title: 'Hide'
      }));
      this.subscriptions.add(this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
        title: 'Fullscreen'
      }));
      this.inputBtn.tooltip = atom.tooltips.add(this.inputBtn, {
        title: 'Insert Text'
      });
      this.prevHeight = atom.config.get('terminal-plus.style.defaultPanelHeight');
      if (this.prevHeight.indexOf('%') > 0) {
        percent = Math.abs(Math.min(parseFloat(this.prevHeight) / 100.0, 1));
        bottomHeight = $('atom-panel.bottom').children(".terminal-view").height() || 0;
        this.prevHeight = percent * ($('.item-views').height() + bottomHeight);
      }
      this.xterm.height(0);
      this.setAnimationSpeed();
      this.subscriptions.add(atom.config.onDidChange('terminal-plus.style.animationSpeed', this.setAnimationSpeed));
      override = function(event) {
        if (event.originalEvent.dataTransfer.getData('terminal-plus') === 'true') {
          return;
        }
        event.preventDefault();
        return event.stopPropagation();
      };
      this.xterm.on('mouseup', (function(_this) {
        return function(event) {
          var text;
          if (event.which !== 3) {
            text = window.getSelection().toString();
            if (!text) {
              return _this.focus();
            }
          }
        };
      })(this));
      this.xterm.on('dragenter', override);
      this.xterm.on('dragover', override);
      this.xterm.on('drop', this.recieveItemOrFile);
      this.on('focus', this.focus);
      return this.subscriptions.add({
        dispose: (function(_this) {
          return function() {
            return _this.off('focus', _this.focus);
          };
        })(this)
      });
    };

    TerminalPlusView.prototype.attach = function() {
      if (this.panel != null) {
        return;
      }
      return this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
    };

    TerminalPlusView.prototype.setAnimationSpeed = function() {
      this.animationSpeed = atom.config.get('terminal-plus.style.animationSpeed');
      if (this.animationSpeed === 0) {
        this.animationSpeed = 100;
      }
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    TerminalPlusView.prototype.recieveItemOrFile = function(event) {
      var dataTransfer, file, filePath, i, len, ref2, results;
      event.preventDefault();
      event.stopPropagation();
      dataTransfer = event.originalEvent.dataTransfer;
      if (dataTransfer.getData('atom-event') === 'true') {
        filePath = dataTransfer.getData('text/plain');
        if (filePath) {
          return this.input(filePath + " ");
        }
      } else if (filePath = dataTransfer.getData('initialPath')) {
        return this.input(filePath + " ");
      } else if (dataTransfer.files.length > 0) {
        ref2 = dataTransfer.files;
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          file = ref2[i];
          results.push(this.input(file.path + " "));
        }
        return results;
      }
    };

    TerminalPlusView.prototype.forkPtyProcess = function() {
      return Task.once(Pty, path.resolve(this.pwd), this.shell, this.args, (function(_this) {
        return function() {
          _this.input = function() {};
          return _this.resize = function() {};
        };
      })(this));
    };

    TerminalPlusView.prototype.getId = function() {
      return this.id;
    };

    TerminalPlusView.prototype.displayTerminal = function() {
      var cols, ref2, rows;
      ref2 = this.getDimensions(), cols = ref2.cols, rows = ref2.rows;
      this.ptyProcess = this.forkPtyProcess();
      this.terminal = new Terminal({
        cursorBlink: false,
        scrollback: atom.config.get('terminal-plus.core.scrollback'),
        cols: cols,
        rows: rows
      });
      this.attachListeners();
      this.attachResizeEvents();
      this.attachWindowEvents();
      return this.terminal.open(this.xterm.get(0));
    };

    TerminalPlusView.prototype.attachListeners = function() {
      this.ptyProcess.on("terminal-plus:data", (function(_this) {
        return function(data) {
          return _this.terminal.write(data);
        };
      })(this));
      this.ptyProcess.on("terminal-plus:exit", (function(_this) {
        return function() {
          if (atom.config.get('terminal-plus.toggles.autoClose')) {
            return _this.destroy();
          }
        };
      })(this));
      this.terminal.end = (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this);
      this.terminal.on("data", (function(_this) {
        return function(data) {
          return _this.input(data);
        };
      })(this));
      this.ptyProcess.on("terminal-plus:title", (function(_this) {
        return function(title) {
          return _this.process = title;
        };
      })(this));
      this.terminal.on("title", (function(_this) {
        return function(title) {
          return _this.title = title;
        };
      })(this));
      return this.terminal.once("open", (function(_this) {
        return function() {
          var autoRunCommand;
          _this.applyStyle();
          _this.resizeTerminalToView();
          if (_this.ptyProcess.childProcess == null) {
            return;
          }
          autoRunCommand = atom.config.get('terminal-plus.core.autoRunCommand');
          if (autoRunCommand) {
            return _this.input("" + autoRunCommand + os.EOL);
          }
        };
      })(this));
    };

    TerminalPlusView.prototype.destroy = function() {
      var ref2, ref3;
      this.subscriptions.dispose();
      this.statusIcon.destroy();
      this.statusBar.removeTerminalView(this);
      this.detachResizeEvents();
      this.detachWindowEvents();
      if (this.panel.isVisible()) {
        this.hide();
        this.onTransitionEnd((function(_this) {
          return function() {
            return _this.panel.destroy();
          };
        })(this));
      } else {
        this.panel.destroy();
      }
      if (this.statusIcon && this.statusIcon.parentNode) {
        this.statusIcon.parentNode.removeChild(this.statusIcon);
      }
      if ((ref2 = this.ptyProcess) != null) {
        ref2.terminate();
      }
      return (ref3 = this.terminal) != null ? ref3.destroy() : void 0;
    };

    TerminalPlusView.prototype.maximize = function() {
      var btn;
      this.subscriptions.remove(this.maximizeBtn.tooltip);
      this.maximizeBtn.tooltip.dispose();
      this.maxHeight = this.prevHeight + $('.item-views').height();
      btn = this.maximizeBtn.children('span');
      this.onTransitionEnd((function(_this) {
        return function() {
          return _this.focus();
        };
      })(this));
      if (this.maximized) {
        this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
          title: 'Fullscreen'
        });
        this.subscriptions.add(this.maximizeBtn.tooltip);
        this.adjustHeight(this.prevHeight);
        btn.removeClass('icon-screen-normal').addClass('icon-screen-full');
        return this.maximized = false;
      } else {
        this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
          title: 'Normal'
        });
        this.subscriptions.add(this.maximizeBtn.tooltip);
        this.adjustHeight(this.maxHeight);
        btn.removeClass('icon-screen-full').addClass('icon-screen-normal');
        return this.maximized = true;
      }
    };

    TerminalPlusView.prototype.open = function() {
      var icon;
      if (lastActiveElement == null) {
        lastActiveElement = $(document.activeElement);
      }
      if (lastOpenedView && lastOpenedView !== this) {
        if (lastOpenedView.maximized) {
          this.subscriptions.remove(this.maximizeBtn.tooltip);
          this.maximizeBtn.tooltip.dispose();
          icon = this.maximizeBtn.children('span');
          this.maxHeight = lastOpenedView.maxHeight;
          this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
            title: 'Normal'
          });
          this.subscriptions.add(this.maximizeBtn.tooltip);
          icon.removeClass('icon-screen-full').addClass('icon-screen-normal');
          this.maximized = true;
        }
        lastOpenedView.hide();
      }
      lastOpenedView = this;
      this.statusBar.setActiveTerminalView(this);
      this.statusIcon.activate();
      this.onTransitionEnd((function(_this) {
        return function() {
          if (!_this.opened) {
            _this.opened = true;
            _this.displayTerminal();
            _this.prevHeight = _this.nearestRow(_this.xterm.height());
            return _this.xterm.height(_this.prevHeight);
          } else {
            return _this.focus();
          }
        };
      })(this));
      this.panel.show();
      this.xterm.height(0);
      this.animating = true;
      return this.xterm.height(this.maximized ? this.maxHeight : this.prevHeight);
    };

    TerminalPlusView.prototype.hide = function() {
      var ref2;
      if ((ref2 = this.terminal) != null) {
        ref2.blur();
      }
      lastOpenedView = null;
      this.statusIcon.deactivate();
      this.onTransitionEnd((function(_this) {
        return function() {
          _this.panel.hide();
          if (lastOpenedView == null) {
            if (lastActiveElement != null) {
              lastActiveElement.focus();
              return lastActiveElement = null;
            }
          }
        };
      })(this));
      this.xterm.height(this.maximized ? this.maxHeight : this.prevHeight);
      this.animating = true;
      return this.xterm.height(0);
    };

    TerminalPlusView.prototype.toggle = function() {
      if (this.animating) {
        return;
      }
      if (this.panel.isVisible()) {
        return this.hide();
      } else {
        return this.open();
      }
    };

    TerminalPlusView.prototype.input = function(data) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      this.terminal.stopScrolling();
      return this.ptyProcess.send({
        event: 'input',
        text: data
      });
    };

    TerminalPlusView.prototype.resize = function(cols, rows) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      return this.ptyProcess.send({
        event: 'resize',
        rows: rows,
        cols: cols
      });
    };

    TerminalPlusView.prototype.applyStyle = function() {
      var config, defaultFont, editorFont, editorFontSize, overrideFont, overrideFontSize, ref2, ref3;
      config = atom.config.get('terminal-plus');
      this.xterm.addClass(config.style.theme);
      if (config.toggles.cursorBlink) {
        this.xterm.addClass('cursor-blink');
      }
      editorFont = atom.config.get('editor.fontFamily');
      defaultFont = "Menlo, Consolas, 'DejaVu Sans Mono', monospace";
      overrideFont = config.style.fontFamily;
      this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
      this.subscriptions.add(atom.config.onDidChange('editor.fontFamily', (function(_this) {
        return function(event) {
          editorFont = event.newValue;
          return _this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('terminal-plus.style.fontFamily', (function(_this) {
        return function(event) {
          overrideFont = event.newValue;
          return _this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
        };
      })(this)));
      editorFontSize = atom.config.get('editor.fontSize');
      overrideFontSize = config.style.fontSize;
      this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
      this.subscriptions.add(atom.config.onDidChange('editor.fontSize', (function(_this) {
        return function(event) {
          editorFontSize = event.newValue;
          _this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
          return _this.resizeTerminalToView();
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('terminal-plus.style.fontSize', (function(_this) {
        return function(event) {
          overrideFontSize = event.newValue;
          _this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
          return _this.resizeTerminalToView();
        };
      })(this)));
      [].splice.apply(this.terminal.colors, [0, 8].concat(ref2 = [config.ansiColors.normal.black.toHexString(), config.ansiColors.normal.red.toHexString(), config.ansiColors.normal.green.toHexString(), config.ansiColors.normal.yellow.toHexString(), config.ansiColors.normal.blue.toHexString(), config.ansiColors.normal.magenta.toHexString(), config.ansiColors.normal.cyan.toHexString(), config.ansiColors.normal.white.toHexString()])), ref2;
      return ([].splice.apply(this.terminal.colors, [8, 8].concat(ref3 = [config.ansiColors.zBright.brightBlack.toHexString(), config.ansiColors.zBright.brightRed.toHexString(), config.ansiColors.zBright.brightGreen.toHexString(), config.ansiColors.zBright.brightYellow.toHexString(), config.ansiColors.zBright.brightBlue.toHexString(), config.ansiColors.zBright.brightMagenta.toHexString(), config.ansiColors.zBright.brightCyan.toHexString(), config.ansiColors.zBright.brightWhite.toHexString()])), ref3);
    };

    TerminalPlusView.prototype.attachWindowEvents = function() {
      return $(window).on('resize', this.onWindowResize);
    };

    TerminalPlusView.prototype.detachWindowEvents = function() {
      return $(window).off('resize', this.onWindowResize);
    };

    TerminalPlusView.prototype.attachResizeEvents = function() {
      return this.panelDivider.on('mousedown', this.resizeStarted);
    };

    TerminalPlusView.prototype.detachResizeEvents = function() {
      return this.panelDivider.off('mousedown');
    };

    TerminalPlusView.prototype.onWindowResize = function() {
      var bottomPanel, clamped, delta, newHeight, overflow;
      if (!this.tabView) {
        this.xterm.css('transition', '');
        newHeight = $(window).height();
        bottomPanel = $('atom-panel-container.bottom').first().get(0);
        overflow = bottomPanel.scrollHeight - bottomPanel.offsetHeight;
        delta = newHeight - this.windowHeight;
        this.windowHeight = newHeight;
        if (this.maximized) {
          clamped = Math.max(this.maxHeight + delta, this.rowHeight);
          if (this.panel.isVisible()) {
            this.adjustHeight(clamped);
          }
          this.maxHeight = clamped;
          this.prevHeight = Math.min(this.prevHeight, this.maxHeight);
        } else if (overflow > 0) {
          clamped = Math.max(this.nearestRow(this.prevHeight + delta), this.rowHeight);
          if (this.panel.isVisible()) {
            this.adjustHeight(clamped);
          }
          this.prevHeight = clamped;
        }
        this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
      }
      return this.resizeTerminalToView();
    };

    TerminalPlusView.prototype.resizeStarted = function() {
      if (this.maximized) {
        return;
      }
      this.maxHeight = this.prevHeight + $('.item-views').height();
      $(document).on('mousemove', this.resizePanel);
      $(document).on('mouseup', this.resizeStopped);
      return this.xterm.css('transition', '');
    };

    TerminalPlusView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizePanel);
      $(document).off('mouseup', this.resizeStopped);
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    TerminalPlusView.prototype.nearestRow = function(value) {
      var rows;
      rows = Math.floor(value / this.rowHeight);
      return rows * this.rowHeight;
    };

    TerminalPlusView.prototype.resizePanel = function(event) {
      var clamped, delta, mouseY;
      if (event.which !== 1) {
        return this.resizeStopped();
      }
      mouseY = $(window).height() - event.pageY;
      delta = mouseY - $('atom-panel-container.bottom').height();
      if (!(Math.abs(delta) > (this.rowHeight * 5 / 6))) {
        return;
      }
      clamped = Math.max(this.nearestRow(this.prevHeight + delta), this.rowHeight);
      if (clamped > this.maxHeight) {
        return;
      }
      this.xterm.height(clamped);
      $(this.terminal.element).height(clamped);
      this.prevHeight = clamped;
      return this.resizeTerminalToView();
    };

    TerminalPlusView.prototype.adjustHeight = function(height) {
      this.xterm.height(height);
      return $(this.terminal.element).height(height);
    };

    TerminalPlusView.prototype.copy = function() {
      var lines, rawLines, rawText, text, textarea;
      if (this.terminal._selected) {
        textarea = this.terminal.getCopyTextarea();
        text = this.terminal.grabText(this.terminal._selected.x1, this.terminal._selected.x2, this.terminal._selected.y1, this.terminal._selected.y2);
      } else {
        rawText = this.terminal.context.getSelection().toString();
        rawLines = rawText.split(/\r?\n/g);
        lines = rawLines.map(function(line) {
          return line.replace(/\s/g, " ").trimRight();
        });
        text = lines.join("\n");
      }
      return atom.clipboard.write(text);
    };

    TerminalPlusView.prototype.paste = function() {
      return this.input(atom.clipboard.read());
    };

    TerminalPlusView.prototype.insertSelection = function() {
      var cursor, editor, line, runCommand, selection;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      runCommand = atom.config.get('terminal-plus.toggles.runInsertedText');
      if (selection = editor.getSelectedText()) {
        this.terminal.stopScrolling();
        return this.input("" + selection + (runCommand ? os.EOL : ''));
      } else if (cursor = editor.getCursorBufferPosition()) {
        line = editor.lineTextForBufferRow(cursor.row);
        this.terminal.stopScrolling();
        this.input("" + line + (runCommand ? os.EOL : ''));
        return editor.moveDown(1);
      }
    };

    TerminalPlusView.prototype.focus = function() {
      this.resizeTerminalToView();
      this.focusTerminal();
      this.statusBar.setActiveTerminalView(this);
      return TerminalPlusView.__super__.focus.call(this);
    };

    TerminalPlusView.prototype.blur = function() {
      this.blurTerminal();
      return TerminalPlusView.__super__.blur.call(this);
    };

    TerminalPlusView.prototype.focusTerminal = function() {
      if (!this.terminal) {
        return;
      }
      this.terminal.focus();
      if (this.terminal._textarea) {
        return this.terminal._textarea.focus();
      } else {
        return this.terminal.element.focus();
      }
    };

    TerminalPlusView.prototype.blurTerminal = function() {
      if (!this.terminal) {
        return;
      }
      this.terminal.blur();
      return this.terminal.element.blur();
    };

    TerminalPlusView.prototype.resizeTerminalToView = function() {
      var cols, ref2, rows;
      if (!(this.panel.isVisible() || this.tabView)) {
        return;
      }
      ref2 = this.getDimensions(), cols = ref2.cols, rows = ref2.rows;
      if (!(cols > 0 && rows > 0)) {
        return;
      }
      if (!this.terminal) {
        return;
      }
      if (this.terminal.rows === rows && this.terminal.cols === cols) {
        return;
      }
      this.resize(cols, rows);
      return this.terminal.resize(cols, rows);
    };

    TerminalPlusView.prototype.getDimensions = function() {
      var cols, fakeCol, fakeRow, rows;
      fakeRow = $("<div><span>&nbsp;</span></div>");
      if (this.terminal) {
        this.find('.terminal').append(fakeRow);
        fakeCol = fakeRow.children().first()[0].getBoundingClientRect();
        cols = Math.floor(this.xterm.width() / (fakeCol.width || 9));
        rows = Math.floor(this.xterm.height() / (fakeCol.height || 20));
        this.rowHeight = fakeCol.height;
        fakeRow.remove();
      } else {
        cols = Math.floor(this.xterm.width() / 9);
        rows = Math.floor(this.xterm.height() / 20);
      }
      return {
        cols: cols,
        rows: rows
      };
    };

    TerminalPlusView.prototype.onTransitionEnd = function(callback) {
      return this.xterm.one('webkitTransitionEnd', (function(_this) {
        return function() {
          callback();
          return _this.animating = false;
        };
      })(this));
    };

    TerminalPlusView.prototype.inputDialog = function() {
      var dialog;
      if (InputDialog == null) {
        InputDialog = require('./input-dialog');
      }
      dialog = new InputDialog(this);
      return dialog.attach();
    };

    TerminalPlusView.prototype.rename = function() {
      return this.statusIcon.rename();
    };

    TerminalPlusView.prototype.toggleTabView = function() {
      if (this.tabView) {
        this.panel = atom.workspace.addBottomPanel({
          item: this,
          visible: false
        });
        this.attachResizeEvents();
        this.closeBtn.show();
        this.hideBtn.show();
        this.maximizeBtn.show();
        return this.tabView = false;
      } else {
        this.panel.destroy();
        this.detachResizeEvents();
        this.closeBtn.hide();
        this.hideBtn.hide();
        this.maximizeBtn.hide();
        this.xterm.css("height", "");
        this.tabView = true;
        if (lastOpenedView === this) {
          return lastOpenedView = null;
        }
      }
    };

    TerminalPlusView.prototype.getTitle = function() {
      return this.statusIcon.getName() || "Terminal-Plus";
    };

    TerminalPlusView.prototype.getIconName = function() {
      return "terminal";
    };

    TerminalPlusView.prototype.getShell = function() {
      return path.basename(this.shell);
    };

    TerminalPlusView.prototype.getShellPath = function() {
      return this.shell;
    };

    TerminalPlusView.prototype.emit = function(event, data) {
      return this.emitter.emit(event, data);
    };

    TerminalPlusView.prototype.onDidChangeTitle = function(callback) {
      return this.emitter.on('did-change-title', callback);
    };

    TerminalPlusView.prototype.getPath = function() {
      return this.getTerminalTitle();
    };

    TerminalPlusView.prototype.getTerminalTitle = function() {
      return this.title || this.process;
    };

    TerminalPlusView.prototype.getTerminal = function() {
      return this.terminal;
    };

    TerminalPlusView.prototype.isAnimating = function() {
      return this.animating;
    };

    return TerminalPlusView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvdGVybWluYWwtcGx1cy9saWIvdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGlKQUFBO0lBQUE7Ozs7RUFBQSxNQUF1QyxPQUFBLENBQVEsTUFBUixDQUF2QyxFQUFDLGVBQUQsRUFBTyw2Q0FBUCxFQUE0Qjs7RUFDNUIsT0FBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFVBQUQsRUFBSTs7RUFFSixHQUFBLEdBQU0sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsV0FBaEI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxTQUFSOztFQUNYLFdBQUEsR0FBYzs7RUFFZCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUVMLGNBQUEsR0FBaUI7O0VBQ2pCLGlCQUFBLEdBQW9COztFQUVwQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OytCQUNKLFNBQUEsR0FBVzs7K0JBQ1gsRUFBQSxHQUFJOzsrQkFDSixTQUFBLEdBQVc7OytCQUNYLE1BQUEsR0FBUTs7K0JBQ1IsR0FBQSxHQUFLOzsrQkFDTCxZQUFBLEdBQWMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBQTs7K0JBQ2QsU0FBQSxHQUFXOzsrQkFDWCxLQUFBLEdBQU87OytCQUNQLE9BQUEsR0FBUzs7SUFFVCxnQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sNkJBQVA7UUFBc0MsTUFBQSxFQUFRLGtCQUE5QztPQUFMLEVBQXVFLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNyRSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxlQUFQO1lBQXdCLE1B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QU8sSUFBQyxDQUFBLGdCQUFELENBQUE7SUFEQTs7K0JBR1QsZ0JBQUEsR0FBa0IsU0FBQTtBQUNoQixhQUFPLElBQUMsQ0FBQSxLQUFELElBQVUsSUFBQyxDQUFBO0lBREY7OytCQUdsQixXQUFBLEdBQWEsU0FBQTtBQUNYLGFBQU8sSUFBQyxDQUFBO0lBREc7OytCQUdiLFdBQUEsR0FBYSxTQUFBO0FBQ1gsYUFBTyxJQUFDLENBQUE7SUFERzs7OztLQXpnQmdCO0FBZC9CIiwic291cmNlc0NvbnRlbnQiOlsie1Rhc2ssIENvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9ID0gcmVxdWlyZSAnYXRvbSdcbnskLCBWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5QdHkgPSByZXF1aXJlLnJlc29sdmUgJy4vcHJvY2VzcydcblRlcm1pbmFsID0gcmVxdWlyZSAndGVybS5qcydcbklucHV0RGlhbG9nID0gbnVsbFxuXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbm9zID0gcmVxdWlyZSAnb3MnXG5cbmxhc3RPcGVuZWRWaWV3ID0gbnVsbFxubGFzdEFjdGl2ZUVsZW1lbnQgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFRlcm1pbmFsUGx1c1ZpZXcgZXh0ZW5kcyBWaWV3XG4gIGFuaW1hdGluZzogZmFsc2VcbiAgaWQ6ICcnXG4gIG1heGltaXplZDogZmFsc2VcbiAgb3BlbmVkOiBmYWxzZVxuICBwd2Q6ICcnXG4gIHdpbmRvd0hlaWdodDogJCh3aW5kb3cpLmhlaWdodCgpXG4gIHJvd0hlaWdodDogMjBcbiAgc2hlbGw6ICcnXG4gIHRhYlZpZXc6IGZhbHNlXG5cbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ3Rlcm1pbmFsLXBsdXMgdGVybWluYWwtdmlldycsIG91dGxldDogJ3Rlcm1pbmFsUGx1c1ZpZXcnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ3BhbmVsLWRpdmlkZXInLCBvdXRsZXQ6ICdwYW5lbERpdmlkZXInXG4gICAgICBAZGl2IGNsYXNzOiAnYnRuLXRvb2xiYXInLCBvdXRsZXQ6J3Rvb2xiYXInLCA9PlxuICAgICAgICBAYnV0dG9uIG91dGxldDogJ2Nsb3NlQnRuJywgY2xhc3M6ICdidG4gaW5saW5lLWJsb2NrLXRpZ2h0IHJpZ2h0JywgY2xpY2s6ICdkZXN0cm95JywgPT5cbiAgICAgICAgICBAc3BhbiBjbGFzczogJ2ljb24gaWNvbi14J1xuICAgICAgICBAYnV0dG9uIG91dGxldDogJ2hpZGVCdG4nLCBjbGFzczogJ2J0biBpbmxpbmUtYmxvY2stdGlnaHQgcmlnaHQnLCBjbGljazogJ2hpZGUnLCA9PlxuICAgICAgICAgIEBzcGFuIGNsYXNzOiAnaWNvbiBpY29uLWNoZXZyb24tZG93bidcbiAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdtYXhpbWl6ZUJ0bicsIGNsYXNzOiAnYnRuIGlubGluZS1ibG9jay10aWdodCByaWdodCcsIGNsaWNrOiAnbWF4aW1pemUnLCA9PlxuICAgICAgICAgIEBzcGFuIGNsYXNzOiAnaWNvbiBpY29uLXNjcmVlbi1mdWxsJ1xuICAgICAgICBAYnV0dG9uIG91dGxldDogJ2lucHV0QnRuJywgY2xhc3M6ICdidG4gaW5saW5lLWJsb2NrLXRpZ2h0IGxlZnQnLCBjbGljazogJ2lucHV0RGlhbG9nJywgPT5cbiAgICAgICAgICBAc3BhbiBjbGFzczogJ2ljb24gaWNvbi1rZXlib2FyZCdcbiAgICAgIEBkaXYgY2xhc3M6ICd4dGVybScsIG91dGxldDogJ3h0ZXJtJ1xuXG4gIEBnZXRGb2N1c2VkVGVybWluYWw6IC0+XG4gICAgcmV0dXJuIFRlcm1pbmFsLlRlcm1pbmFsLmZvY3VzXG5cbiAgaW5pdGlhbGl6ZTogKEBpZCwgQHB3ZCwgQHN0YXR1c0ljb24sIEBzdGF0dXNCYXIsIEBzaGVsbCwgQGFyZ3M9W10pIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnRvb2x0aXBzLmFkZCBAY2xvc2VCdG4sXG4gICAgICB0aXRsZTogJ0Nsb3NlJ1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnRvb2x0aXBzLmFkZCBAaGlkZUJ0bixcbiAgICAgIHRpdGxlOiAnSGlkZSdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1heGltaXplQnRuLnRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCBAbWF4aW1pemVCdG4sXG4gICAgICB0aXRsZTogJ0Z1bGxzY3JlZW4nXG4gICAgQGlucHV0QnRuLnRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCBAaW5wdXRCdG4sXG4gICAgICB0aXRsZTogJ0luc2VydCBUZXh0J1xuXG4gICAgQHByZXZIZWlnaHQgPSBhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmFsLXBsdXMuc3R5bGUuZGVmYXVsdFBhbmVsSGVpZ2h0JylcbiAgICBpZiBAcHJldkhlaWdodC5pbmRleE9mKCclJykgPiAwXG4gICAgICBwZXJjZW50ID0gTWF0aC5hYnMoTWF0aC5taW4ocGFyc2VGbG9hdChAcHJldkhlaWdodCkgLyAxMDAuMCwgMSkpXG4gICAgICBib3R0b21IZWlnaHQgPSAkKCdhdG9tLXBhbmVsLmJvdHRvbScpLmNoaWxkcmVuKFwiLnRlcm1pbmFsLXZpZXdcIikuaGVpZ2h0KCkgb3IgMFxuICAgICAgQHByZXZIZWlnaHQgPSBwZXJjZW50ICogKCQoJy5pdGVtLXZpZXdzJykuaGVpZ2h0KCkgKyBib3R0b21IZWlnaHQpXG4gICAgQHh0ZXJtLmhlaWdodCAwXG5cbiAgICBAc2V0QW5pbWF0aW9uU3BlZWQoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAndGVybWluYWwtcGx1cy5zdHlsZS5hbmltYXRpb25TcGVlZCcsIEBzZXRBbmltYXRpb25TcGVlZFxuXG4gICAgb3ZlcnJpZGUgPSAoZXZlbnQpIC0+XG4gICAgICByZXR1cm4gaWYgZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGVybWluYWwtcGx1cycpIGlzICd0cnVlJ1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgIEB4dGVybS5vbiAnbW91c2V1cCcsIChldmVudCkgPT5cbiAgICAgIGlmIGV2ZW50LndoaWNoICE9IDNcbiAgICAgICAgdGV4dCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKS50b1N0cmluZygpXG4gICAgICAgIHVubGVzcyB0ZXh0XG4gICAgICAgICAgQGZvY3VzKClcbiAgICBAeHRlcm0ub24gJ2RyYWdlbnRlcicsIG92ZXJyaWRlXG4gICAgQHh0ZXJtLm9uICdkcmFnb3ZlcicsIG92ZXJyaWRlXG4gICAgQHh0ZXJtLm9uICdkcm9wJywgQHJlY2lldmVJdGVtT3JGaWxlXG5cbiAgICBAb24gJ2ZvY3VzJywgQGZvY3VzXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGRpc3Bvc2U6ID0+XG4gICAgICBAb2ZmICdmb2N1cycsIEBmb2N1c1xuXG4gIGF0dGFjaDogLT5cbiAgICByZXR1cm4gaWYgQHBhbmVsP1xuICAgIEBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsKGl0ZW06IHRoaXMsIHZpc2libGU6IGZhbHNlKVxuXG4gIHNldEFuaW1hdGlvblNwZWVkOiA9PlxuICAgIEBhbmltYXRpb25TcGVlZCA9IGF0b20uY29uZmlnLmdldCgndGVybWluYWwtcGx1cy5zdHlsZS5hbmltYXRpb25TcGVlZCcpXG4gICAgQGFuaW1hdGlvblNwZWVkID0gMTAwIGlmIEBhbmltYXRpb25TcGVlZCBpcyAwXG5cbiAgICBAeHRlcm0uY3NzICd0cmFuc2l0aW9uJywgXCJoZWlnaHQgI3swLjI1IC8gQGFuaW1hdGlvblNwZWVkfXMgbGluZWFyXCJcblxuICByZWNpZXZlSXRlbU9yRmlsZTogKGV2ZW50KSA9PlxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIHtkYXRhVHJhbnNmZXJ9ID0gZXZlbnQub3JpZ2luYWxFdmVudFxuXG4gICAgaWYgZGF0YVRyYW5zZmVyLmdldERhdGEoJ2F0b20tZXZlbnQnKSBpcyAndHJ1ZSdcbiAgICAgIGZpbGVQYXRoID0gZGF0YVRyYW5zZmVyLmdldERhdGEoJ3RleHQvcGxhaW4nKVxuICAgICAgQGlucHV0IFwiI3tmaWxlUGF0aH0gXCIgaWYgZmlsZVBhdGhcbiAgICBlbHNlIGlmIGZpbGVQYXRoID0gZGF0YVRyYW5zZmVyLmdldERhdGEoJ2luaXRpYWxQYXRoJylcbiAgICAgIEBpbnB1dCBcIiN7ZmlsZVBhdGh9IFwiXG4gICAgZWxzZSBpZiBkYXRhVHJhbnNmZXIuZmlsZXMubGVuZ3RoID4gMFxuICAgICAgZm9yIGZpbGUgaW4gZGF0YVRyYW5zZmVyLmZpbGVzXG4gICAgICAgIEBpbnB1dCBcIiN7ZmlsZS5wYXRofSBcIlxuXG4gIGZvcmtQdHlQcm9jZXNzOiAtPlxuICAgIFRhc2sub25jZSBQdHksIHBhdGgucmVzb2x2ZShAcHdkKSwgQHNoZWxsLCBAYXJncywgPT5cbiAgICAgIEBpbnB1dCA9IC0+XG4gICAgICBAcmVzaXplID0gLT5cblxuICBnZXRJZDogLT5cbiAgICByZXR1cm4gQGlkXG5cbiAgZGlzcGxheVRlcm1pbmFsOiAtPlxuICAgIHtjb2xzLCByb3dzfSA9IEBnZXREaW1lbnNpb25zKClcbiAgICBAcHR5UHJvY2VzcyA9IEBmb3JrUHR5UHJvY2VzcygpXG5cbiAgICBAdGVybWluYWwgPSBuZXcgVGVybWluYWwge1xuICAgICAgY3Vyc29yQmxpbmsgICAgIDogZmFsc2VcbiAgICAgIHNjcm9sbGJhY2sgICAgICA6IGF0b20uY29uZmlnLmdldCAndGVybWluYWwtcGx1cy5jb3JlLnNjcm9sbGJhY2snXG4gICAgICBjb2xzLCByb3dzXG4gICAgfVxuXG4gICAgQGF0dGFjaExpc3RlbmVycygpXG4gICAgQGF0dGFjaFJlc2l6ZUV2ZW50cygpXG4gICAgQGF0dGFjaFdpbmRvd0V2ZW50cygpXG4gICAgQHRlcm1pbmFsLm9wZW4gQHh0ZXJtLmdldCgwKVxuXG4gIGF0dGFjaExpc3RlbmVyczogLT5cbiAgICBAcHR5UHJvY2Vzcy5vbiBcInRlcm1pbmFsLXBsdXM6ZGF0YVwiLCAoZGF0YSkgPT5cbiAgICAgIEB0ZXJtaW5hbC53cml0ZSBkYXRhXG5cbiAgICBAcHR5UHJvY2Vzcy5vbiBcInRlcm1pbmFsLXBsdXM6ZXhpdFwiLCA9PlxuICAgICAgQGRlc3Ryb3koKSBpZiBhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmFsLXBsdXMudG9nZ2xlcy5hdXRvQ2xvc2UnKVxuXG4gICAgQHRlcm1pbmFsLmVuZCA9ID0+IEBkZXN0cm95KClcblxuICAgIEB0ZXJtaW5hbC5vbiBcImRhdGFcIiwgKGRhdGEpID0+XG4gICAgICBAaW5wdXQgZGF0YVxuXG4gICAgQHB0eVByb2Nlc3Mub24gXCJ0ZXJtaW5hbC1wbHVzOnRpdGxlXCIsICh0aXRsZSkgPT5cbiAgICAgIEBwcm9jZXNzID0gdGl0bGVcbiAgICBAdGVybWluYWwub24gXCJ0aXRsZVwiLCAodGl0bGUpID0+XG4gICAgICBAdGl0bGUgPSB0aXRsZVxuXG4gICAgQHRlcm1pbmFsLm9uY2UgXCJvcGVuXCIsID0+XG4gICAgICBAYXBwbHlTdHlsZSgpXG4gICAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuXG4gICAgICByZXR1cm4gdW5sZXNzIEBwdHlQcm9jZXNzLmNoaWxkUHJvY2Vzcz9cbiAgICAgIGF1dG9SdW5Db21tYW5kID0gYXRvbS5jb25maWcuZ2V0KCd0ZXJtaW5hbC1wbHVzLmNvcmUuYXV0b1J1bkNvbW1hbmQnKVxuICAgICAgQGlucHV0IFwiI3thdXRvUnVuQ29tbWFuZH0je29zLkVPTH1cIiBpZiBhdXRvUnVuQ29tbWFuZFxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQHN0YXR1c0ljb24uZGVzdHJveSgpXG4gICAgQHN0YXR1c0Jhci5yZW1vdmVUZXJtaW5hbFZpZXcgdGhpc1xuICAgIEBkZXRhY2hSZXNpemVFdmVudHMoKVxuICAgIEBkZXRhY2hXaW5kb3dFdmVudHMoKVxuXG4gICAgaWYgQHBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICBAaGlkZSgpXG4gICAgICBAb25UcmFuc2l0aW9uRW5kID0+IEBwYW5lbC5kZXN0cm95KClcbiAgICBlbHNlXG4gICAgICBAcGFuZWwuZGVzdHJveSgpXG5cbiAgICBpZiBAc3RhdHVzSWNvbiBhbmQgQHN0YXR1c0ljb24ucGFyZW50Tm9kZVxuICAgICAgQHN0YXR1c0ljb24ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChAc3RhdHVzSWNvbilcblxuICAgIEBwdHlQcm9jZXNzPy50ZXJtaW5hdGUoKVxuICAgIEB0ZXJtaW5hbD8uZGVzdHJveSgpXG5cbiAgbWF4aW1pemU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMucmVtb3ZlIEBtYXhpbWl6ZUJ0bi50b29sdGlwXG4gICAgQG1heGltaXplQnRuLnRvb2x0aXAuZGlzcG9zZSgpXG5cbiAgICBAbWF4SGVpZ2h0ID0gQHByZXZIZWlnaHQgKyAkKCcuaXRlbS12aWV3cycpLmhlaWdodCgpXG4gICAgYnRuID0gQG1heGltaXplQnRuLmNoaWxkcmVuKCdzcGFuJylcbiAgICBAb25UcmFuc2l0aW9uRW5kID0+IEBmb2N1cygpXG5cbiAgICBpZiBAbWF4aW1pemVkXG4gICAgICBAbWF4aW1pemVCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBtYXhpbWl6ZUJ0bixcbiAgICAgICAgdGl0bGU6ICdGdWxsc2NyZWVuJ1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBtYXhpbWl6ZUJ0bi50b29sdGlwXG4gICAgICBAYWRqdXN0SGVpZ2h0IEBwcmV2SGVpZ2h0XG4gICAgICBidG4ucmVtb3ZlQ2xhc3MoJ2ljb24tc2NyZWVuLW5vcm1hbCcpLmFkZENsYXNzKCdpY29uLXNjcmVlbi1mdWxsJylcbiAgICAgIEBtYXhpbWl6ZWQgPSBmYWxzZVxuICAgIGVsc2VcbiAgICAgIEBtYXhpbWl6ZUJ0bi50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQgQG1heGltaXplQnRuLFxuICAgICAgICB0aXRsZTogJ05vcm1hbCdcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgICAgQGFkanVzdEhlaWdodCBAbWF4SGVpZ2h0XG4gICAgICBidG4ucmVtb3ZlQ2xhc3MoJ2ljb24tc2NyZWVuLWZ1bGwnKS5hZGRDbGFzcygnaWNvbi1zY3JlZW4tbm9ybWFsJylcbiAgICAgIEBtYXhpbWl6ZWQgPSB0cnVlXG5cbiAgb3BlbjogPT5cbiAgICBsYXN0QWN0aXZlRWxlbWVudCA/PSAkKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG5cbiAgICBpZiBsYXN0T3BlbmVkVmlldyBhbmQgbGFzdE9wZW5lZFZpZXcgIT0gdGhpc1xuICAgICAgaWYgbGFzdE9wZW5lZFZpZXcubWF4aW1pemVkXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLnJlbW92ZSBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgICAgICBAbWF4aW1pemVCdG4udG9vbHRpcC5kaXNwb3NlKClcbiAgICAgICAgaWNvbiA9IEBtYXhpbWl6ZUJ0bi5jaGlsZHJlbignc3BhbicpXG5cbiAgICAgICAgQG1heEhlaWdodCA9IGxhc3RPcGVuZWRWaWV3Lm1heEhlaWdodFxuICAgICAgICBAbWF4aW1pemVCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBtYXhpbWl6ZUJ0bixcbiAgICAgICAgICB0aXRsZTogJ05vcm1hbCdcbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBtYXhpbWl6ZUJ0bi50b29sdGlwXG4gICAgICAgIGljb24ucmVtb3ZlQ2xhc3MoJ2ljb24tc2NyZWVuLWZ1bGwnKS5hZGRDbGFzcygnaWNvbi1zY3JlZW4tbm9ybWFsJylcbiAgICAgICAgQG1heGltaXplZCA9IHRydWVcbiAgICAgIGxhc3RPcGVuZWRWaWV3LmhpZGUoKVxuXG4gICAgbGFzdE9wZW5lZFZpZXcgPSB0aGlzXG4gICAgQHN0YXR1c0Jhci5zZXRBY3RpdmVUZXJtaW5hbFZpZXcgdGhpc1xuICAgIEBzdGF0dXNJY29uLmFjdGl2YXRlKClcblxuICAgIEBvblRyYW5zaXRpb25FbmQgPT5cbiAgICAgIGlmIG5vdCBAb3BlbmVkXG4gICAgICAgIEBvcGVuZWQgPSB0cnVlXG4gICAgICAgIEBkaXNwbGF5VGVybWluYWwoKVxuICAgICAgICBAcHJldkhlaWdodCA9IEBuZWFyZXN0Um93KEB4dGVybS5oZWlnaHQoKSlcbiAgICAgICAgQHh0ZXJtLmhlaWdodChAcHJldkhlaWdodClcbiAgICAgIGVsc2VcbiAgICAgICAgQGZvY3VzKClcblxuICAgIEBwYW5lbC5zaG93KClcbiAgICBAeHRlcm0uaGVpZ2h0IDBcbiAgICBAYW5pbWF0aW5nID0gdHJ1ZVxuICAgIEB4dGVybS5oZWlnaHQgaWYgQG1heGltaXplZCB0aGVuIEBtYXhIZWlnaHQgZWxzZSBAcHJldkhlaWdodFxuXG4gIGhpZGU6ID0+XG4gICAgQHRlcm1pbmFsPy5ibHVyKClcbiAgICBsYXN0T3BlbmVkVmlldyA9IG51bGxcbiAgICBAc3RhdHVzSWNvbi5kZWFjdGl2YXRlKClcblxuICAgIEBvblRyYW5zaXRpb25FbmQgPT5cbiAgICAgIEBwYW5lbC5oaWRlKClcbiAgICAgIHVubGVzcyBsYXN0T3BlbmVkVmlldz9cbiAgICAgICAgaWYgbGFzdEFjdGl2ZUVsZW1lbnQ/XG4gICAgICAgICAgbGFzdEFjdGl2ZUVsZW1lbnQuZm9jdXMoKVxuICAgICAgICAgIGxhc3RBY3RpdmVFbGVtZW50ID0gbnVsbFxuXG4gICAgQHh0ZXJtLmhlaWdodCBpZiBAbWF4aW1pemVkIHRoZW4gQG1heEhlaWdodCBlbHNlIEBwcmV2SGVpZ2h0XG4gICAgQGFuaW1hdGluZyA9IHRydWVcbiAgICBAeHRlcm0uaGVpZ2h0IDBcblxuICB0b2dnbGU6IC0+XG4gICAgcmV0dXJuIGlmIEBhbmltYXRpbmdcblxuICAgIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgQGhpZGUoKVxuICAgIGVsc2VcbiAgICAgIEBvcGVuKClcblxuICBpbnB1dDogKGRhdGEpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcHR5UHJvY2Vzcy5jaGlsZFByb2Nlc3M/XG5cbiAgICBAdGVybWluYWwuc3RvcFNjcm9sbGluZygpXG4gICAgQHB0eVByb2Nlc3Muc2VuZCBldmVudDogJ2lucHV0JywgdGV4dDogZGF0YVxuXG4gIHJlc2l6ZTogKGNvbHMsIHJvd3MpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcHR5UHJvY2Vzcy5jaGlsZFByb2Nlc3M/XG5cbiAgICBAcHR5UHJvY2Vzcy5zZW5kIHtldmVudDogJ3Jlc2l6ZScsIHJvd3MsIGNvbHN9XG5cbiAgYXBwbHlTdHlsZTogLT5cbiAgICBjb25maWcgPSBhdG9tLmNvbmZpZy5nZXQgJ3Rlcm1pbmFsLXBsdXMnXG5cbiAgICBAeHRlcm0uYWRkQ2xhc3MgY29uZmlnLnN0eWxlLnRoZW1lXG4gICAgQHh0ZXJtLmFkZENsYXNzICdjdXJzb3ItYmxpbmsnIGlmIGNvbmZpZy50b2dnbGVzLmN1cnNvckJsaW5rXG5cbiAgICBlZGl0b3JGb250ID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IuZm9udEZhbWlseScpXG4gICAgZGVmYXVsdEZvbnQgPSBcIk1lbmxvLCBDb25zb2xhcywgJ0RlamFWdSBTYW5zIE1vbm8nLCBtb25vc3BhY2VcIlxuICAgIG92ZXJyaWRlRm9udCA9IGNvbmZpZy5zdHlsZS5mb250RmFtaWx5XG4gICAgQHRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuZm9udEZhbWlseSA9IG92ZXJyaWRlRm9udCBvciBlZGl0b3JGb250IG9yIGRlZmF1bHRGb250XG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2VkaXRvci5mb250RmFtaWx5JywgKGV2ZW50KSA9PlxuICAgICAgZWRpdG9yRm9udCA9IGV2ZW50Lm5ld1ZhbHVlXG4gICAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250RmFtaWx5ID0gb3ZlcnJpZGVGb250IG9yIGVkaXRvckZvbnQgb3IgZGVmYXVsdEZvbnRcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3Rlcm1pbmFsLXBsdXMuc3R5bGUuZm9udEZhbWlseScsIChldmVudCkgPT5cbiAgICAgIG92ZXJyaWRlRm9udCA9IGV2ZW50Lm5ld1ZhbHVlXG4gICAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250RmFtaWx5ID0gb3ZlcnJpZGVGb250IG9yIGVkaXRvckZvbnQgb3IgZGVmYXVsdEZvbnRcblxuICAgIGVkaXRvckZvbnRTaXplID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IuZm9udFNpemUnKVxuICAgIG92ZXJyaWRlRm9udFNpemUgPSBjb25maWcuc3R5bGUuZm9udFNpemVcbiAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250U2l6ZSA9IFwiI3tvdmVycmlkZUZvbnRTaXplIG9yIGVkaXRvckZvbnRTaXplfXB4XCJcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnZWRpdG9yLmZvbnRTaXplJywgKGV2ZW50KSA9PlxuICAgICAgZWRpdG9yRm9udFNpemUgPSBldmVudC5uZXdWYWx1ZVxuICAgICAgQHRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuZm9udFNpemUgPSBcIiN7b3ZlcnJpZGVGb250U2l6ZSBvciBlZGl0b3JGb250U2l6ZX1weFwiXG4gICAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAndGVybWluYWwtcGx1cy5zdHlsZS5mb250U2l6ZScsIChldmVudCkgPT5cbiAgICAgIG92ZXJyaWRlRm9udFNpemUgPSBldmVudC5uZXdWYWx1ZVxuICAgICAgQHRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuZm9udFNpemUgPSBcIiN7b3ZlcnJpZGVGb250U2l6ZSBvciBlZGl0b3JGb250U2l6ZX1weFwiXG4gICAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuXG4gICAgIyBmaXJzdCA4IGNvbG9ycyBpLmUuICdkYXJrJyBjb2xvcnNcbiAgICBAdGVybWluYWwuY29sb3JzWzAuLjddID0gW1xuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLmJsYWNrLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5yZWQudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLmdyZWVuLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC55ZWxsb3cudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLmJsdWUudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLm1hZ2VudGEudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLmN5YW4udG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLndoaXRlLnRvSGV4U3RyaW5nKClcbiAgICBdXG4gICAgIyAnYnJpZ2h0JyBjb2xvcnNcbiAgICBAdGVybWluYWwuY29sb3JzWzguLjE1XSA9IFtcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0QmxhY2sudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRSZWQudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRHcmVlbi50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodFllbGxvdy50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodEJsdWUudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRNYWdlbnRhLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0Q3lhbi50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodFdoaXRlLnRvSGV4U3RyaW5nKClcbiAgICBdXG5cbiAgYXR0YWNoV2luZG93RXZlbnRzOiAtPlxuICAgICQod2luZG93KS5vbiAncmVzaXplJywgQG9uV2luZG93UmVzaXplXG5cbiAgZGV0YWNoV2luZG93RXZlbnRzOiAtPlxuICAgICQod2luZG93KS5vZmYgJ3Jlc2l6ZScsIEBvbldpbmRvd1Jlc2l6ZVxuXG4gIGF0dGFjaFJlc2l6ZUV2ZW50czogLT5cbiAgICBAcGFuZWxEaXZpZGVyLm9uICdtb3VzZWRvd24nLCBAcmVzaXplU3RhcnRlZFxuXG4gIGRldGFjaFJlc2l6ZUV2ZW50czogLT5cbiAgICBAcGFuZWxEaXZpZGVyLm9mZiAnbW91c2Vkb3duJ1xuXG4gIG9uV2luZG93UmVzaXplOiA9PlxuICAgIGlmIG5vdCBAdGFiVmlld1xuICAgICAgQHh0ZXJtLmNzcyAndHJhbnNpdGlvbicsICcnXG4gICAgICBuZXdIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KClcbiAgICAgIGJvdHRvbVBhbmVsID0gJCgnYXRvbS1wYW5lbC1jb250YWluZXIuYm90dG9tJykuZmlyc3QoKS5nZXQoMClcbiAgICAgIG92ZXJmbG93ID0gYm90dG9tUGFuZWwuc2Nyb2xsSGVpZ2h0IC0gYm90dG9tUGFuZWwub2Zmc2V0SGVpZ2h0XG5cbiAgICAgIGRlbHRhID0gbmV3SGVpZ2h0IC0gQHdpbmRvd0hlaWdodFxuICAgICAgQHdpbmRvd0hlaWdodCA9IG5ld0hlaWdodFxuXG4gICAgICBpZiBAbWF4aW1pemVkXG4gICAgICAgIGNsYW1wZWQgPSBNYXRoLm1heChAbWF4SGVpZ2h0ICsgZGVsdGEsIEByb3dIZWlnaHQpXG5cbiAgICAgICAgQGFkanVzdEhlaWdodCBjbGFtcGVkIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgICBAbWF4SGVpZ2h0ID0gY2xhbXBlZFxuXG4gICAgICAgIEBwcmV2SGVpZ2h0ID0gTWF0aC5taW4oQHByZXZIZWlnaHQsIEBtYXhIZWlnaHQpXG4gICAgICBlbHNlIGlmIG92ZXJmbG93ID4gMFxuICAgICAgICBjbGFtcGVkID0gTWF0aC5tYXgoQG5lYXJlc3RSb3coQHByZXZIZWlnaHQgKyBkZWx0YSksIEByb3dIZWlnaHQpXG5cbiAgICAgICAgQGFkanVzdEhlaWdodCBjbGFtcGVkIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgICBAcHJldkhlaWdodCA9IGNsYW1wZWRcblxuICAgICAgQHh0ZXJtLmNzcyAndHJhbnNpdGlvbicsIFwiaGVpZ2h0ICN7MC4yNSAvIEBhbmltYXRpb25TcGVlZH1zIGxpbmVhclwiXG4gICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcblxuICByZXNpemVTdGFydGVkOiA9PlxuICAgIHJldHVybiBpZiBAbWF4aW1pemVkXG4gICAgQG1heEhlaWdodCA9IEBwcmV2SGVpZ2h0ICsgJCgnLml0ZW0tdmlld3MnKS5oZWlnaHQoKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBAcmVzaXplUGFuZWwpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBAcmVzaXplU3RvcHBlZClcbiAgICBAeHRlcm0uY3NzICd0cmFuc2l0aW9uJywgJydcblxuICByZXNpemVTdG9wcGVkOiA9PlxuICAgICQoZG9jdW1lbnQpLm9mZignbW91c2Vtb3ZlJywgQHJlc2l6ZVBhbmVsKVxuICAgICQoZG9jdW1lbnQpLm9mZignbW91c2V1cCcsIEByZXNpemVTdG9wcGVkKVxuICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCBcImhlaWdodCAjezAuMjUgLyBAYW5pbWF0aW9uU3BlZWR9cyBsaW5lYXJcIlxuXG4gIG5lYXJlc3RSb3c6ICh2YWx1ZSkgLT5cbiAgICByb3dzID0gdmFsdWUgLy8gQHJvd0hlaWdodFxuICAgIHJldHVybiByb3dzICogQHJvd0hlaWdodFxuXG4gIHJlc2l6ZVBhbmVsOiAoZXZlbnQpID0+XG4gICAgcmV0dXJuIEByZXNpemVTdG9wcGVkKCkgdW5sZXNzIGV2ZW50LndoaWNoIGlzIDFcblxuICAgIG1vdXNlWSA9ICQod2luZG93KS5oZWlnaHQoKSAtIGV2ZW50LnBhZ2VZXG4gICAgZGVsdGEgPSBtb3VzZVkgLSAkKCdhdG9tLXBhbmVsLWNvbnRhaW5lci5ib3R0b20nKS5oZWlnaHQoKVxuICAgIHJldHVybiB1bmxlc3MgTWF0aC5hYnMoZGVsdGEpID4gKEByb3dIZWlnaHQgKiA1IC8gNilcblxuICAgIGNsYW1wZWQgPSBNYXRoLm1heChAbmVhcmVzdFJvdyhAcHJldkhlaWdodCArIGRlbHRhKSwgQHJvd0hlaWdodClcbiAgICByZXR1cm4gaWYgY2xhbXBlZCA+IEBtYXhIZWlnaHRcblxuICAgIEB4dGVybS5oZWlnaHQgY2xhbXBlZFxuICAgICQoQHRlcm1pbmFsLmVsZW1lbnQpLmhlaWdodCBjbGFtcGVkXG4gICAgQHByZXZIZWlnaHQgPSBjbGFtcGVkXG5cbiAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuXG4gIGFkanVzdEhlaWdodDogKGhlaWdodCkgLT5cbiAgICBAeHRlcm0uaGVpZ2h0IGhlaWdodFxuICAgICQoQHRlcm1pbmFsLmVsZW1lbnQpLmhlaWdodCBoZWlnaHRcblxuICBjb3B5OiAtPlxuICAgIGlmIEB0ZXJtaW5hbC5fc2VsZWN0ZWRcbiAgICAgIHRleHRhcmVhID0gQHRlcm1pbmFsLmdldENvcHlUZXh0YXJlYSgpXG4gICAgICB0ZXh0ID0gQHRlcm1pbmFsLmdyYWJUZXh0KFxuICAgICAgICBAdGVybWluYWwuX3NlbGVjdGVkLngxLCBAdGVybWluYWwuX3NlbGVjdGVkLngyLFxuICAgICAgICBAdGVybWluYWwuX3NlbGVjdGVkLnkxLCBAdGVybWluYWwuX3NlbGVjdGVkLnkyKVxuICAgIGVsc2VcbiAgICAgIHJhd1RleHQgPSBAdGVybWluYWwuY29udGV4dC5nZXRTZWxlY3Rpb24oKS50b1N0cmluZygpXG4gICAgICByYXdMaW5lcyA9IHJhd1RleHQuc3BsaXQoL1xccj9cXG4vZylcbiAgICAgIGxpbmVzID0gcmF3TGluZXMubWFwIChsaW5lKSAtPlxuICAgICAgICBsaW5lLnJlcGxhY2UoL1xccy9nLCBcIiBcIikudHJpbVJpZ2h0KClcbiAgICAgIHRleHQgPSBsaW5lcy5qb2luKFwiXFxuXCIpXG4gICAgYXRvbS5jbGlwYm9hcmQud3JpdGUgdGV4dFxuXG4gIHBhc3RlOiAtPlxuICAgIEBpbnB1dCBhdG9tLmNsaXBib2FyZC5yZWFkKClcblxuICBpbnNlcnRTZWxlY3Rpb246IC0+XG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBydW5Db21tYW5kID0gYXRvbS5jb25maWcuZ2V0KCd0ZXJtaW5hbC1wbHVzLnRvZ2dsZXMucnVuSW5zZXJ0ZWRUZXh0JylcblxuICAgIGlmIHNlbGVjdGlvbiA9IGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKVxuICAgICAgQHRlcm1pbmFsLnN0b3BTY3JvbGxpbmcoKVxuICAgICAgQGlucHV0IFwiI3tzZWxlY3Rpb259I3tpZiBydW5Db21tYW5kIHRoZW4gb3MuRU9MIGVsc2UgJyd9XCJcbiAgICBlbHNlIGlmIGN1cnNvciA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGN1cnNvci5yb3cpXG4gICAgICBAdGVybWluYWwuc3RvcFNjcm9sbGluZygpXG4gICAgICBAaW5wdXQgXCIje2xpbmV9I3tpZiBydW5Db21tYW5kIHRoZW4gb3MuRU9MIGVsc2UgJyd9XCJcbiAgICAgIGVkaXRvci5tb3ZlRG93bigxKTtcblxuICBmb2N1czogPT5cbiAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuICAgIEBmb2N1c1Rlcm1pbmFsKClcbiAgICBAc3RhdHVzQmFyLnNldEFjdGl2ZVRlcm1pbmFsVmlldyh0aGlzKVxuICAgIHN1cGVyKClcblxuICBibHVyOiA9PlxuICAgIEBibHVyVGVybWluYWwoKVxuICAgIHN1cGVyKClcblxuICBmb2N1c1Rlcm1pbmFsOiA9PlxuICAgIHJldHVybiB1bmxlc3MgQHRlcm1pbmFsXG5cbiAgICBAdGVybWluYWwuZm9jdXMoKVxuICAgIGlmIEB0ZXJtaW5hbC5fdGV4dGFyZWFcbiAgICAgIEB0ZXJtaW5hbC5fdGV4dGFyZWEuZm9jdXMoKVxuICAgIGVsc2VcbiAgICAgIEB0ZXJtaW5hbC5lbGVtZW50LmZvY3VzKClcblxuICBibHVyVGVybWluYWw6ID0+XG4gICAgcmV0dXJuIHVubGVzcyBAdGVybWluYWxcblxuICAgIEB0ZXJtaW5hbC5ibHVyKClcbiAgICBAdGVybWluYWwuZWxlbWVudC5ibHVyKClcblxuICByZXNpemVUZXJtaW5hbFRvVmlldzogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBwYW5lbC5pc1Zpc2libGUoKSBvciBAdGFiVmlld1xuXG4gICAge2NvbHMsIHJvd3N9ID0gQGdldERpbWVuc2lvbnMoKVxuICAgIHJldHVybiB1bmxlc3MgY29scyA+IDAgYW5kIHJvd3MgPiAwXG4gICAgcmV0dXJuIHVubGVzcyBAdGVybWluYWxcbiAgICByZXR1cm4gaWYgQHRlcm1pbmFsLnJvd3MgaXMgcm93cyBhbmQgQHRlcm1pbmFsLmNvbHMgaXMgY29sc1xuXG4gICAgQHJlc2l6ZSBjb2xzLCByb3dzXG4gICAgQHRlcm1pbmFsLnJlc2l6ZSBjb2xzLCByb3dzXG5cbiAgZ2V0RGltZW5zaW9uczogLT5cbiAgICBmYWtlUm93ID0gJChcIjxkaXY+PHNwYW4+Jm5ic3A7PC9zcGFuPjwvZGl2PlwiKVxuXG4gICAgaWYgQHRlcm1pbmFsXG4gICAgICBAZmluZCgnLnRlcm1pbmFsJykuYXBwZW5kIGZha2VSb3dcbiAgICAgIGZha2VDb2wgPSBmYWtlUm93LmNoaWxkcmVuKCkuZmlyc3QoKVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29scyA9IE1hdGguZmxvb3IgQHh0ZXJtLndpZHRoKCkgLyAoZmFrZUNvbC53aWR0aCBvciA5KVxuICAgICAgcm93cyA9IE1hdGguZmxvb3IgQHh0ZXJtLmhlaWdodCgpIC8gKGZha2VDb2wuaGVpZ2h0IG9yIDIwKVxuICAgICAgQHJvd0hlaWdodCA9IGZha2VDb2wuaGVpZ2h0XG4gICAgICBmYWtlUm93LnJlbW92ZSgpXG4gICAgZWxzZVxuICAgICAgY29scyA9IE1hdGguZmxvb3IgQHh0ZXJtLndpZHRoKCkgLyA5XG4gICAgICByb3dzID0gTWF0aC5mbG9vciBAeHRlcm0uaGVpZ2h0KCkgLyAyMFxuXG4gICAge2NvbHMsIHJvd3N9XG5cbiAgb25UcmFuc2l0aW9uRW5kOiAoY2FsbGJhY2spIC0+XG4gICAgQHh0ZXJtLm9uZSAnd2Via2l0VHJhbnNpdGlvbkVuZCcsID0+XG4gICAgICBjYWxsYmFjaygpXG4gICAgICBAYW5pbWF0aW5nID0gZmFsc2VcblxuICBpbnB1dERpYWxvZzogLT5cbiAgICBJbnB1dERpYWxvZyA/PSByZXF1aXJlKCcuL2lucHV0LWRpYWxvZycpXG4gICAgZGlhbG9nID0gbmV3IElucHV0RGlhbG9nIHRoaXNcbiAgICBkaWFsb2cuYXR0YWNoKClcblxuICByZW5hbWU6IC0+XG4gICAgQHN0YXR1c0ljb24ucmVuYW1lKClcblxuICB0b2dnbGVUYWJWaWV3OiAtPlxuICAgIGlmIEB0YWJWaWV3XG4gICAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiB0aGlzLCB2aXNpYmxlOiBmYWxzZSlcbiAgICAgIEBhdHRhY2hSZXNpemVFdmVudHMoKVxuICAgICAgQGNsb3NlQnRuLnNob3coKVxuICAgICAgQGhpZGVCdG4uc2hvdygpXG4gICAgICBAbWF4aW1pemVCdG4uc2hvdygpXG4gICAgICBAdGFiVmlldyA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgQHBhbmVsLmRlc3Ryb3koKVxuICAgICAgQGRldGFjaFJlc2l6ZUV2ZW50cygpXG4gICAgICBAY2xvc2VCdG4uaGlkZSgpXG4gICAgICBAaGlkZUJ0bi5oaWRlKClcbiAgICAgIEBtYXhpbWl6ZUJ0bi5oaWRlKClcbiAgICAgIEB4dGVybS5jc3MgXCJoZWlnaHRcIiwgXCJcIlxuICAgICAgQHRhYlZpZXcgPSB0cnVlXG4gICAgICBsYXN0T3BlbmVkVmlldyA9IG51bGwgaWYgbGFzdE9wZW5lZFZpZXcgPT0gdGhpc1xuXG4gIGdldFRpdGxlOiAtPlxuICAgIEBzdGF0dXNJY29uLmdldE5hbWUoKSBvciBcIlRlcm1pbmFsLVBsdXNcIlxuXG4gIGdldEljb25OYW1lOiAtPlxuICAgIFwidGVybWluYWxcIlxuXG4gIGdldFNoZWxsOiAtPlxuICAgIHJldHVybiBwYXRoLmJhc2VuYW1lIEBzaGVsbFxuXG4gIGdldFNoZWxsUGF0aDogLT5cbiAgICByZXR1cm4gQHNoZWxsXG5cbiAgZW1pdDogKGV2ZW50LCBkYXRhKSAtPlxuICAgIEBlbWl0dGVyLmVtaXQgZXZlbnQsIGRhdGFcblxuICBvbkRpZENoYW5nZVRpdGxlOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1jaGFuZ2UtdGl0bGUnLCBjYWxsYmFja1xuXG4gIGdldFBhdGg6IC0+XG4gICAgcmV0dXJuIEBnZXRUZXJtaW5hbFRpdGxlKClcblxuICBnZXRUZXJtaW5hbFRpdGxlOiAtPlxuICAgIHJldHVybiBAdGl0bGUgb3IgQHByb2Nlc3NcblxuICBnZXRUZXJtaW5hbDogLT5cbiAgICByZXR1cm4gQHRlcm1pbmFsXG5cbiAgaXNBbmltYXRpbmc6IC0+XG4gICAgcmV0dXJuIEBhbmltYXRpbmdcbiJdfQ==
