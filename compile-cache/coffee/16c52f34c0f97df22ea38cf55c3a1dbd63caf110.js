(function() {
  var GoBackView, SymbolsView,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  SymbolsView = require('./symbols-view');

  module.exports = GoBackView = (function(superClass) {
    extend(GoBackView, superClass);

    function GoBackView() {
      return GoBackView.__super__.constructor.apply(this, arguments);
    }

    GoBackView.prototype.toggle = function() {
      var previousTag;
      previousTag = this.stack.pop();
      if (previousTag == null) {
        return;
      }
      return atom.workspace.open(previousTag.file).then((function(_this) {
        return function() {
          if (previousTag.position) {
            return _this.moveToPosition(previousTag.position, false);
          }
        };
      })(this));
    };

    return GoBackView;

  })(SymbolsView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvYXRvbS1jdGFncy9saWIvZ28tYmFjay12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTs7O0VBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFFZCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O3lCQUNKLE1BQUEsR0FBUSxTQUFBO0FBQ04sVUFBQTtNQUFBLFdBQUEsR0FBYyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBQTtNQUNkLElBQWMsbUJBQWQ7QUFBQSxlQUFBOzthQUVBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixXQUFXLENBQUMsSUFBaEMsQ0FBcUMsQ0FBQyxJQUF0QyxDQUEyQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDekMsSUFBZ0QsV0FBVyxDQUFDLFFBQTVEO21CQUFBLEtBQUMsQ0FBQSxjQUFELENBQWdCLFdBQVcsQ0FBQyxRQUE1QixFQUFzQyxLQUF0QyxFQUFBOztRQUR5QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0M7SUFKTTs7OztLQURlO0FBSHpCIiwic291cmNlc0NvbnRlbnQiOlsiU3ltYm9sc1ZpZXcgPSByZXF1aXJlICcuL3N5bWJvbHMtdmlldydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgR29CYWNrVmlldyBleHRlbmRzIFN5bWJvbHNWaWV3XG4gIHRvZ2dsZTogLT5cbiAgICBwcmV2aW91c1RhZyA9IEBzdGFjay5wb3AoKVxuICAgIHJldHVybiB1bmxlc3MgcHJldmlvdXNUYWc/XG5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHByZXZpb3VzVGFnLmZpbGUpLnRoZW4gPT5cbiAgICAgIEBtb3ZlVG9Qb3NpdGlvbihwcmV2aW91c1RhZy5wb3NpdGlvbiwgZmFsc2UpIGlmIHByZXZpb3VzVGFnLnBvc2l0aW9uXG4iXX0=
