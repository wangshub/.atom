(function() {
  var SymbolGenView;

  SymbolGenView = require('./symbol-gen-view');

  module.exports = {
    symbolGenView: null,
    activate: function(state) {
      return this.symbolGenView = new SymbolGenView(state.symbolGenViewState);
    },
    deactivate: function() {
      return this.symbolGenView.destroy();
    },
    serialize: function() {
      return {
        symbolGenViewState: this.symbolGenView.serialize()
      };
    },
    consumeStatusBar: function(statusBar) {
      return this.symbolGenView.consumeStatusBar(statusBar);
    },
    config: {
      tagFile: {
        type: 'string',
        "default": '.tags'
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvc3ltYm9sLWdlbi9saWIvc3ltYm9sLWdlbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLG1CQUFSOztFQUVoQixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsYUFBQSxFQUFlLElBQWY7SUFFQSxRQUFBLEVBQVUsU0FBQyxLQUFEO2FBQ1IsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxhQUFBLENBQWMsS0FBSyxDQUFDLGtCQUFwQjtJQURiLENBRlY7SUFLQSxVQUFBLEVBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO0lBRFUsQ0FMWjtJQVFBLFNBQUEsRUFBVyxTQUFBO2FBQ1Q7UUFBQSxrQkFBQSxFQUFvQixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQWYsQ0FBQSxDQUFwQjs7SUFEUyxDQVJYO0lBV0EsZ0JBQUEsRUFBa0IsU0FBQyxTQUFEO2FBQ2hCLElBQUMsQ0FBQSxhQUFhLENBQUMsZ0JBQWYsQ0FBZ0MsU0FBaEM7SUFEZ0IsQ0FYbEI7SUFjQSxNQUFBLEVBQ0U7TUFBQSxPQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FEVDtPQURGO0tBZkY7O0FBSEYiLCJzb3VyY2VzQ29udGVudCI6WyJTeW1ib2xHZW5WaWV3ID0gcmVxdWlyZSAnLi9zeW1ib2wtZ2VuLXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgc3ltYm9sR2VuVmlldzogbnVsbFxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQHN5bWJvbEdlblZpZXcgPSBuZXcgU3ltYm9sR2VuVmlldyhzdGF0ZS5zeW1ib2xHZW5WaWV3U3RhdGUpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3ltYm9sR2VuVmlldy5kZXN0cm95KClcblxuICBzZXJpYWxpemU6IC0+XG4gICAgc3ltYm9sR2VuVmlld1N0YXRlOiBAc3ltYm9sR2VuVmlldy5zZXJpYWxpemUoKVxuXG4gIGNvbnN1bWVTdGF0dXNCYXI6IChzdGF0dXNCYXIpIC0+XG4gICAgQHN5bWJvbEdlblZpZXcuY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXIpXG5cbiAgY29uZmlnOlxuICAgIHRhZ0ZpbGU6XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICcudGFncydcbiJdfQ==
