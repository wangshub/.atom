(function() {
  var $$, Point, SelectListView, SymbolsView, fs, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  Point = require('atom').Point;

  fs = null;

  module.exports = SymbolsView = (function(superClass) {
    extend(SymbolsView, superClass);

    function SymbolsView() {
      return SymbolsView.__super__.constructor.apply(this, arguments);
    }

    SymbolsView.activate = function() {
      return new SymbolsView;
    };

    SymbolsView.prototype.initialize = function(stack) {
      this.stack = stack;
      SymbolsView.__super__.initialize.apply(this, arguments);
      this.panel = atom.workspace.addModalPanel({
        item: this,
        visible: false
      });
      return this.addClass('atom-ctags');
    };

    SymbolsView.prototype.destroy = function() {
      this.cancel();
      return this.panel.destroy();
    };

    SymbolsView.prototype.getFilterKey = function() {
      return 'name';
    };

    SymbolsView.prototype.viewForItem = function(arg) {
      var directory, file, lineNumber, name;
      lineNumber = arg.lineNumber, name = arg.name, file = arg.file, directory = arg.directory;
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div(name + ":" + lineNumber, {
              "class": 'primary-line'
            });
            return _this.div(file, {
              "class": 'secondary-line'
            });
          };
        })(this));
      });
    };

    SymbolsView.prototype.getEmptyMessage = function(itemCount) {
      if (itemCount === 0) {
        return 'No symbols found';
      } else {
        return SymbolsView.__super__.getEmptyMessage.apply(this, arguments);
      }
    };

    SymbolsView.prototype.cancelled = function() {
      return this.panel.hide();
    };

    SymbolsView.prototype.confirmed = function(tag) {
      this.cancelPosition = null;
      this.cancel();
      return this.openTag(tag);
    };

    SymbolsView.prototype.getTagPosition = function(tag) {
      if (!tag.position && tag.lineNumber && tag.pattern) {
        tag.position = new Point(tag.lineNumber - 1, tag.pattern.indexOf(tag.name) - 2);
      }
      if (!tag.position) {
        console.error("Atom Ctags: please create a new issue: " + JSON.stringify(tag));
      }
      return tag.position;
    };

    SymbolsView.prototype.openTag = function(tag) {
      var editor, previous;
      if (editor = atom.workspace.getActiveTextEditor()) {
        previous = {
          position: editor.getCursorBufferPosition(),
          file: editor.getURI()
        };
      }
      if (tag.file) {
        atom.workspace.open(tag.file).then((function(_this) {
          return function() {
            if (_this.getTagPosition(tag)) {
              return _this.moveToPosition(tag.position);
            }
          };
        })(this));
      }
      return this.stack.push(previous);
    };

    SymbolsView.prototype.moveToPosition = function(position) {
      var editor;
      if (editor = atom.workspace.getActiveTextEditor()) {
        editor.scrollToBufferPosition(position, {
          center: true
        });
        return editor.setCursorBufferPosition(position);
      }
    };

    SymbolsView.prototype.attach = function() {
      this.storeFocusedElement();
      this.panel.show();
      return this.focusFilterEditor();
    };

    return SymbolsView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvYXRvbS1jdGFncy9saWIvc3ltYm9scy12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsK0NBQUE7SUFBQTs7O0VBQUEsTUFBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsV0FBRCxFQUFLOztFQUNKLFFBQVMsT0FBQSxDQUFRLE1BQVI7O0VBQ1YsRUFBQSxHQUFLOztFQUVMLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixXQUFDLENBQUEsUUFBRCxHQUFXLFNBQUE7YUFDVCxJQUFJO0lBREs7OzBCQUdYLFVBQUEsR0FBWSxTQUFDLEtBQUQ7TUFBQyxJQUFDLENBQUEsUUFBRDtNQUNYLDZDQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtRQUFBLElBQUEsRUFBTSxJQUFOO1FBQVksT0FBQSxFQUFTLEtBQXJCO09BQTdCO2FBQ1QsSUFBQyxDQUFBLFFBQUQsQ0FBVSxZQUFWO0lBSFU7OzBCQUtaLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLE1BQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBO0lBRk87OzBCQUlULFlBQUEsR0FBYyxTQUFBO2FBQUc7SUFBSDs7MEJBRWQsV0FBQSxHQUFhLFNBQUMsR0FBRDtBQUNYLFVBQUE7TUFEYSw2QkFBWSxpQkFBTSxpQkFBTTthQUNyQyxFQUFBLENBQUcsU0FBQTtlQUNELElBQUMsQ0FBQSxFQUFELENBQUk7VUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFdBQVA7U0FBSixFQUF3QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO1lBQ3RCLEtBQUMsQ0FBQSxHQUFELENBQVEsSUFBRCxHQUFNLEdBQU4sR0FBUyxVQUFoQixFQUE4QjtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sY0FBUDthQUE5QjttQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLLElBQUwsRUFBVztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sZ0JBQVA7YUFBWDtVQUZzQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEI7TUFEQyxDQUFIO0lBRFc7OzBCQU1iLGVBQUEsR0FBaUIsU0FBQyxTQUFEO01BQ2YsSUFBRyxTQUFBLEtBQWEsQ0FBaEI7ZUFDRSxtQkFERjtPQUFBLE1BQUE7ZUFHRSxrREFBQSxTQUFBLEVBSEY7O0lBRGU7OzBCQU1qQixTQUFBLEdBQVcsU0FBQTthQUNULElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBO0lBRFM7OzBCQUdYLFNBQUEsR0FBWSxTQUFDLEdBQUQ7TUFDVixJQUFDLENBQUEsY0FBRCxHQUFrQjtNQUNsQixJQUFDLENBQUEsTUFBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxHQUFUO0lBSFU7OzBCQUtaLGNBQUEsR0FBZ0IsU0FBQyxHQUFEO01BQ2QsSUFBRyxDQUFJLEdBQUcsQ0FBQyxRQUFSLElBQXFCLEdBQUcsQ0FBQyxVQUF6QixJQUF3QyxHQUFHLENBQUMsT0FBL0M7UUFDRSxHQUFHLENBQUMsUUFBSixHQUFtQixJQUFBLEtBQUEsQ0FBTSxHQUFHLENBQUMsVUFBSixHQUFlLENBQXJCLEVBQXdCLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBWixDQUFvQixHQUFHLENBQUMsSUFBeEIsQ0FBQSxHQUE4QixDQUF0RCxFQURyQjs7TUFFQSxJQUFHLENBQUksR0FBRyxDQUFDLFFBQVg7UUFDRSxPQUFPLENBQUMsS0FBUixDQUFjLHlDQUFBLEdBQTRDLElBQUksQ0FBQyxTQUFMLENBQWUsR0FBZixDQUExRCxFQURGOztBQUVBLGFBQU8sR0FBRyxDQUFDO0lBTEc7OzBCQU9oQixPQUFBLEdBQVMsU0FBQyxHQUFEO0FBQ1AsVUFBQTtNQUFBLElBQUcsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFaO1FBQ0UsUUFBQSxHQUNFO1VBQUEsUUFBQSxFQUFVLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQVY7VUFDQSxJQUFBLEVBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBQSxDQUROO1VBRko7O01BS0EsSUFBRyxHQUFHLENBQUMsSUFBUDtRQUNFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixHQUFHLENBQUMsSUFBeEIsQ0FBNkIsQ0FBQyxJQUE5QixDQUFtQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO1lBQ2pDLElBQWlDLEtBQUMsQ0FBQSxjQUFELENBQWdCLEdBQWhCLENBQWpDO3FCQUFBLEtBQUMsQ0FBQSxjQUFELENBQWdCLEdBQUcsQ0FBQyxRQUFwQixFQUFBOztVQURpQztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkMsRUFERjs7YUFJQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxRQUFaO0lBVk87OzBCQVlULGNBQUEsR0FBZ0IsU0FBQyxRQUFEO0FBQ2QsVUFBQTtNQUFBLElBQUcsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFaO1FBQ0UsTUFBTSxDQUFDLHNCQUFQLENBQThCLFFBQTlCLEVBQXdDO1VBQUEsTUFBQSxFQUFRLElBQVI7U0FBeEM7ZUFDQSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsUUFBL0IsRUFGRjs7SUFEYzs7MEJBS2hCLE1BQUEsR0FBUSxTQUFBO01BQ04sSUFBQyxDQUFBLG1CQUFELENBQUE7TUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBSE07Ozs7S0EzRGdCO0FBTDFCIiwic291cmNlc0NvbnRlbnQiOlsieyQkLCBTZWxlY3RMaXN0Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbntQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xuZnMgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFN5bWJvbHNWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgQGFjdGl2YXRlOiAtPlxuICAgIG5ldyBTeW1ib2xzVmlld1xuXG4gIGluaXRpYWxpemU6IChAc3RhY2spIC0+XG4gICAgc3VwZXJcbiAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMsIHZpc2libGU6IGZhbHNlKVxuICAgIEBhZGRDbGFzcygnYXRvbS1jdGFncycpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAY2FuY2VsKClcbiAgICBAcGFuZWwuZGVzdHJveSgpXG5cbiAgZ2V0RmlsdGVyS2V5OiAtPiAnbmFtZSdcblxuICB2aWV3Rm9ySXRlbTogKHtsaW5lTnVtYmVyLCBuYW1lLCBmaWxlLCBkaXJlY3Rvcnl9KSAtPlxuICAgICQkIC0+XG4gICAgICBAbGkgY2xhc3M6ICd0d28tbGluZXMnLCA9PlxuICAgICAgICBAZGl2IFwiI3tuYW1lfToje2xpbmVOdW1iZXJ9XCIsIGNsYXNzOiAncHJpbWFyeS1saW5lJ1xuICAgICAgICBAZGl2IGZpbGUsIGNsYXNzOiAnc2Vjb25kYXJ5LWxpbmUnXG5cbiAgZ2V0RW1wdHlNZXNzYWdlOiAoaXRlbUNvdW50KSAtPlxuICAgIGlmIGl0ZW1Db3VudCBpcyAwXG4gICAgICAnTm8gc3ltYm9scyBmb3VuZCdcbiAgICBlbHNlXG4gICAgICBzdXBlclxuXG4gIGNhbmNlbGxlZDogLT5cbiAgICBAcGFuZWwuaGlkZSgpXG5cbiAgY29uZmlybWVkIDogKHRhZykgLT5cbiAgICBAY2FuY2VsUG9zaXRpb24gPSBudWxsXG4gICAgQGNhbmNlbCgpXG4gICAgQG9wZW5UYWcodGFnKVxuXG4gIGdldFRhZ1Bvc2l0aW9uOiAodGFnKSAtPlxuICAgIGlmIG5vdCB0YWcucG9zaXRpb24gYW5kIHRhZy5saW5lTnVtYmVyIGFuZCB0YWcucGF0dGVyblxuICAgICAgdGFnLnBvc2l0aW9uID0gbmV3IFBvaW50KHRhZy5saW5lTnVtYmVyLTEsIHRhZy5wYXR0ZXJuLmluZGV4T2YodGFnLm5hbWUpLTIpXG4gICAgaWYgbm90IHRhZy5wb3NpdGlvblxuICAgICAgY29uc29sZS5lcnJvciBcIkF0b20gQ3RhZ3M6IHBsZWFzZSBjcmVhdGUgYSBuZXcgaXNzdWU6IFwiICsgSlNPTi5zdHJpbmdpZnkodGFnKVxuICAgIHJldHVybiB0YWcucG9zaXRpb25cblxuICBvcGVuVGFnOiAodGFnKSAtPlxuICAgIGlmIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgcHJldmlvdXMgPVxuICAgICAgICBwb3NpdGlvbjogZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgZmlsZTogZWRpdG9yLmdldFVSSSgpXG5cbiAgICBpZiB0YWcuZmlsZVxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbih0YWcuZmlsZSkudGhlbiA9PlxuICAgICAgICBAbW92ZVRvUG9zaXRpb24odGFnLnBvc2l0aW9uKSBpZiBAZ2V0VGFnUG9zaXRpb24odGFnKVxuXG4gICAgQHN0YWNrLnB1c2gocHJldmlvdXMpXG5cbiAgbW92ZVRvUG9zaXRpb246IChwb3NpdGlvbikgLT5cbiAgICBpZiBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKHBvc2l0aW9uLCBjZW50ZXI6IHRydWUpXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ocG9zaXRpb24pXG5cbiAgYXR0YWNoOiAtPlxuICAgIEBzdG9yZUZvY3VzZWRFbGVtZW50KClcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcbiJdfQ==
