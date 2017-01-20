(function() {
  var CtagsProvider, getTagsFile;

  CtagsProvider = require('./ctags-provider');

  getTagsFile = require('./get-tags-file');

  module.exports = {
    ctagsProvider: null,
    activate: function(state) {
      this.ctagsProvider = new CtagsProvider;
      return this.getTagsFiles().then((function(_this) {
        return function(tagsFiles) {
          return _this.ctagsProvider.setTagsFiles(tagsFiles);
        };
      })(this));
    },
    deactivate: function() {
      var ref;
      if ((ref = this.ctagsProvider) != null) {
        ref.dispose();
      }
      return this.ctagsProvider = null;
    },
    getTagsFiles: function() {
      return new Promise(function(resolve) {
        var promises;
        promises = atom.project.getPaths().map(function(projectPath) {
          return getTagsFile(projectPath);
        });
        return Promise.all(promises).then(function(results) {
          var tagsFiles;
          tagsFiles = results.filter(function(tagsFile) {
            return tagsFile !== false;
          });
          return resolve(tagsFiles);
        });
      });
    },
    provide: function() {
      return this.ctagsProvider;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWN0YWdzL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVI7O0VBQ2hCLFdBQUEsR0FBYyxPQUFBLENBQVEsaUJBQVI7O0VBRWQsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLGFBQUEsRUFBZSxJQUFmO0lBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUNSLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7YUFFckIsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUFlLENBQUMsSUFBaEIsQ0FBcUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFNBQUQ7aUJBQ25CLEtBQUMsQ0FBQSxhQUFhLENBQUMsWUFBZixDQUE0QixTQUE1QjtRQURtQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckI7SUFIUSxDQUZWO0lBU0EsVUFBQSxFQUFZLFNBQUE7QUFDVixVQUFBOztXQUFjLENBQUUsT0FBaEIsQ0FBQTs7YUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUZQLENBVFo7SUFhQSxZQUFBLEVBQWMsU0FBQTthQUNSLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRDtBQUNWLFlBQUE7UUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBdUIsQ0FBQyxHQUF4QixDQUE0QixTQUFDLFdBQUQ7aUJBQ3JDLFdBQUEsQ0FBWSxXQUFaO1FBRHFDLENBQTVCO2VBSVgsT0FBTyxDQUFDLEdBQVIsQ0FBWSxRQUFaLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsU0FBQyxPQUFEO0FBQ3pCLGNBQUE7VUFBQSxTQUFBLEdBQVksT0FBTyxDQUFDLE1BQVIsQ0FBZSxTQUFDLFFBQUQ7bUJBQWMsUUFBQSxLQUFjO1VBQTVCLENBQWY7aUJBQ1osT0FBQSxDQUFRLFNBQVI7UUFGeUIsQ0FBM0I7TUFMVSxDQUFSO0lBRFEsQ0FiZDtJQXdCQSxPQUFBLEVBQVMsU0FBQTthQUNQLElBQUMsQ0FBQTtJQURNLENBeEJUOztBQUpGIiwic291cmNlc0NvbnRlbnQiOlsiQ3RhZ3NQcm92aWRlciA9IHJlcXVpcmUgJy4vY3RhZ3MtcHJvdmlkZXInXG5nZXRUYWdzRmlsZSA9IHJlcXVpcmUgJy4vZ2V0LXRhZ3MtZmlsZSdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjdGFnc1Byb3ZpZGVyOiBudWxsXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAY3RhZ3NQcm92aWRlciA9IG5ldyBDdGFnc1Byb3ZpZGVyXG5cbiAgICBAZ2V0VGFnc0ZpbGVzKCkudGhlbigodGFnc0ZpbGVzKSA9PlxuICAgICAgQGN0YWdzUHJvdmlkZXIuc2V0VGFnc0ZpbGVzKHRhZ3NGaWxlcylcbiAgICApXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAY3RhZ3NQcm92aWRlcj8uZGlzcG9zZSgpXG4gICAgQGN0YWdzUHJvdmlkZXIgPSBudWxsXG5cbiAgZ2V0VGFnc0ZpbGVzOiAtPlxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlKSAtPlxuICAgICAgcHJvbWlzZXMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKS5tYXAoKHByb2plY3RQYXRoKSAtPlxuICAgICAgICBnZXRUYWdzRmlsZShwcm9qZWN0UGF0aClcbiAgICAgIClcblxuICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oKHJlc3VsdHMpIC0+XG4gICAgICAgIHRhZ3NGaWxlcyA9IHJlc3VsdHMuZmlsdGVyKCh0YWdzRmlsZSkgLT4gdGFnc0ZpbGUgaXNudCBmYWxzZSlcbiAgICAgICAgcmVzb2x2ZSh0YWdzRmlsZXMpXG4gICAgICApXG5cbiAgcHJvdmlkZTogLT5cbiAgICBAY3RhZ3NQcm92aWRlclxuIl19
