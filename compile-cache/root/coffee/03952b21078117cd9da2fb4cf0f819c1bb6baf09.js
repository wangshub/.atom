(function() {
  var debug, fs, getSize,
    slice = [].slice;

  fs = require('fs');

  getSize = function(filePath) {
    return new Promise(function(resolve, reject) {
      return fs.stat(filePath, function(error, stat) {
        if (error) {
          return reject(error);
        }
        return resolve(stat.size);
      });
    });
  };

  debug = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (!atom.config.get('autocomplete-ctags.debug')) {
      return;
    }
    args.unshift('CtagsProvider');
    return console.log.apply(console, args);
  };

  module.exports = {
    getSize: getSize,
    debug: debug
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWN0YWdzL2xpYi9oZWxwZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxrQkFBQTtJQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFFTCxPQUFBLEdBQVUsU0FBQyxRQUFEO1dBQ0osSUFBQSxPQUFBLENBQVEsU0FBQyxPQUFELEVBQVUsTUFBVjthQUNWLEVBQUUsQ0FBQyxJQUFILENBQVEsUUFBUixFQUFrQixTQUFDLEtBQUQsRUFBUSxJQUFSO1FBQ2hCLElBQXdCLEtBQXhCO0FBQUEsaUJBQU8sTUFBQSxDQUFPLEtBQVAsRUFBUDs7ZUFDQSxPQUFBLENBQVEsSUFBSSxDQUFDLElBQWI7TUFGZ0IsQ0FBbEI7SUFEVSxDQUFSO0VBREk7O0VBUVYsS0FBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBRE87SUFDUCxJQUFBLENBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDBCQUFoQixDQUFkO0FBQUEsYUFBQTs7SUFDQSxJQUFJLENBQUMsT0FBTCxDQUFhLGVBQWI7V0FDQSxPQUFPLENBQUMsR0FBUixnQkFBWSxJQUFaO0VBSE07O0VBTVIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFBQyxTQUFBLE9BQUQ7SUFBVSxPQUFBLEtBQVY7O0FBaEJqQiIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMnXG5cbmdldFNpemUgPSAoZmlsZVBhdGgpIC0+XG4gIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgZnMuc3RhdChmaWxlUGF0aCwgKGVycm9yLCBzdGF0KSAtPlxuICAgICAgcmV0dXJuIHJlamVjdChlcnJvcikgaWYgZXJyb3JcbiAgICAgIHJlc29sdmUoc3RhdC5zaXplKVxuICAgIClcbiAgKVxuXG5kZWJ1ZyA9IChhcmdzLi4uKSAtPlxuICByZXR1cm4gdW5sZXNzIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLWN0YWdzLmRlYnVnJylcbiAgYXJncy51bnNoaWZ0KCdDdGFnc1Byb3ZpZGVyJylcbiAgY29uc29sZS5sb2coYXJncy4uLilcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtnZXRTaXplLCBkZWJ1Z31cbiJdfQ==
