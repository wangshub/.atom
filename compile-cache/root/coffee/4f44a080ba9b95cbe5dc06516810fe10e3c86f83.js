(function() {
  var CompositeDisposable, RenameDialog, StatusIcon, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  RenameDialog = null;

  View = require('space-pen').View;

  module.exports = StatusIcon = (function(superClass) {
    extend(StatusIcon, superClass);

    function StatusIcon() {
      return StatusIcon.__super__.constructor.apply(this, arguments);
    }

    StatusIcon.prototype.active = false;

    StatusIcon.prototype.initialize = function(terminalView) {
      var ref;
      this.terminalView = terminalView;
      this.classList.add('fusion-terminal-status-icon');
      this.icon = document.createElement('i');
      this.icon.classList.add('icon', 'icon-terminal');
      this.appendChild(this.icon);
      this.name = document.createElement('span');
      this.name.classList.add('name');
      this.appendChild(this.name);
      this.dataset.type = (ref = this.terminalView.constructor) != null ? ref.name : void 0;
      this.addEventListener('click', (function(_this) {
        return function(arg) {
          var ctrlKey, which;
          which = arg.which, ctrlKey = arg.ctrlKey;
          if (which === 1) {
            _this.terminalView.toggle();
            return true;
          } else if (which === 2) {
            _this.terminalView.destroy();
            return false;
          }
        };
      })(this));
      return this.setupTooltip();
    };

    StatusIcon.prototype.setupTooltip = function() {
      var onMouseEnter;
      onMouseEnter = (function(_this) {
        return function(event) {
          if (event.detail === 'terminal-fusion') {
            return;
          }
          return _this.updateTooltip();
        };
      })(this);
      this.mouseEnterSubscription = {
        dispose: (function(_this) {
          return function() {
            _this.removeEventListener('mouseenter', onMouseEnter);
            return _this.mouseEnterSubscription = null;
          };
        })(this)
      };
      return this.addEventListener('mouseenter', onMouseEnter);
    };

    StatusIcon.prototype.updateTooltip = function() {
      var process;
      this.removeTooltip();
      if (process = this.terminalView.getTerminalTitle()) {
        this.tooltip = atom.tooltips.add(this, {
          title: process,
          html: false,
          delay: {
            show: 1000,
            hide: 100
          }
        });
      }
      return this.dispatchEvent(new CustomEvent('mouseenter', {
        bubbles: true,
        detail: 'terminal-fusion'
      }));
    };

    StatusIcon.prototype.removeTooltip = function() {
      if (this.tooltip) {
        this.tooltip.dispose();
      }
      return this.tooltip = null;
    };

    StatusIcon.prototype.destroy = function() {
      this.removeTooltip();
      if (this.mouseEnterSubscription) {
        this.mouseEnterSubscription.dispose();
      }
      return this.remove();
    };

    StatusIcon.prototype.activate = function() {
      this.classList.add('active');
      return this.active = true;
    };

    StatusIcon.prototype.isActive = function() {
      return this.classList.contains('active');
    };

    StatusIcon.prototype.deactivate = function() {
      this.classList.remove('active');
      return this.active = false;
    };

    StatusIcon.prototype.toggle = function() {
      if (this.active) {
        this.classList.remove('active');
      } else {
        this.classList.add('active');
      }
      return this.active = !this.active;
    };

    StatusIcon.prototype.isActive = function() {
      return this.active;
    };

    StatusIcon.prototype.rename = function() {
      var dialog;
      if (RenameDialog == null) {
        RenameDialog = require('./rename-dialog');
      }
      dialog = new RenameDialog(this);
      return dialog.attach();
    };

    StatusIcon.prototype.getName = function() {
      return this.name.textContent.substring(1);
    };

    StatusIcon.prototype.updateName = function(name) {
      if (name !== this.getName()) {
        if (name) {
          name = "&nbsp;" + name;
        }
        this.name.innerHTML = name;
        return this.terminalView.emit('did-change-title');
      }
    };

    return StatusIcon;

  })(HTMLElement);

  module.exports = document.registerElement('fusion-terminal-status-icon', {
    prototype: StatusIcon.prototype,
    "extends": 'li'
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvdGVybWluYWwtZnVzaW9uL2xpYi9zdGF0dXMtaWNvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG1EQUFBO0lBQUE7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsWUFBQSxHQUF3Qjs7RUFDdkIsT0FBdUIsT0FBQSxDQUFRLFdBQVI7O0VBRXhCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7eUJBQ0osTUFBQSxHQUFROzt5QkFFUixVQUFBLEdBQVksU0FBQyxZQUFEO0FBQ1YsVUFBQTtNQURXLElBQUMsQ0FBQSxlQUFEO01BQ1gsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsNkJBQWY7TUFFQSxJQUFDLENBQUEsSUFBRCxHQUFRLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCO01BQ1IsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBaEIsQ0FBb0IsTUFBcEIsRUFBNEIsZUFBNUI7TUFDQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxJQUFkO01BRUEsSUFBQyxDQUFBLElBQUQsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QjtNQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWhCLENBQW9CLE1BQXBCO01BQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsSUFBZDtNQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxzREFBeUMsQ0FBRTtNQUUzQyxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsT0FBbEIsRUFBMkIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDekIsY0FBQTtVQUQyQixtQkFBTztVQUNsQyxJQUFHLEtBQUEsS0FBUyxDQUFaO1lBQ0UsS0FBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLENBQUE7bUJBQ0EsS0FGRjtX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LEdBQWEsSUFBQSxZQUFBLENBQWEsSUFBYjthQUNiLE1BQU0sQ0FBQyxNQUFQLENBQUE7SUFITTs7eUJBS1IsT0FBQSxHQUFTLFNBQUE7YUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFsQixDQUE0QixDQUE1QjtJQUFIOzt5QkFFVCxVQUFBLEdBQVksU0FBQyxJQUFEO01BQ1YsSUFBRyxJQUFBLEtBQVUsSUFBQyxDQUFBLE9BQUQsQ0FBQSxDQUFiO1FBQ0UsSUFBMEIsSUFBMUI7VUFBQSxJQUFBLEdBQU8sUUFBQSxHQUFXLEtBQWxCOztRQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixHQUFrQjtlQUNsQixJQUFDLENBQUEsWUFBWSxDQUFDLElBQWQsQ0FBbUIsa0JBQW5CLEVBSEY7O0lBRFU7Ozs7S0F4Rlc7O0VBOEZ6QixNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFRLENBQUMsZUFBVCxDQUF5Qiw2QkFBekIsRUFBd0Q7SUFBQSxTQUFBLEVBQVcsVUFBVSxDQUFDLFNBQXRCO0lBQWlDLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFBMUM7R0FBeEQ7QUFuR2pCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblJlbmFtZURpYWxvZyAgICAgICAgICA9IG51bGxcbntWaWV3fSAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3NwYWNlLXBlbidcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU3RhdHVzSWNvbiBleHRlbmRzIEhUTUxFbGVtZW50XG4gIGFjdGl2ZTogZmFsc2VcblxuICBpbml0aWFsaXplOiAoQHRlcm1pbmFsVmlldykgLT5cbiAgICBAY2xhc3NMaXN0LmFkZCAnZnVzaW9uLXRlcm1pbmFsLXN0YXR1cy1pY29uJ1xuXG4gICAgQGljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpJylcbiAgICBAaWNvbi5jbGFzc0xpc3QuYWRkICdpY29uJywgJ2ljb24tdGVybWluYWwnXG4gICAgQGFwcGVuZENoaWxkKEBpY29uKVxuXG4gICAgQG5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBAbmFtZS5jbGFzc0xpc3QuYWRkICduYW1lJ1xuICAgIEBhcHBlbmRDaGlsZChAbmFtZSlcblxuICAgIEBkYXRhc2V0LnR5cGUgPSBAdGVybWluYWxWaWV3LmNvbnN0cnVjdG9yPy5uYW1lXG5cbiAgICBAYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAoe3doaWNoLCBjdHJsS2V5fSkgPT5cbiAgICAgIGlmIHdoaWNoIGlzIDFcbiAgICAgICAgQHRlcm1pbmFsVmlldy50b2dnbGUoKVxuICAgICAgICB0cnVlXG4gICAgICBlbHNlIGlmIHdoaWNoIGlzIDJcbiAgICAgICAgQHRlcm1pbmFsVmlldy5kZXN0cm95KClcbiAgICAgICAgZmFsc2VcblxuICAgIEBzZXR1cFRvb2x0aXAoKVxuXG4gIHNldHVwVG9vbHRpcDogLT5cblxuICAgIG9uTW91c2VFbnRlciAgICAgICAgICAgICAgPSAoZXZlbnQpID0+XG4gICAgICByZXR1cm4gaWYgZXZlbnQuZGV0YWlsIGlzICd0ZXJtaW5hbC1mdXNpb24nXG4gICAgICBAdXBkYXRlVG9vbHRpcCgpXG5cbiAgICBAbW91c2VFbnRlclN1YnNjcmlwdGlvbiAgID0gZGlzcG9zZTogPT5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuICAgICAgQG1vdXNlRW50ZXJTdWJzY3JpcHRpb24gPSBudWxsXG5cbiAgICBAYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblxuICB1cGRhdGVUb29sdGlwOiAtPlxuICAgIEByZW1vdmVUb29sdGlwKClcblxuICAgIGlmIHByb2Nlc3MgPSBAdGVybWluYWxWaWV3LmdldFRlcm1pbmFsVGl0bGUoKVxuICAgICAgQHRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCB0aGlzLFxuICAgICAgICB0aXRsZTogcHJvY2Vzc1xuICAgICAgICBodG1sOiBmYWxzZVxuICAgICAgICBkZWxheTpcbiAgICAgICAgICBzaG93OiAxMDAwXG4gICAgICAgICAgaGlkZTogMTAwXG5cbiAgICBAZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ21vdXNlZW50ZXInLCBidWJibGVzOiB0cnVlLCBkZXRhaWw6ICd0ZXJtaW5hbC1mdXNpb24nKSlcblxuICByZW1vdmVUb29sdGlwOiAtPlxuICAgIEB0b29sdGlwLmRpc3Bvc2UoKSBpZiBAdG9vbHRpcFxuICAgIEB0b29sdGlwID0gbnVsbFxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHJlbW92ZVRvb2x0aXAoKVxuICAgIEBtb3VzZUVudGVyU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKSBpZiBAbW91c2VFbnRlclN1YnNjcmlwdGlvblxuICAgIEByZW1vdmUoKVxuXG4gIGFjdGl2YXRlOiAtPlxuICAgIEBjbGFzc0xpc3QuYWRkICdhY3RpdmUnXG4gICAgQGFjdGl2ZSA9IHRydWVcblxuICBpc0FjdGl2ZTogLT5cbiAgICBAY2xhc3NMaXN0LmNvbnRhaW5zICdhY3RpdmUnXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAY2xhc3NMaXN0LnJlbW92ZSAnYWN0aXZlJ1xuICAgIEBhY3RpdmUgPSBmYWxzZVxuXG4gIHRvZ2dsZTogLT5cbiAgICBpZiBAYWN0aXZlXG4gICAgICBAY2xhc3NMaXN0LnJlbW92ZSAnYWN0aXZlJ1xuICAgIGVsc2VcbiAgICAgIEBjbGFzc0xpc3QuYWRkICdhY3RpdmUnXG4gICAgQGFjdGl2ZSA9ICFAYWN0aXZlXG5cbiAgaXNBY3RpdmU6IC0+XG4gICAgcmV0dXJuIEBhY3RpdmVcblxuICByZW5hbWU6IC0+XG4gICAgUmVuYW1lRGlhbG9nID89IHJlcXVpcmUgJy4vcmVuYW1lLWRpYWxvZydcbiAgICBkaWFsb2cgPSBuZXcgUmVuYW1lRGlhbG9nIHRoaXNcbiAgICBkaWFsb2cuYXR0YWNoKClcblxuICBnZXROYW1lOiAtPiBAbmFtZS50ZXh0Q29udGVudC5zdWJzdHJpbmcoMSlcblxuICB1cGRhdGVOYW1lOiAobmFtZSkgLT5cbiAgICBpZiBuYW1lIGlzbnQgQGdldE5hbWUoKVxuICAgICAgbmFtZSA9IFwiJm5ic3A7XCIgKyBuYW1lIGlmIG5hbWVcbiAgICAgIEBuYW1lLmlubmVySFRNTCA9IG5hbWVcbiAgICAgIEB0ZXJtaW5hbFZpZXcuZW1pdCAnZGlkLWNoYW5nZS10aXRsZSdcblxubW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ2Z1c2lvbi10ZXJtaW5hbC1zdGF0dXMtaWNvbicsIHByb3RvdHlwZTogU3RhdHVzSWNvbi5wcm90b3R5cGUsIGV4dGVuZHM6ICdsaScpXG4iXX0=
