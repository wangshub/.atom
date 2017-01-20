(function() {
  var $, CompositeDisposable, MouseEventWhichDict;

  $ = null;

  CompositeDisposable = require('atom').CompositeDisposable;

  MouseEventWhichDict = {
    "left click": 1,
    "middle click": 2,
    "right click": 3
  };

  module.exports = {
    disposable: null,
    config: {
      disableComplete: {
        title: 'Disable auto complete',
        type: 'boolean',
        "default": false
      },
      autoBuildTagsWhenActive: {
        title: 'Automatically rebuild tags',
        description: 'Rebuild tags file each time a project path changes',
        type: 'boolean',
        "default": false
      },
      buildTimeout: {
        title: 'Build timeout',
        description: 'Time (in milliseconds) to wait for a tags rebuild to finish',
        type: 'integer',
        "default": 10000
      },
      cmd: {
        type: 'string',
        "default": ""
      },
      cmdArgs: {
        description: 'Add specified ctag command args like: --exclude=lib --exclude=*.js',
        type: 'string',
        "default": ""
      },
      extraTagFiles: {
        description: 'Add specified tagFiles. (Make sure you tag file generate with --fields=+KSn)',
        type: 'string',
        "default": ""
      },
      GotoSymbolKey: {
        description: 'combine bindings: alt, ctrl, meta, shift',
        type: 'array',
        "default": ["alt"]
      },
      GotoSymbolClick: {
        type: 'string',
        "default": "left click",
        "enum": ["left click", "middle click", "right click"]
      }
    },
    provider: null,
    activate: function() {
      var initExtraTagsTime;
      this.stack = [];
      this.ctagsCache = require("./ctags-cache");
      this.ctagsCache.activate();
      this.ctagsCache.initTags(atom.project.getPaths(), atom.config.get('atom-ctags.autoBuildTagsWhenActive'));
      this.disposable = atom.project.onDidChangePaths((function(_this) {
        return function(paths) {
          return _this.ctagsCache.initTags(paths, atom.config.get('atom-ctags.autoBuildTagsWhenActive'));
        };
      })(this));
      atom.commands.add('atom-workspace', 'atom-ctags:rebuild', (function(_this) {
        return function(e, cmdArgs) {
          var t;
          console.error("rebuild: ", e);
          if (Array.isArray(cmdArgs)) {
            _this.ctagsCache.cmdArgs = cmdArgs;
          }
          _this.createFileView().rebuild(true);
          if (t) {
            clearTimeout(t);
            return t = null;
          }
        };
      })(this));
      atom.commands.add('atom-workspace', 'atom-ctags:toggle-project-symbols', (function(_this) {
        return function() {
          return _this.createFileView().toggleAll();
        };
      })(this));
      atom.commands.add('atom-text-editor', {
        'atom-ctags:toggle-file-symbols': (function(_this) {
          return function() {
            return _this.createFileView().toggle();
          };
        })(this),
        'atom-ctags:go-to-declaration': (function(_this) {
          return function() {
            return _this.createFileView().goto();
          };
        })(this),
        'atom-ctags:return-from-declaration': (function(_this) {
          return function() {
            return _this.createGoBackView().toggle();
          };
        })(this)
      });
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var editorView;
          editorView = atom.views.getView(editor);
          if (!$) {
            $ = require('atom-space-pen-views').$;
          }
          return $(editorView).on('mousedown', function(event) {
            var i, keyName, len, ref, which;
            which = atom.config.get('atom-ctags.GotoSymbolClick');
            if (MouseEventWhichDict[which] !== event.which) {
              return;
            }
            ref = atom.config.get('atom-ctags.GotoSymbolKey');
            for (i = 0, len = ref.length; i < len; i++) {
              keyName = ref[i];
              if (!event[keyName + "Key"]) {
                return;
              }
            }
            return _this.createFileView().goto();
          });
        };
      })(this));
      if (!atom.packages.isPackageDisabled("symbols-view")) {
        atom.packages.disablePackage("symbols-view");
        alert("Warning from atom-ctags: atom-ctags replaces and enhances the symbols-view package. Therefore, symbols-view has been disabled.");
      }
      atom.config.observe('atom-ctags.disableComplete', (function(_this) {
        return function() {
          if (!_this.provider) {
            return;
          }
          return _this.provider.disabled = atom.config.get('atom-ctags.disableComplete');
        };
      })(this));
      initExtraTagsTime = null;
      return atom.config.observe('atom-ctags.extraTagFiles', (function(_this) {
        return function() {
          if (initExtraTagsTime) {
            clearTimeout(initExtraTagsTime);
          }
          return initExtraTagsTime = setTimeout((function() {
            _this.ctagsCache.initExtraTags(atom.config.get('atom-ctags.extraTagFiles').split(" "));
            return initExtraTagsTime = null;
          }), 1000);
        };
      })(this));
    },
    deactivate: function() {
      if (this.disposable != null) {
        this.disposable.dispose();
        this.disposable = null;
      }
      if (this.fileView != null) {
        this.fileView.destroy();
        this.fileView = null;
      }
      if (this.projectView != null) {
        this.projectView.destroy();
        this.projectView = null;
      }
      if (this.goToView != null) {
        this.goToView.destroy();
        this.goToView = null;
      }
      if (this.goBackView != null) {
        this.goBackView.destroy();
        this.goBackView = null;
      }
      return this.ctagsCache.deactivate();
    },
    createFileView: function() {
      var FileView;
      if (this.fileView == null) {
        FileView = require('./file-view');
        this.fileView = new FileView(this.stack);
        this.fileView.ctagsCache = this.ctagsCache;
      }
      return this.fileView;
    },
    createGoBackView: function() {
      var GoBackView;
      if (this.goBackView == null) {
        GoBackView = require('./go-back-view');
        this.goBackView = new GoBackView(this.stack);
      }
      return this.goBackView;
    },
    provide: function() {
      var CtagsProvider;
      if (this.provider == null) {
        CtagsProvider = require('./ctags-provider');
        this.provider = new CtagsProvider();
        this.provider.ctagsCache = this.ctagsCache;
        this.provider.disabled = atom.config.get('atom-ctags.disableComplete');
      }
      return this.provider;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvYXRvbS1jdGFncy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSTs7RUFDSCxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBRXhCLG1CQUFBLEdBQXNCO0lBQUMsWUFBQSxFQUFjLENBQWY7SUFBa0IsY0FBQSxFQUFnQixDQUFsQztJQUFxQyxhQUFBLEVBQWUsQ0FBcEQ7OztFQUN0QixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsVUFBQSxFQUFZLElBQVo7SUFFQSxNQUFBLEVBQ0U7TUFBQSxlQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sdUJBQVA7UUFDQSxJQUFBLEVBQU0sU0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FGVDtPQURGO01BSUEsdUJBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyw0QkFBUDtRQUNBLFdBQUEsRUFBYSxvREFEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO09BTEY7TUFTQSxZQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sZUFBUDtRQUNBLFdBQUEsRUFBYSw2REFEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO09BVkY7TUFjQSxHQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFEVDtPQWZGO01BaUJBLE9BQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxvRUFBYjtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUZUO09BbEJGO01BcUJBLGFBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSw4RUFBYjtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUZU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LElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsUUFBQSxDQUFTLElBQUMsQ0FBQSxLQUFWO1FBQ2hCLElBQUMsQ0FBQSxRQUFRLENBQUMsVUFBVixHQUF1QixJQUFDLENBQUEsV0FIMUI7O2FBSUEsSUFBQyxDQUFBO0lBTGEsQ0FySGhCO0lBNEhBLGdCQUFBLEVBQWtCLFNBQUE7QUFDaEIsVUFBQTtNQUFBLElBQU8sdUJBQVA7UUFDRSxVQUFBLEdBQWEsT0FBQSxDQUFRLGdCQUFSO1FBQ2IsSUFBQyxDQUFBLFVBQUQsR0FBa0IsSUFBQSxVQUFBLENBQVcsSUFBQyxDQUFBLEtBQVosRUFGcEI7O2FBR0EsSUFBQyxDQUFBO0lBSmUsQ0E1SGxCO0lBa0lBLE9BQUEsRUFBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQU8scUJBQVA7UUFDRSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUjtRQUNoQixJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLGFBQUEsQ0FBQTtRQUNoQixJQUFDLENBQUEsUUFBUSxDQUFDLFVBQVYsR0FBdUIsSUFBQyxDQUFBO1FBQ3hCLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBVixHQUFxQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCLEVBSnZCOzthQUtBLElBQUMsQ0FBQTtJQU5NLENBbElUOztBQUxGIiwic291cmNlc0NvbnRlbnQiOlsiJCA9IG51bGxcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbk1vdXNlRXZlbnRXaGljaERpY3QgPSB7XCJsZWZ0IGNsaWNrXCI6IDEsIFwibWlkZGxlIGNsaWNrXCI6IDIsIFwicmlnaHQgY2xpY2tcIjogM31cbm1vZHVsZS5leHBvcnRzID1cbiAgZGlzcG9zYWJsZTogbnVsbFxuXG4gIGNvbmZpZzpcbiAgICBkaXNhYmxlQ29tcGxldGU6XG4gICAgICB0aXRsZTogJ0Rpc2FibGUgYXV0byBjb21wbGV0ZSdcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICBhdXRvQnVpbGRUYWdzV2hlbkFjdGl2ZTpcbiAgICAgIHRpdGxlOiAnQXV0b21hdGljYWxseSByZWJ1aWxkIHRhZ3MnXG4gICAgICBkZXNjcmlwdGlvbjogJ1JlYnVpbGQgdGFncyBmaWxlIGVhY2ggdGltZSBhIHByb2plY3QgcGF0aCBjaGFuZ2VzJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGJ1aWxkVGltZW91dDpcbiAgICAgIHRpdGxlOiAnQnVpbGQgdGltZW91dCdcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGltZSAoaW4gbWlsbGlzZWNvbmRzKSB0byB3YWl0IGZvciBhIHRhZ3MgcmVidWlsZCB0byBmaW5pc2gnXG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDEwMDAwXG4gICAgY21kOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiXCJcbiAgICBjbWRBcmdzOlxuICAgICAgZGVzY3JpcHRpb246ICdBZGQgc3BlY2lmaWVkIGN0YWcgY29tbWFuZCBhcmdzIGxpa2U6IC0tZXhjbHVkZT1saWIgLS1leGNsdWRlPSouanMnXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJcIlxuICAgIGV4dHJhVGFnRmlsZXM6XG4gICAgICBkZXNjcmlwdGlvbjogJ0FkZCBzcGVjaWZpZWQgdGFnRmlsZXMuIChNYWtlIHN1cmUgeW91IHRhZyBmaWxlIGdlbmVyYXRlIHdpdGggLS1maWVsZHM9K0tTbiknXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJcIlxuICAgIEdvdG9TeW1ib2xLZXk6XG4gICAgICBkZXNjcmlwdGlvbjogJ2NvbWJpbmUgYmluZGluZ3M6IGFsdCwgY3RybCwgbWV0YSwgc2hpZnQnXG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbXCJhbHRcIl1cbiAgICBHb3RvU3ltYm9sQ2xpY2s6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJsZWZ0IGNsaWNrXCJcbiAgICAgIGVudW06IFtcImxlZnQgY2xpY2tcIiwgXCJtaWRkbGUgY2xpY2tcIiwgXCJyaWdodCBjbGlja1wiXVxuXG4gIHByb3ZpZGVyOiBudWxsXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgQHN0YWNrID0gW11cblxuICAgIEBjdGFnc0NhY2hlID0gcmVxdWlyZSBcIi4vY3RhZ3MtY2FjaGVcIlxuXG4gICAgQGN0YWdzQ2FjaGUuYWN0aXZhdGUoKVxuXG4gICAgQGN0YWdzQ2FjaGUuaW5pdFRhZ3MoYXRvbS5wcm9qZWN0LmdldFBhdGhzKCksIGF0b20uY29uZmlnLmdldCgnYXRvbS1jdGFncy5hdXRvQnVpbGRUYWdzV2hlbkFjdGl2ZScpKVxuICAgIEBkaXNwb3NhYmxlID0gYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMgKHBhdGhzKT0+XG4gICAgICBAY3RhZ3NDYWNoZS5pbml0VGFncyhwYXRocywgYXRvbS5jb25maWcuZ2V0KCdhdG9tLWN0YWdzLmF1dG9CdWlsZFRhZ3NXaGVuQWN0aXZlJykpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnYXRvbS1jdGFnczpyZWJ1aWxkJywgKGUsIGNtZEFyZ3MpPT5cbiAgICAgIGNvbnNvbGUuZXJyb3IgXCJyZWJ1aWxkOiBcIiwgZVxuICAgICAgQGN0YWdzQ2FjaGUuY21kQXJncyA9IGNtZEFyZ3MgaWYgQXJyYXkuaXNBcnJheShjbWRBcmdzKVxuICAgICAgQGNyZWF0ZUZpbGVWaWV3KCkucmVidWlsZCh0cnVlKVxuICAgICAgaWYgdFxuICAgICAgICBjbGVhclRpbWVvdXQodClcbiAgICAgICAgdCA9IG51bGxcblxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdhdG9tLWN0YWdzOnRvZ2dsZS1wcm9qZWN0LXN5bWJvbHMnLCA9PlxuICAgICAgQGNyZWF0ZUZpbGVWaWV3KCkudG9nZ2xlQWxsKClcblxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdhdG9tLWN0YWdzOnRvZ2dsZS1maWxlLXN5bWJvbHMnOiA9PiBAY3JlYXRlRmlsZVZpZXcoKS50b2dnbGUoKVxuICAgICAgJ2F0b20tY3RhZ3M6Z28tdG8tZGVjbGFyYXRpb24nOiA9PiBAY3JlYXRlRmlsZVZpZXcoKS5nb3RvKClcbiAgICAgICdhdG9tLWN0YWdzOnJldHVybi1mcm9tLWRlY2xhcmF0aW9uJzogPT4gQGNyZWF0ZUdvQmFja1ZpZXcoKS50b2dnbGUoKVxuXG4gICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICBlZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICAgIHskfSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJyB1bmxlc3MgJFxuICAgICAgJChlZGl0b3JWaWV3KS5vbiAnbW91c2Vkb3duJywgKGV2ZW50KSA9PlxuICAgICAgICB3aGljaCA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jdGFncy5Hb3RvU3ltYm9sQ2xpY2snKVxuICAgICAgICByZXR1cm4gdW5sZXNzIE1vdXNlRXZlbnRXaGljaERpY3Rbd2hpY2hdID09IGV2ZW50LndoaWNoXG4gICAgICAgIGZvciBrZXlOYW1lIGluIGF0b20uY29uZmlnLmdldCgnYXRvbS1jdGFncy5Hb3RvU3ltYm9sS2V5JylcbiAgICAgICAgICByZXR1cm4gaWYgbm90IGV2ZW50W2tleU5hbWUrXCJLZXlcIl1cbiAgICAgICAgQGNyZWF0ZUZpbGVWaWV3KCkuZ290bygpXG5cbiAgICBpZiBub3QgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VEaXNhYmxlZChcInN5bWJvbHMtdmlld1wiKVxuICAgICAgYXRvbS5wYWNrYWdlcy5kaXNhYmxlUGFja2FnZShcInN5bWJvbHMtdmlld1wiKVxuICAgICAgYWxlcnQgXCJXYXJuaW5nIGZyb20gYXRvbS1jdGFnczpcbiAgICAgICAgICAgICAgYXRvbS1jdGFncyByZXBsYWNlcyBhbmQgZW5oYW5jZXMgdGhlIHN5bWJvbHMtdmlldyBwYWNrYWdlLlxuICAgICAgICAgICAgICBUaGVyZWZvcmUsIHN5bWJvbHMtdmlldyBoYXMgYmVlbiBkaXNhYmxlZC5cIlxuXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAnYXRvbS1jdGFncy5kaXNhYmxlQ29tcGxldGUnLCA9PlxuICAgICAgcmV0dXJuIHVubGVzcyBAcHJvdmlkZXJcbiAgICAgIEBwcm92aWRlci5kaXNhYmxlZCA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jdGFncy5kaXNhYmxlQ29tcGxldGUnKVxuXG4gICAgaW5pdEV4dHJhVGFnc1RpbWUgPSBudWxsXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAnYXRvbS1jdGFncy5leHRyYVRhZ0ZpbGVzJywgPT5cbiAgICAgIGNsZWFyVGltZW91dCBpbml0RXh0cmFUYWdzVGltZSBpZiBpbml0RXh0cmFUYWdzVGltZVxuICAgICAgaW5pdEV4dHJhVGFnc1RpbWUgPSBzZXRUaW1lb3V0KCg9PlxuICAgICAgICBAY3RhZ3NDYWNoZS5pbml0RXh0cmFUYWdzKGF0b20uY29uZmlnLmdldCgnYXRvbS1jdGFncy5leHRyYVRhZ0ZpbGVzJykuc3BsaXQoXCIgXCIpKVxuICAgICAgICBpbml0RXh0cmFUYWdzVGltZSA9IG51bGxcbiAgICAgICksIDEwMDApXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBpZiBAZGlzcG9zYWJsZT9cbiAgICAgIEBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgQGRpc3Bvc2FibGUgPSBudWxsXG5cbiAgICBpZiBAZmlsZVZpZXc/XG4gICAgICBAZmlsZVZpZXcuZGVzdHJveSgpXG4gICAgICBAZmlsZVZpZXcgPSBudWxsXG5cbiAgICBpZiBAcHJvamVjdFZpZXc/XG4gICAgICBAcHJvamVjdFZpZXcuZGVzdHJveSgpXG4gICAgICBAcHJvamVjdFZpZXcgPSBudWxsXG5cbiAgICBpZiBAZ29Ub1ZpZXc/XG4gICAgICBAZ29Ub1ZpZXcuZGVzdHJveSgpXG4gICAgICBAZ29Ub1ZpZXcgPSBudWxsXG5cbiAgICBpZiBAZ29CYWNrVmlldz9cbiAgICAgIEBnb0JhY2tWaWV3LmRlc3Ryb3koKVxuICAgICAgQGdvQmFja1ZpZXcgPSBudWxsXG5cbiAgICBAY3RhZ3NDYWNoZS5kZWFjdGl2YXRlKClcblxuICBjcmVhdGVGaWxlVmlldzogLT5cbiAgICB1bmxlc3MgQGZpbGVWaWV3P1xuICAgICAgRmlsZVZpZXcgID0gcmVxdWlyZSAnLi9maWxlLXZpZXcnXG4gICAgICBAZmlsZVZpZXcgPSBuZXcgRmlsZVZpZXcoQHN0YWNrKVxuICAgICAgQGZpbGVWaWV3LmN0YWdzQ2FjaGUgPSBAY3RhZ3NDYWNoZVxuICAgIEBmaWxlVmlld1xuXG4gIGNyZWF0ZUdvQmFja1ZpZXc6IC0+XG4gICAgdW5sZXNzIEBnb0JhY2tWaWV3P1xuICAgICAgR29CYWNrVmlldyA9IHJlcXVpcmUgJy4vZ28tYmFjay12aWV3J1xuICAgICAgQGdvQmFja1ZpZXcgPSBuZXcgR29CYWNrVmlldyhAc3RhY2spXG4gICAgQGdvQmFja1ZpZXdcblxuICBwcm92aWRlOiAtPlxuICAgIHVubGVzcyBAcHJvdmlkZXI/XG4gICAgICBDdGFnc1Byb3ZpZGVyID0gcmVxdWlyZSAnLi9jdGFncy1wcm92aWRlcidcbiAgICAgIEBwcm92aWRlciA9IG5ldyBDdGFnc1Byb3ZpZGVyKClcbiAgICAgIEBwcm92aWRlci5jdGFnc0NhY2hlID0gQGN0YWdzQ2FjaGVcbiAgICAgIEBwcm92aWRlci5kaXNhYmxlZCA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jdGFncy5kaXNhYmxlQ29tcGxldGUnKVxuICAgIEBwcm92aWRlclxuIl19
