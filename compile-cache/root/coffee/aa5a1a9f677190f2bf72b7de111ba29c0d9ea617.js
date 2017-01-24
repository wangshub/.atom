(function() {
  var CompositeDisposable, Emitter, HighlightedAreaView, MarkerLayer, Range, StatusBarView, _, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ref = require('atom'), Range = ref.Range, CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter, MarkerLayer = ref.MarkerLayer;

  _ = require('underscore-plus');

  StatusBarView = require('./status-bar-view');

  module.exports = HighlightedAreaView = (function() {
    function HighlightedAreaView() {
      this.listenForStatusBarChange = bind(this.listenForStatusBarChange, this);
      this.removeStatusBar = bind(this.removeStatusBar, this);
      this.setupStatusBar = bind(this.setupStatusBar, this);
      this.removeMarkers = bind(this.removeMarkers, this);
      this.handleSelection = bind(this.handleSelection, this);
      this.debouncedHandleSelection = bind(this.debouncedHandleSelection, this);
      this.setStatusBar = bind(this.setStatusBar, this);
      this.enable = bind(this.enable, this);
      this.disable = bind(this.disable, this);
      this.onDidRemoveAllMarkers = bind(this.onDidRemoveAllMarkers, this);
      this.onDidAddSelectedMarker = bind(this.onDidAddSelectedMarker, this);
      this.onDidAddMarker = bind(this.onDidAddMarker, this);
      this.destroy = bind(this.destroy, this);
      this.emitter = new Emitter;
      this.markerLayers = [];
      this.resultCount = 0;
      this.enable();
      this.listenForTimeoutChange();
      this.activeItemSubscription = atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          _this.debouncedHandleSelection();
          return _this.subscribeToActiveTextEditor();
        };
      })(this));
      this.subscribeToActiveTextEditor();
      this.listenForStatusBarChange();
    }

    HighlightedAreaView.prototype.destroy = function() {
      var ref1, ref2, ref3;
      clearTimeout(this.handleSelectionTimeout);
      this.activeItemSubscription.dispose();
      if ((ref1 = this.selectionSubscription) != null) {
        ref1.dispose();
      }
      if ((ref2 = this.statusBarView) != null) {
        ref2.removeElement();
      }
      if ((ref3 = this.statusBarTile) != null) {
        ref3.destroy();
      }
      return this.statusBarTile = null;
    };

    HighlightedAreaView.prototype.onDidAddMarker = function(callback) {
      return this.emitter.on('did-add-marker', callback);
    };

    HighlightedAreaView.prototype.onDidAddSelectedMarker = function(callback) {
      return this.emitter.on('did-add-selected-marker', callback);
    };

    HighlightedAreaView.prototype.onDidRemoveAllMarkers = function(callback) {
      return this.emitter.on('did-remove-marker-layer', callback);
    };

    HighlightedAreaView.prototype.disable = function() {
      this.disabled = true;
      return this.removeMarkers();
    };

    HighlightedAreaView.prototype.enable = function() {
      this.disabled = false;
      return this.debouncedHandleSelection();
    };

    HighlightedAreaView.prototype.setStatusBar = function(statusBar) {
      this.statusBar = statusBar;
      return this.setupStatusBar();
    };

    HighlightedAreaView.prototype.debouncedHandleSelection = function() {
      clearTimeout(this.handleSelectionTimeout);
      return this.handleSelectionTimeout = setTimeout((function(_this) {
        return function() {
          return _this.handleSelection();
        };
      })(this), atom.config.get('highlight-selected.timeout'));
    };

    HighlightedAreaView.prototype.listenForTimeoutChange = function() {
      return atom.config.onDidChange('highlight-selected.timeout', (function(_this) {
        return function() {
          return _this.debouncedHandleSelection();
        };
      })(this));
    };

    HighlightedAreaView.prototype.subscribeToActiveTextEditor = function() {
      var editor, ref1;
      if ((ref1 = this.selectionSubscription) != null) {
        ref1.dispose();
      }
      editor = this.getActiveEditor();
      if (!editor) {
        return;
      }
      this.selectionSubscription = new CompositeDisposable;
      this.selectionSubscription.add(editor.onDidAddSelection(this.debouncedHandleSelection));
      this.selectionSubscription.add(editor.onDidChangeSelectionRange(this.debouncedHandleSelection));
      return this.handleSelection();
    };

    HighlightedAreaView.prototype.getActiveEditor = function() {
      return atom.workspace.getActiveTextEditor();
    };

    HighlightedAreaView.prototype.getActiveEditors = function() {
      return atom.workspace.getPanes().map(function(pane) {
        var activeItem;
        activeItem = pane.activeItem;
        if (activeItem && activeItem.constructor.name === 'TextEditor') {
          return activeItem;
        }
      });
    };

    HighlightedAreaView.prototype.handleSelection = function() {
      var editor, range, ref1, ref2, regex, regexFlags, regexSearch, result, text;
      this.removeMarkers();
      if (this.disabled) {
        return;
      }
      editor = this.getActiveEditor();
      if (!editor) {
        return;
      }
      if (editor.getLastSelection().isEmpty()) {
        return;
      }
      if (!this.isWordSelected(editor.getLastSelection())) {
        return;
      }
      this.selections = editor.getSelections();
      text = _.escapeRegExp(this.selections[0].getText());
      regex = new RegExp("\\S*\\w*\\b", 'gi');
      result = regex.exec(text);
      if (result == null) {
        return;
      }
      if (result[0].length < atom.config.get('highlight-selected.minimumLength') || result.index !== 0 || result[0] !== result.input) {
        return;
      }
      regexFlags = 'g';
      if (atom.config.get('highlight-selected.ignoreCase')) {
        regexFlags = 'gi';
      }
      range = [[0, 0], editor.getEofBufferPosition()];
      this.ranges = [];
      regexSearch = result[0];
      if (atom.config.get('highlight-selected.onlyHighlightWholeWords')) {
        if (regexSearch.indexOf("\$") !== -1 && ((ref1 = editor.getGrammar()) != null ? ref1.name : void 0) === 'PHP') {
          regexSearch = regexSearch.replace("\$", "\$\\b");
        } else {
          regexSearch = "\\b" + regexSearch;
        }
        regexSearch = regexSearch + "\\b";
      }
      this.resultCount = 0;
      if (atom.config.get('highlight-selected.highlightInPanes')) {
        this.getActiveEditors().forEach((function(_this) {
          return function(editor) {
            return _this.highlightSelectionInEditor(editor, regexSearch, regexFlags, range);
          };
        })(this));
      } else {
        this.highlightSelectionInEditor(editor, regexSearch, regexFlags, range);
      }
      return (ref2 = this.statusBarElement) != null ? ref2.updateCount(this.resultCount) : void 0;
    };

    HighlightedAreaView.prototype.highlightSelectionInEditor = function(editor, regexSearch, regexFlags, range) {
      var markerLayer, markerLayerForHiddenMarkers;
      markerLayer = editor != null ? editor.addMarkerLayer() : void 0;
      if (markerLayer == null) {
        return;
      }
      markerLayerForHiddenMarkers = editor.addMarkerLayer();
      this.markerLayers.push(markerLayer);
      this.markerLayers.push(markerLayerForHiddenMarkers);
      editor.scanInBufferRange(new RegExp(regexSearch, regexFlags), range, (function(_this) {
        return function(result) {
          var marker;
          _this.resultCount += 1;
          if (_this.showHighlightOnSelectedWord(result.range, _this.selections)) {
            marker = markerLayerForHiddenMarkers.markBufferRange(result.range);
            return _this.emitter.emit('did-add-selected-marker', marker);
          } else {
            marker = markerLayer.markBufferRange(result.range);
            return _this.emitter.emit('did-add-marker', marker);
          }
        };
      })(this));
      return editor.decorateMarkerLayer(markerLayer, {
        type: 'highlight',
        "class": this.makeClasses()
      });
    };

    HighlightedAreaView.prototype.makeClasses = function() {
      var className;
      className = 'highlight-selected';
      if (atom.config.get('highlight-selected.lightTheme')) {
        className += ' light-theme';
      }
      if (atom.config.get('highlight-selected.highlightBackground')) {
        className += ' background';
      }
      return className;
    };

    HighlightedAreaView.prototype.showHighlightOnSelectedWord = function(range, selections) {
      var i, len, outcome, selection, selectionRange;
      if (!atom.config.get('highlight-selected.hideHighlightOnSelectedWord')) {
        return false;
      }
      outcome = false;
      for (i = 0, len = selections.length; i < len; i++) {
        selection = selections[i];
        selectionRange = selection.getBufferRange();
        outcome = (range.start.column === selectionRange.start.column) && (range.start.row === selectionRange.start.row) && (range.end.column === selectionRange.end.column) && (range.end.row === selectionRange.end.row);
        if (outcome) {
          break;
        }
      }
      return outcome;
    };

    HighlightedAreaView.prototype.removeMarkers = function() {
      var ref1;
      this.markerLayers.forEach(function(markerLayer) {
        return markerLayer.destroy();
      });
      this.markerLayers = [];
      if ((ref1 = this.statusBarElement) != null) {
        ref1.updateCount(0);
      }
      return this.emitter.emit('did-remove-marker-layer');
    };

    HighlightedAreaView.prototype.isWordSelected = function(selection) {
      var lineRange, nonWordCharacterToTheLeft, nonWordCharacterToTheRight, selectionRange;
      if (selection.getBufferRange().isSingleLine()) {
        selectionRange = selection.getBufferRange();
        lineRange = this.getActiveEditor().bufferRangeForBufferRow(selectionRange.start.row);
        nonWordCharacterToTheLeft = _.isEqual(selectionRange.start, lineRange.start) || this.isNonWordCharacterToTheLeft(selection);
        nonWordCharacterToTheRight = _.isEqual(selectionRange.end, lineRange.end) || this.isNonWordCharacterToTheRight(selection);
        return nonWordCharacterToTheLeft && nonWordCharacterToTheRight;
      } else {
        return false;
      }
    };

    HighlightedAreaView.prototype.isNonWordCharacter = function(character) {
      var nonWordCharacters;
      nonWordCharacters = atom.config.get('editor.nonWordCharacters');
      return new RegExp("[ \t" + (_.escapeRegExp(nonWordCharacters)) + "]").test(character);
    };

    HighlightedAreaView.prototype.isNonWordCharacterToTheLeft = function(selection) {
      var range, selectionStart;
      selectionStart = selection.getBufferRange().start;
      range = Range.fromPointWithDelta(selectionStart, 0, -1);
      return this.isNonWordCharacter(this.getActiveEditor().getTextInBufferRange(range));
    };

    HighlightedAreaView.prototype.isNonWordCharacterToTheRight = function(selection) {
      var range, selectionEnd;
      selectionEnd = selection.getBufferRange().end;
      range = Range.fromPointWithDelta(selectionEnd, 0, 1);
      return this.isNonWordCharacter(this.getActiveEditor().getTextInBufferRange(range));
    };

    HighlightedAreaView.prototype.setupStatusBar = function() {
      if (this.statusBarElement != null) {
        return;
      }
      if (!atom.config.get('highlight-selected.showInStatusBar')) {
        return;
      }
      this.statusBarElement = new StatusBarView();
      return this.statusBarTile = this.statusBar.addLeftTile({
        item: this.statusBarElement.getElement(),
        priority: 100
      });
    };

    HighlightedAreaView.prototype.removeStatusBar = function() {
      var ref1;
      if (this.statusBarElement == null) {
        return;
      }
      if ((ref1 = this.statusBarTile) != null) {
        ref1.destroy();
      }
      this.statusBarTile = null;
      return this.statusBarElement = null;
    };

    HighlightedAreaView.prototype.listenForStatusBarChange = function() {
      return atom.config.onDidChange('highlight-selected.showInStatusBar', (function(_this) {
        return function(changed) {
          if (changed.newValue) {
            return _this.setupStatusBar();
          } else {
            return _this.removeStatusBar();
          }
        };
      })(this));
    };

    return HighlightedAreaView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvaGlnaGxpZ2h0LXNlbGVjdGVkL2xpYi9oaWdobGlnaHRlZC1hcmVhLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw0RkFBQTtJQUFBOztFQUFBLE1BQXFELE9BQUEsQ0FBUSxNQUFSLENBQXJELEVBQUMsaUJBQUQsRUFBUSw2Q0FBUixFQUE2QixxQkFBN0IsRUFBc0M7O0VBQ3RDLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osYUFBQSxHQUFnQixPQUFBLENBQVEsbUJBQVI7O0VBRWhCLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFFUyw2QkFBQTs7Ozs7Ozs7Ozs7Ozs7TUFDWCxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsWUFBRCxHQUFnQjtNQUNoQixJQUFDLENBQUEsV0FBRCxHQUFlO01BQ2YsSUFBQyxDQUFBLE1BQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxzQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLHNCQUFELEdBQTBCLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQWYsQ0FBeUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ2pFLEtBQUMsQ0FBQSx3QkFBRCxDQUFBO2lCQUNBLEtBQUMsQ0FBQSwyQkFBRCxDQUFBO1FBRmlFO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QztNQUcxQixJQUFDLENBQUEsMkJBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSx3QkFBRCxDQUFBO0lBVlc7O2tDQVliLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLFlBQUEsQ0FBYSxJQUFDLENBQUEsc0JBQWQ7TUFDQSxJQUFDLENBQUEsc0JBQXNCLENBQUMsT0FBeEIsQ0FBQTs7WUFDc0IsQ0FBRSxPQUF4QixDQUFBOzs7WUFDYyxDQUFFLGFBQWhCLENBQUE7OztZQUNjLENBQUUsT0FB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QSxlQUFBOztNQUNBLElBQUEsQ0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0NBQWhCLENBQWQ7QUFBQSxlQUFBOztNQUNBLElBQUMsQ0FBQSxnQkFBRCxHQUF3QixJQUFBLGFBQUEsQ0FBQTthQUN4QixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFDLENBQUEsU0FBUyxDQUFDLFdBQVgsQ0FDZjtRQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsVUFBbEIsQ0FBQSxDQUFOO1FBQXNDLFFBQUEsRUFBVSxHQUFoRDtPQURlO0lBSkg7O2tDQU9oQixlQUFBLEdBQWlCLFNBQUE7QUFDZixVQUFBO01BQUEsSUFBYyw2QkFBZDtBQUFBLGVBQUE7OztZQUNjLENBQUUsT0FBaEIsQ0FBQTs7TUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQjthQUNqQixJQUFDLENBQUEsZ0JBQUQsR0FBb0I7SUFKTDs7a0NBTWpCLHdCQUFBLEdBQTBCLFNBQUE7YUFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLG9DQUF4QixFQUE4RCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRDtVQUM1RCxJQUFHLE9BQU8sQ0FBQyxRQUFYO21CQUNFLEtBQUMsQ0FBQSxjQUFELENBQUEsRUFERjtXQUFBLE1BQUE7bUJBR0UsS0FBQyxDQUFBLGVBQUQsQ0FBQSxFQUhGOztRQUQ0RDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUQ7SUFEd0I7Ozs7O0FBL041QiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlciwgTWFya2VyTGF5ZXJ9ID0gcmVxdWlyZSAnYXRvbSdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5TdGF0dXNCYXJWaWV3ID0gcmVxdWlyZSAnLi9zdGF0dXMtYmFyLXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEhpZ2hsaWdodGVkQXJlYVZpZXdcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQG1hcmtlckxheWVycyA9IFtdXG4gICAgQHJlc3VsdENvdW50ID0gMFxuICAgIEBlbmFibGUoKVxuICAgIEBsaXN0ZW5Gb3JUaW1lb3V0Q2hhbmdlKClcbiAgICBAYWN0aXZlSXRlbVN1YnNjcmlwdGlvbiA9IGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gPT5cbiAgICAgIEBkZWJvdW5jZWRIYW5kbGVTZWxlY3Rpb24oKVxuICAgICAgQHN1YnNjcmliZVRvQWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQHN1YnNjcmliZVRvQWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQGxpc3RlbkZvclN0YXR1c0JhckNoYW5nZSgpXG5cbiAgZGVzdHJveTogPT5cbiAgICBjbGVhclRpbWVvdXQoQGhhbmRsZVNlbGVjdGlvblRpbWVvdXQpXG4gICAgQGFjdGl2ZUl0ZW1TdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgQHNlbGVjdGlvblN1YnNjcmlwdGlvbj8uZGlzcG9zZSgpXG4gICAgQHN0YXR1c0JhclZpZXc/LnJlbW92ZUVsZW1lbnQoKVxuICAgIEBzdGF0dXNCYXJUaWxlPy5kZXN0cm95KClcbiAgICBAc3RhdHVzQmFyVGlsZSA9IG51bGxcblxuICBvbkRpZEFkZE1hcmtlcjogKGNhbGxiYWNrKSA9PlxuICAgIEBlbWl0dGVyLm9uICdkaWQtYWRkLW1hcmtlcicsIGNhbGxiYWNrXG5cbiAgb25EaWRBZGRTZWxlY3RlZE1hcmtlcjogKGNhbGxiYWNrKSA9PlxuICAgIEBlbWl0dGVyLm9uICdkaWQtYWRkLXNlbGVjdGVkLW1hcmtlcicsIGNhbGxiYWNrXG5cbiAgb25EaWRSZW1vdmVBbGxNYXJrZXJzOiAoY2FsbGJhY2spID0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1yZW1vdmUtbWFya2VyLWxheWVyJywgY2FsbGJhY2tcblxuICBkaXNhYmxlOiA9PlxuICAgIEBkaXNhYmxlZCA9IHRydWVcbiAgICBAcmVtb3ZlTWFya2VycygpXG5cbiAgZW5hYmxlOiA9PlxuICAgIEBkaXNhYmxlZCA9IGZhbHNlXG4gICAgQGRlYm91bmNlZEhhbmRsZVNlbGVjdGlvbigpXG5cbiAgc2V0U3RhdHVzQmFyOiAoc3RhdHVzQmFyKSA9PlxuICAgIEBzdGF0dXNCYXIgPSBzdGF0dXNCYXJcbiAgICBAc2V0dXBTdGF0dXNCYXIoKVxuXG4gIGRlYm91bmNlZEhhbmRsZVNlbGVjdGlvbjogPT5cbiAgICBjbGVhclRpbWVvdXQoQGhhbmRsZVNlbGVjdGlvblRpbWVvdXQpXG4gICAgQGhhbmRsZVNlbGVjdGlvblRpbWVvdXQgPSBzZXRUaW1lb3V0ID0+XG4gICAgICBAaGFuZGxlU2VsZWN0aW9uKClcbiAgICAsIGF0b20uY29uZmlnLmdldCgnaGlnaGxpZ2h0LXNlbGVjdGVkLnRpbWVvdXQnKVxuXG4gIGxpc3RlbkZvclRpbWVvdXRDaGFuZ2U6IC0+XG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2hpZ2hsaWdodC1zZWxlY3RlZC50aW1lb3V0JywgPT5cbiAgICAgIEBkZWJvdW5jZWRIYW5kbGVTZWxlY3Rpb24oKVxuXG4gIHN1YnNjcmliZVRvQWN0aXZlVGV4dEVkaXRvcjogLT5cbiAgICBAc2VsZWN0aW9uU3Vic2NyaXB0aW9uPy5kaXNwb3NlKClcblxuICAgIGVkaXRvciA9IEBnZXRBY3RpdmVFZGl0b3IoKVxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yXG5cbiAgICBAc2VsZWN0aW9uU3Vic2NyaXB0aW9uID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIEBzZWxlY3Rpb25TdWJzY3JpcHRpb24uYWRkKFxuICAgICAgZWRpdG9yLm9uRGlkQWRkU2VsZWN0aW9uIEBkZWJvdW5jZWRIYW5kbGVTZWxlY3Rpb25cbiAgICApXG4gICAgQHNlbGVjdGlvblN1YnNjcmlwdGlvbi5hZGQoXG4gICAgICBlZGl0b3Iub25EaWRDaGFuZ2VTZWxlY3Rpb25SYW5nZSBAZGVib3VuY2VkSGFuZGxlU2VsZWN0aW9uXG4gICAgKVxuICAgIEBoYW5kbGVTZWxlY3Rpb24oKVxuXG4gIGdldEFjdGl2ZUVkaXRvcjogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuICBnZXRBY3RpdmVFZGl0b3JzOiAtPlxuICAgIGF0b20ud29ya3NwYWNlLmdldFBhbmVzKCkubWFwIChwYW5lKSAtPlxuICAgICAgYWN0aXZlSXRlbSA9IHBhbmUuYWN0aXZlSXRlbVxuICAgICAgYWN0aXZlSXRlbSBpZiBhY3RpdmVJdGVtIGFuZCBhY3RpdmVJdGVtLmNvbnN0cnVjdG9yLm5hbWUgPT0gJ1RleHRFZGl0b3InXG5cbiAgaGFuZGxlU2VsZWN0aW9uOiA9PlxuICAgIEByZW1vdmVNYXJrZXJzKClcblxuICAgIHJldHVybiBpZiBAZGlzYWJsZWRcblxuICAgIGVkaXRvciA9IEBnZXRBY3RpdmVFZGl0b3IoKVxuXG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3JcbiAgICByZXR1cm4gaWYgZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5pc0VtcHR5KClcbiAgICByZXR1cm4gdW5sZXNzIEBpc1dvcmRTZWxlY3RlZChlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuXG4gICAgQHNlbGVjdGlvbnMgPSBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG5cbiAgICB0ZXh0ID0gXy5lc2NhcGVSZWdFeHAoQHNlbGVjdGlvbnNbMF0uZ2V0VGV4dCgpKVxuICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cChcIlxcXFxTKlxcXFx3KlxcXFxiXCIsICdnaScpXG4gICAgcmVzdWx0ID0gcmVnZXguZXhlYyh0ZXh0KVxuXG4gICAgcmV0dXJuIHVubGVzcyByZXN1bHQ/XG4gICAgcmV0dXJuIGlmIHJlc3VsdFswXS5sZW5ndGggPCBhdG9tLmNvbmZpZy5nZXQoXG4gICAgICAnaGlnaGxpZ2h0LXNlbGVjdGVkLm1pbmltdW1MZW5ndGgnKSBvclxuICAgICAgICAgICAgICByZXN1bHQuaW5kZXggaXNudCAwIG9yXG4gICAgICAgICAgICAgIHJlc3VsdFswXSBpc250IHJlc3VsdC5pbnB1dFxuXG4gICAgcmVnZXhGbGFncyA9ICdnJ1xuICAgIGlmIGF0b20uY29uZmlnLmdldCgnaGlnaGxpZ2h0LXNlbGVjdGVkLmlnbm9yZUNhc2UnKVxuICAgICAgcmVnZXhGbGFncyA9ICdnaSdcblxuICAgIHJhbmdlID0gIFtbMCwgMF0sIGVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpXVxuXG4gICAgQHJhbmdlcyA9IFtdXG4gICAgcmVnZXhTZWFyY2ggPSByZXN1bHRbMF1cblxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnaGlnaGxpZ2h0LXNlbGVjdGVkLm9ubHlIaWdobGlnaHRXaG9sZVdvcmRzJylcbiAgICAgIGlmIHJlZ2V4U2VhcmNoLmluZGV4T2YoXCJcXCRcIikgaXNudCAtMSBcXFxuICAgICAgYW5kIGVkaXRvci5nZXRHcmFtbWFyKCk/Lm5hbWUgaXMgJ1BIUCdcbiAgICAgICAgcmVnZXhTZWFyY2ggPSByZWdleFNlYXJjaC5yZXBsYWNlKFwiXFwkXCIsIFwiXFwkXFxcXGJcIilcbiAgICAgIGVsc2VcbiAgICAgICAgcmVnZXhTZWFyY2ggPSAgXCJcXFxcYlwiICsgcmVnZXhTZWFyY2hcbiAgICAgIHJlZ2V4U2VhcmNoID0gcmVnZXhTZWFyY2ggKyBcIlxcXFxiXCJcblxuICAgIEByZXN1bHRDb3VudCA9IDBcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2hpZ2hsaWdodC1zZWxlY3RlZC5oaWdobGlnaHRJblBhbmVzJylcbiAgICAgIEBnZXRBY3RpdmVFZGl0b3JzKCkuZm9yRWFjaCAoZWRpdG9yKSA9PlxuICAgICAgICBAaGlnaGxpZ2h0U2VsZWN0aW9uSW5FZGl0b3IoZWRpdG9yLCByZWdleFNlYXJjaCwgcmVnZXhGbGFncywgcmFuZ2UpXG4gICAgZWxzZVxuICAgICAgQGhpZ2hsaWdodFNlbGVjdGlvbkluRWRpdG9yKGVkaXRvciwgcmVnZXhTZWFyY2gsIHJlZ2V4RmxhZ3MsIHJhbmdlKVxuXG4gICAgQHN0YXR1c0JhckVsZW1lbnQ/LnVwZGF0ZUNvdW50KEByZXN1bHRDb3VudClcblxuICBoaWdobGlnaHRTZWxlY3Rpb25JbkVkaXRvcjogKGVkaXRvciwgcmVnZXhTZWFyY2gsIHJlZ2V4RmxhZ3MsIHJhbmdlKSAtPlxuICAgIG1hcmtlckxheWVyID0gZWRpdG9yPy5hZGRNYXJrZXJMYXllcigpXG4gICAgcmV0dXJuIHVubGVzcyBtYXJrZXJMYXllcj9cbiAgICBtYXJrZXJMYXllckZvckhpZGRlbk1hcmtlcnMgPSBlZGl0b3IuYWRkTWFya2VyTGF5ZXIoKVxuICAgIEBtYXJrZXJMYXllcnMucHVzaChtYXJrZXJMYXllcilcbiAgICBAbWFya2VyTGF5ZXJzLnB1c2gobWFya2VyTGF5ZXJGb3JIaWRkZW5NYXJrZXJzKVxuICAgIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZSBuZXcgUmVnRXhwKHJlZ2V4U2VhcmNoLCByZWdleEZsYWdzKSwgcmFuZ2UsXG4gICAgICAocmVzdWx0KSA9PlxuICAgICAgICBAcmVzdWx0Q291bnQgKz0gMVxuICAgICAgICBpZiBAc2hvd0hpZ2hsaWdodE9uU2VsZWN0ZWRXb3JkKHJlc3VsdC5yYW5nZSwgQHNlbGVjdGlvbnMpXG4gICAgICAgICAgbWFya2VyID0gbWFya2VyTGF5ZXJGb3JIaWRkZW5NYXJrZXJzLm1hcmtCdWZmZXJSYW5nZShyZXN1bHQucmFuZ2UpXG4gICAgICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWFkZC1zZWxlY3RlZC1tYXJrZXInLCBtYXJrZXJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG1hcmtlciA9IG1hcmtlckxheWVyLm1hcmtCdWZmZXJSYW5nZShyZXN1bHQucmFuZ2UpXG4gICAgICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWFkZC1tYXJrZXInLCBtYXJrZXJcbiAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXJMYXllcihtYXJrZXJMYXllciwge1xuICAgICAgdHlwZTogJ2hpZ2hsaWdodCcsXG4gICAgICBjbGFzczogQG1ha2VDbGFzc2VzKClcbiAgICB9KVxuXG4gIG1ha2VDbGFzc2VzOiAtPlxuICAgIGNsYXNzTmFtZSA9ICdoaWdobGlnaHQtc2VsZWN0ZWQnXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQubGlnaHRUaGVtZScpXG4gICAgICBjbGFzc05hbWUgKz0gJyBsaWdodC10aGVtZSdcblxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnaGlnaGxpZ2h0LXNlbGVjdGVkLmhpZ2hsaWdodEJhY2tncm91bmQnKVxuICAgICAgY2xhc3NOYW1lICs9ICcgYmFja2dyb3VuZCdcbiAgICBjbGFzc05hbWVcblxuICBzaG93SGlnaGxpZ2h0T25TZWxlY3RlZFdvcmQ6IChyYW5nZSwgc2VsZWN0aW9ucykgLT5cbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGF0b20uY29uZmlnLmdldChcbiAgICAgICdoaWdobGlnaHQtc2VsZWN0ZWQuaGlkZUhpZ2hsaWdodE9uU2VsZWN0ZWRXb3JkJylcbiAgICBvdXRjb21lID0gZmFsc2VcbiAgICBmb3Igc2VsZWN0aW9uIGluIHNlbGVjdGlvbnNcbiAgICAgIHNlbGVjdGlvblJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIG91dGNvbWUgPSAocmFuZ2Uuc3RhcnQuY29sdW1uIGlzIHNlbGVjdGlvblJhbmdlLnN0YXJ0LmNvbHVtbikgYW5kXG4gICAgICAgICAgICAgICAgKHJhbmdlLnN0YXJ0LnJvdyBpcyBzZWxlY3Rpb25SYW5nZS5zdGFydC5yb3cpIGFuZFxuICAgICAgICAgICAgICAgIChyYW5nZS5lbmQuY29sdW1uIGlzIHNlbGVjdGlvblJhbmdlLmVuZC5jb2x1bW4pIGFuZFxuICAgICAgICAgICAgICAgIChyYW5nZS5lbmQucm93IGlzIHNlbGVjdGlvblJhbmdlLmVuZC5yb3cpXG4gICAgICBicmVhayBpZiBvdXRjb21lXG4gICAgb3V0Y29tZVxuXG4gIHJlbW92ZU1hcmtlcnM6ID0+XG4gICAgQG1hcmtlckxheWVycy5mb3JFYWNoIChtYXJrZXJMYXllcikgLT5cbiAgICAgIG1hcmtlckxheWVyLmRlc3Ryb3koKVxuICAgIEBtYXJrZXJMYXllcnMgPSBbXVxuICAgIEBzdGF0dXNCYXJFbGVtZW50Py51cGRhdGVDb3VudCgwKVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1yZW1vdmUtbWFya2VyLWxheWVyJ1xuXG4gIGlzV29yZFNlbGVjdGVkOiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmlzU2luZ2xlTGluZSgpXG4gICAgICBzZWxlY3Rpb25SYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICBsaW5lUmFuZ2UgPSBAZ2V0QWN0aXZlRWRpdG9yKCkuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3coXG4gICAgICAgIHNlbGVjdGlvblJhbmdlLnN0YXJ0LnJvdylcbiAgICAgIG5vbldvcmRDaGFyYWN0ZXJUb1RoZUxlZnQgPVxuICAgICAgICBfLmlzRXF1YWwoc2VsZWN0aW9uUmFuZ2Uuc3RhcnQsIGxpbmVSYW5nZS5zdGFydCkgb3JcbiAgICAgICAgQGlzTm9uV29yZENoYXJhY3RlclRvVGhlTGVmdChzZWxlY3Rpb24pXG4gICAgICBub25Xb3JkQ2hhcmFjdGVyVG9UaGVSaWdodCA9XG4gICAgICAgIF8uaXNFcXVhbChzZWxlY3Rpb25SYW5nZS5lbmQsIGxpbmVSYW5nZS5lbmQpIG9yXG4gICAgICAgIEBpc05vbldvcmRDaGFyYWN0ZXJUb1RoZVJpZ2h0KHNlbGVjdGlvbilcblxuICAgICAgbm9uV29yZENoYXJhY3RlclRvVGhlTGVmdCBhbmQgbm9uV29yZENoYXJhY3RlclRvVGhlUmlnaHRcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4gIGlzTm9uV29yZENoYXJhY3RlcjogKGNoYXJhY3RlcikgLT5cbiAgICBub25Xb3JkQ2hhcmFjdGVycyA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLm5vbldvcmRDaGFyYWN0ZXJzJylcbiAgICBuZXcgUmVnRXhwKFwiWyBcXHQje18uZXNjYXBlUmVnRXhwKG5vbldvcmRDaGFyYWN0ZXJzKX1dXCIpLnRlc3QoY2hhcmFjdGVyKVxuXG4gIGlzTm9uV29yZENoYXJhY3RlclRvVGhlTGVmdDogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb25TdGFydCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgcmFuZ2UgPSBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEoc2VsZWN0aW9uU3RhcnQsIDAsIC0xKVxuICAgIEBpc05vbldvcmRDaGFyYWN0ZXIoQGdldEFjdGl2ZUVkaXRvcigpLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKSlcblxuICBpc05vbldvcmRDaGFyYWN0ZXJUb1RoZVJpZ2h0OiAoc2VsZWN0aW9uKSAtPlxuICAgIHNlbGVjdGlvbkVuZCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmVuZFxuICAgIHJhbmdlID0gUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHNlbGVjdGlvbkVuZCwgMCwgMSlcbiAgICBAaXNOb25Xb3JkQ2hhcmFjdGVyKEBnZXRBY3RpdmVFZGl0b3IoKS5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSkpXG5cbiAgc2V0dXBTdGF0dXNCYXI6ID0+XG4gICAgcmV0dXJuIGlmIEBzdGF0dXNCYXJFbGVtZW50P1xuICAgIHJldHVybiB1bmxlc3MgYXRvbS5jb25maWcuZ2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQuc2hvd0luU3RhdHVzQmFyJylcbiAgICBAc3RhdHVzQmFyRWxlbWVudCA9IG5ldyBTdGF0dXNCYXJWaWV3KClcbiAgICBAc3RhdHVzQmFyVGlsZSA9IEBzdGF0dXNCYXIuYWRkTGVmdFRpbGUoXG4gICAgICBpdGVtOiBAc3RhdHVzQmFyRWxlbWVudC5nZXRFbGVtZW50KCksIHByaW9yaXR5OiAxMDApXG5cbiAgcmVtb3ZlU3RhdHVzQmFyOiA9PlxuICAgIHJldHVybiB1bmxlc3MgQHN0YXR1c0JhckVsZW1lbnQ/XG4gICAgQHN0YXR1c0JhclRpbGU/LmRlc3Ryb3koKVxuICAgIEBzdGF0dXNCYXJUaWxlID0gbnVsbFxuICAgIEBzdGF0dXNCYXJFbGVtZW50ID0gbnVsbFxuXG4gIGxpc3RlbkZvclN0YXR1c0JhckNoYW5nZTogPT5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnaGlnaGxpZ2h0LXNlbGVjdGVkLnNob3dJblN0YXR1c0JhcicsIChjaGFuZ2VkKSA9PlxuICAgICAgaWYgY2hhbmdlZC5uZXdWYWx1ZVxuICAgICAgICBAc2V0dXBTdGF0dXNCYXIoKVxuICAgICAgZWxzZVxuICAgICAgICBAcmVtb3ZlU3RhdHVzQmFyKClcbiJdfQ==
