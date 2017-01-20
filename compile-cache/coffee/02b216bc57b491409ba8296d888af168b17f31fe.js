(function() {
  var Dialog, InputDialog, os,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Dialog = require("./dialog");

  os = require("os");

  module.exports = InputDialog = (function(superClass) {
    extend(InputDialog, superClass);

    function InputDialog(terminalView) {
      this.terminalView = terminalView;
      InputDialog.__super__.constructor.call(this, {
        prompt: "Insert Text",
        iconClass: "icon-keyboard",
        stayOpen: true
      });
    }

    InputDialog.prototype.onConfirm = function(input) {
      var data, eol;
      if (atom.config.get('terminal-plus.toggles.runInsertedText')) {
        eol = os.EOL;
      } else {
        eol = '';
      }
      data = "" + input + eol;
      this.terminalView.input(data);
      return this.cancel();
    };

    return InputDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvdGVybWluYWwtcGx1cy9saWIvaW5wdXQtZGlhbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTs7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUNULEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFFTCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7SUFDUyxxQkFBQyxZQUFEO01BQUMsSUFBQyxDQUFBLGVBQUQ7TUFDWiw2Q0FDRTtRQUFBLE1BQUEsRUFBUSxhQUFSO1FBQ0EsU0FBQSxFQUFXLGVBRFg7UUFFQSxRQUFBLEVBQVUsSUFGVjtPQURGO0lBRFc7OzBCQU1iLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFDVCxVQUFBO01BQUEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUNBQWhCLENBQUg7UUFDRSxHQUFBLEdBQU0sRUFBRSxDQUFDLElBRFg7T0FBQSxNQUFBO1FBR0UsR0FBQSxHQUFNLEdBSFI7O01BS0EsSUFBQSxHQUFPLEVBQUEsR0FBRyxLQUFILEdBQVc7TUFDbEIsSUFBQyxDQUFBLFlBQVksQ0FBQyxLQUFkLENBQW9CLElBQXBCO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQVJTOzs7O0tBUGE7QUFKMUIiLCJzb3VyY2VzQ29udGVudCI6WyJEaWFsb2cgPSByZXF1aXJlIFwiLi9kaWFsb2dcIlxub3MgPSByZXF1aXJlIFwib3NcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBJbnB1dERpYWxvZyBleHRlbmRzIERpYWxvZ1xuICBjb25zdHJ1Y3RvcjogKEB0ZXJtaW5hbFZpZXcpIC0+XG4gICAgc3VwZXJcbiAgICAgIHByb21wdDogXCJJbnNlcnQgVGV4dFwiXG4gICAgICBpY29uQ2xhc3M6IFwiaWNvbi1rZXlib2FyZFwiXG4gICAgICBzdGF5T3BlbjogdHJ1ZVxuXG4gIG9uQ29uZmlybTogKGlucHV0KSAtPlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgndGVybWluYWwtcGx1cy50b2dnbGVzLnJ1bkluc2VydGVkVGV4dCcpXG4gICAgICBlb2wgPSBvcy5FT0xcbiAgICBlbHNlXG4gICAgICBlb2wgPSAnJ1xuXG4gICAgZGF0YSA9IFwiI3tpbnB1dH0je2VvbH1cIlxuICAgIEB0ZXJtaW5hbFZpZXcuaW5wdXQgZGF0YVxuICAgIEBjYW5jZWwoKVxuIl19
