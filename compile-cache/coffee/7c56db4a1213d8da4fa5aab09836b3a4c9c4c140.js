(function() {
  var CtagsProvider, checkSnippet, tagToSuggestion;

  checkSnippet = function(tag) {
    if (tag.kind === "require") {
      return tag.pattern.substring(2, tag.pattern.length - 2);
    }
    if (tag.kind === "function") {
      return tag.pattern.substring(tag.pattern.indexOf(tag.name), tag.pattern.length - 2);
    }
  };

  tagToSuggestion = function(tag) {
    return {
      text: tag.name,
      displayText: tag.pattern.substring(2, tag.pattern.length - 2),
      type: tag.kind,
      snippet: checkSnippet(tag)
    };
  };

  module.exports = CtagsProvider = (function() {
    var prefix_opt, tag_options;

    function CtagsProvider() {}

    CtagsProvider.prototype.selector = '*';

    tag_options = {
      partialMatch: true,
      maxItems: 10
    };

    prefix_opt = {
      wordRegex: /[a-zA-Z0-9_]+[\.\:]/
    };

    CtagsProvider.prototype.getSuggestions = function(arg) {
      var bufferPosition, editor, i, k, len, matches, output, prefix, scopeDescriptor, suggestions, tag;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      if (this.disabled) {
        return [];
      }
      if (prefix === "." || prefix === ":") {
        prefix = editor.getWordUnderCursor(prefix_opt);
      }
      if (!prefix.length) {
        return;
      }
      matches = this.ctagsCache.findTags(prefix, tag_options);
      suggestions = [];
      if (tag_options.partialMatch) {
        output = {};
        k = 0;
        while (k < matches.length) {
          tag = matches[k++];
          if (output[tag.name]) {
            continue;
          }
          output[tag.name] = tag;
          suggestions.push(tagToSuggestion(tag));
        }
        if (suggestions.length === 1 && suggestions[0].text === prefix) {
          return [];
        }
      } else {
        for (i = 0, len = matches.length; i < len; i++) {
          tag = matches[i];
          suggestions.push(tagToSuggestion(tag));
        }
      }
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };

    return CtagsProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvYXRvbS1jdGFncy9saWIvY3RhZ3MtcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxZQUFBLEdBQWUsU0FBQyxHQUFEO0lBRWIsSUFBRyxHQUFHLENBQUMsSUFBSixLQUFZLFNBQWY7QUFDRSxhQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBWixDQUFzQixDQUF0QixFQUF5QixHQUFHLENBQUMsT0FBTyxDQUFDLE1BQVosR0FBbUIsQ0FBNUMsRUFEVDs7SUFFQSxJQUFHLEdBQUcsQ0FBQyxJQUFKLEtBQVksVUFBZjtBQUNFLGFBQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFaLENBQXNCLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBWixDQUFvQixHQUFHLENBQUMsSUFBeEIsQ0FBdEIsRUFBcUQsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFaLEdBQW1CLENBQXhFLEVBRFQ7O0VBSmE7O0VBT2YsZUFBQSxHQUFrQixTQUFDLEdBQUQ7V0FDaEI7TUFBQSxJQUFBLEVBQU0sR0FBRyxDQUFDLElBQVY7TUFDQSxXQUFBLEVBQWEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFaLENBQXNCLENBQXRCLEVBQXlCLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBWixHQUFtQixDQUE1QyxDQURiO01BRUEsSUFBQSxFQUFNLEdBQUcsQ0FBQyxJQUZWO01BR0EsT0FBQSxFQUFTLFlBQUEsQ0FBYSxHQUFiLENBSFQ7O0VBRGdCOztFQU1sQixNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osUUFBQTs7Ozs0QkFBQSxRQUFBLEdBQVU7O0lBRVYsV0FBQSxHQUFjO01BQUUsWUFBQSxFQUFjLElBQWhCO01BQXNCLFFBQUEsRUFBVSxFQUFoQzs7O0lBQ2QsVUFBQSxHQUFhO01BQUMsU0FBQSxFQUFXLHFCQUFaOzs7NEJBRWIsY0FBQSxHQUFnQixTQUFDLEdBQUQ7QUFDZCxVQUFBO01BRGdCLHFCQUFRLHFDQUFnQix1Q0FBaUI7TUFDekQsSUFBYSxJQUFDLENBQUEsUUFBZDtBQUFBLGVBQU8sR0FBUDs7TUFFQSxJQUFHLE1BQUEsS0FBVSxHQUFWLElBQWlCLE1BQUEsS0FBVSxHQUE5QjtRQUNFLE1BQUEsR0FBUyxNQUFNLENBQUMsa0JBQVAsQ0FBMEIsVUFBMUIsRUFEWDs7TUFJQSxJQUFBLENBQWMsTUFBTSxDQUFDLE1BQXJCO0FBQUEsZUFBQTs7TUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQXFCLE1BQXJCLEVBQTZCLFdBQTdCO01BRVYsV0FBQSxHQUFjO01BQ2QsSUFBRyxXQUFXLENBQUMsWUFBZjtRQUNFLE1BQUEsR0FBUztRQUNULENBQUEsR0FBSTtBQUNKLGVBQU0sQ0FBQSxHQUFJLE9BQU8sQ0FBQyxNQUFsQjtVQUNFLEdBQUEsR0FBTSxPQUFRLENBQUEsQ0FBQSxFQUFBO1VBQ2QsSUFBWSxNQUFPLENBQUEsR0FBRyxDQUFDLElBQUosQ0FBbkI7QUFBQSxxQkFBQTs7VUFDQSxNQUFPLENBQUEsR0FBRyxDQUFDLElBQUosQ0FBUCxHQUFtQjtVQUNuQixXQUFXLENBQUMsSUFBWixDQUFpQixlQUFBLENBQWdCLEdBQWhCLENBQWpCO1FBSkY7UUFLQSxJQUFHLFdBQVcsQ0FBQyxNQUFaLEtBQXNCLENBQXRCLElBQTRCLFdBQVksQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUFmLEtBQXVCLE1BQXREO0FBQ0UsaUJBQU8sR0FEVDtTQVJGO09BQUEsTUFBQTtBQVdFLGFBQUEseUNBQUE7O1VBQ0UsV0FBVyxDQUFDLElBQVosQ0FBaUIsZUFBQSxDQUFnQixHQUFoQixDQUFqQjtBQURGLFNBWEY7O01BZUEsSUFBQSxDQUFjLFdBQVcsQ0FBQyxNQUExQjtBQUFBLGVBQUE7O0FBR0EsYUFBTztJQTlCTzs7Ozs7QUFwQmxCIiwic291cmNlc0NvbnRlbnQiOlsiY2hlY2tTbmlwcGV0ID0gKHRhZyktPlxuICAjVE9ETyBzdXBwb3J0IG1vcmUgbGFuZ3VhZ2VcbiAgaWYgdGFnLmtpbmQgPT0gXCJyZXF1aXJlXCJcbiAgICByZXR1cm4gdGFnLnBhdHRlcm4uc3Vic3RyaW5nKDIsIHRhZy5wYXR0ZXJuLmxlbmd0aC0yKVxuICBpZiB0YWcua2luZCA9PSBcImZ1bmN0aW9uXCJcbiAgICByZXR1cm4gdGFnLnBhdHRlcm4uc3Vic3RyaW5nKHRhZy5wYXR0ZXJuLmluZGV4T2YodGFnLm5hbWUpLCB0YWcucGF0dGVybi5sZW5ndGgtMilcbiAgICBcbnRhZ1RvU3VnZ2VzdGlvbiA9ICh0YWcpLT5cbiAgdGV4dDogdGFnLm5hbWVcbiAgZGlzcGxheVRleHQ6IHRhZy5wYXR0ZXJuLnN1YnN0cmluZygyLCB0YWcucGF0dGVybi5sZW5ndGgtMilcbiAgdHlwZTogdGFnLmtpbmRcbiAgc25pcHBldDogY2hlY2tTbmlwcGV0KHRhZylcbiAgICBcbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEN0YWdzUHJvdmlkZXJcbiAgc2VsZWN0b3I6ICcqJ1xuXG4gIHRhZ19vcHRpb25zID0geyBwYXJ0aWFsTWF0Y2g6IHRydWUsIG1heEl0ZW1zOiAxMCB9XG4gIHByZWZpeF9vcHQgPSB7d29yZFJlZ2V4OiAvW2EtekEtWjAtOV9dK1tcXC5cXDpdL31cblxuICBnZXRTdWdnZXN0aW9uczogKHtlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBzY29wZURlc2NyaXB0b3IsIHByZWZpeH0pIC0+XG4gICAgcmV0dXJuIFtdIGlmIEBkaXNhYmxlZFxuXG4gICAgaWYgcHJlZml4ID09IFwiLlwiIG9yIHByZWZpeCA9PSBcIjpcIlxuICAgICAgcHJlZml4ID0gZWRpdG9yLmdldFdvcmRVbmRlckN1cnNvcihwcmVmaXhfb3B0KVxuXG4gICAgIyBObyBwcmVmaXg/IERvbid0IGF1dG9jb21wbGV0ZSFcbiAgICByZXR1cm4gdW5sZXNzIHByZWZpeC5sZW5ndGhcblxuICAgIG1hdGNoZXMgPSBAY3RhZ3NDYWNoZS5maW5kVGFncyBwcmVmaXgsIHRhZ19vcHRpb25zXG5cbiAgICBzdWdnZXN0aW9ucyA9IFtdXG4gICAgaWYgdGFnX29wdGlvbnMucGFydGlhbE1hdGNoXG4gICAgICBvdXRwdXQgPSB7fVxuICAgICAgayA9IDBcbiAgICAgIHdoaWxlIGsgPCBtYXRjaGVzLmxlbmd0aFxuICAgICAgICB0YWcgPSBtYXRjaGVzW2srK11cbiAgICAgICAgY29udGludWUgaWYgb3V0cHV0W3RhZy5uYW1lXVxuICAgICAgICBvdXRwdXRbdGFnLm5hbWVdID0gdGFnXG4gICAgICAgIHN1Z2dlc3Rpb25zLnB1c2ggdGFnVG9TdWdnZXN0aW9uKHRhZylcbiAgICAgIGlmIHN1Z2dlc3Rpb25zLmxlbmd0aCA9PSAxIGFuZCBzdWdnZXN0aW9uc1swXS50ZXh0ID09IHByZWZpeFxuICAgICAgICByZXR1cm4gW11cbiAgICBlbHNlXG4gICAgICBmb3IgdGFnIGluIG1hdGNoZXNcbiAgICAgICAgc3VnZ2VzdGlvbnMucHVzaCB0YWdUb1N1Z2dlc3Rpb24odGFnKVxuXG4gICAgIyBObyBzdWdnZXN0aW9ucz8gRG9uJ3QgYXV0b2NvbXBsZXRlIVxuICAgIHJldHVybiB1bmxlc3Mgc3VnZ2VzdGlvbnMubGVuZ3RoXG5cbiAgICAjIE5vdyB3ZSdyZSByZWFkeSAtIGRpc3BsYXkgdGhlIHN1Z2dlc3Rpb25zXG4gICAgcmV0dXJuIHN1Z2dlc3Rpb25zXG4iXX0=
