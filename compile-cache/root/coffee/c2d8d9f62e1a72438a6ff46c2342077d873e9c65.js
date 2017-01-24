(function() {
  var CompositeDisposable, HighlightedAreaView;

  CompositeDisposable = require("atom").CompositeDisposable;

  HighlightedAreaView = require('./highlighted-area-view');

  module.exports = {
    config: {
      onlyHighlightWholeWords: {
        type: 'boolean',
        "default": true
      },
      hideHighlightOnSelectedWord: {
        type: 'boolean',
        "default": false
      },
      ignoreCase: {
        type: 'boolean',
        "default": false
      },
      lightTheme: {
        type: 'boolean',
        "default": false
      },
      highlightBackground: {
        type: 'boolean',
        "default": false
      },
      minimumLength: {
        type: 'integer',
        "default": 0
      },
      timeout: {
        type: 'integer',
        "default": 20,
        description: 'Defers searching for matching strings for X ms'
      },
      showInStatusBar: {
        type: 'boolean',
        "default": true,
        description: 'Show how many matches there are'
      },
      highlightInPanes: {
        type: 'boolean',
        "default": true,
        description: 'Highlight selection in another panes'
      }
    },
    areaView: null,
    activate: function(state) {
      this.areaView = new HighlightedAreaView();
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add("atom-workspace", {
        'highlight-selected:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
    },
    deactivate: function() {
      var ref, ref1;
      if ((ref = this.areaView) != null) {
        ref.destroy();
      }
      this.areaView = null;
      if ((ref1 = this.subscriptions) != null) {
        ref1.dispose();
      }
      return this.subscriptions = null;
    },
    provideHighlightSelectedV1: function() {
      return this.areaView;
    },
    consumeStatusBar: function(statusBar) {
      return this.areaView.setStatusBar(statusBar);
    },
    toggle: function() {
      if (this.areaView.disabled) {
        return this.areaView.enable();
      } else {
        return this.areaView.disable();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvaGlnaGxpZ2h0LXNlbGVjdGVkL2xpYi9oaWdobGlnaHQtc2VsZWN0ZWQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx5QkFBUjs7RUFFdEIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLHVCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtPQURGO01BR0EsMkJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO09BSkY7TUFNQSxVQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtPQVBGO01BU0EsVUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7T0FWRjtNQVlBLG1CQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtPQWJGO01BZUEsYUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBRFQ7T0FoQkY7TUFrQkEsT0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7UUFFQSxXQUFBLEVBQWEsZ0RBRmI7T0FuQkY7TUFzQkEsZUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxXQUFBLEVBQWEsaUNBRmI7T0F2QkY7TUEwQkEsZ0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsV0FBQSxFQUFhLHNDQUZiO09BM0JGO0tBREY7SUFnQ0EsUUFBQSxFQUFVLElBaENWO0lBa0NBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFDUixJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLG1CQUFBLENBQUE7TUFDaEIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTthQUVyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUNmO1FBQUEsMkJBQUEsRUFBNkIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCO09BRGUsQ0FBbkI7SUFKUSxDQWxDVjtJQXlDQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7O1dBQVMsQ0FBRSxPQUFYLENBQUE7O01BQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWTs7WUFDRSxDQUFFLE9BQWhCLENBQUE7O2FBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFKUCxDQXpDWjtJQStDQSwwQkFBQSxFQUE0QixTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUosQ0EvQzVCO0lBaURBLGdCQUFBLEVBQWtCLFNBQUMsU0FBRDthQUNoQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsU0FBdkI7SUFEZ0IsQ0FqRGxCO0lBb0RBLE1BQUEsRUFBUSxTQUFBO01BQ04sSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQWI7ZUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFBLEVBSEY7O0lBRE0sQ0FwRFI7O0FBSkYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlIFwiYXRvbVwiXG5IaWdobGlnaHRlZEFyZWFWaWV3ID0gcmVxdWlyZSAnLi9oaWdobGlnaHRlZC1hcmVhLXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOlxuICAgIG9ubHlIaWdobGlnaHRXaG9sZVdvcmRzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgaGlkZUhpZ2hsaWdodE9uU2VsZWN0ZWRXb3JkOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGlnbm9yZUNhc2U6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgbGlnaHRUaGVtZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICBoaWdobGlnaHRCYWNrZ3JvdW5kOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIG1pbmltdW1MZW5ndGg6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDBcbiAgICB0aW1lb3V0OlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAyMFxuICAgICAgZGVzY3JpcHRpb246ICdEZWZlcnMgc2VhcmNoaW5nIGZvciBtYXRjaGluZyBzdHJpbmdzIGZvciBYIG1zJ1xuICAgIHNob3dJblN0YXR1c0JhcjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgZGVzY3JpcHRpb246ICdTaG93IGhvdyBtYW55IG1hdGNoZXMgdGhlcmUgYXJlJ1xuICAgIGhpZ2hsaWdodEluUGFuZXM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIGRlc2NyaXB0aW9uOiAnSGlnaGxpZ2h0IHNlbGVjdGlvbiBpbiBhbm90aGVyIHBhbmVzJ1xuXG4gIGFyZWFWaWV3OiBudWxsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAYXJlYVZpZXcgPSBuZXcgSGlnaGxpZ2h0ZWRBcmVhVmlldygpXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS13b3Jrc3BhY2VcIixcbiAgICAgICAgJ2hpZ2hsaWdodC1zZWxlY3RlZDp0b2dnbGUnOiA9PiBAdG9nZ2xlKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBhcmVhVmlldz8uZGVzdHJveSgpXG4gICAgQGFyZWFWaWV3ID0gbnVsbFxuICAgIEBzdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG51bGxcblxuICBwcm92aWRlSGlnaGxpZ2h0U2VsZWN0ZWRWMTogLT4gQGFyZWFWaWV3XG5cbiAgY29uc3VtZVN0YXR1c0JhcjogKHN0YXR1c0JhcikgLT5cbiAgICBAYXJlYVZpZXcuc2V0U3RhdHVzQmFyIHN0YXR1c0JhclxuXG4gIHRvZ2dsZTogLT5cbiAgICBpZiBAYXJlYVZpZXcuZGlzYWJsZWRcbiAgICAgIEBhcmVhVmlldy5lbmFibGUoKVxuICAgIGVsc2VcbiAgICAgIEBhcmVhVmlldy5kaXNhYmxlKClcbiJdfQ==
