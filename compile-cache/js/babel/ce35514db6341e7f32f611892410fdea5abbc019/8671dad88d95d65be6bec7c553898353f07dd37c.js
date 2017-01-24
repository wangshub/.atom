Object.defineProperty(exports, '__esModule', {
	value: true
});

var _this = this;

exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/** @babel */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atom = require('atom');

var _reqFrom = require('req-from');

var _loophole = require('loophole');

var SUPPORTED_SCOPES = ['source.js', 'source.jsx', 'source.js.jsx'];

function init(editor, onSave) {
	var fp = editor.getPath();

	var esformatter = undefined;
	(0, _loophole.allowUnsafeNewFunction)(function () {
		esformatter = (0, _reqFrom.silent)(_path2['default'].dirname(fp), 'esformatter') || require('esformatter');
	});

	var selectedText = onSave ? null : editor.getSelectedText();
	var text = selectedText || editor.getText();

	var retText = '';

	try {
		retText = esformatter.format(text, esformatter.rc(fp));
	} catch (err) {
		console.error(err);
		atom.notifications.addError('esformatter', { detail: err.message });
		return;
	}

	var editorEl = atom.views.getView(editor);
	var cursorPosition = editor.getCursorBufferPosition();
	var line = editorEl.getFirstVisibleScreenRow() + editor.displayBuffer.getVerticalScrollMargin();

	if (selectedText) {
		editor.setTextInBufferRange(editor.getSelectedBufferRange(), retText);
	} else {
		editor.getBuffer().setTextViaDiff(retText);
	}

	editor.setCursorBufferPosition(cursorPosition);

	if (editor.getScreenLineCount() > line) {
		editor.scrollToScreenPosition([line, 0]);
	}
}

var config = {
	formatOnSave: {
		type: 'boolean',
		'default': false
	}
};

exports.config = config;

function deactivate() {
	this.subscriptions.dispose();
}

var activate = function activate() {
	_this.subscriptions = new _atom.CompositeDisposable();

	_this.subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
		editor.getBuffer().onWillSave(function () {
			var isJS = SUPPORTED_SCOPES.includes(editor.getGrammar().scopeName);

			if (isJS && atom.config.get('esformatter.formatOnSave')) {
				init(editor, true);
			}
		});
	}));

	_this.subscriptions.add(atom.commands.add('atom-workspace', 'esformatter', function () {
		var editor = atom.workspace.getActiveTextEditor();

		if (editor) {
			init(editor);
		}
	}));
};
exports.activate = activate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3dhbmdzLy5hdG9tL3BhY2thZ2VzL2VzZm9ybWF0dGVyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztvQkFDaUIsTUFBTTs7OztvQkFDVyxNQUFNOzt1QkFDUixVQUFVOzt3QkFDTCxVQUFVOztBQUUvQyxJQUFNLGdCQUFnQixHQUFHLENBQ3hCLFdBQVcsRUFDWCxZQUFZLEVBQ1osZUFBZSxDQUNmLENBQUM7O0FBRUYsU0FBUyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUM3QixLQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRTVCLEtBQUksV0FBVyxZQUFBLENBQUM7QUFDaEIsdUNBQXVCLFlBQU07QUFDNUIsYUFBVyxHQUFHLHFCQUFRLGtCQUFLLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxhQUFhLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7RUFDakYsQ0FBQyxDQUFDOztBQUVILEtBQU0sWUFBWSxHQUFHLE1BQU0sR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQzlELEtBQU0sSUFBSSxHQUFHLFlBQVksSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRTlDLEtBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQzs7QUFFakIsS0FBSTtBQUNILFNBQU8sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDdkQsQ0FBQyxPQUFPLEdBQUcsRUFBRTtBQUNiLFNBQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkIsTUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDO0FBQ2xFLFNBQU87RUFDUDs7QUFFRCxLQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM1QyxLQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztBQUN4RCxLQUFNLElBQUksR0FBRyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLHVCQUF1QixFQUFFLENBQUM7O0FBRWxHLEtBQUksWUFBWSxFQUFFO0FBQ2pCLFFBQU0sQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztFQUN0RSxNQUFNO0FBQ04sUUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztFQUMzQzs7QUFFRCxPQUFNLENBQUMsdUJBQXVCLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBRS9DLEtBQUksTUFBTSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsSUFBSSxFQUFFO0FBQ3ZDLFFBQU0sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3pDO0NBQ0Q7O0FBRU0sSUFBTSxNQUFNLEdBQUc7QUFDckIsYUFBWSxFQUFFO0FBQ2IsTUFBSSxFQUFFLFNBQVM7QUFDZixhQUFTLEtBQUs7RUFDZDtDQUNELENBQUM7Ozs7QUFFSyxTQUFTLFVBQVUsR0FBRztBQUM1QixLQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0NBQzdCOztBQUVNLElBQU0sUUFBUSxHQUFHLFNBQVgsUUFBUSxHQUFTO0FBQzdCLE9BQUssYUFBYSxHQUFHLCtCQUF5QixDQUFDOztBQUUvQyxPQUFLLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUNsRSxRQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsVUFBVSxDQUFDLFlBQU07QUFDbkMsT0FBTSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFdEUsT0FBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsRUFBRTtBQUN4RCxRQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25CO0dBQ0QsQ0FBQyxDQUFDO0VBQ0gsQ0FBQyxDQUFDLENBQUM7O0FBRUosT0FBSyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxZQUFNO0FBQy9FLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzs7QUFFcEQsTUFBSSxNQUFNLEVBQUU7QUFDWCxPQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDYjtFQUNELENBQUMsQ0FBQyxDQUFDO0NBQ0osQ0FBQyIsImZpbGUiOiIvaG9tZS93YW5ncy8uYXRvbS9wYWNrYWdlcy9lc2Zvcm1hdHRlci9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7c2lsZW50IGFzIHJlcUZyb219IGZyb20gJ3JlcS1mcm9tJztcbmltcG9ydCB7YWxsb3dVbnNhZmVOZXdGdW5jdGlvbn0gZnJvbSAnbG9vcGhvbGUnO1xuXG5jb25zdCBTVVBQT1JURURfU0NPUEVTID0gW1xuXHQnc291cmNlLmpzJyxcblx0J3NvdXJjZS5qc3gnLFxuXHQnc291cmNlLmpzLmpzeCdcbl07XG5cbmZ1bmN0aW9uIGluaXQoZWRpdG9yLCBvblNhdmUpIHtcblx0Y29uc3QgZnAgPSBlZGl0b3IuZ2V0UGF0aCgpO1xuXG5cdGxldCBlc2Zvcm1hdHRlcjtcblx0YWxsb3dVbnNhZmVOZXdGdW5jdGlvbigoKSA9PiB7XG5cdFx0ZXNmb3JtYXR0ZXIgPSByZXFGcm9tKHBhdGguZGlybmFtZShmcCksICdlc2Zvcm1hdHRlcicpIHx8IHJlcXVpcmUoJ2VzZm9ybWF0dGVyJyk7XG5cdH0pO1xuXG5cdGNvbnN0IHNlbGVjdGVkVGV4dCA9IG9uU2F2ZSA/IG51bGwgOiBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCk7XG5cdGNvbnN0IHRleHQgPSBzZWxlY3RlZFRleHQgfHwgZWRpdG9yLmdldFRleHQoKTtcblxuXHRsZXQgcmV0VGV4dCA9ICcnO1xuXG5cdHRyeSB7XG5cdFx0cmV0VGV4dCA9IGVzZm9ybWF0dGVyLmZvcm1hdCh0ZXh0LCBlc2Zvcm1hdHRlci5yYyhmcCkpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHRjb25zb2xlLmVycm9yKGVycik7XG5cdFx0YXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdlc2Zvcm1hdHRlcicsIHtkZXRhaWw6IGVyci5tZXNzYWdlfSk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3QgZWRpdG9yRWwgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKTtcblx0Y29uc3QgY3Vyc29yUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKTtcblx0Y29uc3QgbGluZSA9IGVkaXRvckVsLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpICsgZWRpdG9yLmRpc3BsYXlCdWZmZXIuZ2V0VmVydGljYWxTY3JvbGxNYXJnaW4oKTtcblxuXHRpZiAoc2VsZWN0ZWRUZXh0KSB7XG5cdFx0ZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKCksIHJldFRleHQpO1xuXHR9IGVsc2Uge1xuXHRcdGVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0VmlhRGlmZihyZXRUZXh0KTtcblx0fVxuXG5cdGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihjdXJzb3JQb3NpdGlvbik7XG5cblx0aWYgKGVkaXRvci5nZXRTY3JlZW5MaW5lQ291bnQoKSA+IGxpbmUpIHtcblx0XHRlZGl0b3Iuc2Nyb2xsVG9TY3JlZW5Qb3NpdGlvbihbbGluZSwgMF0pO1xuXHR9XG59XG5cbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XG5cdGZvcm1hdE9uU2F2ZToge1xuXHRcdHR5cGU6ICdib29sZWFuJyxcblx0XHRkZWZhdWx0OiBmYWxzZVxuXHR9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcblx0dGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbn1cblxuZXhwb3J0IGNvbnN0IGFjdGl2YXRlID0gKCkgPT4ge1xuXHR0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG5cdHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKGVkaXRvciA9PiB7XG5cdFx0ZWRpdG9yLmdldEJ1ZmZlcigpLm9uV2lsbFNhdmUoKCkgPT4ge1xuXHRcdFx0Y29uc3QgaXNKUyA9IFNVUFBPUlRFRF9TQ09QRVMuaW5jbHVkZXMoZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpO1xuXG5cdFx0XHRpZiAoaXNKUyAmJiBhdG9tLmNvbmZpZy5nZXQoJ2VzZm9ybWF0dGVyLmZvcm1hdE9uU2F2ZScpKSB7XG5cdFx0XHRcdGluaXQoZWRpdG9yLCB0cnVlKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSkpO1xuXG5cdHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2VzZm9ybWF0dGVyJywgKCkgPT4ge1xuXHRcdGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcblxuXHRcdGlmIChlZGl0b3IpIHtcblx0XHRcdGluaXQoZWRpdG9yKTtcblx0XHR9XG5cdH0pKTtcbn07XG4iXX0=