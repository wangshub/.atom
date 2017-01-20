(function() {
  var CoffeeSnipper, Snipper,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Snipper = require('./snipper');

  module.exports = CoffeeSnipper = (function(superClass) {
    extend(CoffeeSnipper, superClass);

    function CoffeeSnipper() {
      return CoffeeSnipper.__super__.constructor.apply(this, arguments);
    }

    CoffeeSnipper.prototype.extensions = ['coffee'];

    CoffeeSnipper.prototype.generate = function(tag) {
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
      if (argsString.match(/^[\{\[].+[\]\}]$/)) {
        argsString = argsString.replace(/([\{\}])/g, '\\$1');
        args = ["${" + (snippetCount++) + ":" + argsString + "}"];
      } else if (argsString.length > 0) {
        args = argsString.split(',').map(function(arg) {
          arg = arg.split('=', 1)[0];
          return "${" + (snippetCount++) + ":" + (arg.trim()) + "}";
        });
      }
      return tag.name + "(" + (args.join(', ')) + ")${" + snippetCount + "}";
    };

    return CoffeeSnipper;

  })(Snipper);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWN0YWdzL2xpYi9zbmlwcGVycy9jb2ZmZWUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxzQkFBQTtJQUFBOzs7RUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozs0QkFFSixVQUFBLEdBQVksQ0FBQyxRQUFEOzs0QkFFWixRQUFBLEdBQVUsU0FBQyxHQUFEO0FBQ1IsVUFBQTtNQUFBLElBQWUsR0FBRyxDQUFDLElBQUosS0FBYyxHQUE3QjtBQUFBLGVBQU8sS0FBUDs7TUFFQSxVQUFBLEdBQWE7TUFDYixPQUFBLEdBQVUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFaLENBQWtCLGdCQUFsQjtNQUNWLElBQWtDLE9BQWxDO1FBQUEsVUFBQSxHQUFhLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFYLENBQUEsRUFBYjs7TUFDQSxZQUFBLEdBQWU7TUFDZixJQUFBLEdBQU87TUFFUCxJQUFHLFVBQVUsQ0FBQyxLQUFYLENBQWlCLGtCQUFqQixDQUFIO1FBRUUsVUFBQSxHQUFhLFVBQVUsQ0FBQyxPQUFYLENBQW1CLFdBQW5CLEVBQWdDLE1BQWhDO1FBQ2IsSUFBQSxHQUFPLENBQUMsSUFBQSxHQUFJLENBQUMsWUFBQSxFQUFELENBQUosR0FBb0IsR0FBcEIsR0FBdUIsVUFBdkIsR0FBa0MsR0FBbkMsRUFIVDtPQUFBLE1BSUssSUFBRyxVQUFVLENBQUMsTUFBWCxHQUFvQixDQUF2QjtRQUNILElBQUEsR0FBTyxVQUFVLENBQUMsS0FBWCxDQUFpQixHQUFqQixDQUFxQixDQUFDLEdBQXRCLENBQTBCLFNBQUMsR0FBRDtVQUM5QixNQUFPLEdBQUcsQ0FBQyxLQUFKLENBQVUsR0FBVixFQUFlLENBQWY7aUJBQ1IsSUFBQSxHQUFJLENBQUMsWUFBQSxFQUFELENBQUosR0FBb0IsR0FBcEIsR0FBc0IsQ0FBQyxHQUFHLENBQUMsSUFBSixDQUFBLENBQUQsQ0FBdEIsR0FBa0M7UUFGSCxDQUExQixFQURKOzthQU1GLEdBQUcsQ0FBQyxJQUFMLEdBQVUsR0FBVixHQUFZLENBQUMsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWLENBQUQsQ0FBWixHQUE2QixLQUE3QixHQUFrQyxZQUFsQyxHQUErQztJQW5CekM7Ozs7S0FKZ0I7QUFINUIiLCJzb3VyY2VzQ29udGVudCI6WyJTbmlwcGVyID0gcmVxdWlyZSAnLi9zbmlwcGVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBDb2ZmZWVTbmlwcGVyIGV4dGVuZHMgU25pcHBlclxuXG4gIGV4dGVuc2lvbnM6IFsnY29mZmVlJ11cblxuICBnZW5lcmF0ZTogKHRhZykgLT5cbiAgICByZXR1cm4gbnVsbCBpZiB0YWcua2luZCBpc250ICdmJ1xuXG4gICAgYXJnc1N0cmluZyA9ICcnXG4gICAgbWF0Y2hlcyA9IHRhZy5wYXR0ZXJuLm1hdGNoKC9cXCgoW15cXChcXCldKilcXCkvKVxuICAgIGFyZ3NTdHJpbmcgPSBtYXRjaGVzWzFdLnRyaW0oKSBpZiBtYXRjaGVzXG4gICAgc25pcHBldENvdW50ID0gMVxuICAgIGFyZ3MgPSBbXVxuXG4gICAgaWYgYXJnc1N0cmluZy5tYXRjaCgvXltcXHtcXFtdLitbXFxdXFx9XSQvKVxuICAgICAgIyBkZXN0cnVjdHVyaW5nIGFzc2lnbm1lbnRcbiAgICAgIGFyZ3NTdHJpbmcgPSBhcmdzU3RyaW5nLnJlcGxhY2UoLyhbXFx7XFx9XSkvZywgJ1xcXFwkMScpXG4gICAgICBhcmdzID0gW1wiJHsje3NuaXBwZXRDb3VudCsrfToje2FyZ3NTdHJpbmd9fVwiXVxuICAgIGVsc2UgaWYgYXJnc1N0cmluZy5sZW5ndGggPiAwXG4gICAgICBhcmdzID0gYXJnc1N0cmluZy5zcGxpdCgnLCcpLm1hcCgoYXJnKSAtPlxuICAgICAgICBbYXJnXSA9IGFyZy5zcGxpdCgnPScsIDEpXG4gICAgICAgIFwiJHsje3NuaXBwZXRDb3VudCsrfToje2FyZy50cmltKCl9fVwiXG4gICAgICApXG5cbiAgICBcIiN7dGFnLm5hbWV9KCN7YXJncy5qb2luKCcsICcpfSkkeyN7c25pcHBldENvdW50fX1cIlxuIl19
