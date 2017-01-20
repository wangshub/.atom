(function() {
  var Dialog, TextEditorView, View, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), TextEditorView = ref.TextEditorView, View = ref.View;

  module.exports = Dialog = (function(superClass) {
    extend(Dialog, superClass);

    function Dialog() {
      return Dialog.__super__.constructor.apply(this, arguments);
    }

    Dialog.content = function(arg) {
      var prompt;
      prompt = (arg != null ? arg : {}).prompt;
      return this.div({
        "class": 'terminal-plus-dialog'
      }, (function(_this) {
        return function() {
          _this.label(prompt, {
            "class": 'icon',
            outlet: 'promptText'
          });
          _this.subview('miniEditor', new TextEditorView({
            mini: true
          }));
          _this.label('Escape (Esc) to exit', {
            style: 'float: left;'
          });
          return _this.label('Enter (\u21B5) to confirm', {
            style: 'float: right;'
          });
        };
      })(this));
    };

    Dialog.prototype.initialize = function(arg) {
      var iconClass, placeholderText, ref1, stayOpen;
      ref1 = arg != null ? arg : {}, iconClass = ref1.iconClass, placeholderText = ref1.placeholderText, stayOpen = ref1.stayOpen;
      if (iconClass) {
        this.promptText.addClass(iconClass);
      }
      atom.commands.add(this.element, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.onConfirm(_this.miniEditor.getText());
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this)
      });
      if (!stayOpen) {
        this.miniEditor.on('blur', (function(_this) {
          return function() {
            return _this.close();
          };
        })(this));
      }
      if (placeholderText) {
        this.miniEditor.getModel().setText(placeholderText);
        return this.miniEditor.getModel().selectAll();
      }
    };

    Dialog.prototype.attach = function() {
      this.panel = atom.workspace.addModalPanel({
        item: this.element
      });
      this.miniEditor.focus();
      return this.miniEditor.getModel().scrollToCursorPosition();
    };

    Dialog.prototype.close = function() {
      var panelToDestroy;
      panelToDestroy = this.panel;
      this.panel = null;
      if (panelToDestroy != null) {
        panelToDestroy.destroy();
      }
      return atom.workspace.getActivePane().activate();
    };

    Dialog.prototype.cancel = function() {
      return this.close();
    };

    return Dialog;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvdGVybWluYWwtcGx1cy9saWIvZGlhbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaUNBQUE7SUFBQTs7O0VBQUEsTUFBeUIsT0FBQSxDQUFRLHNCQUFSLENBQXpCLEVBQUMsbUNBQUQsRUFBaUI7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixNQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsR0FBRDtBQUNSLFVBQUE7TUFEVSx3QkFBRCxNQUFXO2FBQ3BCLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHNCQUFQO09BQUwsRUFBb0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ2xDLEtBQUMsQ0FBQSxLQUFELENBQU8sTUFBUCxFQUFlO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxNQUFQO1lBQWUsTUFBQSxFQUFRLFlBQXZCO1dBQWY7VUFDQSxLQUFDLENBQUEsT0FBRCxDQUFTLFlBQVQsRUFBMkIsSUFBQSxjQUFBLENBQWU7WUFBQSxJQUFBLEVBQU0sSUFBTjtXQUFmLENBQTNCO1VBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTyxzQkFBUCxFQUErQjtZQUFBLEtBQUEsRUFBTyxjQUFQO1dBQS9CO2lCQUNBLEtBQUMsQ0FBQSxLQUFELENBQU8sMkJBQVAsRUFBb0M7WUFBQSxLQUFBLEVBQU8sZUFBUDtXQUFwQztRQUprQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEM7SUFEUTs7cUJBT1YsVUFBQSxHQUFZLFNBQUMsR0FBRDtBQUNWLFVBQUE7MkJBRFcsTUFBeUMsSUFBeEMsNEJBQVcsd0NBQWlCO01BQ3hDLElBQW1DLFNBQW5DO1FBQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQXFCLFNBQXJCLEVBQUE7O01BQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxPQUFuQixFQUNFO1FBQUEsY0FBQSxFQUFnQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxTQUFELENBQVcsS0FBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQUEsQ0FBWDtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQjtRQUNBLGFBQUEsRUFBZSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEZjtPQURGO01BSUEsSUFBQSxDQUFPLFFBQVA7UUFDRSxJQUFDLENBQUEsVUFBVSxDQUFDLEVBQVosQ0FBZSxNQUFmLEVBQXVCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLEtBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QixFQURGOztNQUdBLElBQUcsZUFBSDtRQUNFLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFBLENBQXNCLENBQUMsT0FBdkIsQ0FBK0IsZUFBL0I7ZUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBQSxDQUFzQixDQUFDLFNBQXZCLENBQUEsRUFGRjs7SUFUVTs7cUJBYVosTUFBQSxHQUFRLFNBQUE7TUFDTixJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtRQUFBLElBQUEsRUFBTSxJQUFJLENBQUMsT0FBWDtPQUE3QjtNQUNULElBQUMsQ0FBQSxVQUFVLENBQUMsS0FBWixDQUFBO2FBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQUEsQ0FBc0IsQ0FBQyxzQkFBdkIsQ0FBQTtJQUhNOztxQkFLUixLQUFBLEdBQU8sU0FBQTtBQUNMLFVBQUE7TUFBQSxjQUFBLEdBQWlCLElBQUMsQ0FBQTtNQUNsQixJQUFDLENBQUEsS0FBRCxHQUFTOztRQUNULGNBQWMsQ0FBRSxPQUFoQixDQUFBOzthQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBQThCLENBQUMsUUFBL0IsQ0FBQTtJQUpLOztxQkFNUCxNQUFBLEdBQVEsU0FBQTthQUNOLElBQUMsQ0FBQSxLQUFELENBQUE7SUFETTs7OztLQWhDVztBQUhyQiIsInNvdXJjZXNDb250ZW50IjpbIntUZXh0RWRpdG9yVmlldywgVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRGlhbG9nIGV4dGVuZHMgVmlld1xuICBAY29udGVudDogKHtwcm9tcHR9ID0ge30pIC0+XG4gICAgQGRpdiBjbGFzczogJ3Rlcm1pbmFsLXBsdXMtZGlhbG9nJywgPT5cbiAgICAgIEBsYWJlbCBwcm9tcHQsIGNsYXNzOiAnaWNvbicsIG91dGxldDogJ3Byb21wdFRleHQnXG4gICAgICBAc3VidmlldyAnbWluaUVkaXRvcicsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlKVxuICAgICAgQGxhYmVsICdFc2NhcGUgKEVzYykgdG8gZXhpdCcsIHN0eWxlOiAnZmxvYXQ6IGxlZnQ7J1xuICAgICAgQGxhYmVsICdFbnRlciAoXFx1MjFCNSkgdG8gY29uZmlybScsIHN0eWxlOiAnZmxvYXQ6IHJpZ2h0OydcblxuICBpbml0aWFsaXplOiAoe2ljb25DbGFzcywgcGxhY2Vob2xkZXJUZXh0LCBzdGF5T3Blbn0gPSB7fSkgLT5cbiAgICBAcHJvbXB0VGV4dC5hZGRDbGFzcyhpY29uQ2xhc3MpIGlmIGljb25DbGFzc1xuICAgIGF0b20uY29tbWFuZHMuYWRkIEBlbGVtZW50LFxuICAgICAgJ2NvcmU6Y29uZmlybSc6ID0+IEBvbkNvbmZpcm0oQG1pbmlFZGl0b3IuZ2V0VGV4dCgpKVxuICAgICAgJ2NvcmU6Y2FuY2VsJzogPT4gQGNhbmNlbCgpXG5cbiAgICB1bmxlc3Mgc3RheU9wZW5cbiAgICAgIEBtaW5pRWRpdG9yLm9uICdibHVyJywgPT4gQGNsb3NlKClcblxuICAgIGlmIHBsYWNlaG9sZGVyVGV4dFxuICAgICAgQG1pbmlFZGl0b3IuZ2V0TW9kZWwoKS5zZXRUZXh0IHBsYWNlaG9sZGVyVGV4dFxuICAgICAgQG1pbmlFZGl0b3IuZ2V0TW9kZWwoKS5zZWxlY3RBbGwoKVxuXG4gIGF0dGFjaDogLT5cbiAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMuZWxlbWVudClcbiAgICBAbWluaUVkaXRvci5mb2N1cygpXG4gICAgQG1pbmlFZGl0b3IuZ2V0TW9kZWwoKS5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKClcblxuICBjbG9zZTogLT5cbiAgICBwYW5lbFRvRGVzdHJveSA9IEBwYW5lbFxuICAgIEBwYW5lbCA9IG51bGxcbiAgICBwYW5lbFRvRGVzdHJveT8uZGVzdHJveSgpXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlKClcblxuICBjYW5jZWw6IC0+XG4gICAgQGNsb3NlKClcbiJdfQ==
