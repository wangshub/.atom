(function() {
  var Snippers, path;

  path = require('path');

  module.exports = Snippers = (function() {
    Snippers.snipperNames = ['coffee', 'default'];

    Snippers.prototype.snippers = new Map;

    function Snippers() {
      this.constructor.snipperNames.forEach((function(_this) {
        return function(name) {
          var Snipper, extension, i, len, ref, results, snipper;
          Snipper = require("./" + name);
          snipper = new Snipper;
          ref = snipper.extensions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            extension = ref[i];
            results.push(_this.snippers.set(extension, snipper));
          }
          return results;
        };
      })(this));
    }

    Snippers.prototype.generate = function(tag) {
      var fileExtension, filePath, snipper;
      filePath = tag.file;
      fileExtension = path.extname(filePath);
      fileExtension = fileExtension.substr(1);
      snipper = this.getSnipper({
        extension: fileExtension
      });
      if (!snipper) {
        return;
      }
      return snipper.generate(tag);
    };

    Snippers.prototype.getSnipper = function(arg) {
      var extension;
      extension = arg.extension;
      return this.snippers.get(extension);
    };

    return Snippers;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWN0YWdzL2xpYi9zbmlwcGVycy9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUNNO0lBRUosUUFBQyxDQUFBLFlBQUQsR0FBZ0IsQ0FDZCxRQURjLEVBRWQsU0FGYzs7dUJBS2hCLFFBQUEsR0FBVSxJQUFJOztJQUVELGtCQUFBO01BQ1gsSUFBQyxDQUFBLFdBQVcsQ0FBQyxZQUFZLENBQUMsT0FBMUIsQ0FBa0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7QUFDaEMsY0FBQTtVQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsSUFBQSxHQUFLLElBQWI7VUFDVixPQUFBLEdBQVUsSUFBSTtBQUNkO0FBQUE7ZUFBQSxxQ0FBQTs7eUJBQ0UsS0FBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsU0FBZCxFQUF5QixPQUF6QjtBQURGOztRQUhnQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEM7SUFEVzs7dUJBUWIsUUFBQSxHQUFVLFNBQUMsR0FBRDtBQUNSLFVBQUE7TUFBTyxXQUFZLElBQWxCO01BRUQsYUFBQSxHQUFnQixJQUFJLENBQUMsT0FBTCxDQUFhLFFBQWI7TUFDaEIsYUFBQSxHQUFnQixhQUFhLENBQUMsTUFBZCxDQUFxQixDQUFyQjtNQUVoQixPQUFBLEdBQVUsSUFBQyxDQUFBLFVBQUQsQ0FBWTtRQUFDLFNBQUEsRUFBVyxhQUFaO09BQVo7TUFDVixJQUFBLENBQWMsT0FBZDtBQUFBLGVBQUE7O2FBRUEsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsR0FBakI7SUFUUTs7dUJBV1YsVUFBQSxHQUFZLFNBQUMsR0FBRDtBQUNWLFVBQUE7TUFEWSxZQUFEO2FBQ1gsSUFBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsU0FBZDtJQURVOzs7OztBQS9CZCIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTbmlwcGVyc1xuXG4gIEBzbmlwcGVyTmFtZXMgPSBbXG4gICAgJ2NvZmZlZSdcbiAgICAnZGVmYXVsdCdcbiAgXVxuXG4gIHNuaXBwZXJzOiBuZXcgTWFwXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGNvbnN0cnVjdG9yLnNuaXBwZXJOYW1lcy5mb3JFYWNoKChuYW1lKSA9PlxuICAgICAgU25pcHBlciA9IHJlcXVpcmUgXCIuLyN7bmFtZX1cIlxuICAgICAgc25pcHBlciA9IG5ldyBTbmlwcGVyXG4gICAgICBmb3IgZXh0ZW5zaW9uIGluIHNuaXBwZXIuZXh0ZW5zaW9uc1xuICAgICAgICBAc25pcHBlcnMuc2V0KGV4dGVuc2lvbiwgc25pcHBlcilcbiAgICApXG5cbiAgZ2VuZXJhdGU6ICh0YWcpIC0+XG4gICAge2ZpbGU6IGZpbGVQYXRofSA9IHRhZ1xuXG4gICAgZmlsZUV4dGVuc2lvbiA9IHBhdGguZXh0bmFtZShmaWxlUGF0aClcbiAgICBmaWxlRXh0ZW5zaW9uID0gZmlsZUV4dGVuc2lvbi5zdWJzdHIoMSlcblxuICAgIHNuaXBwZXIgPSBAZ2V0U25pcHBlcih7ZXh0ZW5zaW9uOiBmaWxlRXh0ZW5zaW9ufSlcbiAgICByZXR1cm4gdW5sZXNzIHNuaXBwZXJcblxuICAgIHNuaXBwZXIuZ2VuZXJhdGUodGFnKVxuXG4gIGdldFNuaXBwZXI6ICh7ZXh0ZW5zaW9ufSkgLT5cbiAgICBAc25pcHBlcnMuZ2V0KGV4dGVuc2lvbilcbiJdfQ==
