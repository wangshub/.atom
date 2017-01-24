(function() {
  var DefaultSnipper, Snipper,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Snipper = require('./snipper');

  module.exports = DefaultSnipper = (function(superClass) {
    extend(DefaultSnipper, superClass);

    function DefaultSnipper() {
      return DefaultSnipper.__super__.constructor.apply(this, arguments);
    }

    DefaultSnipper.prototype.extensions = ['m'];

    DefaultSnipper.prototype.generate = function(tag) {
      var args, argsString, matches, snippetCount;
      if (tag.kind !== 'f') {
        return null;
      }
      argsString = '';
      matches = tag.pattern.match(/\(([^\(\)]*)\)/);
      if (matches) {
        argsString = matches[1].trim();
      }
      snippetCount = 1;
      args = [];
      if (argsString.length > 0) {
        args = argsString.split(',').map(function(arg) {
          arg = arg.split('=', 1)[0];
          return "${" + (snippetCount++) + ":" + (arg.trim()) + "}";
        });
      }
      return tag.name + "(" + (args.join(', ')) + ")${" + snippetCount + "}";
    };

    return DefaultSnipper;

  })(Snipper);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWN0YWdzL2xpYi9zbmlwcGVycy9kZWZhdWx0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTs7O0VBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7NkJBRUosVUFBQSxHQUFZLENBQUMsR0FBRDs7NkJBRVosUUFBQSxHQUFVLFNBQUMsR0FBRDtBQUNSLFVBQUE7TUFBQSxJQUFlLEdBQUcsQ0FBQyxJQUFKLEtBQWMsR0FBN0I7QUFBQSxlQUFPLEtBQVA7O01BRUEsVUFBQSxHQUFhO01BQ2IsT0FBQSxHQUFVLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBWixDQUFrQixnQkFBbEI7TUFDVixJQUFrQyxPQUFsQztRQUFBLFVBQUEsR0FBYSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBWCxDQUFBLEVBQWI7O01BQ0EsWUFBQSxHQUFlO01BQ2YsSUFBQSxHQUFPO01BRVAsSUFBRyxVQUFVLENBQUMsTUFBWCxHQUFvQixDQUF2QjtRQUNFLElBQUEsR0FBTyxVQUFVLENBQUMsS0FBWCxDQUFpQixHQUFqQixDQUFxQixDQUFDLEdBQXRCLENBQTBCLFNBQUMsR0FBRDtVQUM5QixNQUFPLEdBQUcsQ0FBQyxLQUFKLENBQVUsR0FBVixFQUFlLENBQWY7aUJBQ1IsSUFBQSxHQUFJLENBQUMsWUFBQSxFQUFELENBQUosR0FBb0IsR0FBcEIsR0FBc0IsQ0FBQyxHQUFHLENBQUMsSUFBSixDQUFBLENBQUQsQ0FBdEIsR0FBa0M7UUFGSCxDQUExQixFQURUOzthQU1HLEdBQUcsQ0FBQyxJQUFMLEdBQVUsR0FBVixHQUFZLENBQUMsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWLENBQUQsQ0FBWixHQUE2QixLQUE3QixHQUFrQyxZQUFsQyxHQUErQztJQWZ6Qzs7OztLQUppQjtBQUg3QiIsInNvdXJjZXNDb250ZW50IjpbIlNuaXBwZXIgPSByZXF1aXJlICcuL3NuaXBwZXInXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIERlZmF1bHRTbmlwcGVyIGV4dGVuZHMgU25pcHBlclxuXG4gIGV4dGVuc2lvbnM6IFsnbSddXG5cbiAgZ2VuZXJhdGU6ICh0YWcpIC0+XG4gICAgcmV0dXJuIG51bGwgaWYgdGFnLmtpbmQgaXNudCAnZidcblxuICAgIGFyZ3NTdHJpbmcgPSAnJ1xuICAgIG1hdGNoZXMgPSB0YWcucGF0dGVybi5tYXRjaCgvXFwoKFteXFwoXFwpXSopXFwpLylcbiAgICBhcmdzU3RyaW5nID0gbWF0Y2hlc1sxXS50cmltKCkgaWYgbWF0Y2hlc1xuICAgIHNuaXBwZXRDb3VudCA9IDFcbiAgICBhcmdzID0gW11cblxuICAgIGlmIGFyZ3NTdHJpbmcubGVuZ3RoID4gMFxuICAgICAgYXJncyA9IGFyZ3NTdHJpbmcuc3BsaXQoJywnKS5tYXAoKGFyZykgLT5cbiAgICAgICAgW2FyZ10gPSBhcmcuc3BsaXQoJz0nLCAxKVxuICAgICAgICBcIiR7I3tzbmlwcGV0Q291bnQrK306I3thcmcudHJpbSgpfX1cIlxuICAgICAgKVxuXG4gICAgXCIje3RhZy5uYW1lfSgje2FyZ3Muam9pbignLCAnKX0pJHsje3NuaXBwZXRDb3VudH19XCJcbiJdfQ==
