(function() {
  var log;

  log = require('./log');

  module.exports = {
    selector: '.source.python',
    disableForSelector: '.source.python .comment, .source.python .string',
    inclusionPriority: 2,
    suggestionPriority: atom.config.get('autocomplete-python.suggestionPriority'),
    excludeLowerPriority: false,
    cacheSize: 10,
    _addEventListener: function(editor, eventName, handler) {
      var disposable, editorView;
      editorView = atom.views.getView(editor);
      editorView.addEventListener(eventName, handler);
      disposable = new this.Disposable(function() {
        log.debug('Unsubscribing from event listener ', eventName, handler);
        return editorView.removeEventListener(eventName, handler);
      });
      return disposable;
    },
    _noExecutableError: function(error) {
      if (this.providerNoExecutable) {
        return;
      }
      log.warning('No python executable found', error);
      atom.notifications.addWarning('autocomplete-python unable to find python binary.', {
        detail: "Please set path to python executable manually in package\nsettings and restart your editor. Be sure to migrate on new settings\nif everything worked on previous version.\nDetailed error message: " + error + "\n\nCurrent config: " + (atom.config.get('autocomplete-python.pythonPaths')),
        dismissable: true
      });
      return this.providerNoExecutable = true;
    },
    _spawnDaemon: function() {
      var interpreter, ref;
      interpreter = this.InterpreterLookup.getInterpreter();
      log.debug('Using interpreter', interpreter);
      this.provider = new this.BufferedProcess({
        command: interpreter || 'python',
        args: [__dirname + '/completion.py'],
        stdout: (function(_this) {
          return function(data) {
            return _this._deserialize(data);
          };
        })(this),
        stderr: (function(_this) {
          return function(data) {
            var ref, requestId, resolve, results1;
            if (data.indexOf('is not recognized as an internal or external') > -1) {
              return _this._noExecutableError(data);
            }
            log.debug("autocomplete-python traceback output: " + data);
            if (data.indexOf('jedi') > -1) {
              if (atom.config.get('autocomplete-python.outputProviderErrors')) {
                atom.notifications.addWarning('Looks like this error originated from Jedi. Please do not\nreport such issues in autocomplete-python issue tracker. Report\nthem directly to Jedi. Turn off `outputProviderErrors` setting\nto hide such errors in future. Traceback output:', {
                  detail: "" + data,
                  dismissable: true
                });
              }
            } else {
              atom.notifications.addError('autocomplete-python traceback output:', {
                detail: "" + data,
                dismissable: true
              });
            }
            log.debug("Forcing to resolve " + (Object.keys(_this.requests).length) + " promises");
            ref = _this.requests;
            results1 = [];
            for (requestId in ref) {
              resolve = ref[requestId];
              if (typeof resolve === 'function') {
                resolve([]);
              }
              results1.push(delete _this.requests[requestId]);
            }
            return results1;
          };
        })(this),
        exit: (function(_this) {
          return function(code) {
            return log.warning('Process exit with', code, _this.provider);
          };
        })(this)
      });
      this.provider.onWillThrowError((function(_this) {
        return function(arg) {
          var error, handle;
          error = arg.error, handle = arg.handle;
          if (error.code === 'ENOENT' && error.syscall.indexOf('spawn') === 0) {
            _this._noExecutableError(error);
            _this.dispose();
            return handle();
          } else {
            throw error;
          }
        };
      })(this));
      if ((ref = this.provider.process) != null) {
        ref.stdin.on('error', function(err) {
          return log.debug('stdin', err);
        });
      }
      return setTimeout((function(_this) {
        return function() {
          log.debug('Killing python process after timeout...');
          if (_this.provider && _this.provider.process) {
            return _this.provider.kill();
          }
        };
      })(this), 60 * 10 * 1000);
    },
    load: function() {
      if (!this.constructed) {
        this.constructor();
      }
      return this;
    },
    constructor: function() {
      var err, ref, selector;
      ref = require('atom'), this.Disposable = ref.Disposable, this.CompositeDisposable = ref.CompositeDisposable, this.BufferedProcess = ref.BufferedProcess;
      this.selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;
      this.Selector = require('selector-kit').Selector;
      this.DefinitionsView = require('./definitions-view');
      this.UsagesView = require('./usages-view');
      this.OverrideView = require('./override-view');
      this.RenameView = require('./rename-view');
      this.InterpreterLookup = require('./interpreters-lookup');
      this._ = require('underscore');
      this.filter = require('fuzzaldrin-plus').filter;
      this.requests = {};
      this.responses = {};
      this.provider = null;
      this.disposables = new this.CompositeDisposable;
      this.subscriptions = {};
      this.definitionsView = null;
      this.usagesView = null;
      this.renameView = null;
      this.constructed = true;
      this.snippetsManager = null;
      log.debug("Init autocomplete-python with priority " + this.suggestionPriority);
      try {
        this.triggerCompletionRegex = RegExp(atom.config.get('autocomplete-python.triggerCompletionRegex'));
      } catch (error1) {
        err = error1;
        atom.notifications.addWarning('autocomplete-python invalid regexp to trigger autocompletions.\nFalling back to default value.', {
          detail: "Original exception: " + err,
          dismissable: true
        });
        atom.config.set('autocomplete-python.triggerCompletionRegex', '([\.\ ]|[a-zA-Z_][a-zA-Z0-9_]*)');
        this.triggerCompletionRegex = /([\.\ ]|[a-zA-Z_][a-zA-Z0-9_]*)/;
      }
      selector = 'atom-text-editor[data-grammar~=python]';
      atom.commands.add(selector, 'autocomplete-python:go-to-definition', (function(_this) {
        return function() {
          return _this.goToDefinition();
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:complete-arguments', (function(_this) {
        return function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return _this._completeArguments(editor, editor.getCursorBufferPosition(), true);
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:show-usages', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          if (_this.usagesView) {
            _this.usagesView.destroy();
          }
          _this.usagesView = new _this.UsagesView();
          return _this.getUsages(editor, bufferPosition).then(function(usages) {
            return _this.usagesView.setItems(usages);
          });
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:override-method', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          if (_this.overrideView) {
            _this.overrideView.destroy();
          }
          _this.overrideView = new _this.OverrideView();
          return _this.getMethods(editor, bufferPosition).then(function(arg) {
            var bufferPosition, indent, methods;
            methods = arg.methods, indent = arg.indent, bufferPosition = arg.bufferPosition;
            _this.overrideView.indent = indent;
            _this.overrideView.bufferPosition = bufferPosition;
            return _this.overrideView.setItems(methods);
          });
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:rename', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          return _this.getUsages(editor, bufferPosition).then(function(usages) {
            if (_this.renameView) {
              _this.renameView.destroy();
            }
            if (usages.length > 0) {
              _this.renameView = new _this.RenameView(usages);
              return _this.renameView.onInput(function(newName) {
                var _relative, fileName, project, ref1, ref2, results1;
                ref1 = _this._.groupBy(usages, 'fileName');
                results1 = [];
                for (fileName in ref1) {
                  usages = ref1[fileName];
                  ref2 = atom.project.relativizePath(fileName), project = ref2[0], _relative = ref2[1];
                  if (project) {
                    results1.push(_this._updateUsagesInFile(fileName, usages, newName));
                  } else {
                    results1.push(log.debug('Ignoring file outside of project', fileName));
                  }
                }
                return results1;
              });
            } else {
              if (_this.usagesView) {
                _this.usagesView.destroy();
              }
              _this.usagesView = new _this.UsagesView();
              return _this.usagesView.setItems(usages);
            }
          });
        };
      })(this));
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          _this._handleGrammarChangeEvent(editor, editor.getGrammar());
          return editor.onDidChangeGrammar(function(grammar) {
            return _this._handleGrammarChangeEvent(editor, grammar);
          });
        };
      })(this));
      return atom.config.onDidChange('autocomplete-plus.enableAutoActivation', (function(_this) {
        return function() {
          return atom.workspace.observeTextEditors(function(editor) {
            return _this._handleGrammarChangeEvent(editor, editor.getGrammar());
          });
        };
      })(this));
    },
    _updateUsagesInFile: function(fileName, usages, newName) {
      var columnOffset;
      columnOffset = {};
      return atom.workspace.open(fileName, {
        activateItem: false
      }).then(function(editor) {
        var buffer, column, i, len, line, name, usage;
        buffer = editor.getBuffer();
        for (i = 0, len = usages.length; i < len; i++) {
          usage = usages[i];
          name = usage.name, line = usage.line, column = usage.column;
          if (columnOffset[line] == null) {
            columnOffset[line] = 0;
          }
          log.debug('Replacing', usage, 'with', newName, 'in', editor.id);
          log.debug('Offset for line', line, 'is', columnOffset[line]);
          buffer.setTextInRange([[line - 1, column + columnOffset[line]], [line - 1, column + name.length + columnOffset[line]]], newName);
          columnOffset[line] += newName.length - name.length;
        }
        return buffer.save();
      });
    },
    _showSignatureOverlay: function(event) {
      var cursor, disableForSelector, editor, getTooltip, i, len, marker, ref, scopeChain, scopeDescriptor, wordBufferRange;
      if (this.markers) {
        ref = this.markers;
        for (i = 0, len = ref.length; i < len; i++) {
          marker = ref[i];
          log.debug('destroying old marker', marker);
          marker.destroy();
        }
      } else {
        this.markers = [];
      }
      cursor = event.cursor;
      editor = event.cursor.editor;
      wordBufferRange = cursor.getCurrentWordBufferRange();
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(event.newBufferPosition);
      scopeChain = scopeDescriptor.getScopeChain();
      disableForSelector = this.disableForSelector + ", .source.python .numeric, .source.python .integer, .source.python .decimal, .source.python .punctuation, .source.python .keyword, .source.python .storage, .source.python .variable.parameter, .source.python .entity.name";
      disableForSelector = this.Selector.create(disableForSelector);
      if (this.selectorsMatchScopeChain(disableForSelector, scopeChain)) {
        log.debug('do nothing for this selector');
        return;
      }
      marker = editor.markBufferRange(wordBufferRange, {
        persistent: false,
        invalidate: 'never'
      });
      this.markers.push(marker);
      getTooltip = (function(_this) {
        return function(editor, bufferPosition) {
          var payload;
          payload = {
            id: _this._generateRequestId('tooltip', editor, bufferPosition),
            lookup: 'tooltip',
            path: editor.getPath(),
            source: editor.getText(),
            line: bufferPosition.row,
            column: bufferPosition.column,
            config: _this._generateRequestConfig()
          };
          _this._sendRequest(_this._serialize(payload));
          return new Promise(function(resolve) {
            return _this.requests[payload.id] = resolve;
          });
        };
      })(this);
      return getTooltip(editor, event.newBufferPosition).then((function(_this) {
        return function(results) {
          var column, decoration, description, fileName, line, ref1, text, type, view;
          if (results.length > 0) {
            ref1 = results[0], text = ref1.text, fileName = ref1.fileName, line = ref1.line, column = ref1.column, type = ref1.type, description = ref1.description;
            description = description.trim();
            if (!description) {
              return;
            }
            view = document.createElement('autocomplete-python-suggestion');
            view.appendChild(document.createTextNode(description));
            decoration = editor.decorateMarker(marker, {
              type: 'overlay',
              item: view,
              position: 'head'
            });
            return log.debug('decorated marker', marker);
          }
        };
      })(this));
    },
    _handleGrammarChangeEvent: function(editor, grammar) {
      var disposable, eventId, eventName;
      eventName = 'keyup';
      eventId = editor.id + "." + eventName;
      if (grammar.scopeName === 'source.python') {
        if (atom.config.get('autocomplete-python.showTooltips') === true) {
          editor.onDidChangeCursorPosition((function(_this) {
            return function(event) {
              return _this._showSignatureOverlay(event);
            };
          })(this));
        }
        if (!atom.config.get('autocomplete-plus.enableAutoActivation')) {
          log.debug('Ignoring keyup events due to autocomplete-plus settings.');
          return;
        }
        disposable = this._addEventListener(editor, eventName, (function(_this) {
          return function(e) {
            if (atom.keymaps.keystrokeForKeyboardEvent(e) === '^(') {
              log.debug('Trying to complete arguments on keyup event', e);
              return _this._completeArguments(editor, editor.getCursorBufferPosition());
            }
          };
        })(this));
        this.disposables.add(disposable);
        this.subscriptions[eventId] = disposable;
        return log.debug('Subscribed on event', eventId);
      } else {
        if (eventId in this.subscriptions) {
          this.subscriptions[eventId].dispose();
          return log.debug('Unsubscribed from event', eventId);
        }
      }
    },
    _serialize: function(request) {
      log.debug('Serializing request to be sent to Jedi', request);
      return JSON.stringify(request);
    },
    _sendRequest: function(data, respawned) {
      var process;
      log.debug('Pending requests:', Object.keys(this.requests).length, this.requests);
      if (Object.keys(this.requests).length > 10) {
        log.debug('Cleaning up request queue to avoid overflow, ignoring request');
        this.requests = {};
        if (this.provider && this.provider.process) {
          log.debug('Killing python process');
          this.provider.kill();
          return;
        }
      }
      if (this.provider && this.provider.process) {
        process = this.provider.process;
        if (process.exitCode === null && process.signalCode === null) {
          if (this.provider.process.pid) {
            return this.provider.process.stdin.write(data + '\n');
          } else {
            return log.debug('Attempt to communicate with terminated process', this.provider);
          }
        } else if (respawned) {
          atom.notifications.addWarning(["Failed to spawn daemon for autocomplete-python.", "Completions will not work anymore", "unless you restart your editor."].join(' '), {
            detail: ["exitCode: " + process.exitCode, "signalCode: " + process.signalCode].join('\n'),
            dismissable: true
          });
          return this.dispose();
        } else {
          this._spawnDaemon();
          this._sendRequest(data, {
            respawned: true
          });
          return log.debug('Re-spawning python process...');
        }
      } else {
        log.debug('Spawning python process...');
        this._spawnDaemon();
        return this._sendRequest(data);
      }
    },
    _deserialize: function(response) {
      var bufferPosition, cacheSizeDelta, e, editor, i, id, ids, j, len, len1, ref, ref1, ref2, resolve, responseSource, results1;
      log.debug('Deserealizing response from Jedi', response);
      log.debug("Got " + (response.trim().split('\n').length) + " lines");
      ref = response.trim().split('\n');
      results1 = [];
      for (i = 0, len = ref.length; i < len; i++) {
        responseSource = ref[i];
        try {
          response = JSON.parse(responseSource);
        } catch (error1) {
          e = error1;
          throw new Error("Failed to parse JSON from \"" + responseSource + "\".\nOriginal exception: " + e);
        }
        if (response['arguments']) {
          editor = this.requests[response['id']];
          if (typeof editor === 'object') {
            bufferPosition = editor.getCursorBufferPosition();
            if (response['id'] === this._generateRequestId('arguments', editor, bufferPosition)) {
              if ((ref1 = this.snippetsManager) != null) {
                ref1.insertSnippet(response['arguments'], editor);
              }
            }
          }
        } else {
          resolve = this.requests[response['id']];
          if (typeof resolve === 'function') {
            resolve(response['results']);
          }
        }
        cacheSizeDelta = Object.keys(this.responses).length > this.cacheSize;
        if (cacheSizeDelta > 0) {
          ids = Object.keys(this.responses).sort((function(_this) {
            return function(a, b) {
              return _this.responses[a]['timestamp'] - _this.responses[b]['timestamp'];
            };
          })(this));
          ref2 = ids.slice(0, cacheSizeDelta);
          for (j = 0, len1 = ref2.length; j < len1; j++) {
            id = ref2[j];
            log.debug('Removing old item from cache with ID', id);
            delete this.responses[id];
          }
        }
        this.responses[response['id']] = {
          source: responseSource,
          timestamp: Date.now()
        };
        log.debug('Cached request with ID', response['id']);
        results1.push(delete this.requests[response['id']]);
      }
      return results1;
    },
    _generateRequestId: function(type, editor, bufferPosition, text) {
      if (!text) {
        text = editor.getText();
      }
      return require('crypto').createHash('md5').update([editor.getPath(), text, bufferPosition.row, bufferPosition.column, type].join()).digest('hex');
    },
    _generateRequestConfig: function() {
      var args, extraPaths;
      extraPaths = this.InterpreterLookup.applySubstitutions(atom.config.get('autocomplete-python.extraPaths').split(';'));
      args = {
        'extraPaths': extraPaths,
        'useSnippets': atom.config.get('autocomplete-python.useSnippets'),
        'caseInsensitiveCompletion': atom.config.get('autocomplete-python.caseInsensitiveCompletion'),
        'showDescriptions': atom.config.get('autocomplete-python.showDescriptions'),
        'fuzzyMatcher': atom.config.get('autocomplete-python.fuzzyMatcher')
      };
      return args;
    },
    setSnippetsManager: function(snippetsManager) {
      this.snippetsManager = snippetsManager;
    },
    _completeArguments: function(editor, bufferPosition, force) {
      var disableForSelector, line, lines, payload, prefix, scopeChain, scopeDescriptor, suffix, useSnippets;
      useSnippets = atom.config.get('autocomplete-python.useSnippets');
      if (!force && useSnippets === 'none') {
        atom.commands.dispatch(document.querySelector('atom-text-editor'), 'autocomplete-plus:activate');
        return;
      }
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
      scopeChain = scopeDescriptor.getScopeChain();
      disableForSelector = this.Selector.create(this.disableForSelector);
      if (this.selectorsMatchScopeChain(disableForSelector, scopeChain)) {
        log.debug('Ignoring argument completion inside of', scopeChain);
        return;
      }
      lines = editor.getBuffer().getLines();
      line = lines[bufferPosition.row];
      prefix = line.slice(bufferPosition.column - 1, bufferPosition.column);
      if (prefix !== '(') {
        log.debug('Ignoring argument completion with prefix', prefix);
        return;
      }
      suffix = line.slice(bufferPosition.column, line.length);
      if (!/^(\)(?:$|\s)|\s|$)/.test(suffix)) {
        log.debug('Ignoring argument completion with suffix', suffix);
        return;
      }
      payload = {
        id: this._generateRequestId('arguments', editor, bufferPosition),
        lookup: 'arguments',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function() {
          return _this.requests[payload.id] = editor;
        };
      })(this));
    },
    _fuzzyFilter: function(candidates, query) {
      if (candidates.length !== 0 && (query !== ' ' && query !== '.' && query !== '(')) {
        candidates = this.filter(candidates, query, {
          key: 'text'
        });
      }
      return candidates;
    },
    getSuggestions: function(arg) {
      var bufferPosition, editor, lastIdentifier, line, lines, matches, payload, prefix, requestId, scopeDescriptor;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      this.load();
      if (!this.triggerCompletionRegex.test(prefix)) {
        return [];
      }
      bufferPosition = {
        row: bufferPosition.row,
        column: bufferPosition.column
      };
      lines = editor.getBuffer().getLines();
      if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
        line = lines[bufferPosition.row];
        lastIdentifier = /\.?[a-zA-Z_][a-zA-Z0-9_]*$/.exec(line.slice(0, bufferPosition.column));
        if (lastIdentifier) {
          bufferPosition.column = lastIdentifier.index + 1;
          lines[bufferPosition.row] = line.slice(0, bufferPosition.column);
        }
      }
      requestId = this._generateRequestId('completions', editor, bufferPosition, lines.join('\n'));
      if (requestId in this.responses) {
        log.debug('Using cached response with ID', requestId);
        matches = JSON.parse(this.responses[requestId]['source'])['results'];
        if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
          return this._fuzzyFilter(matches, prefix);
        } else {
          return matches;
        }
      }
      payload = {
        id: requestId,
        prefix: prefix,
        lookup: 'completions',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
            return _this.requests[payload.id] = function(matches) {
              return resolve(_this._fuzzyFilter(matches, prefix));
            };
          } else {
            return _this.requests[payload.id] = resolve;
          }
        };
      })(this));
    },
    getDefinitions: function(editor, bufferPosition) {
      var payload;
      payload = {
        id: this._generateRequestId('definitions', editor, bufferPosition),
        lookup: 'definitions',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = resolve;
        };
      })(this));
    },
    getUsages: function(editor, bufferPosition) {
      var payload;
      payload = {
        id: this._generateRequestId('usages', editor, bufferPosition),
        lookup: 'usages',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = resolve;
        };
      })(this));
    },
    getMethods: function(editor, bufferPosition) {
      var indent, lines, payload;
      indent = bufferPosition.column;
      lines = editor.getBuffer().getLines();
      lines.splice(bufferPosition.row + 1, 0, "  def __autocomplete_python(s):");
      lines.splice(bufferPosition.row + 2, 0, "    s.");
      payload = {
        id: this._generateRequestId('methods', editor, bufferPosition),
        lookup: 'methods',
        path: editor.getPath(),
        source: lines.join('\n'),
        line: bufferPosition.row + 2,
        column: 6,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = function(methods) {
            return resolve({
              methods: methods,
              indent: indent,
              bufferPosition: bufferPosition
            });
          };
        };
      })(this));
    },
    goToDefinition: function(editor, bufferPosition) {
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      if (!bufferPosition) {
        bufferPosition = editor.getCursorBufferPosition();
      }
      if (this.definitionsView) {
        this.definitionsView.destroy();
      }
      this.definitionsView = new this.DefinitionsView();
      return this.getDefinitions(editor, bufferPosition).then((function(_this) {
        return function(results) {
          _this.definitionsView.setItems(results);
          if (results.length === 1) {
            return _this.definitionsView.confirmed(results[0]);
          }
        };
      })(this));
    },
    dispose: function() {
      if (this.disposables) {
        this.disposables.dispose();
      }
      if (this.provider) {
        return this.provider.kill();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVI7O0VBRU4sTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxnQkFBVjtJQUNBLGtCQUFBLEVBQW9CLGlEQURwQjtJQUVBLGlCQUFBLEVBQW1CLENBRm5CO0lBR0Esa0JBQUEsRUFBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdDQUFoQixDQUhwQjtJQUlBLG9CQUFBLEVBQXNCLEtBSnRCO0lBS0EsU0FBQSxFQUFXLEVBTFg7SUFPQSxpQkFBQSxFQUFtQixTQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLE9BQXBCO0FBQ2pCLFVBQUE7TUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CO01BQ2IsVUFBVSxDQUFDLGdCQUFYLENBQTRCLFNBQTVCLEVBQXVDLE9BQXZDO01BQ0EsVUFBQSxHQUFpQixJQUFBLElBQUMsQ0FBQSxVQUFELENBQVksU0FBQTtRQUMzQixHQUFHLENBQUMsS0FBSixDQUFVLG9DQUFWLEVBQWdELFNBQWhELEVBQTJELE9BQTNEO2VBQ0EsVUFBVSxDQUFDLG1CQUFYLENBQStCLFNBQS9CLEVBQTBDLE9BQTFDO01BRjJCLENBQVo7QUFHakIsYUFBTztJQU5VLENBUG5CO0lBZUEsa0JBQUEsRUFBb0IsU0FBQyxLQUFEO01BQ2xCLElBQUcsSUFBQyxDQUFBLG9CQUFKO0FBQ0UsZUFERjs7TUFFQSxHQUFHLENBQUMsT0FBSixDQUFZLDRCQUFaLEVBQTBDLEtBQTFDO01BQ0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUNFLG1EQURGLEVBQ3VEO1FBQ3JELE1BQUEsRUFBUSxxTUFB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Q0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQ7VUFDM0MsS0FBQyxDQUFBLGVBQWUsQ0FBQyxRQUFqQixDQUEwQixPQUExQjtVQUNBLElBQUcsT0FBTyxDQUFDLE1BQVIsS0FBa0IsQ0FBckI7bUJBQ0UsS0FBQyxDQUFBLGVBQWUsQ0FBQyxTQUFqQixDQUEyQixPQUFRLENBQUEsQ0FBQSxDQUFuQyxFQURGOztRQUYyQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0M7SUFSYyxDQTdmaEI7SUEwZ0JBLE9BQUEsRUFBUyxTQUFBO01BQ1AsSUFBRyxJQUFDLENBQUEsV0FBSjtRQUNFLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBLEVBREY7O01BRUEsSUFBRyxJQUFDLENBQUEsUUFBSjtlQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFBLEVBREY7O0lBSE8sQ0ExZ0JUOztBQUhGIiwic291cmNlc0NvbnRlbnQiOlsibG9nID0gcmVxdWlyZSAnLi9sb2cnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgc2VsZWN0b3I6ICcuc291cmNlLnB5dGhvbidcbiAgZGlzYWJsZUZvclNlbGVjdG9yOiAnLnNvdXJjZS5weXRob24gLmNvbW1lbnQsIC5zb3VyY2UucHl0aG9uIC5zdHJpbmcnXG4gIGluY2x1c2lvblByaW9yaXR5OiAyXG4gIHN1Z2dlc3Rpb25Qcmlvcml0eTogYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLnN1Z2dlc3Rpb25Qcmlvcml0eScpXG4gIGV4Y2x1ZGVMb3dlclByaW9yaXR5OiBmYWxzZVxuICBjYWNoZVNpemU6IDEwXG5cbiAgX2FkZEV2ZW50TGlzdGVuZXI6IChlZGl0b3IsIGV2ZW50TmFtZSwgaGFuZGxlcikgLT5cbiAgICBlZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3IGVkaXRvclxuICAgIGVkaXRvclZpZXcuYWRkRXZlbnRMaXN0ZW5lciBldmVudE5hbWUsIGhhbmRsZXJcbiAgICBkaXNwb3NhYmxlID0gbmV3IEBEaXNwb3NhYmxlIC0+XG4gICAgICBsb2cuZGVidWcgJ1Vuc3Vic2NyaWJpbmcgZnJvbSBldmVudCBsaXN0ZW5lciAnLCBldmVudE5hbWUsIGhhbmRsZXJcbiAgICAgIGVkaXRvclZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lciBldmVudE5hbWUsIGhhbmRsZXJcbiAgICByZXR1cm4gZGlzcG9zYWJsZVxuXG4gIF9ub0V4ZWN1dGFibGVFcnJvcjogKGVycm9yKSAtPlxuICAgIGlmIEBwcm92aWRlck5vRXhlY3V0YWJsZVxuICAgICAgcmV0dXJuXG4gICAgbG9nLndhcm5pbmcgJ05vIHB5dGhvbiBleGVjdXRhYmxlIGZvdW5kJywgZXJyb3JcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICdhdXRvY29tcGxldGUtcHl0aG9uIHVuYWJsZSB0byBmaW5kIHB5dGhvbiBiaW5hcnkuJywge1xuICAgICAgZGV0YWlsOiBcIlwiXCJQbGVhc2Ugc2V0IHBhdGggdG8gcHl0aG9uIGV4ZWN1dGFibGUgbWFudWFsbHkgaW4gcGFja2FnZVxuICAgICAgc2V0dGluZ3MgYW5kIHJlc3RhcnQgeW91ciBlZGl0b3IuIEJlIHN1cmUgdG8gbWlncmF0ZSBvbiBuZXcgc2V0dGluZ3NcbiAgICAgIGlmIGV2ZXJ5dGhpbmcgd29ya2VkIG9uIHByZXZpb3VzIHZlcnNpb24uXG4gICAgICBEZXRhaWxlZCBlcnJvciBtZXNzYWdlOiAje2Vycm9yfVxuXG4gICAgICBDdXJyZW50IGNvbmZpZzogI3thdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24ucHl0aG9uUGF0aHMnKX1cIlwiXCJcbiAgICAgIGRpc21pc3NhYmxlOiB0cnVlfSlcbiAgICBAcHJvdmlkZXJOb0V4ZWN1dGFibGUgPSB0cnVlXG5cbiAgX3NwYXduRGFlbW9uOiAtPlxuICAgIGludGVycHJldGVyID0gQEludGVycHJldGVyTG9va3VwLmdldEludGVycHJldGVyKClcbiAgICBsb2cuZGVidWcgJ1VzaW5nIGludGVycHJldGVyJywgaW50ZXJwcmV0ZXJcbiAgICBAcHJvdmlkZXIgPSBuZXcgQEJ1ZmZlcmVkUHJvY2Vzc1xuICAgICAgY29tbWFuZDogaW50ZXJwcmV0ZXIgb3IgJ3B5dGhvbidcbiAgICAgIGFyZ3M6IFtfX2Rpcm5hbWUgKyAnL2NvbXBsZXRpb24ucHknXVxuICAgICAgc3Rkb3V0OiAoZGF0YSkgPT5cbiAgICAgICAgQF9kZXNlcmlhbGl6ZShkYXRhKVxuICAgICAgc3RkZXJyOiAoZGF0YSkgPT5cbiAgICAgICAgaWYgZGF0YS5pbmRleE9mKCdpcyBub3QgcmVjb2duaXplZCBhcyBhbiBpbnRlcm5hbCBvciBleHRlcm5hbCcpID4gLTFcbiAgICAgICAgICByZXR1cm4gQF9ub0V4ZWN1dGFibGVFcnJvcihkYXRhKVxuICAgICAgICBsb2cuZGVidWcgXCJhdXRvY29tcGxldGUtcHl0aG9uIHRyYWNlYmFjayBvdXRwdXQ6ICN7ZGF0YX1cIlxuICAgICAgICBpZiBkYXRhLmluZGV4T2YoJ2plZGknKSA+IC0xXG4gICAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLm91dHB1dFByb3ZpZGVyRXJyb3JzJylcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAgICAgICAnJydMb29rcyBsaWtlIHRoaXMgZXJyb3Igb3JpZ2luYXRlZCBmcm9tIEplZGkuIFBsZWFzZSBkbyBub3RcbiAgICAgICAgICAgICAgcmVwb3J0IHN1Y2ggaXNzdWVzIGluIGF1dG9jb21wbGV0ZS1weXRob24gaXNzdWUgdHJhY2tlci4gUmVwb3J0XG4gICAgICAgICAgICAgIHRoZW0gZGlyZWN0bHkgdG8gSmVkaS4gVHVybiBvZmYgYG91dHB1dFByb3ZpZGVyRXJyb3JzYCBzZXR0aW5nXG4gICAgICAgICAgICAgIHRvIGhpZGUgc3VjaCBlcnJvcnMgaW4gZnV0dXJlLiBUcmFjZWJhY2sgb3V0cHV0OicnJywge1xuICAgICAgICAgICAgICBkZXRhaWw6IFwiI3tkYXRhfVwiLFxuICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbiB0cmFjZWJhY2sgb3V0cHV0OicsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiBcIiN7ZGF0YX1cIixcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWV9KVxuXG4gICAgICAgIGxvZy5kZWJ1ZyBcIkZvcmNpbmcgdG8gcmVzb2x2ZSAje09iamVjdC5rZXlzKEByZXF1ZXN0cykubGVuZ3RofSBwcm9taXNlc1wiXG4gICAgICAgIGZvciByZXF1ZXN0SWQsIHJlc29sdmUgb2YgQHJlcXVlc3RzXG4gICAgICAgICAgaWYgdHlwZW9mIHJlc29sdmUgPT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgcmVzb2x2ZShbXSlcbiAgICAgICAgICBkZWxldGUgQHJlcXVlc3RzW3JlcXVlc3RJZF1cblxuICAgICAgZXhpdDogKGNvZGUpID0+XG4gICAgICAgIGxvZy53YXJuaW5nICdQcm9jZXNzIGV4aXQgd2l0aCcsIGNvZGUsIEBwcm92aWRlclxuICAgIEBwcm92aWRlci5vbldpbGxUaHJvd0Vycm9yICh7ZXJyb3IsIGhhbmRsZX0pID0+XG4gICAgICBpZiBlcnJvci5jb2RlIGlzICdFTk9FTlQnIGFuZCBlcnJvci5zeXNjYWxsLmluZGV4T2YoJ3NwYXduJykgaXMgMFxuICAgICAgICBAX25vRXhlY3V0YWJsZUVycm9yKGVycm9yKVxuICAgICAgICBAZGlzcG9zZSgpXG4gICAgICAgIGhhbmRsZSgpXG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IGVycm9yXG5cbiAgICBAcHJvdmlkZXIucHJvY2Vzcz8uc3RkaW4ub24gJ2Vycm9yJywgKGVycikgLT5cbiAgICAgIGxvZy5kZWJ1ZyAnc3RkaW4nLCBlcnJcblxuICAgIHNldFRpbWVvdXQgPT5cbiAgICAgIGxvZy5kZWJ1ZyAnS2lsbGluZyBweXRob24gcHJvY2VzcyBhZnRlciB0aW1lb3V0Li4uJ1xuICAgICAgaWYgQHByb3ZpZGVyIGFuZCBAcHJvdmlkZXIucHJvY2Vzc1xuICAgICAgICBAcHJvdmlkZXIua2lsbCgpXG4gICAgLCA2MCAqIDEwICogMTAwMFxuXG4gIGxvYWQ6IC0+XG4gICAgaWYgbm90IEBjb25zdHJ1Y3RlZFxuICAgICAgQGNvbnN0cnVjdG9yKClcbiAgICByZXR1cm4gdGhpc1xuXG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgIHtARGlzcG9zYWJsZSwgQENvbXBvc2l0ZURpc3Bvc2FibGUsIEBCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSAnYXRvbSdcbiAgICB7QHNlbGVjdG9yc01hdGNoU2NvcGVDaGFpbn0gPSByZXF1aXJlICcuL3Njb3BlLWhlbHBlcnMnXG4gICAge0BTZWxlY3Rvcn0gPSByZXF1aXJlICdzZWxlY3Rvci1raXQnXG4gICAgQERlZmluaXRpb25zVmlldyA9IHJlcXVpcmUgJy4vZGVmaW5pdGlvbnMtdmlldydcbiAgICBAVXNhZ2VzVmlldyA9IHJlcXVpcmUgJy4vdXNhZ2VzLXZpZXcnXG4gICAgQE92ZXJyaWRlVmlldyA9IHJlcXVpcmUgJy4vb3ZlcnJpZGUtdmlldydcbiAgICBAUmVuYW1lVmlldyA9IHJlcXVpcmUgJy4vcmVuYW1lLXZpZXcnXG4gICAgQEludGVycHJldGVyTG9va3VwID0gcmVxdWlyZSAnLi9pbnRlcnByZXRlcnMtbG9va3VwJ1xuICAgIEBfID0gcmVxdWlyZSAndW5kZXJzY29yZSdcbiAgICBAZmlsdGVyID0gcmVxdWlyZSgnZnV6emFsZHJpbi1wbHVzJykuZmlsdGVyXG5cbiAgICBAcmVxdWVzdHMgPSB7fVxuICAgIEByZXNwb25zZXMgPSB7fVxuICAgIEBwcm92aWRlciA9IG51bGxcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucyA9IHt9XG4gICAgQGRlZmluaXRpb25zVmlldyA9IG51bGxcbiAgICBAdXNhZ2VzVmlldyA9IG51bGxcbiAgICBAcmVuYW1lVmlldyA9IG51bGxcbiAgICBAY29uc3RydWN0ZWQgPSB0cnVlXG4gICAgQHNuaXBwZXRzTWFuYWdlciA9IG51bGxcblxuICAgIGxvZy5kZWJ1ZyBcIkluaXQgYXV0b2NvbXBsZXRlLXB5dGhvbiB3aXRoIHByaW9yaXR5ICN7QHN1Z2dlc3Rpb25Qcmlvcml0eX1cIlxuXG4gICAgdHJ5XG4gICAgICBAdHJpZ2dlckNvbXBsZXRpb25SZWdleCA9IFJlZ0V4cCBhdG9tLmNvbmZpZy5nZXQoXG4gICAgICAgICdhdXRvY29tcGxldGUtcHl0aG9uLnRyaWdnZXJDb21wbGV0aW9uUmVnZXgnKVxuICAgIGNhdGNoIGVyclxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICcnJ2F1dG9jb21wbGV0ZS1weXRob24gaW52YWxpZCByZWdleHAgdG8gdHJpZ2dlciBhdXRvY29tcGxldGlvbnMuXG4gICAgICAgIEZhbGxpbmcgYmFjayB0byBkZWZhdWx0IHZhbHVlLicnJywge1xuICAgICAgICBkZXRhaWw6IFwiT3JpZ2luYWwgZXhjZXB0aW9uOiAje2Vycn1cIlxuICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1weXRob24udHJpZ2dlckNvbXBsZXRpb25SZWdleCcsXG4gICAgICAgICAgICAgICAgICAgICAgJyhbXFwuXFwgXXxbYS16QS1aX11bYS16QS1aMC05X10qKScpXG4gICAgICBAdHJpZ2dlckNvbXBsZXRpb25SZWdleCA9IC8oW1xcLlxcIF18W2EtekEtWl9dW2EtekEtWjAtOV9dKikvXG5cbiAgICBzZWxlY3RvciA9ICdhdG9tLXRleHQtZWRpdG9yW2RhdGEtZ3JhbW1hcn49cHl0aG9uXSdcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBzZWxlY3RvciwgJ2F1dG9jb21wbGV0ZS1weXRob246Z28tdG8tZGVmaW5pdGlvbicsID0+XG4gICAgICBAZ29Ub0RlZmluaXRpb24oKVxuICAgIGF0b20uY29tbWFuZHMuYWRkIHNlbGVjdG9yLCAnYXV0b2NvbXBsZXRlLXB5dGhvbjpjb21wbGV0ZS1hcmd1bWVudHMnLCA9PlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBAX2NvbXBsZXRlQXJndW1lbnRzKGVkaXRvciwgZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCksIHRydWUpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBzZWxlY3RvciwgJ2F1dG9jb21wbGV0ZS1weXRob246c2hvdy11c2FnZXMnLCA9PlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiBAdXNhZ2VzVmlld1xuICAgICAgICBAdXNhZ2VzVmlldy5kZXN0cm95KClcbiAgICAgIEB1c2FnZXNWaWV3ID0gbmV3IEBVc2FnZXNWaWV3KClcbiAgICAgIEBnZXRVc2FnZXMoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikudGhlbiAodXNhZ2VzKSA9PlxuICAgICAgICBAdXNhZ2VzVmlldy5zZXRJdGVtcyh1c2FnZXMpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBzZWxlY3RvciwgJ2F1dG9jb21wbGV0ZS1weXRob246b3ZlcnJpZGUtbWV0aG9kJywgPT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgQG92ZXJyaWRlVmlld1xuICAgICAgICBAb3ZlcnJpZGVWaWV3LmRlc3Ryb3koKVxuICAgICAgQG92ZXJyaWRlVmlldyA9IG5ldyBAT3ZlcnJpZGVWaWV3KClcbiAgICAgIEBnZXRNZXRob2RzKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pLnRoZW4gKHttZXRob2RzLCBpbmRlbnQsIGJ1ZmZlclBvc2l0aW9ufSkgPT5cbiAgICAgICAgQG92ZXJyaWRlVmlldy5pbmRlbnQgPSBpbmRlbnRcbiAgICAgICAgQG92ZXJyaWRlVmlldy5idWZmZXJQb3NpdGlvbiA9IGJ1ZmZlclBvc2l0aW9uXG4gICAgICAgIEBvdmVycmlkZVZpZXcuc2V0SXRlbXMobWV0aG9kcylcblxuICAgIGF0b20uY29tbWFuZHMuYWRkIHNlbGVjdG9yLCAnYXV0b2NvbXBsZXRlLXB5dGhvbjpyZW5hbWUnLCA9PlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBAZ2V0VXNhZ2VzKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pLnRoZW4gKHVzYWdlcykgPT5cbiAgICAgICAgaWYgQHJlbmFtZVZpZXdcbiAgICAgICAgICBAcmVuYW1lVmlldy5kZXN0cm95KClcbiAgICAgICAgaWYgdXNhZ2VzLmxlbmd0aCA+IDBcbiAgICAgICAgICBAcmVuYW1lVmlldyA9IG5ldyBAUmVuYW1lVmlldyh1c2FnZXMpXG4gICAgICAgICAgQHJlbmFtZVZpZXcub25JbnB1dCAobmV3TmFtZSkgPT5cbiAgICAgICAgICAgIGZvciBmaWxlTmFtZSwgdXNhZ2VzIG9mIEBfLmdyb3VwQnkodXNhZ2VzLCAnZmlsZU5hbWUnKVxuICAgICAgICAgICAgICBbcHJvamVjdCwgX3JlbGF0aXZlXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmaWxlTmFtZSlcbiAgICAgICAgICAgICAgaWYgcHJvamVjdFxuICAgICAgICAgICAgICAgIEBfdXBkYXRlVXNhZ2VzSW5GaWxlKGZpbGVOYW1lLCB1c2FnZXMsIG5ld05hbWUpXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsb2cuZGVidWcgJ0lnbm9yaW5nIGZpbGUgb3V0c2lkZSBvZiBwcm9qZWN0JywgZmlsZU5hbWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlmIEB1c2FnZXNWaWV3XG4gICAgICAgICAgICBAdXNhZ2VzVmlldy5kZXN0cm95KClcbiAgICAgICAgICBAdXNhZ2VzVmlldyA9IG5ldyBAVXNhZ2VzVmlldygpXG4gICAgICAgICAgQHVzYWdlc1ZpZXcuc2V0SXRlbXModXNhZ2VzKVxuXG4gICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICBAX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudChlZGl0b3IsIGVkaXRvci5nZXRHcmFtbWFyKCkpXG4gICAgICBlZGl0b3Iub25EaWRDaGFuZ2VHcmFtbWFyIChncmFtbWFyKSA9PlxuICAgICAgICBAX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudChlZGl0b3IsIGdyYW1tYXIpXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnYXV0b2NvbXBsZXRlLXBsdXMuZW5hYmxlQXV0b0FjdGl2YXRpb24nLCA9PlxuICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICAgIEBfaGFuZGxlR3JhbW1hckNoYW5nZUV2ZW50KGVkaXRvciwgZWRpdG9yLmdldEdyYW1tYXIoKSlcblxuICBfdXBkYXRlVXNhZ2VzSW5GaWxlOiAoZmlsZU5hbWUsIHVzYWdlcywgbmV3TmFtZSkgLT5cbiAgICBjb2x1bW5PZmZzZXQgPSB7fVxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZU5hbWUsIGFjdGl2YXRlSXRlbTogZmFsc2UpLnRoZW4gKGVkaXRvcikgLT5cbiAgICAgIGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKVxuICAgICAgZm9yIHVzYWdlIGluIHVzYWdlc1xuICAgICAgICB7bmFtZSwgbGluZSwgY29sdW1ufSA9IHVzYWdlXG4gICAgICAgIGNvbHVtbk9mZnNldFtsaW5lXSA/PSAwXG4gICAgICAgIGxvZy5kZWJ1ZyAnUmVwbGFjaW5nJywgdXNhZ2UsICd3aXRoJywgbmV3TmFtZSwgJ2luJywgZWRpdG9yLmlkXG4gICAgICAgIGxvZy5kZWJ1ZyAnT2Zmc2V0IGZvciBsaW5lJywgbGluZSwgJ2lzJywgY29sdW1uT2Zmc2V0W2xpbmVdXG4gICAgICAgIGJ1ZmZlci5zZXRUZXh0SW5SYW5nZShbXG4gICAgICAgICAgW2xpbmUgLSAxLCBjb2x1bW4gKyBjb2x1bW5PZmZzZXRbbGluZV1dLFxuICAgICAgICAgIFtsaW5lIC0gMSwgY29sdW1uICsgbmFtZS5sZW5ndGggKyBjb2x1bW5PZmZzZXRbbGluZV1dLFxuICAgICAgICAgIF0sIG5ld05hbWUpXG4gICAgICAgIGNvbHVtbk9mZnNldFtsaW5lXSArPSBuZXdOYW1lLmxlbmd0aCAtIG5hbWUubGVuZ3RoXG4gICAgICBidWZmZXIuc2F2ZSgpXG5cblxuICBfc2hvd1NpZ25hdHVyZU92ZXJsYXk6IChldmVudCkgLT5cbiAgICBpZiBAbWFya2Vyc1xuICAgICAgZm9yIG1hcmtlciBpbiBAbWFya2Vyc1xuICAgICAgICBsb2cuZGVidWcgJ2Rlc3Ryb3lpbmcgb2xkIG1hcmtlcicsIG1hcmtlclxuICAgICAgICBtYXJrZXIuZGVzdHJveSgpXG4gICAgZWxzZVxuICAgICAgQG1hcmtlcnMgPSBbXVxuXG4gICAgY3Vyc29yID0gZXZlbnQuY3Vyc29yXG4gICAgZWRpdG9yID0gZXZlbnQuY3Vyc29yLmVkaXRvclxuICAgIHdvcmRCdWZmZXJSYW5nZSA9IGN1cnNvci5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKClcbiAgICBzY29wZURlc2NyaXB0b3IgPSBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oXG4gICAgICBldmVudC5uZXdCdWZmZXJQb3NpdGlvbilcbiAgICBzY29wZUNoYWluID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3BlQ2hhaW4oKVxuXG4gICAgZGlzYWJsZUZvclNlbGVjdG9yID0gXCIje0BkaXNhYmxlRm9yU2VsZWN0b3J9LCAuc291cmNlLnB5dGhvbiAubnVtZXJpYywgLnNvdXJjZS5weXRob24gLmludGVnZXIsIC5zb3VyY2UucHl0aG9uIC5kZWNpbWFsLCAuc291cmNlLnB5dGhvbiAucHVuY3R1YXRpb24sIC5zb3VyY2UucHl0aG9uIC5rZXl3b3JkLCAuc291cmNlLnB5dGhvbiAuc3RvcmFnZSwgLnNvdXJjZS5weXRob24gLnZhcmlhYmxlLnBhcmFtZXRlciwgLnNvdXJjZS5weXRob24gLmVudGl0eS5uYW1lXCJcbiAgICBkaXNhYmxlRm9yU2VsZWN0b3IgPSBAU2VsZWN0b3IuY3JlYXRlKGRpc2FibGVGb3JTZWxlY3RvcilcblxuICAgIGlmIEBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4oZGlzYWJsZUZvclNlbGVjdG9yLCBzY29wZUNoYWluKVxuICAgICAgbG9nLmRlYnVnICdkbyBub3RoaW5nIGZvciB0aGlzIHNlbGVjdG9yJ1xuICAgICAgcmV0dXJuXG5cbiAgICBtYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKFxuICAgICAgd29yZEJ1ZmZlclJhbmdlLFxuICAgICAge3BlcnNpc3RlbnQ6IGZhbHNlLCBpbnZhbGlkYXRlOiAnbmV2ZXInfSlcblxuICAgIEBtYXJrZXJzLnB1c2gobWFya2VyKVxuXG4gICAgZ2V0VG9vbHRpcCA9IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSA9PlxuICAgICAgcGF5bG9hZCA9XG4gICAgICAgIGlkOiBAX2dlbmVyYXRlUmVxdWVzdElkKCd0b29sdGlwJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgICAgbG9va3VwOiAndG9vbHRpcCdcbiAgICAgICAgcGF0aDogZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICBzb3VyY2U6IGVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICAgIGNvbHVtbjogYnVmZmVyUG9zaXRpb24uY29sdW1uXG4gICAgICAgIGNvbmZpZzogQF9nZW5lcmF0ZVJlcXVlc3RDb25maWcoKVxuICAgICAgQF9zZW5kUmVxdWVzdChAX3NlcmlhbGl6ZShwYXlsb2FkKSlcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgICAgQHJlcXVlc3RzW3BheWxvYWQuaWRdID0gcmVzb2x2ZVxuXG4gICAgZ2V0VG9vbHRpcChlZGl0b3IsIGV2ZW50Lm5ld0J1ZmZlclBvc2l0aW9uKS50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgaWYgcmVzdWx0cy5sZW5ndGggPiAwXG4gICAgICAgIHt0ZXh0LCBmaWxlTmFtZSwgbGluZSwgY29sdW1uLCB0eXBlLCBkZXNjcmlwdGlvbn0gPSByZXN1bHRzWzBdXG5cbiAgICAgICAgZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbi50cmltKClcbiAgICAgICAgaWYgbm90IGRlc2NyaXB0aW9uXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIHZpZXcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdXRvY29tcGxldGUtcHl0aG9uLXN1Z2dlc3Rpb24nKVxuICAgICAgICB2aWV3LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRlc2NyaXB0aW9uKSlcbiAgICAgICAgZGVjb3JhdGlvbiA9IGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgICAgICAgIHR5cGU6ICdvdmVybGF5JyxcbiAgICAgICAgICAgIGl0ZW06IHZpZXcsXG4gICAgICAgICAgICBwb3NpdGlvbjogJ2hlYWQnXG4gICAgICAgIH0pXG4gICAgICAgIGxvZy5kZWJ1ZygnZGVjb3JhdGVkIG1hcmtlcicsIG1hcmtlcilcblxuICBfaGFuZGxlR3JhbW1hckNoYW5nZUV2ZW50OiAoZWRpdG9yLCBncmFtbWFyKSAtPlxuICAgIGV2ZW50TmFtZSA9ICdrZXl1cCdcbiAgICBldmVudElkID0gXCIje2VkaXRvci5pZH0uI3tldmVudE5hbWV9XCJcbiAgICBpZiBncmFtbWFyLnNjb3BlTmFtZSA9PSAnc291cmNlLnB5dGhvbidcblxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLnNob3dUb29sdGlwcycpIGlzIHRydWVcbiAgICAgICAgZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24gKGV2ZW50KSA9PlxuICAgICAgICAgIEBfc2hvd1NpZ25hdHVyZU92ZXJsYXkoZXZlbnQpXG5cbiAgICAgIGlmIG5vdCBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUF1dG9BY3RpdmF0aW9uJylcbiAgICAgICAgbG9nLmRlYnVnICdJZ25vcmluZyBrZXl1cCBldmVudHMgZHVlIHRvIGF1dG9jb21wbGV0ZS1wbHVzIHNldHRpbmdzLidcbiAgICAgICAgcmV0dXJuXG4gICAgICBkaXNwb3NhYmxlID0gQF9hZGRFdmVudExpc3RlbmVyIGVkaXRvciwgZXZlbnROYW1lLCAoZSkgPT5cbiAgICAgICAgaWYgYXRvbS5rZXltYXBzLmtleXN0cm9rZUZvcktleWJvYXJkRXZlbnQoZSkgPT0gJ14oJ1xuICAgICAgICAgIGxvZy5kZWJ1ZyAnVHJ5aW5nIHRvIGNvbXBsZXRlIGFyZ3VtZW50cyBvbiBrZXl1cCBldmVudCcsIGVcbiAgICAgICAgICBAX2NvbXBsZXRlQXJndW1lbnRzKGVkaXRvciwgZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIGRpc3Bvc2FibGVcbiAgICAgIEBzdWJzY3JpcHRpb25zW2V2ZW50SWRdID0gZGlzcG9zYWJsZVxuICAgICAgbG9nLmRlYnVnICdTdWJzY3JpYmVkIG9uIGV2ZW50JywgZXZlbnRJZFxuICAgIGVsc2VcbiAgICAgIGlmIGV2ZW50SWQgb2YgQHN1YnNjcmlwdGlvbnNcbiAgICAgICAgQHN1YnNjcmlwdGlvbnNbZXZlbnRJZF0uZGlzcG9zZSgpXG4gICAgICAgIGxvZy5kZWJ1ZyAnVW5zdWJzY3JpYmVkIGZyb20gZXZlbnQnLCBldmVudElkXG5cbiAgX3NlcmlhbGl6ZTogKHJlcXVlc3QpIC0+XG4gICAgbG9nLmRlYnVnICdTZXJpYWxpemluZyByZXF1ZXN0IHRvIGJlIHNlbnQgdG8gSmVkaScsIHJlcXVlc3RcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocmVxdWVzdClcblxuICBfc2VuZFJlcXVlc3Q6IChkYXRhLCByZXNwYXduZWQpIC0+XG4gICAgbG9nLmRlYnVnICdQZW5kaW5nIHJlcXVlc3RzOicsIE9iamVjdC5rZXlzKEByZXF1ZXN0cykubGVuZ3RoLCBAcmVxdWVzdHNcbiAgICBpZiBPYmplY3Qua2V5cyhAcmVxdWVzdHMpLmxlbmd0aCA+IDEwXG4gICAgICBsb2cuZGVidWcgJ0NsZWFuaW5nIHVwIHJlcXVlc3QgcXVldWUgdG8gYXZvaWQgb3ZlcmZsb3csIGlnbm9yaW5nIHJlcXVlc3QnXG4gICAgICBAcmVxdWVzdHMgPSB7fVxuICAgICAgaWYgQHByb3ZpZGVyIGFuZCBAcHJvdmlkZXIucHJvY2Vzc1xuICAgICAgICBsb2cuZGVidWcgJ0tpbGxpbmcgcHl0aG9uIHByb2Nlc3MnXG4gICAgICAgIEBwcm92aWRlci5raWxsKClcbiAgICAgICAgcmV0dXJuXG5cbiAgICBpZiBAcHJvdmlkZXIgYW5kIEBwcm92aWRlci5wcm9jZXNzXG4gICAgICBwcm9jZXNzID0gQHByb3ZpZGVyLnByb2Nlc3NcbiAgICAgIGlmIHByb2Nlc3MuZXhpdENvZGUgPT0gbnVsbCBhbmQgcHJvY2Vzcy5zaWduYWxDb2RlID09IG51bGxcbiAgICAgICAgaWYgQHByb3ZpZGVyLnByb2Nlc3MucGlkXG4gICAgICAgICAgcmV0dXJuIEBwcm92aWRlci5wcm9jZXNzLnN0ZGluLndyaXRlKGRhdGEgKyAnXFxuJylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxvZy5kZWJ1ZyAnQXR0ZW1wdCB0byBjb21tdW5pY2F0ZSB3aXRoIHRlcm1pbmF0ZWQgcHJvY2VzcycsIEBwcm92aWRlclxuICAgICAgZWxzZSBpZiByZXNwYXduZWRcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICAgW1wiRmFpbGVkIHRvIHNwYXduIGRhZW1vbiBmb3IgYXV0b2NvbXBsZXRlLXB5dGhvbi5cIlxuICAgICAgICAgICBcIkNvbXBsZXRpb25zIHdpbGwgbm90IHdvcmsgYW55bW9yZVwiXG4gICAgICAgICAgIFwidW5sZXNzIHlvdSByZXN0YXJ0IHlvdXIgZWRpdG9yLlwiXS5qb2luKCcgJyksIHtcbiAgICAgICAgICBkZXRhaWw6IFtcImV4aXRDb2RlOiAje3Byb2Nlc3MuZXhpdENvZGV9XCJcbiAgICAgICAgICAgICAgICAgICBcInNpZ25hbENvZGU6ICN7cHJvY2Vzcy5zaWduYWxDb2RlfVwiXS5qb2luKCdcXG4nKSxcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgICAgIEBkaXNwb3NlKClcbiAgICAgIGVsc2VcbiAgICAgICAgQF9zcGF3bkRhZW1vbigpXG4gICAgICAgIEBfc2VuZFJlcXVlc3QoZGF0YSwgcmVzcGF3bmVkOiB0cnVlKVxuICAgICAgICBsb2cuZGVidWcgJ1JlLXNwYXduaW5nIHB5dGhvbiBwcm9jZXNzLi4uJ1xuICAgIGVsc2VcbiAgICAgIGxvZy5kZWJ1ZyAnU3Bhd25pbmcgcHl0aG9uIHByb2Nlc3MuLi4nXG4gICAgICBAX3NwYXduRGFlbW9uKClcbiAgICAgIEBfc2VuZFJlcXVlc3QoZGF0YSlcblxuICBfZGVzZXJpYWxpemU6IChyZXNwb25zZSkgLT5cbiAgICBsb2cuZGVidWcgJ0Rlc2VyZWFsaXppbmcgcmVzcG9uc2UgZnJvbSBKZWRpJywgcmVzcG9uc2VcbiAgICBsb2cuZGVidWcgXCJHb3QgI3tyZXNwb25zZS50cmltKCkuc3BsaXQoJ1xcbicpLmxlbmd0aH0gbGluZXNcIlxuICAgIGZvciByZXNwb25zZVNvdXJjZSBpbiByZXNwb25zZS50cmltKCkuc3BsaXQoJ1xcbicpXG4gICAgICB0cnlcbiAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlU291cmNlKVxuICAgICAgY2F0Y2ggZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJcIlwiRmFpbGVkIHRvIHBhcnNlIEpTT04gZnJvbSBcXFwiI3tyZXNwb25zZVNvdXJjZX1cXFwiLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgT3JpZ2luYWwgZXhjZXB0aW9uOiAje2V9XCJcIlwiKVxuXG4gICAgICBpZiByZXNwb25zZVsnYXJndW1lbnRzJ11cbiAgICAgICAgZWRpdG9yID0gQHJlcXVlc3RzW3Jlc3BvbnNlWydpZCddXVxuICAgICAgICBpZiB0eXBlb2YgZWRpdG9yID09ICdvYmplY3QnXG4gICAgICAgICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgICAgICMgQ29tcGFyZSByZXNwb25zZSBJRCB3aXRoIGN1cnJlbnQgc3RhdGUgdG8gYXZvaWQgc3RhbGUgY29tcGxldGlvbnNcbiAgICAgICAgICBpZiByZXNwb25zZVsnaWQnXSA9PSBAX2dlbmVyYXRlUmVxdWVzdElkKCdhcmd1bWVudHMnLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgICAgICAgQHNuaXBwZXRzTWFuYWdlcj8uaW5zZXJ0U25pcHBldChyZXNwb25zZVsnYXJndW1lbnRzJ10sIGVkaXRvcilcbiAgICAgIGVsc2VcbiAgICAgICAgcmVzb2x2ZSA9IEByZXF1ZXN0c1tyZXNwb25zZVsnaWQnXV1cbiAgICAgICAgaWYgdHlwZW9mIHJlc29sdmUgPT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgIHJlc29sdmUocmVzcG9uc2VbJ3Jlc3VsdHMnXSlcbiAgICAgIGNhY2hlU2l6ZURlbHRhID0gT2JqZWN0LmtleXMoQHJlc3BvbnNlcykubGVuZ3RoID4gQGNhY2hlU2l6ZVxuICAgICAgaWYgY2FjaGVTaXplRGVsdGEgPiAwXG4gICAgICAgIGlkcyA9IE9iamVjdC5rZXlzKEByZXNwb25zZXMpLnNvcnQgKGEsIGIpID0+XG4gICAgICAgICAgcmV0dXJuIEByZXNwb25zZXNbYV1bJ3RpbWVzdGFtcCddIC0gQHJlc3BvbnNlc1tiXVsndGltZXN0YW1wJ11cbiAgICAgICAgZm9yIGlkIGluIGlkcy5zbGljZSgwLCBjYWNoZVNpemVEZWx0YSlcbiAgICAgICAgICBsb2cuZGVidWcgJ1JlbW92aW5nIG9sZCBpdGVtIGZyb20gY2FjaGUgd2l0aCBJRCcsIGlkXG4gICAgICAgICAgZGVsZXRlIEByZXNwb25zZXNbaWRdXG4gICAgICBAcmVzcG9uc2VzW3Jlc3BvbnNlWydpZCddXSA9XG4gICAgICAgIHNvdXJjZTogcmVzcG9uc2VTb3VyY2VcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICBsb2cuZGVidWcgJ0NhY2hlZCByZXF1ZXN0IHdpdGggSUQnLCByZXNwb25zZVsnaWQnXVxuICAgICAgZGVsZXRlIEByZXF1ZXN0c1tyZXNwb25zZVsnaWQnXV1cblxuICBfZ2VuZXJhdGVSZXF1ZXN0SWQ6ICh0eXBlLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCB0ZXh0KSAtPlxuICAgIGlmIG5vdCB0ZXh0XG4gICAgICB0ZXh0ID0gZWRpdG9yLmdldFRleHQoKVxuICAgIHJldHVybiByZXF1aXJlKCdjcnlwdG8nKS5jcmVhdGVIYXNoKCdtZDUnKS51cGRhdGUoW1xuICAgICAgZWRpdG9yLmdldFBhdGgoKSwgdGV4dCwgYnVmZmVyUG9zaXRpb24ucm93LFxuICAgICAgYnVmZmVyUG9zaXRpb24uY29sdW1uLCB0eXBlXS5qb2luKCkpLmRpZ2VzdCgnaGV4JylcblxuICBfZ2VuZXJhdGVSZXF1ZXN0Q29uZmlnOiAtPlxuICAgIGV4dHJhUGF0aHMgPSBASW50ZXJwcmV0ZXJMb29rdXAuYXBwbHlTdWJzdGl0dXRpb25zKFxuICAgICAgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLmV4dHJhUGF0aHMnKS5zcGxpdCgnOycpKVxuICAgIGFyZ3MgPVxuICAgICAgJ2V4dHJhUGF0aHMnOiBleHRyYVBhdGhzXG4gICAgICAndXNlU25pcHBldHMnOiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24udXNlU25pcHBldHMnKVxuICAgICAgJ2Nhc2VJbnNlbnNpdGl2ZUNvbXBsZXRpb24nOiBhdG9tLmNvbmZpZy5nZXQoXG4gICAgICAgICdhdXRvY29tcGxldGUtcHl0aG9uLmNhc2VJbnNlbnNpdGl2ZUNvbXBsZXRpb24nKVxuICAgICAgJ3Nob3dEZXNjcmlwdGlvbnMnOiBhdG9tLmNvbmZpZy5nZXQoXG4gICAgICAgICdhdXRvY29tcGxldGUtcHl0aG9uLnNob3dEZXNjcmlwdGlvbnMnKVxuICAgICAgJ2Z1enp5TWF0Y2hlcic6IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5mdXp6eU1hdGNoZXInKVxuICAgIHJldHVybiBhcmdzXG5cbiAgc2V0U25pcHBldHNNYW5hZ2VyOiAoQHNuaXBwZXRzTWFuYWdlcikgLT5cblxuICBfY29tcGxldGVBcmd1bWVudHM6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBmb3JjZSkgLT5cbiAgICB1c2VTbmlwcGV0cyA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VTbmlwcGV0cycpXG4gICAgaWYgbm90IGZvcmNlIGFuZCB1c2VTbmlwcGV0cyA9PSAnbm9uZSdcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYXRvbS10ZXh0LWVkaXRvcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXV0b2NvbXBsZXRlLXBsdXM6YWN0aXZhdGUnKVxuICAgICAgcmV0dXJuXG4gICAgc2NvcGVEZXNjcmlwdG9yID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuICAgIHNjb3BlQ2hhaW4gPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVDaGFpbigpXG4gICAgZGlzYWJsZUZvclNlbGVjdG9yID0gQFNlbGVjdG9yLmNyZWF0ZShAZGlzYWJsZUZvclNlbGVjdG9yKVxuICAgIGlmIEBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4oZGlzYWJsZUZvclNlbGVjdG9yLCBzY29wZUNoYWluKVxuICAgICAgbG9nLmRlYnVnICdJZ25vcmluZyBhcmd1bWVudCBjb21wbGV0aW9uIGluc2lkZSBvZicsIHNjb3BlQ2hhaW5cbiAgICAgIHJldHVyblxuXG4gICAgIyB3ZSBkb24ndCB3YW50IHRvIGNvbXBsZXRlIGFyZ3VtZW50cyBpbnNpZGUgb2YgZXhpc3RpbmcgY29kZVxuICAgIGxpbmVzID0gZWRpdG9yLmdldEJ1ZmZlcigpLmdldExpbmVzKClcbiAgICBsaW5lID0gbGluZXNbYnVmZmVyUG9zaXRpb24ucm93XVxuICAgIHByZWZpeCA9IGxpbmUuc2xpY2UoYnVmZmVyUG9zaXRpb24uY29sdW1uIC0gMSwgYnVmZmVyUG9zaXRpb24uY29sdW1uKVxuICAgIGlmIHByZWZpeCBpc250ICcoJ1xuICAgICAgbG9nLmRlYnVnICdJZ25vcmluZyBhcmd1bWVudCBjb21wbGV0aW9uIHdpdGggcHJlZml4JywgcHJlZml4XG4gICAgICByZXR1cm5cbiAgICBzdWZmaXggPSBsaW5lLnNsaWNlIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiwgbGluZS5sZW5ndGhcbiAgICBpZiBub3QgL14oXFwpKD86JHxcXHMpfFxcc3wkKS8udGVzdChzdWZmaXgpXG4gICAgICBsb2cuZGVidWcgJ0lnbm9yaW5nIGFyZ3VtZW50IGNvbXBsZXRpb24gd2l0aCBzdWZmaXgnLCBzdWZmaXhcbiAgICAgIHJldHVyblxuXG4gICAgcGF5bG9hZCA9XG4gICAgICBpZDogQF9nZW5lcmF0ZVJlcXVlc3RJZCgnYXJndW1lbnRzJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgIGxvb2t1cDogJ2FyZ3VtZW50cydcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHNvdXJjZTogZWRpdG9yLmdldFRleHQoKVxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgICAgY29uZmlnOiBAX2dlbmVyYXRlUmVxdWVzdENvbmZpZygpXG5cbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSA9PlxuICAgICAgQHJlcXVlc3RzW3BheWxvYWQuaWRdID0gZWRpdG9yXG5cbiAgX2Z1enp5RmlsdGVyOiAoY2FuZGlkYXRlcywgcXVlcnkpIC0+XG4gICAgaWYgY2FuZGlkYXRlcy5sZW5ndGggaXNudCAwIGFuZCBxdWVyeSBub3QgaW4gWycgJywgJy4nLCAnKCddXG4gICAgICBjYW5kaWRhdGVzID0gQGZpbHRlcihjYW5kaWRhdGVzLCBxdWVyeSwga2V5OiAndGV4dCcpXG4gICAgcmV0dXJuIGNhbmRpZGF0ZXNcblxuICBnZXRTdWdnZXN0aW9uczogKHtlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBzY29wZURlc2NyaXB0b3IsIHByZWZpeH0pIC0+XG4gICAgQGxvYWQoKVxuICAgIGlmIG5vdCBAdHJpZ2dlckNvbXBsZXRpb25SZWdleC50ZXN0KHByZWZpeClcbiAgICAgIHJldHVybiBbXVxuICAgIGJ1ZmZlclBvc2l0aW9uID1cbiAgICAgIHJvdzogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgIGxpbmVzID0gZWRpdG9yLmdldEJ1ZmZlcigpLmdldExpbmVzKClcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24uZnV6enlNYXRjaGVyJylcbiAgICAgICMgd2Ugd2FudCB0byBkbyBvdXIgb3duIGZpbHRlcmluZywgaGlkZSBhbnkgZXhpc3Rpbmcgc3VmZml4IGZyb20gSmVkaVxuICAgICAgbGluZSA9IGxpbmVzW2J1ZmZlclBvc2l0aW9uLnJvd11cbiAgICAgIGxhc3RJZGVudGlmaWVyID0gL1xcLj9bYS16QS1aX11bYS16QS1aMC05X10qJC8uZXhlYyhcbiAgICAgICAgbGluZS5zbGljZSAwLCBidWZmZXJQb3NpdGlvbi5jb2x1bW4pXG4gICAgICBpZiBsYXN0SWRlbnRpZmllclxuICAgICAgICBidWZmZXJQb3NpdGlvbi5jb2x1bW4gPSBsYXN0SWRlbnRpZmllci5pbmRleCArIDFcbiAgICAgICAgbGluZXNbYnVmZmVyUG9zaXRpb24ucm93XSA9IGxpbmUuc2xpY2UoMCwgYnVmZmVyUG9zaXRpb24uY29sdW1uKVxuICAgIHJlcXVlc3RJZCA9IEBfZ2VuZXJhdGVSZXF1ZXN0SWQoXG4gICAgICAnY29tcGxldGlvbnMnLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBsaW5lcy5qb2luKCdcXG4nKSlcbiAgICBpZiByZXF1ZXN0SWQgb2YgQHJlc3BvbnNlc1xuICAgICAgbG9nLmRlYnVnICdVc2luZyBjYWNoZWQgcmVzcG9uc2Ugd2l0aCBJRCcsIHJlcXVlc3RJZFxuICAgICAgIyBXZSBoYXZlIHRvIHBhcnNlIEpTT04gb24gZWFjaCByZXF1ZXN0IGhlcmUgdG8gcGFzcyBvbmx5IGEgY29weVxuICAgICAgbWF0Y2hlcyA9IEpTT04ucGFyc2UoQHJlc3BvbnNlc1tyZXF1ZXN0SWRdWydzb3VyY2UnXSlbJ3Jlc3VsdHMnXVxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLmZ1enp5TWF0Y2hlcicpXG4gICAgICAgIHJldHVybiBAX2Z1enp5RmlsdGVyKG1hdGNoZXMsIHByZWZpeClcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIG1hdGNoZXNcbiAgICBwYXlsb2FkID1cbiAgICAgIGlkOiByZXF1ZXN0SWRcbiAgICAgIHByZWZpeDogcHJlZml4XG4gICAgICBsb29rdXA6ICdjb21wbGV0aW9ucydcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHNvdXJjZTogZWRpdG9yLmdldFRleHQoKVxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgICAgY29uZmlnOiBAX2dlbmVyYXRlUmVxdWVzdENvbmZpZygpXG5cbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5mdXp6eU1hdGNoZXInKVxuICAgICAgICBAcmVxdWVzdHNbcGF5bG9hZC5pZF0gPSAobWF0Y2hlcykgPT5cbiAgICAgICAgICByZXNvbHZlKEBfZnV6enlGaWx0ZXIobWF0Y2hlcywgcHJlZml4KSlcbiAgICAgIGVsc2VcbiAgICAgICAgQHJlcXVlc3RzW3BheWxvYWQuaWRdID0gcmVzb2x2ZVxuXG4gIGdldERlZmluaXRpb25zOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICBwYXlsb2FkID1cbiAgICAgIGlkOiBAX2dlbmVyYXRlUmVxdWVzdElkKCdkZWZpbml0aW9ucycsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICBsb29rdXA6ICdkZWZpbml0aW9ucydcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHNvdXJjZTogZWRpdG9yLmdldFRleHQoKVxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgICAgY29uZmlnOiBAX2dlbmVyYXRlUmVxdWVzdENvbmZpZygpXG5cbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IHJlc29sdmVcblxuICBnZXRVc2FnZXM6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgIHBheWxvYWQgPVxuICAgICAgaWQ6IEBfZ2VuZXJhdGVSZXF1ZXN0SWQoJ3VzYWdlcycsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICBsb29rdXA6ICd1c2FnZXMnXG4gICAgICBwYXRoOiBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICBzb3VyY2U6IGVkaXRvci5nZXRUZXh0KClcbiAgICAgIGxpbmU6IGJ1ZmZlclBvc2l0aW9uLnJvd1xuICAgICAgY29sdW1uOiBidWZmZXJQb3NpdGlvbi5jb2x1bW5cbiAgICAgIGNvbmZpZzogQF9nZW5lcmF0ZVJlcXVlc3RDb25maWcoKVxuXG4gICAgQF9zZW5kUmVxdWVzdChAX3NlcmlhbGl6ZShwYXlsb2FkKSlcbiAgICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUpID0+XG4gICAgICBAcmVxdWVzdHNbcGF5bG9hZC5pZF0gPSByZXNvbHZlXG5cbiAgZ2V0TWV0aG9kczogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgaW5kZW50ID0gYnVmZmVyUG9zaXRpb24uY29sdW1uXG4gICAgbGluZXMgPSBlZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0TGluZXMoKVxuICAgIGxpbmVzLnNwbGljZShidWZmZXJQb3NpdGlvbi5yb3cgKyAxLCAwLCBcIiAgZGVmIF9fYXV0b2NvbXBsZXRlX3B5dGhvbihzKTpcIilcbiAgICBsaW5lcy5zcGxpY2UoYnVmZmVyUG9zaXRpb24ucm93ICsgMiwgMCwgXCIgICAgcy5cIilcbiAgICBwYXlsb2FkID1cbiAgICAgIGlkOiBAX2dlbmVyYXRlUmVxdWVzdElkKCdtZXRob2RzJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgIGxvb2t1cDogJ21ldGhvZHMnXG4gICAgICBwYXRoOiBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICBzb3VyY2U6IGxpbmVzLmpvaW4oJ1xcbicpXG4gICAgICBsaW5lOiBidWZmZXJQb3NpdGlvbi5yb3cgKyAyXG4gICAgICBjb2x1bW46IDZcbiAgICAgIGNvbmZpZzogQF9nZW5lcmF0ZVJlcXVlc3RDb25maWcoKVxuXG4gICAgQF9zZW5kUmVxdWVzdChAX3NlcmlhbGl6ZShwYXlsb2FkKSlcbiAgICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUpID0+XG4gICAgICBAcmVxdWVzdHNbcGF5bG9hZC5pZF0gPSAobWV0aG9kcykgLT5cbiAgICAgICAgcmVzb2x2ZSh7bWV0aG9kcywgaW5kZW50LCBidWZmZXJQb3NpdGlvbn0pXG5cbiAgZ29Ub0RlZmluaXRpb246IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgIGlmIG5vdCBlZGl0b3JcbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmIG5vdCBidWZmZXJQb3NpdGlvblxuICAgICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIGlmIEBkZWZpbml0aW9uc1ZpZXdcbiAgICAgIEBkZWZpbml0aW9uc1ZpZXcuZGVzdHJveSgpXG4gICAgQGRlZmluaXRpb25zVmlldyA9IG5ldyBARGVmaW5pdGlvbnNWaWV3KClcbiAgICBAZ2V0RGVmaW5pdGlvbnMoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikudGhlbiAocmVzdWx0cykgPT5cbiAgICAgIEBkZWZpbml0aW9uc1ZpZXcuc2V0SXRlbXMocmVzdWx0cylcbiAgICAgIGlmIHJlc3VsdHMubGVuZ3RoID09IDFcbiAgICAgICAgQGRlZmluaXRpb25zVmlldy5jb25maXJtZWQocmVzdWx0c1swXSlcblxuICBkaXNwb3NlOiAtPlxuICAgIGlmIEBkaXNwb3NhYmxlc1xuICAgICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIGlmIEBwcm92aWRlclxuICAgICAgQHByb3ZpZGVyLmtpbGwoKVxuIl19
