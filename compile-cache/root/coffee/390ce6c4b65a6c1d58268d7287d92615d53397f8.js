(function() {
  var $, CompositeDisposable, StatusBar, StatusIcon, TerminalFusionView, View, os, path, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, View = ref.View;

  TerminalFusionView = require('./view');

  StatusIcon = require('./status-icon');

  os = require('os');

  path = require('path');

  module.exports = StatusBar = (function(superClass) {
    extend(StatusBar, superClass);

    function StatusBar() {
      this.moveTerminalView = bind(this.moveTerminalView, this);
      this.onDropTabBar = bind(this.onDropTabBar, this);
      this.onDrop = bind(this.onDrop, this);
      this.onDragOver = bind(this.onDragOver, this);
      this.onDragEnd = bind(this.onDragEnd, this);
      this.onDragLeave = bind(this.onDragLeave, this);
      this.onDragStart = bind(this.onDragStart, this);
      this.closeAll = bind(this.closeAll, this);
      return StatusBar.__super__.constructor.apply(this, arguments);
    }

    StatusBar.prototype.terminalViews = [];

    StatusBar.prototype.activeTerminal = null;

    StatusBar.prototype.returnFocus = null;

    StatusBar.content = function() {
      return this.div({
        "class": 'terminal-fusion status-bar',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.i({
            "class": "icon icon-plus",
            click: 'newTerminalView',
            outlet: 'plusBtn'
          });
          _this.ul({
            "class": "list-inline status-container",
            tabindex: '-1',
            outlet: 'statusContainer',
            is: 'space-pen-ul'
          });
          return _this.i({
            "class": "icon icon-x",
            click: 'closeAll',
            outlet: 'closeBtn'
          });
        };
      })(this));
    };

    StatusBar.prototype.initialize = function(statusBarProvider) {
      var handleBlur, handleFocus;
      this.statusBarProvider = statusBarProvider;
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'terminal-fusion:new': (function(_this) {
          return function() {
            return _this.newTerminalView();
          };
        })(this),
        'terminal-fusion:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'terminal-fusion:next': (function(_this) {
          return function() {
            if (!_this.activeTerminal) {
              return;
            }
            if (_this.activeTerminal.isAnimating()) {
              return;
            }
            if (_this.activeNextTerminalView()) {
              return _this.activeTerminal.open();
            }
          };
        })(this),
        'terminal-fusion:prev': (function(_this) {
          return function() {
            if (!_this.activeTerminal) {
              return;
            }
            if (_this.activeTerminal.isAnimating()) {
              return;
            }
            if (_this.activePrevTerminalView()) {
              return _this.activeTerminal.open();
            }
          };
        })(this),
        'terminal-fusion:close': (function(_this) {
          return function() {
            return _this.destroyActiveTerm();
          };
        })(this),
        'terminal-fusion:close-all': (function(_this) {
          return function() {
            return _this.closeAll();
          };
        })(this),
        'terminal-fusion:rename': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.rename();
            });
          };
        })(this),
        'terminal-fusion:insert-selected-text': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection('$S');
            });
          };
        })(this),
        'terminal-fusion:insert-text': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.inputDialog();
            });
          };
        })(this),
        'terminal-fusion:insert-custom-text-1': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('terminal-fusion.customTexts.customText1'));
            });
          };
        })(this),
        'terminal-fusion:insert-custom-text-2': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('terminal-fusion.customTexts.customText2'));
            });
          };
        })(this),
        'terminal-fusion:insert-custom-text-3': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('terminal-fusion.customTexts.customText3'));
            });
          };
        })(this),
        'terminal-fusion:insert-custom-text-4': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('terminal-fusion.customTexts.customText4'));
            });
          };
        })(this),
        'terminal-fusion:insert-custom-text-5': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('terminal-fusion.customTexts.customText5'));
            });
          };
        })(this),
        'terminal-fusion:insert-custom-text-6': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('terminal-fusion.customTexts.customText6'));
            });
          };
        })(this),
        'terminal-fusion:insert-custom-text-7': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('terminal-fusion.customTexts.customText7'));
            });
          };
        })(this),
        'terminal-fusion:insert-custom-text-8': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.insertSelection(atom.config.get('terminal-fusion.customTexts.customText8'));
            });
          };
        })(this),
        'terminal-fusion:fullscreen': (function(_this) {
          return function() {
            return _this.activeTerminal.maximize();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('.xterm', {
        'terminal-fusion:paste': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.paste();
            });
          };
        })(this),
        'terminal-fusion:copy': (function(_this) {
          return function() {
            return _this.runInActiveView(function(i) {
              return i.copy();
            });
          };
        })(this)
      }));
      this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(item) {
          var mapping, nextTerminal, prevTerminal;
          if (item == null) {
            return;
          }
          if (item.constructor.name === "TerminalFusionView") {
            return setTimeout(item.focus, 100);
          } else if (item.constructor.name === "TextEditor") {
            mapping = atom.config.get('terminal-fusion.core.mapTerminalsTo');
            if (mapping === 'None') {
              return;
            }
            switch (mapping) {
              case 'File':
                nextTerminal = _this.getTerminalById(item.getPath(), function(view) {
                  return view.getId().filePath;
                });
                break;
              case 'Folder':
                nextTerminal = _this.getTerminalById(path.dirname(item.getPath()), function(view) {
                  return view.getId().folderPath;
                });
            }
            prevTerminal = _this.getActiveTerminalView();
            if (prevTerminal !== nextTerminal) {
              if (nextTerminal == null) {
                if (item.getTitle() !== 'untitled') {
                  if (atom.config.get('terminal-fusion.core.mapTerminalsToAutoOpen')) {
                    return nextTerminal = _this.createTerminalView();
                  }
                }
              } else {
                _this.setActiveTerminalView(nextTerminal);
                if (prevTerminal != null ? prevTerminal.panel.isVisible() : void 0) {
                  return nextTerminal.toggle();
                }
              }
            }
          }
        };
      })(this)));
      this.registerContextMenu();
      this.subscriptions.add(atom.tooltips.add(this.plusBtn, {
        title: 'New Terminal'
      }));
      this.subscriptions.add(atom.tooltips.add(this.closeBtn, {
        title: 'Close All'
      }));
      this.statusContainer.on('dblclick', (function(_this) {
        return function(event) {
          if (event.target === event.delegateTarget) {
            return _this.newTerminalView();
          }
        };
      })(this));
      this.statusContainer.on('dragstart', '.fusion-terminal-status-icon', this.onDragStart);
      this.statusContainer.on('dragend', '.fusion-terminal-status-icon', this.onDragEnd);
      this.statusContainer.on('dragleave', this.onDragLeave);
      this.statusContainer.on('dragover', this.onDragOver);
      this.statusContainer.on('drop', this.onDrop);
      handleBlur = (function(_this) {
        return function() {
          var terminal;
          if (terminal = TerminalFusionView.getFocusedTerminal()) {
            _this.returnFocus = _this.terminalViewForTerminal(terminal);
            return terminal.blur();
          }
        };
      })(this);
      handleFocus = (function(_this) {
        return function() {
          if (_this.returnFocus) {
            return setTimeout(function() {
              var tempFocus;
              if (_this.returnFocus) {
                tempFocus = _this.returnFocus;
                _this.returnFocus = null;
                if (tempFocus) {
                  return tempFocus.focus();
                }
              }
            }, 100);
          }
        };
      })(this);
      window.addEventListener('blur', handleBlur);
      this.subscriptions.add({
        dispose: function() {
          return window.removeEventListener('blur', handleBlur);
        }
      });
      window.addEventListener('focus', handleFocus);
      this.subscriptions.add({
        dispose: function() {
          return window.removeEventListener('focus', handleFocus);
        }
      });
      return this.attach();
    };

    StatusBar.prototype.registerContextMenu = function() {
      return this.subscriptions.add(atom.commands.add('.terminal-fusion.status-bar', {
        'terminal-fusion:status-red': this.setStatusColor,
        'terminal-fusion:status-orange': this.setStatusColor,
        'terminal-fusion:status-yellow': this.setStatusColor,
        'terminal-fusion:status-green': this.setStatusColor,
        'terminal-fusion:status-blue': this.setStatusColor,
        'terminal-fusion:status-purple': this.setStatusColor,
        'terminal-fusion:status-pink': this.setStatusColor,
        'terminal-fusion:status-cyan': this.setStatusColor,
        'terminal-fusion:status-magenta': this.setStatusColor,
        'terminal-fusion:status-default': this.clearStatusColor,
        'terminal-fusion:context-close': function(event) {
          return $(event.target).closest('.fusion-terminal-status-icon')[0].terminalView.destroy();
        },
        'terminal-fusion:context-hide': function(event) {
          var statusIcon;
          statusIcon = $(event.target).closest('.fusion-terminal-status-icon')[0];
          if (statusIcon.isActive()) {
            return statusIcon.terminalView.hide();
          }
        },
        'terminal-fusion:context-rename': function(event) {
          return $(event.target).closest('.fusion-terminal-status-icon')[0].rename();
        }
      }));
    };

    StatusBar.prototype.registerPaneSubscription = function() {
      return this.subscriptions.add(this.paneSubscription = atom.workspace.observePanes((function(_this) {
        return function(pane) {
          var paneElement, tabBar;
          paneElement = $(atom.views.getView(pane));
          tabBar = paneElement.find('ul');
          tabBar.on('drop', function(event) {
            return _this.onDropTabBar(event, pane);
          });
          tabBar.on('dragstart', function(event) {
            var ref1;
            if (((ref1 = event.target.item) != null ? ref1.constructor.name : void 0) !== 'TerminalFusionView') {
              return;
            }
            return event.originalEvent.dataTransfer.setData('terminal-fusion-tab', 'true');
          });
          return pane.onDidDestroy(function() {
            return tabBar.off('drop', this.onDropTabBar);
          });
        };
      })(this)));
    };

    StatusBar.prototype.createTerminalView = function(autoRun) {
      var args, directory, editorFolder, editorPath, home, id, j, len, projectFolder, pwd, ref1, ref2, shell, shellArguments, statusIcon, terminalPlusView;
      if (this.paneSubscription == null) {
        this.registerPaneSubscription();
      }
      projectFolder = atom.project.getPaths()[0];
      editorPath = (ref1 = atom.workspace.getActiveTextEditor()) != null ? ref1.getPath() : void 0;
      if (editorPath != null) {
        editorFolder = path.dirname(editorPath);
        ref2 = atom.project.getPaths();
        for (j = 0, len = ref2.length; j < len; j++) {
          directory = ref2[j];
          if (editorPath.indexOf(directory) >= 0) {
            projectFolder = directory;
          }
        }
      }
      if ((projectFolder != null ? projectFolder.indexOf('atom://') : void 0) >= 0) {
        projectFolder = void 0;
      }
      home = process.platform === 'win32' ? process.env.HOMEPATH : process.env.HOME;
      switch (atom.config.get('terminal-fusion.core.workingDirectory')) {
        case 'Project':
          pwd = projectFolder || editorFolder || home;
          break;
        case 'Active File':
          pwd = editorFolder || projectFolder || home;
          break;
        default:
          pwd = home;
      }
      id = editorPath || projectFolder || home;
      id = {
        filePath: id,
        folderPath: path.dirname(id)
      };
      shell = atom.config.get('terminal-fusion.core.shell');
      shellArguments = atom.config.get('terminal-fusion.core.shellArguments');
      args = shellArguments.split(/\s+/g).filter(function(arg) {
        return arg;
      });
      statusIcon = new StatusIcon();
      terminalPlusView = new TerminalFusionView(id, pwd, statusIcon, this, shell, args, autoRun);
      statusIcon.initialize(terminalPlusView);
      terminalPlusView.attach();
      this.terminalViews.push(terminalPlusView);
      this.statusContainer.append(statusIcon);
      return terminalPlusView;
    };

    StatusBar.prototype.activeNextTerminalView = function() {
      var index;
      index = this.indexOf(this.activeTerminal);
      if (index < 0) {
        return false;
      }
      return this.activeTerminalView(index + 1);
    };

    StatusBar.prototype.activePrevTerminalView = function() {
      var index;
      index = this.indexOf(this.activeTerminal);
      if (index < 0) {
        return false;
      }
      return this.activeTerminalView(index - 1);
    };

    StatusBar.prototype.indexOf = function(view) {
      return this.terminalViews.indexOf(view);
    };

    StatusBar.prototype.activeTerminalView = function(index) {
      if (this.terminalViews.length < 2) {
        return false;
      }
      if (index >= this.terminalViews.length) {
        index = 0;
      }
      if (index < 0) {
        index = this.terminalViews.length - 1;
      }
      this.activeTerminal = this.terminalViews[index];
      return true;
    };

    StatusBar.prototype.getActiveTerminalView = function() {
      return this.activeTerminal;
    };

    StatusBar.prototype.getTerminalById = function(target, selector) {
      var index, j, ref1, terminal;
      if (selector == null) {
        selector = function(terminal) {
          return terminal.id;
        };
      }
      for (index = j = 0, ref1 = this.terminalViews.length; 0 <= ref1 ? j <= ref1 : j >= ref1; index = 0 <= ref1 ? ++j : --j) {
        terminal = this.terminalViews[index];
        if (terminal != null) {
          if (selector(terminal) === target) {
            return terminal;
          }
        }
      }
      return null;
    };

    StatusBar.prototype.terminalViewForTerminal = function(terminal) {
      var index, j, ref1, terminalView;
      for (index = j = 0, ref1 = this.terminalViews.length; 0 <= ref1 ? j <= ref1 : j >= ref1; index = 0 <= ref1 ? ++j : --j) {
        terminalView = this.terminalViews[index];
        if (terminalView != null) {
          if (terminalView.getTerminal() === terminal) {
            return terminalView;
          }
        }
      }
      return null;
    };

    StatusBar.prototype.runInActiveView = function(callback) {
      var view;
      view = this.getActiveTerminalView();
      if (view != null) {
        return callback(view);
      }
      return null;
    };

    StatusBar.prototype.runCommandInNewTerminal = function(commands) {
      this.activeTerminal = this.createTerminalView(commands);
      return this.activeTerminal.toggle();
    };

    StatusBar.prototype.runInOpenView = function(callback) {
      var view;
      view = this.getActiveTerminalView();
      if ((view != null) && view.panel.isVisible()) {
        return callback(view);
      }
      return null;
    };

    StatusBar.prototype.setActiveTerminalView = function(view) {
      return this.activeTerminal = view;
    };

    StatusBar.prototype.removeTerminalView = function(view) {
      var index;
      index = this.indexOf(view);
      if (index < 0) {
        return;
      }
      this.terminalViews.splice(index, 1);
      return this.activateAdjacentTerminal(index);
    };

    StatusBar.prototype.activateAdjacentTerminal = function(index) {
      if (index == null) {
        index = 0;
      }
      if (!(this.terminalViews.length > 0)) {
        return false;
      }
      index = Math.max(0, index - 1);
      this.activeTerminal = this.terminalViews[index];
      return true;
    };

    StatusBar.prototype.newTerminalView = function() {
      var ref1;
      if ((ref1 = this.activeTerminal) != null ? ref1.animating : void 0) {
        return;
      }
      this.activeTerminal = this.createTerminalView();
      return this.activeTerminal.toggle();
    };

    StatusBar.prototype.attach = function() {
      return this.statusBarProvider.addLeftTile({
        item: this,
        priority: 100
      });
    };

    StatusBar.prototype.destroyActiveTerm = function() {
      var index;
      if (this.activeTerminal == null) {
        return;
      }
      index = this.indexOf(this.activeTerminal);
      this.activeTerminal.destroy();
      this.activeTerminal = null;
      return this.activateAdjacentTerminal(index);
    };

    StatusBar.prototype.closeAll = function() {
      var index, j, ref1, view;
      for (index = j = ref1 = this.terminalViews.length; ref1 <= 0 ? j <= 0 : j >= 0; index = ref1 <= 0 ? ++j : --j) {
        view = this.terminalViews[index];
        if (view != null) {
          view.destroy();
        }
      }
      return this.activeTerminal = null;
    };

    StatusBar.prototype.destroy = function() {
      var j, len, ref1, view;
      this.subscriptions.dispose();
      ref1 = this.terminalViews;
      for (j = 0, len = ref1.length; j < len; j++) {
        view = ref1[j];
        view.ptyProcess.terminate();
        view.terminal.destroy();
      }
      return this.detach();
    };

    StatusBar.prototype.toggle = function() {
      if (this.terminalViews.length === 0) {
        this.activeTerminal = this.createTerminalView();
      } else if (this.activeTerminal === null) {
        this.activeTerminal = this.terminalViews[0];
      }
      return this.activeTerminal.toggle();
    };

    StatusBar.prototype.setStatusColor = function(event) {
      var color;
      color = event.type.match(/\w+$/)[0];
      color = atom.config.get("terminal-fusion.iconColors." + color).toRGBAString();
      return $(event.target).closest('.fusion-terminal-status-icon').css('color', color);
    };

    StatusBar.prototype.clearStatusColor = function(event) {
      return $(event.target).closest('.fusion-terminal-status-icon').css('color', '');
    };

    StatusBar.prototype.onDragStart = function(event) {
      var element;
      event.originalEvent.dataTransfer.setData('terminal-fusion-panel', 'true');
      element = $(event.target).closest('.fusion-terminal-status-icon');
      element.addClass('is-dragging');
      return event.originalEvent.dataTransfer.setData('from-index', element.index());
    };

    StatusBar.prototype.onDragLeave = function(event) {
      return this.removePlaceholder();
    };

    StatusBar.prototype.onDragEnd = function(event) {
      return this.clearDropTarget();
    };

    StatusBar.prototype.onDragOver = function(event) {
      var element, newDropTargetIndex, statusIcons;
      event.preventDefault();
      event.stopPropagation();
      if (event.originalEvent.dataTransfer.getData('terminal-fusion') !== 'true') {
        return;
      }
      newDropTargetIndex = this.getDropTargetIndex(event);
      if (newDropTargetIndex == null) {
        return;
      }
      this.removeDropTargetClasses();
      statusIcons = this.statusContainer.children('.fusion-terminal-status-icon');
      if (newDropTargetIndex < statusIcons.length) {
        element = statusIcons.eq(newDropTargetIndex).addClass('is-drop-target');
        return this.getPlaceholder().insertBefore(element);
      } else {
        element = statusIcons.eq(newDropTargetIndex - 1).addClass('drop-target-is-after');
        return this.getPlaceholder().insertAfter(element);
      }
    };

    StatusBar.prototype.onDrop = function(event) {
      var dataTransfer, fromIndex, pane, paneIndex, panelEvent, tabEvent, toIndex, view;
      dataTransfer = event.originalEvent.dataTransfer;
      panelEvent = dataTransfer.getData('terminal-fusion-panel') === 'true';
      tabEvent = dataTransfer.getData('terminal-fusion-tab') === 'true';
      if (!(panelEvent || tabEvent)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      toIndex = this.getDropTargetIndex(event);
      this.clearDropTarget();
      if (tabEvent) {
        fromIndex = parseInt(dataTransfer.getData('sortable-index'));
        paneIndex = parseInt(dataTransfer.getData('from-pane-index'));
        pane = atom.workspace.getPanes()[paneIndex];
        view = pane.itemAtIndex(fromIndex);
        pane.removeItem(view, false);
        view.show();
        view.toggleTabView();
        this.terminalViews.push(view);
        if (view.statusIcon.isActive()) {
          view.open();
        }
        this.statusContainer.append(view.statusIcon);
        fromIndex = this.terminalViews.length - 1;
      } else {
        fromIndex = parseInt(dataTransfer.getData('from-index'));
      }
      return this.updateOrder(fromIndex, toIndex);
    };

    StatusBar.prototype.onDropTabBar = function(event, pane) {
      var dataTransfer, fromIndex, tabBar, view;
      dataTransfer = event.originalEvent.dataTransfer;
      if (dataTransfer.getData('terminal-fusion-panel') !== 'true') {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.clearDropTarget();
      fromIndex = parseInt(dataTransfer.getData('from-index'));
      view = this.terminalViews[fromIndex];
      view.css("height", "");
      view.terminal.element.style.height = "";
      tabBar = $(event.target).closest('.tab-bar');
      view.toggleTabView();
      this.removeTerminalView(view);
      this.statusContainer.children().eq(fromIndex).detach();
      view.statusIcon.removeTooltip();
      pane.addItem(view, pane.getItems().length);
      pane.activateItem(view);
      return view.focus();
    };

    StatusBar.prototype.clearDropTarget = function() {
      var element;
      element = this.find('.is-dragging');
      element.removeClass('is-dragging');
      this.removeDropTargetClasses();
      return this.removePlaceholder();
    };

    StatusBar.prototype.removeDropTargetClasses = function() {
      this.statusContainer.find('.is-drop-target').removeClass('is-drop-target');
      return this.statusContainer.find('.drop-target-is-after').removeClass('drop-target-is-after');
    };

    StatusBar.prototype.getDropTargetIndex = function(event) {
      var element, elementCenter, statusIcons, target;
      target = $(event.target);
      if (this.isPlaceholder(target)) {
        return;
      }
      statusIcons = this.statusContainer.children('.fusion-terminal-status-icon');
      element = target.closest('.fusion-terminal-status-icon');
      if (element.length === 0) {
        element = statusIcons.last();
      }
      if (!element.length) {
        return 0;
      }
      elementCenter = element.offset().left + element.width() / 2;
      if (event.originalEvent.pageX < elementCenter) {
        return statusIcons.index(element);
      } else if (element.next('.fusion-terminal-status-icon').length > 0) {
        return statusIcons.index(element.next('.fusion-terminal-status-icon'));
      } else {
        return statusIcons.index(element) + 1;
      }
    };

    StatusBar.prototype.getPlaceholder = function() {
      return this.placeholderEl != null ? this.placeholderEl : this.placeholderEl = $('<li class="placeholder"></li>');
    };

    StatusBar.prototype.removePlaceholder = function() {
      var ref1;
      if ((ref1 = this.placeholderEl) != null) {
        ref1.remove();
      }
      return this.placeholderEl = null;
    };

    StatusBar.prototype.isPlaceholder = function(element) {
      return element.is('.placeholder');
    };

    StatusBar.prototype.iconAtIndex = function(index) {
      return this.getStatusIcons().eq(index);
    };

    StatusBar.prototype.getStatusIcons = function() {
      return this.statusContainer.children('.fusion-terminal-status-icon');
    };

    StatusBar.prototype.moveIconToIndex = function(icon, toIndex) {
      var container, followingIcon;
      followingIcon = this.getStatusIcons()[toIndex];
      container = this.statusContainer[0];
      if (followingIcon != null) {
        return container.insertBefore(icon, followingIcon);
      } else {
        return container.appendChild(icon);
      }
    };

    StatusBar.prototype.moveTerminalView = function(fromIndex, toIndex) {
      var activeTerminal, view;
      activeTerminal = this.getActiveTerminalView();
      view = this.terminalViews.splice(fromIndex, 1)[0];
      this.terminalViews.splice(toIndex, 0, view);
      return this.setActiveTerminalView(activeTerminal);
    };

    StatusBar.prototype.updateOrder = function(fromIndex, toIndex) {
      var icon;
      if (fromIndex === toIndex) {
        return;
      }
      if (fromIndex < toIndex) {
        toIndex--;
      }
      icon = this.getStatusIcons().eq(fromIndex).detach();
      this.moveIconToIndex(icon.get(0), toIndex);
      this.moveTerminalView(fromIndex, toIndex);
      icon.addClass('inserted');
      return icon.one('webkitAnimationEnd', function() {
        return icon.removeClass('inserted');
      });
    };

    return StatusBar;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvdGVybWluYWwtZnVzaW9uL2xpYi9zdGF0dXMtYmFyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsc0ZBQUE7SUFBQTs7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsTUFBd0IsT0FBQSxDQUFRLHNCQUFSLENBQXhCLEVBQUMsU0FBRCxFQUFJOztFQUNKLGtCQUFBLEdBQXdCLE9BQUEsQ0FBUSxRQUFSOztFQUN4QixVQUFBLEdBQXdCLE9BQUEsQ0FBUSxlQUFSOztFQUN4QixFQUFBLEdBQXdCLE9BQUEsQ0FBUSxJQUFSOztFQUN4QixJQUFBLEdBQXdCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7Ozs7Ozs7Ozs7d0JBQ0osYUFBQSxHQUFlOzt3QkFDZixjQUFBLEdBQWdCOzt3QkFDaEIsV0FBQSxHQUFhOztJQUViLFNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLDRCQUFQO1FBQXFDLFFBQUEsRUFBVSxDQUFDLENBQWhEO09BQUwsRUFBd0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3RELEtBQUMsQ0FBQSxDQUFELENBQUc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdCQUFQO1lBQXlCLEtBQUEsRUFBTyxpQkFBaEM7WUFBbUQsTUFBQSxFQUFRLFNBQTNEO1dBQUg7VUFDQSxLQUFDLENBQUEsRUFBRCxDQUFJO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyw4QkFBUDtZQUF1QyxRQUFBLEVBQVUsSUFBakQ7WUFBdUQsTUFBQSxFQUFRLGlCQUEvRDtZQUFrRixFQUFBLEVBQUksY0FBdEY7V0FBSjtpQkFDQSxLQUFDLENBQUEsQ0FBRCxDQUFHO1lBQUEsQ0FBQSxLQUFBLENB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QXRCLEVBSEY7O0lBSGU7O3dCQVFqQixnQkFBQSxHQUFrQixTQUFDLFNBQUQsRUFBWSxPQUFaO0FBQ2hCLFVBQUE7TUFBQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxxQkFBRCxDQUFBO01BQ2pCLElBQUEsR0FBTyxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsU0FBdEIsRUFBaUMsQ0FBakMsQ0FBb0MsQ0FBQSxDQUFBO01BQzNDLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFzQixPQUF0QixFQUErQixDQUEvQixFQUFrQyxJQUFsQzthQUNBLElBQUMsQ0FBQSxxQkFBRCxDQUF1QixjQUF2QjtJQUpnQjs7d0JBTWxCLFdBQUEsR0FBYSxTQUFDLFNBQUQsRUFBWSxPQUFaO0FBQ1gsVUFBQTtNQUFBLElBQVUsU0FBQSxLQUFhLE9BQXZCO0FBQUEsZUFBQTs7TUFDQSxJQUFhLFNBQUEsR0FBWSxPQUF6QjtRQUFBLE9BQUEsR0FBQTs7TUFFQSxJQUFBLEdBQU8sSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFpQixDQUFDLEVBQWxCLENBQXFCLFNBQXJCLENBQStCLENBQUMsTUFBaEMsQ0FBQTtNQUNQLElBQUMsQ0FBQSxlQUFELENBQWlCLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxDQUFqQixFQUE4QixPQUE5QjtNQUNBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixTQUFsQixFQUE2QixPQUE3QjtNQUNBLElBQUksQ0FBQyxRQUFMLENBQWMsVUFBZDthQUNBLElBQUksQ0FBQyxHQUFMLENBQVMsb0JBQVQsRUFBK0IsU0FBQTtlQUFHLElBQUksQ0FBQyxXQUFMLENBQWlCLFVBQWpCO01BQUgsQ0FBL0I7SUFSVzs7OztLQTdiUztBQVJ4QiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgVmlld30gICAgICAgICAgICAgPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblRlcm1pbmFsRnVzaW9uVmlldyAgICA9IHJlcXVpcmUgJy4vdmlldydcblN0YXR1c0ljb24gICAgICAgICAgICA9IHJlcXVpcmUgJy4vc3RhdHVzLWljb24nXG5vcyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdvcydcbnBhdGggICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFN0YXR1c0JhciBleHRlbmRzIFZpZXdcbiAgdGVybWluYWxWaWV3czogW11cbiAgYWN0aXZlVGVybWluYWw6IG51bGxcbiAgcmV0dXJuRm9jdXM6IG51bGxcblxuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAndGVybWluYWwtZnVzaW9uIHN0YXR1cy1iYXInLCB0YWJpbmRleDogLTEsID0+XG4gICAgICBAaSBjbGFzczogXCJpY29uIGljb24tcGx1c1wiLCBjbGljazogJ25ld1Rlcm1pbmFsVmlldycsIG91dGxldDogJ3BsdXNCdG4nXG4gICAgICBAdWwgY2xhc3M6IFwibGlzdC1pbmxpbmUgc3RhdHVzLWNvbnRhaW5lclwiLCB0YWJpbmRleDogJy0xJywgb3V0bGV0OiAnc3RhdHVzQ29udGFpbmVyJywgaXM6ICdzcGFjZS1wZW4tdWwnXG4gICAgICBAaSBjbGFzczogXCJpY29uIGljb24teFwiLCBjbGljazogJ2Nsb3NlQWxsJywgb3V0bGV0OiAnY2xvc2VCdG4nXG5cbiAgaW5pdGlhbGl6ZTogKEBzdGF0dXNCYXJQcm92aWRlcikgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ3Rlcm1pbmFsLWZ1c2lvbjpuZXcnOiA9PiBAbmV3VGVybWluYWxWaWV3KClcbiAgICAgICd0ZXJtaW5hbC1mdXNpb246dG9nZ2xlJzogPT4gQHRvZ2dsZSgpXG4gICAgICAndGVybWluYWwtZnVzaW9uOm5leHQnOiA9PlxuICAgICAgICByZXR1cm4gdW5sZXNzIEBhY3RpdmVUZXJtaW5hbFxuICAgICAgICByZXR1cm4gaWYgQGFjdGl2ZVRlcm1pbmFsLmlzQW5pbWF0aW5nKClcbiAgICAgICAgQGFjdGl2ZVRlcm1pbmFsLm9wZW4oKSBpZiBAYWN0aXZlTmV4dFRlcm1pbmFsVmlldygpXG4gICAgICAndGVybWluYWwtZnVzaW9uOnByZXYnOiA9PlxuICAgICAgICByZXR1cm4gdW5sZXNzIEBhY3RpdmVUZXJtaW5hbFxuICAgICAgICByZXR1cm4gaWYgQGFjdGl2ZVRlcm1pbmFsLmlzQW5pbWF0aW5nKClcbiAgICAgICAgQGFjdGl2ZVRlcm1pbmFsLm9wZW4oKSBpZiBAYWN0aXZlUHJldlRlcm1pbmFsVmlldygpXG4gICAgICAndGVybWluYWwtZnVzaW9uOmNsb3NlJzogPT4gQGRlc3Ryb3lBY3RpdmVUZXJtKClcbiAgICAgICd0ZXJtaW5hbC1mdXNpb246Y2xvc2UtYWxsJzogPT4gQGNsb3NlQWxsKClcbiAgICAgICd0ZXJtaW5hbC1mdXNpb246cmVuYW1lJzogPT4gQHJ1bkluQWN0aXZlVmlldyAoaSkgLT4gaS5yZW5hbWUoKVxuICAgICAgJ3Rlcm1pbmFsLWZ1c2lvbjppbnNlcnQtc2VsZWN0ZWQtdGV4dCc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKCckUycpXG4gICAgICAndGVybWluYWwtZnVzaW9uOmluc2VydC10ZXh0JzogPT4gQHJ1bkluQWN0aXZlVmlldyAoaSkgLT4gaS5pbnB1dERpYWxvZygpXG4gICAgICAndGVybWluYWwtZnVzaW9uOmluc2VydC1jdXN0b20tdGV4dC0xJzogPT4gQHJ1bkluQWN0aXZlVmlldyAoaSkgLT4gaS5pbnNlcnRTZWxlY3Rpb24oYXRvbS5jb25maWcuZ2V0KCd0ZXJtaW5hbC1mdXNpb24uY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDEnKSlcbiAgICAgICd0ZXJtaW5hbC1mdXNpb246aW5zZXJ0LWN1c3RvbS10ZXh0LTInOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmFsLWZ1c2lvbi5jdXN0b21UZXh0cy5jdXN0b21UZXh0MicpKVxuICAgICAgJ3Rlcm1pbmFsLWZ1c2lvbjppbnNlcnQtY3VzdG9tLXRleHQtMyc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgndGVybWluYWwtZnVzaW9uLmN1c3RvbVRleHRzLmN1c3RvbVRleHQzJykpXG4gICAgICAndGVybWluYWwtZnVzaW9uOmluc2VydC1jdXN0b20tdGV4dC00JzogPT4gQHJ1bkluQWN0aXZlVmlldyAoaSkgLT4gaS5pbnNlcnRTZWxlY3Rpb24oYXRvbS5jb25maWcuZ2V0KCd0ZXJtaW5hbC1mdXNpb24uY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDQnKSlcbiAgICAgICd0ZXJtaW5hbC1mdXNpb246aW5zZXJ0LWN1c3RvbS10ZXh0LTUnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmFsLWZ1c2lvbi5jdXN0b21UZXh0cy5jdXN0b21UZXh0NScpKVxuICAgICAgJ3Rlcm1pbmFsLWZ1c2lvbjppbnNlcnQtY3VzdG9tLXRleHQtNic6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKGF0b20uY29uZmlnLmdldCgndGVybWluYWwtZnVzaW9uLmN1c3RvbVRleHRzLmN1c3RvbVRleHQ2JykpXG4gICAgICAndGVybWluYWwtZnVzaW9uOmluc2VydC1jdXN0b20tdGV4dC03JzogPT4gQHJ1bkluQWN0aXZlVmlldyAoaSkgLT4gaS5pbnNlcnRTZWxlY3Rpb24oYXRvbS5jb25maWcuZ2V0KCd0ZXJtaW5hbC1mdXNpb24uY3VzdG9tVGV4dHMuY3VzdG9tVGV4dDcnKSlcbiAgICAgICd0ZXJtaW5hbC1mdXNpb246aW5zZXJ0LWN1c3RvbS10ZXh0LTgnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLmluc2VydFNlbGVjdGlvbihhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmFsLWZ1c2lvbi5jdXN0b21UZXh0cy5jdXN0b21UZXh0OCcpKVxuICAgICAgJ3Rlcm1pbmFsLWZ1c2lvbjpmdWxsc2NyZWVuJzogPT4gQGFjdGl2ZVRlcm1pbmFsLm1heGltaXplKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnLnh0ZXJtJyxcbiAgICAgICd0ZXJtaW5hbC1mdXNpb246cGFzdGUnOiA9PiBAcnVuSW5BY3RpdmVWaWV3IChpKSAtPiBpLnBhc3RlKClcbiAgICAgICd0ZXJtaW5hbC1mdXNpb246Y29weSc6ID0+IEBydW5JbkFjdGl2ZVZpZXcgKGkpIC0+IGkuY29weSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSAoaXRlbSkgPT5cbiAgICAgIHJldHVybiB1bmxlc3MgaXRlbT9cblxuICAgICAgaWYgaXRlbS5jb25zdHJ1Y3Rvci5uYW1lIGlzIFwiVGVybWluYWxGdXNpb25WaWV3XCJcbiAgICAgICAgc2V0VGltZW91dCBpdGVtLmZvY3VzLCAxMDBcbiAgICAgIGVsc2UgaWYgaXRlbS5jb25zdHJ1Y3Rvci5uYW1lIGlzIFwiVGV4dEVkaXRvclwiXG4gICAgICAgIG1hcHBpbmcgPSBhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmFsLWZ1c2lvbi5jb3JlLm1hcFRlcm1pbmFsc1RvJylcbiAgICAgICAgcmV0dXJuIGlmIG1hcHBpbmcgaXMgJ05vbmUnXG5cbiAgICAgICAgc3dpdGNoIG1hcHBpbmdcbiAgICAgICAgICB3aGVuICdGaWxlJ1xuICAgICAgICAgICAgbmV4dFRlcm1pbmFsID0gQGdldFRlcm1pbmFsQnlJZCBpdGVtLmdldFBhdGgoKSwgKHZpZXcpIC0+IHZpZXcuZ2V0SWQoKS5maWxlUGF0aFxuICAgICAgICAgIHdoZW4gJ0ZvbGRlcidcbiAgICAgICAgICAgIG5leHRUZXJtaW5hbCA9IEBnZXRUZXJtaW5hbEJ5SWQgcGF0aC5kaXJuYW1lKGl0ZW0uZ2V0UGF0aCgpKSwgKHZpZXcpIC0+IHZpZXcuZ2V0SWQoKS5mb2xkZXJQYXRoXG5cbiAgICAgICAgcHJldlRlcm1pbmFsID0gQGdldEFjdGl2ZVRlcm1pbmFsVmlldygpXG4gICAgICAgIGlmIHByZXZUZXJtaW5hbCAhPSBuZXh0VGVybWluYWxcbiAgICAgICAgICBpZiBub3QgbmV4dFRlcm1pbmFsP1xuICAgICAgICAgICAgaWYgaXRlbS5nZXRUaXRsZSgpIGlzbnQgJ3VudGl0bGVkJ1xuICAgICAgICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmFsLWZ1c2lvbi5jb3JlLm1hcFRlcm1pbmFsc1RvQXV0b09wZW4nKVxuICAgICAgICAgICAgICAgIG5leHRUZXJtaW5hbCA9IEBjcmVhdGVUZXJtaW5hbFZpZXcoKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzZXRBY3RpdmVUZXJtaW5hbFZpZXcobmV4dFRlcm1pbmFsKVxuICAgICAgICAgICAgbmV4dFRlcm1pbmFsLnRvZ2dsZSgpIGlmIHByZXZUZXJtaW5hbD8ucGFuZWwuaXNWaXNpYmxlKClcblxuICAgIEByZWdpc3RlckNvbnRleHRNZW51KClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnRvb2x0aXBzLmFkZCBAcGx1c0J0biwgdGl0bGU6ICdOZXcgVGVybWluYWwnXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBjbG9zZUJ0biwgdGl0bGU6ICdDbG9zZSBBbGwnXG5cbiAgICBAc3RhdHVzQ29udGFpbmVyLm9uICdkYmxjbGljaycsIChldmVudCkgPT5cbiAgICAgIEBuZXdUZXJtaW5hbFZpZXcoKSB1bmxlc3MgZXZlbnQudGFyZ2V0ICE9IGV2ZW50LmRlbGVnYXRlVGFyZ2V0XG5cbiAgICBAc3RhdHVzQ29udGFpbmVyLm9uICdkcmFnc3RhcnQnLCAnLmZ1c2lvbi10ZXJtaW5hbC1zdGF0dXMtaWNvbicsIEBvbkRyYWdTdGFydFxuICAgIEBzdGF0dXNDb250YWluZXIub24gJ2RyYWdlbmQnLCAnLmZ1c2lvbi10ZXJtaW5hbC1zdGF0dXMtaWNvbicsIEBvbkRyYWdFbmRcbiAgICBAc3RhdHVzQ29udGFpbmVyLm9uICdkcmFnbGVhdmUnLCBAb25EcmFnTGVhdmVcbiAgICBAc3RhdHVzQ29udGFpbmVyLm9uICdkcmFnb3ZlcicsIEBvbkRyYWdPdmVyXG4gICAgQHN0YXR1c0NvbnRhaW5lci5vbiAnZHJvcCcsIEBvbkRyb3BcblxuICAgIGhhbmRsZUJsdXIgPSA9PlxuICAgICAgaWYgdGVybWluYWwgPSBUZXJtaW5hbEZ1c2lvblZpZXcuZ2V0Rm9jdXNlZFRlcm1pbmFsKClcbiAgICAgICAgQHJldHVybkZvY3VzID0gQHRlcm1pbmFsVmlld0ZvclRlcm1pbmFsKHRlcm1pbmFsKVxuICAgICAgICB0ZXJtaW5hbC5ibHVyKClcblxuICAgIGhhbmRsZUZvY3VzID0gPT5cbiAgICAgIGlmIEByZXR1cm5Gb2N1c1xuICAgICAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAgICAgaWYgQHJldHVybkZvY3VzXG4gICAgICAgICAgICAgIHRlbXBGb2N1cyA9IEByZXR1cm5Gb2N1c1xuICAgICAgICAgICAgICBAcmV0dXJuRm9jdXMgPSBudWxsXG4gICAgICAgICAgICAgIHRlbXBGb2N1cy5mb2N1cygpIGlmIHRlbXBGb2N1c1xuICAgICAgICAsIDEwMFxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2JsdXInLCBoYW5kbGVCbHVyXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGRpc3Bvc2U6IC0+XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciAnYmx1cicsIGhhbmRsZUJsdXJcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdmb2N1cycsIGhhbmRsZUZvY3VzXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGRpc3Bvc2U6IC0+XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciAnZm9jdXMnLCBoYW5kbGVGb2N1c1xuXG4gICAgQGF0dGFjaCgpXG5cbiAgcmVnaXN0ZXJDb250ZXh0TWVudTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJy50ZXJtaW5hbC1mdXNpb24uc3RhdHVzLWJhcicsXG4gICAgICAndGVybWluYWwtZnVzaW9uOnN0YXR1cy1yZWQnOiBAc2V0U3RhdHVzQ29sb3JcbiAgICAgICd0ZXJtaW5hbC1mdXNpb246c3RhdHVzLW9yYW5nZSc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmFsLWZ1c2lvbjpzdGF0dXMteWVsbG93JzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAndGVybWluYWwtZnVzaW9uOnN0YXR1cy1ncmVlbic6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmFsLWZ1c2lvbjpzdGF0dXMtYmx1ZSc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmFsLWZ1c2lvbjpzdGF0dXMtcHVycGxlJzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAndGVybWluYWwtZnVzaW9uOnN0YXR1cy1waW5rJzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAndGVybWluYWwtZnVzaW9uOnN0YXR1cy1jeWFuJzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAndGVybWluYWwtZnVzaW9uOnN0YXR1cy1tYWdlbnRhJzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAndGVybWluYWwtZnVzaW9uOnN0YXR1cy1kZWZhdWx0JzogQGNsZWFyU3RhdHVzQ29sb3JcbiAgICAgICd0ZXJtaW5hbC1mdXNpb246Y29udGV4dC1jbG9zZSc6IChldmVudCkgLT5cbiAgICAgICAgJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5mdXNpb24tdGVybWluYWwtc3RhdHVzLWljb24nKVswXS50ZXJtaW5hbFZpZXcuZGVzdHJveSgpXG4gICAgICAndGVybWluYWwtZnVzaW9uOmNvbnRleHQtaGlkZSc6IChldmVudCkgLT5cbiAgICAgICAgc3RhdHVzSWNvbiA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcuZnVzaW9uLXRlcm1pbmFsLXN0YXR1cy1pY29uJylbMF1cbiAgICAgICAgc3RhdHVzSWNvbi50ZXJtaW5hbFZpZXcuaGlkZSgpIGlmIHN0YXR1c0ljb24uaXNBY3RpdmUoKVxuICAgICAgJ3Rlcm1pbmFsLWZ1c2lvbjpjb250ZXh0LXJlbmFtZSc6IChldmVudCkgLT5cbiAgICAgICAgJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5mdXNpb24tdGVybWluYWwtc3RhdHVzLWljb24nKVswXS5yZW5hbWUoKVxuXG4gIHJlZ2lzdGVyUGFuZVN1YnNjcmlwdGlvbjogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHBhbmVTdWJzY3JpcHRpb24gPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlUGFuZXMgKHBhbmUpID0+XG4gICAgICBwYW5lRWxlbWVudCA9ICQoYXRvbS52aWV3cy5nZXRWaWV3KHBhbmUpKVxuICAgICAgdGFiQmFyID0gcGFuZUVsZW1lbnQuZmluZCgndWwnKVxuXG4gICAgICB0YWJCYXIub24gJ2Ryb3AnLCAoZXZlbnQpID0+IEBvbkRyb3BUYWJCYXIoZXZlbnQsIHBhbmUpXG4gICAgICB0YWJCYXIub24gJ2RyYWdzdGFydCcsIChldmVudCkgLT5cbiAgICAgICAgcmV0dXJuIHVubGVzcyBldmVudC50YXJnZXQuaXRlbT8uY29uc3RydWN0b3IubmFtZSBpcyAnVGVybWluYWxGdXNpb25WaWV3J1xuICAgICAgICBldmVudC5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhICd0ZXJtaW5hbC1mdXNpb24tdGFiJywgJ3RydWUnXG4gICAgICBwYW5lLm9uRGlkRGVzdHJveSAtPiB0YWJCYXIub2ZmICdkcm9wJywgQG9uRHJvcFRhYkJhclxuXG4gIGNyZWF0ZVRlcm1pbmFsVmlldzogKGF1dG9SdW4pIC0+XG4gICAgQHJlZ2lzdGVyUGFuZVN1YnNjcmlwdGlvbigpIHVubGVzcyBAcGFuZVN1YnNjcmlwdGlvbj9cblxuICAgIHByb2plY3RGb2xkZXIgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXVxuICAgIGVkaXRvclBhdGggPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk/LmdldFBhdGgoKVxuXG4gICAgaWYgZWRpdG9yUGF0aD9cbiAgICAgIGVkaXRvckZvbGRlciA9IHBhdGguZGlybmFtZShlZGl0b3JQYXRoKVxuICAgICAgZm9yIGRpcmVjdG9yeSBpbiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgICAgICBpZiBlZGl0b3JQYXRoLmluZGV4T2YoZGlyZWN0b3J5KSA+PSAwXG4gICAgICAgICAgcHJvamVjdEZvbGRlciA9IGRpcmVjdG9yeVxuXG4gICAgcHJvamVjdEZvbGRlciA9IHVuZGVmaW5lZCBpZiBwcm9qZWN0Rm9sZGVyPy5pbmRleE9mKCdhdG9tOi8vJykgPj0gMFxuXG4gICAgaG9tZSA9IGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgJ3dpbjMyJyB0aGVuIHByb2Nlc3MuZW52LkhPTUVQQVRIIGVsc2UgcHJvY2Vzcy5lbnYuSE9NRVxuXG4gICAgc3dpdGNoIGF0b20uY29uZmlnLmdldCgndGVybWluYWwtZnVzaW9uLmNvcmUud29ya2luZ0RpcmVjdG9yeScpXG4gICAgICB3aGVuICdQcm9qZWN0JyB0aGVuIHB3ZCA9IHByb2plY3RGb2xkZXIgb3IgZWRpdG9yRm9sZGVyIG9yIGhvbWVcbiAgICAgIHdoZW4gJ0FjdGl2ZSBGaWxlJyB0aGVuIHB3ZCA9IGVkaXRvckZvbGRlciBvciBwcm9qZWN0Rm9sZGVyIG9yIGhvbWVcbiAgICAgIGVsc2UgcHdkID0gaG9tZVxuXG4gICAgaWQgPSBlZGl0b3JQYXRoIG9yIHByb2plY3RGb2xkZXIgb3IgaG9tZVxuICAgIGlkID0gZmlsZVBhdGg6IGlkLCBmb2xkZXJQYXRoOiBwYXRoLmRpcm5hbWUoaWQpXG5cbiAgICBzaGVsbCA9IGF0b20uY29uZmlnLmdldCAndGVybWluYWwtZnVzaW9uLmNvcmUuc2hlbGwnXG4gICAgc2hlbGxBcmd1bWVudHMgPSBhdG9tLmNvbmZpZy5nZXQgJ3Rlcm1pbmFsLWZ1c2lvbi5jb3JlLnNoZWxsQXJndW1lbnRzJ1xuICAgIGFyZ3MgPSBzaGVsbEFyZ3VtZW50cy5zcGxpdCgvXFxzKy9nKS5maWx0ZXIgKGFyZykgLT4gYXJnXG5cbiAgICBzdGF0dXNJY29uID0gbmV3IFN0YXR1c0ljb24oKVxuICAgIHRlcm1pbmFsUGx1c1ZpZXcgPSBuZXcgVGVybWluYWxGdXNpb25WaWV3KGlkLCBwd2QsIHN0YXR1c0ljb24sIHRoaXMsIHNoZWxsLCBhcmdzLCBhdXRvUnVuKVxuICAgIHN0YXR1c0ljb24uaW5pdGlhbGl6ZSh0ZXJtaW5hbFBsdXNWaWV3KVxuXG4gICAgdGVybWluYWxQbHVzVmlldy5hdHRhY2goKVxuXG4gICAgQHRlcm1pbmFsVmlld3MucHVzaCB0ZXJtaW5hbFBsdXNWaWV3XG4gICAgQHN0YXR1c0NvbnRhaW5lci5hcHBlbmQgc3RhdHVzSWNvblxuICAgIHJldHVybiB0ZXJtaW5hbFBsdXNWaWV3XG5cbiAgYWN0aXZlTmV4dFRlcm1pbmFsVmlldzogLT5cbiAgICBpbmRleCA9IEBpbmRleE9mKEBhY3RpdmVUZXJtaW5hbClcbiAgICByZXR1cm4gZmFsc2UgaWYgaW5kZXggPCAwXG4gICAgQGFjdGl2ZVRlcm1pbmFsVmlldyBpbmRleCArIDFcblxuICBhY3RpdmVQcmV2VGVybWluYWxWaWV3OiAtPlxuICAgIGluZGV4ID0gQGluZGV4T2YoQGFjdGl2ZVRlcm1pbmFsKVxuICAgIHJldHVybiBmYWxzZSBpZiBpbmRleCA8IDBcbiAgICBAYWN0aXZlVGVybWluYWxWaWV3IGluZGV4IC0gMVxuXG4gIGluZGV4T2Y6ICh2aWV3KSAtPlxuICAgIEB0ZXJtaW5hbFZpZXdzLmluZGV4T2YodmlldylcblxuICBhY3RpdmVUZXJtaW5hbFZpZXc6IChpbmRleCkgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgQHRlcm1pbmFsVmlld3MubGVuZ3RoIDwgMlxuXG4gICAgaWYgaW5kZXggPj0gQHRlcm1pbmFsVmlld3MubGVuZ3RoXG4gICAgICBpbmRleCA9IDBcbiAgICBpZiBpbmRleCA8IDBcbiAgICAgIGluZGV4ID0gQHRlcm1pbmFsVmlld3MubGVuZ3RoIC0gMVxuXG4gICAgQGFjdGl2ZVRlcm1pbmFsID0gQHRlcm1pbmFsVmlld3NbaW5kZXhdXG4gICAgcmV0dXJuIHRydWVcblxuICBnZXRBY3RpdmVUZXJtaW5hbFZpZXc6IC0+XG4gICAgcmV0dXJuIEBhY3RpdmVUZXJtaW5hbFxuXG4gIGdldFRlcm1pbmFsQnlJZDogKHRhcmdldCwgc2VsZWN0b3IpIC0+XG4gICAgc2VsZWN0b3IgPz0gKHRlcm1pbmFsKSAtPiB0ZXJtaW5hbC5pZFxuXG4gICAgZm9yIGluZGV4IGluIFswIC4uIEB0ZXJtaW5hbFZpZXdzLmxlbmd0aF1cbiAgICAgIHRlcm1pbmFsID0gQHRlcm1pbmFsVmlld3NbaW5kZXhdXG4gICAgICBpZiB0ZXJtaW5hbD9cbiAgICAgICAgcmV0dXJuIHRlcm1pbmFsIGlmIHNlbGVjdG9yKHRlcm1pbmFsKSA9PSB0YXJnZXRcblxuICAgIHJldHVybiBudWxsXG5cbiAgdGVybWluYWxWaWV3Rm9yVGVybWluYWw6ICh0ZXJtaW5hbCkgLT5cbiAgICBmb3IgaW5kZXggaW4gWzAgLi4gQHRlcm1pbmFsVmlld3MubGVuZ3RoXVxuICAgICAgdGVybWluYWxWaWV3ID0gQHRlcm1pbmFsVmlld3NbaW5kZXhdXG4gICAgICBpZiB0ZXJtaW5hbFZpZXc/XG4gICAgICAgIHJldHVybiB0ZXJtaW5hbFZpZXcgaWYgdGVybWluYWxWaWV3LmdldFRlcm1pbmFsKCkgPT0gdGVybWluYWxcblxuICAgIHJldHVybiBudWxsXG5cbiAgcnVuSW5BY3RpdmVWaWV3OiAoY2FsbGJhY2spIC0+XG4gICAgdmlldyA9IEBnZXRBY3RpdmVUZXJtaW5hbFZpZXcoKVxuICAgIGlmIHZpZXc/XG4gICAgICByZXR1cm4gY2FsbGJhY2sodmlldylcbiAgICByZXR1cm4gbnVsbFxuXG4gIHJ1bkNvbW1hbmRJbk5ld1Rlcm1pbmFsOiAoY29tbWFuZHMpIC0+XG4gICAgQGFjdGl2ZVRlcm1pbmFsID0gQGNyZWF0ZVRlcm1pbmFsVmlldyhjb21tYW5kcylcbiAgICBAYWN0aXZlVGVybWluYWwudG9nZ2xlKClcblxuICBydW5Jbk9wZW5WaWV3OiAoY2FsbGJhY2spIC0+XG4gICAgdmlldyA9IEBnZXRBY3RpdmVUZXJtaW5hbFZpZXcoKVxuICAgIGlmIHZpZXc/IGFuZCB2aWV3LnBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICByZXR1cm4gY2FsbGJhY2sodmlldylcbiAgICByZXR1cm4gbnVsbFxuXG4gIHNldEFjdGl2ZVRlcm1pbmFsVmlldzogKHZpZXcpIC0+XG4gICAgQGFjdGl2ZVRlcm1pbmFsID0gdmlld1xuXG4gIHJlbW92ZVRlcm1pbmFsVmlldzogKHZpZXcpIC0+XG4gICAgaW5kZXggPSBAaW5kZXhPZiB2aWV3XG4gICAgcmV0dXJuIGlmIGluZGV4IDwgMFxuICAgIEB0ZXJtaW5hbFZpZXdzLnNwbGljZSBpbmRleCwgMVxuXG4gICAgQGFjdGl2YXRlQWRqYWNlbnRUZXJtaW5hbCBpbmRleFxuXG4gIGFjdGl2YXRlQWRqYWNlbnRUZXJtaW5hbDogKGluZGV4PTApIC0+XG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBAdGVybWluYWxWaWV3cy5sZW5ndGggPiAwXG5cbiAgICBpbmRleCA9IE1hdGgubWF4KDAsIGluZGV4IC0gMSlcbiAgICBAYWN0aXZlVGVybWluYWwgPSBAdGVybWluYWxWaWV3c1tpbmRleF1cblxuICAgIHJldHVybiB0cnVlXG5cbiAgbmV3VGVybWluYWxWaWV3OiAtPlxuICAgIHJldHVybiBpZiBAYWN0aXZlVGVybWluYWw/LmFuaW1hdGluZ1xuXG4gICAgQGFjdGl2ZVRlcm1pbmFsID0gQGNyZWF0ZVRlcm1pbmFsVmlldygpXG4gICAgQGFjdGl2ZVRlcm1pbmFsLnRvZ2dsZSgpXG5cbiAgYXR0YWNoOiAtPlxuICAgIEBzdGF0dXNCYXJQcm92aWRlci5hZGRMZWZ0VGlsZShpdGVtOiB0aGlzLCBwcmlvcml0eTogMTAwKVxuXG4gIGRlc3Ryb3lBY3RpdmVUZXJtOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVRlcm1pbmFsP1xuXG4gICAgaW5kZXggPSBAaW5kZXhPZihAYWN0aXZlVGVybWluYWwpXG4gICAgQGFjdGl2ZVRlcm1pbmFsLmRlc3Ryb3koKVxuICAgIEBhY3RpdmVUZXJtaW5hbCA9IG51bGxcblxuICAgIEBhY3RpdmF0ZUFkamFjZW50VGVybWluYWwgaW5kZXhcblxuICBjbG9zZUFsbDogPT5cbiAgICBmb3IgaW5kZXggaW4gW0B0ZXJtaW5hbFZpZXdzLmxlbmd0aCAuLiAwXVxuICAgICAgdmlldyA9IEB0ZXJtaW5hbFZpZXdzW2luZGV4XVxuICAgICAgaWYgdmlldz9cbiAgICAgICAgdmlldy5kZXN0cm95KClcbiAgICBAYWN0aXZlVGVybWluYWwgPSBudWxsXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBmb3IgdmlldyBpbiBAdGVybWluYWxWaWV3c1xuICAgICAgdmlldy5wdHlQcm9jZXNzLnRlcm1pbmF0ZSgpXG4gICAgICB2aWV3LnRlcm1pbmFsLmRlc3Ryb3koKVxuICAgIEBkZXRhY2goKVxuXG4gIHRvZ2dsZTogLT5cbiAgICBpZiBAdGVybWluYWxWaWV3cy5sZW5ndGggPT0gMFxuICAgICAgQGFjdGl2ZVRlcm1pbmFsID0gQGNyZWF0ZVRlcm1pbmFsVmlldygpXG4gICAgZWxzZSBpZiBAYWN0aXZlVGVybWluYWwgPT0gbnVsbFxuICAgICAgQGFjdGl2ZVRlcm1pbmFsID0gQHRlcm1pbmFsVmlld3NbMF1cbiAgICBAYWN0aXZlVGVybWluYWwudG9nZ2xlKClcblxuICBzZXRTdGF0dXNDb2xvcjogKGV2ZW50KSAtPlxuICAgIGNvbG9yID0gZXZlbnQudHlwZS5tYXRjaCgvXFx3KyQvKVswXVxuICAgIGNvbG9yID0gYXRvbS5jb25maWcuZ2V0KFwidGVybWluYWwtZnVzaW9uLmljb25Db2xvcnMuI3tjb2xvcn1cIikudG9SR0JBU3RyaW5nKClcbiAgICAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLmZ1c2lvbi10ZXJtaW5hbC1zdGF0dXMtaWNvbicpLmNzcyAnY29sb3InLCBjb2xvclxuXG4gIGNsZWFyU3RhdHVzQ29sb3I6IChldmVudCkgLT5cbiAgICAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLmZ1c2lvbi10ZXJtaW5hbC1zdGF0dXMtaWNvbicpLmNzcyAnY29sb3InLCAnJ1xuXG4gIG9uRHJhZ1N0YXJ0OiAoZXZlbnQpID0+XG4gICAgZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YSAndGVybWluYWwtZnVzaW9uLXBhbmVsJywgJ3RydWUnXG5cbiAgICBlbGVtZW50ID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5mdXNpb24tdGVybWluYWwtc3RhdHVzLWljb24nKVxuICAgIGVsZW1lbnQuYWRkQ2xhc3MgJ2lzLWRyYWdnaW5nJ1xuICAgIGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEgJ2Zyb20taW5kZXgnLCBlbGVtZW50LmluZGV4KClcblxuICBvbkRyYWdMZWF2ZTogKGV2ZW50KSA9PlxuICAgIEByZW1vdmVQbGFjZWhvbGRlcigpXG5cbiAgb25EcmFnRW5kOiAoZXZlbnQpID0+XG4gICAgQGNsZWFyRHJvcFRhcmdldCgpXG5cbiAgb25EcmFnT3ZlcjogKGV2ZW50KSA9PlxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIHVubGVzcyBldmVudC5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKCd0ZXJtaW5hbC1mdXNpb24nKSBpcyAndHJ1ZSdcbiAgICAgIHJldHVyblxuXG4gICAgbmV3RHJvcFRhcmdldEluZGV4ID0gQGdldERyb3BUYXJnZXRJbmRleChldmVudClcbiAgICByZXR1cm4gdW5sZXNzIG5ld0Ryb3BUYXJnZXRJbmRleD9cbiAgICBAcmVtb3ZlRHJvcFRhcmdldENsYXNzZXMoKVxuICAgIHN0YXR1c0ljb25zID0gQHN0YXR1c0NvbnRhaW5lci5jaGlsZHJlbiAnLmZ1c2lvbi10ZXJtaW5hbC1zdGF0dXMtaWNvbidcblxuICAgIGlmIG5ld0Ryb3BUYXJnZXRJbmRleCA8IHN0YXR1c0ljb25zLmxlbmd0aFxuICAgICAgZWxlbWVudCA9IHN0YXR1c0ljb25zLmVxKG5ld0Ryb3BUYXJnZXRJbmRleCkuYWRkQ2xhc3MgJ2lzLWRyb3AtdGFyZ2V0J1xuICAgICAgQGdldFBsYWNlaG9sZGVyKCkuaW5zZXJ0QmVmb3JlKGVsZW1lbnQpXG4gICAgZWxzZVxuICAgICAgZWxlbWVudCA9IHN0YXR1c0ljb25zLmVxKG5ld0Ryb3BUYXJnZXRJbmRleCAtIDEpLmFkZENsYXNzICdkcm9wLXRhcmdldC1pcy1hZnRlcidcbiAgICAgIEBnZXRQbGFjZWhvbGRlcigpLmluc2VydEFmdGVyKGVsZW1lbnQpXG5cbiAgb25Ecm9wOiAoZXZlbnQpID0+XG4gICAge2RhdGFUcmFuc2Zlcn0gPSBldmVudC5vcmlnaW5hbEV2ZW50XG4gICAgcGFuZWxFdmVudCA9IGRhdGFUcmFuc2Zlci5nZXREYXRhKCd0ZXJtaW5hbC1mdXNpb24tcGFuZWwnKSBpcyAndHJ1ZSdcbiAgICB0YWJFdmVudCA9IGRhdGFUcmFuc2Zlci5nZXREYXRhKCd0ZXJtaW5hbC1mdXNpb24tdGFiJykgaXMgJ3RydWUnXG4gICAgcmV0dXJuIHVubGVzcyBwYW5lbEV2ZW50IG9yIHRhYkV2ZW50XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgIHRvSW5kZXggPSBAZ2V0RHJvcFRhcmdldEluZGV4KGV2ZW50KVxuICAgIEBjbGVhckRyb3BUYXJnZXQoKVxuXG4gICAgaWYgdGFiRXZlbnRcbiAgICAgIGZyb21JbmRleCA9IHBhcnNlSW50KGRhdGFUcmFuc2Zlci5nZXREYXRhKCdzb3J0YWJsZS1pbmRleCcpKVxuICAgICAgcGFuZUluZGV4ID0gcGFyc2VJbnQoZGF0YVRyYW5zZmVyLmdldERhdGEoJ2Zyb20tcGFuZS1pbmRleCcpKVxuICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClbcGFuZUluZGV4XVxuICAgICAgdmlldyA9IHBhbmUuaXRlbUF0SW5kZXgoZnJvbUluZGV4KVxuICAgICAgcGFuZS5yZW1vdmVJdGVtKHZpZXcsIGZhbHNlKVxuICAgICAgdmlldy5zaG93KClcblxuICAgICAgdmlldy50b2dnbGVUYWJWaWV3KClcbiAgICAgIEB0ZXJtaW5hbFZpZXdzLnB1c2ggdmlld1xuICAgICAgdmlldy5vcGVuKCkgaWYgdmlldy5zdGF0dXNJY29uLmlzQWN0aXZlKClcbiAgICAgIEBzdGF0dXNDb250YWluZXIuYXBwZW5kIHZpZXcuc3RhdHVzSWNvblxuICAgICAgZnJvbUluZGV4ID0gQHRlcm1pbmFsVmlld3MubGVuZ3RoIC0gMVxuICAgIGVsc2VcbiAgICAgIGZyb21JbmRleCA9IHBhcnNlSW50KGRhdGFUcmFuc2Zlci5nZXREYXRhKCdmcm9tLWluZGV4JykpXG4gICAgQHVwZGF0ZU9yZGVyKGZyb21JbmRleCwgdG9JbmRleClcblxuICBvbkRyb3BUYWJCYXI6IChldmVudCwgcGFuZSkgPT5cbiAgICB7ZGF0YVRyYW5zZmVyfSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnRcbiAgICByZXR1cm4gdW5sZXNzIGRhdGFUcmFuc2Zlci5nZXREYXRhKCd0ZXJtaW5hbC1mdXNpb24tcGFuZWwnKSBpcyAndHJ1ZSdcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIEBjbGVhckRyb3BUYXJnZXQoKVxuXG4gICAgZnJvbUluZGV4ID0gcGFyc2VJbnQoZGF0YVRyYW5zZmVyLmdldERhdGEoJ2Zyb20taW5kZXgnKSlcbiAgICB2aWV3ID0gQHRlcm1pbmFsVmlld3NbZnJvbUluZGV4XVxuICAgIHZpZXcuY3NzIFwiaGVpZ2h0XCIsIFwiXCJcbiAgICB2aWV3LnRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gXCJcIlxuICAgIHRhYkJhciA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcudGFiLWJhcicpXG5cbiAgICB2aWV3LnRvZ2dsZVRhYlZpZXcoKVxuICAgIEByZW1vdmVUZXJtaW5hbFZpZXcgdmlld1xuICAgIEBzdGF0dXNDb250YWluZXIuY2hpbGRyZW4oKS5lcShmcm9tSW5kZXgpLmRldGFjaCgpXG4gICAgdmlldy5zdGF0dXNJY29uLnJlbW92ZVRvb2x0aXAoKVxuXG4gICAgcGFuZS5hZGRJdGVtIHZpZXcsIHBhbmUuZ2V0SXRlbXMoKS5sZW5ndGhcbiAgICBwYW5lLmFjdGl2YXRlSXRlbSB2aWV3XG5cbiAgICB2aWV3LmZvY3VzKClcblxuICBjbGVhckRyb3BUYXJnZXQ6IC0+XG4gICAgZWxlbWVudCA9IEBmaW5kKCcuaXMtZHJhZ2dpbmcnKVxuICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MgJ2lzLWRyYWdnaW5nJ1xuICAgIEByZW1vdmVEcm9wVGFyZ2V0Q2xhc3NlcygpXG4gICAgQHJlbW92ZVBsYWNlaG9sZGVyKClcblxuICByZW1vdmVEcm9wVGFyZ2V0Q2xhc3NlczogLT5cbiAgICBAc3RhdHVzQ29udGFpbmVyLmZpbmQoJy5pcy1kcm9wLXRhcmdldCcpLnJlbW92ZUNsYXNzICdpcy1kcm9wLXRhcmdldCdcbiAgICBAc3RhdHVzQ29udGFpbmVyLmZpbmQoJy5kcm9wLXRhcmdldC1pcy1hZnRlcicpLnJlbW92ZUNsYXNzICdkcm9wLXRhcmdldC1pcy1hZnRlcidcblxuICBnZXREcm9wVGFyZ2V0SW5kZXg6IChldmVudCkgLT5cbiAgICB0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICByZXR1cm4gaWYgQGlzUGxhY2Vob2xkZXIodGFyZ2V0KVxuXG4gICAgc3RhdHVzSWNvbnMgPSBAc3RhdHVzQ29udGFpbmVyLmNoaWxkcmVuKCcuZnVzaW9uLXRlcm1pbmFsLXN0YXR1cy1pY29uJylcbiAgICBlbGVtZW50ID0gdGFyZ2V0LmNsb3Nlc3QoJy5mdXNpb24tdGVybWluYWwtc3RhdHVzLWljb24nKVxuICAgIGVsZW1lbnQgPSBzdGF0dXNJY29ucy5sYXN0KCkgaWYgZWxlbWVudC5sZW5ndGggaXMgMFxuXG4gICAgcmV0dXJuIDAgdW5sZXNzIGVsZW1lbnQubGVuZ3RoXG5cbiAgICBlbGVtZW50Q2VudGVyID0gZWxlbWVudC5vZmZzZXQoKS5sZWZ0ICsgZWxlbWVudC53aWR0aCgpIC8gMlxuXG4gICAgaWYgZXZlbnQub3JpZ2luYWxFdmVudC5wYWdlWCA8IGVsZW1lbnRDZW50ZXJcbiAgICAgIHN0YXR1c0ljb25zLmluZGV4KGVsZW1lbnQpXG4gICAgZWxzZSBpZiBlbGVtZW50Lm5leHQoJy5mdXNpb24tdGVybWluYWwtc3RhdHVzLWljb24nKS5sZW5ndGggPiAwXG4gICAgICBzdGF0dXNJY29ucy5pbmRleChlbGVtZW50Lm5leHQoJy5mdXNpb24tdGVybWluYWwtc3RhdHVzLWljb24nKSlcbiAgICBlbHNlXG4gICAgICBzdGF0dXNJY29ucy5pbmRleChlbGVtZW50KSArIDFcblxuICBnZXRQbGFjZWhvbGRlcjogLT5cbiAgICBAcGxhY2Vob2xkZXJFbCA/PSAkKCc8bGkgY2xhc3M9XCJwbGFjZWhvbGRlclwiPjwvbGk+JylcblxuICByZW1vdmVQbGFjZWhvbGRlcjogLT5cbiAgICBAcGxhY2Vob2xkZXJFbD8ucmVtb3ZlKClcbiAgICBAcGxhY2Vob2xkZXJFbCA9IG51bGxcblxuICBpc1BsYWNlaG9sZGVyOiAoZWxlbWVudCkgLT5cbiAgICBlbGVtZW50LmlzKCcucGxhY2Vob2xkZXInKVxuXG4gIGljb25BdEluZGV4OiAoaW5kZXgpIC0+XG4gICAgQGdldFN0YXR1c0ljb25zKCkuZXEoaW5kZXgpXG5cbiAgZ2V0U3RhdHVzSWNvbnM6IC0+XG4gICAgQHN0YXR1c0NvbnRhaW5lci5jaGlsZHJlbignLmZ1c2lvbi10ZXJtaW5hbC1zdGF0dXMtaWNvbicpXG5cbiAgbW92ZUljb25Ub0luZGV4OiAoaWNvbiwgdG9JbmRleCkgLT5cbiAgICBmb2xsb3dpbmdJY29uID0gQGdldFN0YXR1c0ljb25zKClbdG9JbmRleF1cbiAgICBjb250YWluZXIgPSBAc3RhdHVzQ29udGFpbmVyWzBdXG4gICAgaWYgZm9sbG93aW5nSWNvbj9cbiAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUoaWNvbiwgZm9sbG93aW5nSWNvbilcbiAgICBlbHNlXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaWNvbilcblxuICBtb3ZlVGVybWluYWxWaWV3OiAoZnJvbUluZGV4LCB0b0luZGV4KSA9PlxuICAgIGFjdGl2ZVRlcm1pbmFsID0gQGdldEFjdGl2ZVRlcm1pbmFsVmlldygpXG4gICAgdmlldyA9IEB0ZXJtaW5hbFZpZXdzLnNwbGljZShmcm9tSW5kZXgsIDEpWzBdXG4gICAgQHRlcm1pbmFsVmlld3Muc3BsaWNlIHRvSW5kZXgsIDAsIHZpZXdcbiAgICBAc2V0QWN0aXZlVGVybWluYWxWaWV3IGFjdGl2ZVRlcm1pbmFsXG5cbiAgdXBkYXRlT3JkZXI6IChmcm9tSW5kZXgsIHRvSW5kZXgpIC0+XG4gICAgcmV0dXJuIGlmIGZyb21JbmRleCBpcyB0b0luZGV4XG4gICAgdG9JbmRleC0tIGlmIGZyb21JbmRleCA8IHRvSW5kZXhcblxuICAgIGljb24gPSBAZ2V0U3RhdHVzSWNvbnMoKS5lcShmcm9tSW5kZXgpLmRldGFjaCgpXG4gICAgQG1vdmVJY29uVG9JbmRleCBpY29uLmdldCgwKSwgdG9JbmRleFxuICAgIEBtb3ZlVGVybWluYWxWaWV3IGZyb21JbmRleCwgdG9JbmRleFxuICAgIGljb24uYWRkQ2xhc3MgJ2luc2VydGVkJ1xuICAgIGljb24ub25lICd3ZWJraXRBbmltYXRpb25FbmQnLCAtPiBpY29uLnJlbW92ZUNsYXNzKCdpbnNlcnRlZCcpXG4iXX0=
