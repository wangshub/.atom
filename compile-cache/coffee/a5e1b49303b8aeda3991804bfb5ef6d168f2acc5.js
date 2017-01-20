(function() {
  module.exports = {
    statusBar: null,
    activate: function() {},
    deactivate: function() {
      var ref;
      if ((ref = this.statusBarTile) != null) {
        ref.destroy();
      }
      return this.statusBarTile = null;
    },
    provideRunInTerminal: function() {
      return {
        run: (function(_this) {
          return function(command) {
            return _this.statusBarTile.runCommandInNewTerminal(command);
          };
        })(this),
        getTerminalViews: (function(_this) {
          return function() {
            return _this.statusBarTile.terminalViews;
          };
        })(this)
      };
    },
    consumeStatusBar: function(statusBarProvider) {
      return this.statusBarTile = new (require('./status-bar'))(statusBarProvider);
    },
    config: {
      toggles: {
        type: 'object',
        order: 1,
        properties: {
          autoClose: {
            title: 'Close Terminal on Exit',
            description: 'Should the terminal close if the shell exits?',
            type: 'boolean',
            "default": false
          },
          cursorBlink: {
            title: 'Cursor Blink',
            description: 'Should the cursor blink when the terminal is active?',
            type: 'boolean',
            "default": true
          },
          runInsertedText: {
            title: 'Run Inserted Text',
            description: 'Run text inserted via `terminal-fusion:insert-text` as a command? **This will append an end-of-line character to input.**',
            type: 'boolean',
            "default": true
          }
        }
      },
      core: {
        type: 'object',
        order: 2,
        properties: {
          autoRunCommand: {
            title: 'Auto Run Command',
            description: 'Command to run on terminal initialization.',
            type: 'string',
            "default": ''
          },
          mapTerminalsTo: {
            title: 'Map Terminals To',
            description: 'Map terminals to each file or folder. Default is no action or mapping at all. **Restart required.**',
            type: 'string',
            "default": 'None',
            "enum": ['None', 'File', 'Folder']
          },
          mapTerminalsToAutoOpen: {
            title: 'Auto Open a New Terminal (For Terminal Mapping)',
            description: 'Should a new terminal be opened for new items? **Note:** This works in conjunction with `Map Terminals To` above.',
            type: 'boolean',
            "default": false
          },
          scrollback: {
            title: 'Scroll Back',
            description: 'How many lines of history should be kept?',
            type: 'integer',
            "default": 1000
          },
          shell: {
            title: 'Shell Override',
            description: 'Override the default shell instance to launch.',
            type: 'string',
            "default": (function() {
              var path;
              if (process.platform === 'win32') {
                path = require('path');
                return path.resolve(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
              } else {
                return process.env.SHELL;
              }
            })()
          },
          shellArguments: {
            title: 'Shell Arguments',
            description: 'Specify some arguments to use when launching the shell.',
            type: 'string',
            "default": ''
          },
          workingDirectory: {
            title: 'Working Directory',
            description: 'Which directory should be the present working directory when a new terminal is made?',
            type: 'string',
            "default": 'Active File',
            "enum": ['Home', 'Project', 'Active File']
          }
        }
      },
      style: {
        type: 'object',
        order: 3,
        properties: {
          animationSpeed: {
            title: 'Animation Speed',
            description: 'How fast should the window animate?',
            type: 'number',
            "default": '1',
            minimum: '0',
            maximum: '100'
          },
          fontFamily: {
            title: 'Font Family',
            description: 'Override the terminal\'s default font family. **You must use a [monospaced font](https://en.wikipedia.org/wiki/List_of_typefaces#Monospace)!**',
            type: 'string',
            "default": ''
          },
          fontSize: {
            title: 'Font Size',
            description: 'Override the terminal\'s default font size.',
            type: 'string',
            "default": ''
          },
          defaultPanelHeight: {
            title: 'Default Panel Height',
            description: 'Default height of a terminal panel. **You may enter a value in px, em, or %.**',
            type: 'string',
            "default": '300px'
          },
          theme: {
            title: 'Theme',
            description: 'Select a theme for the terminal.',
            type: 'string',
            "default": 'linux',
            "enum": ['standard', 'inverse', 'linux', 'grass', 'homebrew', 'man-page', 'novel', 'ocean', 'pro', 'red', 'red-sands', 'silver-aerogel', 'solarized-dark', 'solid-colors', 'dracula']
          }
        }
      },
      ansiColors: {
        type: 'object',
        order: 4,
        properties: {
          normal: {
            type: 'object',
            order: 1,
            properties: {
              black: {
                title: 'Black',
                description: 'Black color used for terminal ANSI color set.',
                type: 'color',
                "default": '#000000'
              },
              red: {
                title: 'Red',
                description: 'Red color used for terminal ANSI color set.',
                type: 'color',
                "default": '#CD0000'
              },
              green: {
                title: 'Green',
                description: 'Green color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00CD00'
              },
              yellow: {
                title: 'Yellow',
                description: 'Yellow color used for terminal ANSI color set.',
                type: 'color',
                "default": '#CDCD00'
              },
              blue: {
                title: 'Blue',
                description: 'Blue color used for terminal ANSI color set.',
                type: 'color',
                "default": '#0000CD'
              },
              magenta: {
                title: 'Magenta',
                description: 'Magenta color used for terminal ANSI color set.',
                type: 'color',
                "default": '#CD00CD'
              },
              cyan: {
                title: 'Cyan',
                description: 'Cyan color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00CDCD'
              },
              white: {
                title: 'White',
                description: 'White color used for terminal ANSI color set.',
                type: 'color',
                "default": '#E5E5E5'
              }
            }
          },
          zBright: {
            type: 'object',
            order: 2,
            properties: {
              brightBlack: {
                title: 'Bright Black',
                description: 'Bright black color used for terminal ANSI color set.',
                type: 'color',
                "default": '#7F7F7F'
              },
              brightRed: {
                title: 'Bright Red',
                description: 'Bright red color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FF0000'
              },
              brightGreen: {
                title: 'Bright Green',
                description: 'Bright green color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00FF00'
              },
              brightYellow: {
                title: 'Bright Yellow',
                description: 'Bright yellow color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FFFF00'
              },
              brightBlue: {
                title: 'Bright Blue',
                description: 'Bright blue color used for terminal ANSI color set.',
                type: 'color',
                "default": '#0000FF'
              },
              brightMagenta: {
                title: 'Bright Magenta',
                description: 'Bright magenta color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FF00FF'
              },
              brightCyan: {
                title: 'Bright Cyan',
                description: 'Bright cyan color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00FFFF'
              },
              brightWhite: {
                title: 'Bright White',
                description: 'Bright white color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FFFFFF'
              }
            }
          }
        }
      },
      iconColors: {
        type: 'object',
        order: 5,
        properties: {
          red: {
            title: 'Status Icon Red',
            description: 'Red color used for status icon.',
            type: 'color',
            "default": 'red'
          },
          orange: {
            title: 'Status Icon Orange',
            description: 'Orange color used for status icon.',
            type: 'color',
            "default": 'orange'
          },
          yellow: {
            title: 'Status Icon Yellow',
            description: 'Yellow color used for status icon.',
            type: 'color',
            "default": 'yellow'
          },
          green: {
            title: 'Status Icon Green',
            description: 'Green color used for status icon.',
            type: 'color',
            "default": 'green'
          },
          blue: {
            title: 'Status Icon Blue',
            description: 'Blue color used for status icon.',
            type: 'color',
            "default": 'blue'
          },
          purple: {
            title: 'Status Icon Purple',
            description: 'Purple color used for status icon.',
            type: 'color',
            "default": 'purple'
          },
          pink: {
            title: 'Status Icon Pink',
            description: 'Pink color used for status icon.',
            type: 'color',
            "default": 'hotpink'
          },
          cyan: {
            title: 'Status Icon Cyan',
            description: 'Cyan color used for status icon.',
            type: 'color',
            "default": 'cyan'
          },
          magenta: {
            title: 'Status Icon Magenta',
            description: 'Magenta color used for status icon.',
            type: 'color',
            "default": 'magenta'
          }
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvdGVybWluYWwtZnVzaW9uL2xpYi90ZXJtaW5hbC1mdXNpb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFNBQUEsRUFBVyxJQUFYO0lBRUEsUUFBQSxFQUFVLFNBQUEsR0FBQSxDQUZWO0lBSUEsVUFBQSxFQUFZLFNBQUE7QUFDVixVQUFBOztXQUFjLENBQUUsT0FBaEIsQ0FBQTs7YUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQjtJQUZQLENBSlo7SUFRQSxvQkFBQSxFQUFzQixTQUFBO2FBQ3BCO1FBQUEsR0FBQSxFQUFLLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsT0FBRDttQkFDSCxLQUFDLENBQUEsYUFBYSxDQUFDLHVCQUFmLENBQXVDLE9BQXZDO1VBREc7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUw7UUFFQSxnQkFBQSxFQUFrQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNoQixLQUFDLENBQUEsYUFBYSxDQUFDO1VBREM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRmxCOztJQURvQixDQVJ0QjtJQWNBLGdCQUFBLEVBQWtCLFNBQUMsaUJBQUQ7YUFDaEIsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxDQUFDLE9BQUEsQ0FBUSxjQUFSLENBQUQsQ0FBQSxDQUF5QixpQkFBekI7SUFETCxDQWRsQjtJQWlCQSxNQUFBLEVBQ0U7TUFBQSxPQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLEtBQUEsRUFBTyxDQURQO1FBRUEsVUFBQSxFQUNFO1VBQUEsU0FBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLHdCQUFQO1lBQ0EsV0FBQSxFQUFhLCtDQURiO1lBRUEsSUFBQSxFQUFNLFNBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7V0FERjtV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R0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQUhUO1dBcENGO1VBd0NBLE9BQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxxQkFBUDtZQUNBLFdBQUEsRUFBYSxxQ0FEYjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUhUO1dBekNGO1NBSEY7T0E5TUY7S0FsQkY7O0FBREYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gIHN0YXR1c0JhcjogbnVsbFxuXG4gIGFjdGl2YXRlOiAtPlxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN0YXR1c0JhclRpbGU/LmRlc3Ryb3koKVxuICAgIEBzdGF0dXNCYXJUaWxlID0gbnVsbFxuXG4gIHByb3ZpZGVSdW5JblRlcm1pbmFsOiAtPlxuICAgIHJ1bjogKGNvbW1hbmQpID0+XG4gICAgICBAc3RhdHVzQmFyVGlsZS5ydW5Db21tYW5kSW5OZXdUZXJtaW5hbCBjb21tYW5kXG4gICAgZ2V0VGVybWluYWxWaWV3czogKCkgPT5cbiAgICAgIEBzdGF0dXNCYXJUaWxlLnRlcm1pbmFsVmlld3NcblxuICBjb25zdW1lU3RhdHVzQmFyOiAoc3RhdHVzQmFyUHJvdmlkZXIpIC0+XG4gICAgQHN0YXR1c0JhclRpbGUgPSBuZXcgKHJlcXVpcmUgJy4vc3RhdHVzLWJhcicpKHN0YXR1c0JhclByb3ZpZGVyKVxuXG4gIGNvbmZpZzpcbiAgICB0b2dnbGVzOlxuICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgIG9yZGVyOiAxXG4gICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICBhdXRvQ2xvc2U6XG4gICAgICAgICAgdGl0bGU6ICdDbG9zZSBUZXJtaW5hbCBvbiBFeGl0J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdWxkIHRoZSB0ZXJtaW5hbCBjbG9zZSBpZiB0aGUgc2hlbGwgZXhpdHM/J1xuICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGN1cnNvckJsaW5rOlxuICAgICAgICAgIHRpdGxlOiAnQ3Vyc29yIEJsaW5rJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdWxkIHRoZSBjdXJzb3IgYmxpbmsgd2hlbiB0aGUgdGVybWluYWwgaXMgYWN0aXZlPydcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgIHJ1bkluc2VydGVkVGV4dDpcbiAgICAgICAgICB0aXRsZTogJ1J1biBJbnNlcnRlZCBUZXh0J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUnVuIHRleHQgaW5zZXJ0ZWQgdmlhIGB0ZXJtaW5hbC1mdXNpb246aW5zZXJ0LXRleHRgIGFzIGEgY29tbWFuZD8gKipUaGlzIHdpbGwgYXBwZW5kIGFuIGVuZC1vZi1saW5lIGNoYXJhY3RlciB0byBpbnB1dC4qKidcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgY29yZTpcbiAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICBvcmRlcjogMlxuICAgICAgcHJvcGVydGllczpcbiAgICAgICAgYXV0b1J1bkNvbW1hbmQ6XG4gICAgICAgICAgdGl0bGU6ICdBdXRvIFJ1biBDb21tYW5kJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ29tbWFuZCB0byBydW4gb24gdGVybWluYWwgaW5pdGlhbGl6YXRpb24uJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgbWFwVGVybWluYWxzVG86XG4gICAgICAgICAgdGl0bGU6ICdNYXAgVGVybWluYWxzIFRvJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTWFwIHRlcm1pbmFscyB0byBlYWNoIGZpbGUgb3IgZm9sZGVyLiBEZWZhdWx0IGlzIG5vIGFjdGlvbiBvciBtYXBwaW5nIGF0IGFsbC4gKipSZXN0YXJ0IHJlcXVpcmVkLioqJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJ05vbmUnXG4gICAgICAgICAgZW51bTogWydOb25lJywgJ0ZpbGUnLCAnRm9sZGVyJ11cbiAgICAgICAgbWFwVGVybWluYWxzVG9BdXRvT3BlbjpcbiAgICAgICAgICB0aXRsZTogJ0F1dG8gT3BlbiBhIE5ldyBUZXJtaW5hbCAoRm9yIFRlcm1pbmFsIE1hcHBpbmcpJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdWxkIGEgbmV3IHRlcm1pbmFsIGJlIG9wZW5lZCBmb3IgbmV3IGl0ZW1zPyAqKk5vdGU6KiogVGhpcyB3b3JrcyBpbiBjb25qdW5jdGlvbiB3aXRoIGBNYXAgVGVybWluYWxzIFRvYCBhYm92ZS4nXG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgc2Nyb2xsYmFjazpcbiAgICAgICAgICB0aXRsZTogJ1Njcm9sbCBCYWNrJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSG93IG1hbnkgbGluZXMgb2YgaGlzdG9yeSBzaG91bGQgYmUga2VwdD8nXG4gICAgICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICAgICAgZGVmYXVsdDogMTAwMFxuICAgICAgICBzaGVsbDpcbiAgICAgICAgICB0aXRsZTogJ1NoZWxsIE92ZXJyaWRlJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnT3ZlcnJpZGUgdGhlIGRlZmF1bHQgc2hlbGwgaW5zdGFuY2UgdG8gbGF1bmNoLidcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6IGRvIC0+XG4gICAgICAgICAgICBpZiBwcm9jZXNzLnBsYXRmb3JtIGlzICd3aW4zMidcbiAgICAgICAgICAgICAgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG4gICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShwcm9jZXNzLmVudi5TeXN0ZW1Sb290LCAnU3lzdGVtMzInLCAnV2luZG93c1Bvd2VyU2hlbGwnLCAndjEuMCcsICdwb3dlcnNoZWxsLmV4ZScpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHByb2Nlc3MuZW52LlNIRUxMXG4gICAgICAgIHNoZWxsQXJndW1lbnRzOlxuICAgICAgICAgIHRpdGxlOiAnU2hlbGwgQXJndW1lbnRzJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU3BlY2lmeSBzb21lIGFyZ3VtZW50cyB0byB1c2Ugd2hlbiBsYXVuY2hpbmcgdGhlIHNoZWxsLidcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICAgIHdvcmtpbmdEaXJlY3Rvcnk6XG4gICAgICAgICAgdGl0bGU6ICdXb3JraW5nIERpcmVjdG9yeSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1doaWNoIGRpcmVjdG9yeSBzaG91bGQgYmUgdGhlIHByZXNlbnQgd29ya2luZyBkaXJlY3Rvcnkgd2hlbiBhIG5ldyB0ZXJtaW5hbCBpcyBtYWRlPydcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdBY3RpdmUgRmlsZSdcbiAgICAgICAgICBlbnVtOiBbJ0hvbWUnLCAnUHJvamVjdCcsICdBY3RpdmUgRmlsZSddXG4gICAgc3R5bGU6XG4gICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgb3JkZXI6IDNcbiAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgIGFuaW1hdGlvblNwZWVkOlxuICAgICAgICAgIHRpdGxlOiAnQW5pbWF0aW9uIFNwZWVkJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSG93IGZhc3Qgc2hvdWxkIHRoZSB3aW5kb3cgYW5pbWF0ZT8nXG4gICAgICAgICAgdHlwZTogJ251bWJlcidcbiAgICAgICAgICBkZWZhdWx0OiAnMSdcbiAgICAgICAgICBtaW5pbXVtOiAnMCdcbiAgICAgICAgICBtYXhpbXVtOiAnMTAwJ1xuICAgICAgICBmb250RmFtaWx5OlxuICAgICAgICAgIHRpdGxlOiAnRm9udCBGYW1pbHknXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdPdmVycmlkZSB0aGUgdGVybWluYWxcXCdzIGRlZmF1bHQgZm9udCBmYW1pbHkuICoqWW91IG11c3QgdXNlIGEgW21vbm9zcGFjZWQgZm9udF0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGlzdF9vZl90eXBlZmFjZXMjTW9ub3NwYWNlKSEqKidcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICAgIGZvbnRTaXplOlxuICAgICAgICAgIHRpdGxlOiAnRm9udCBTaXplJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnT3ZlcnJpZGUgdGhlIHRlcm1pbmFsXFwncyBkZWZhdWx0IGZvbnQgc2l6ZS4nXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBkZWZhdWx0UGFuZWxIZWlnaHQ6XG4gICAgICAgICAgdGl0bGU6ICdEZWZhdWx0IFBhbmVsIEhlaWdodCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0RlZmF1bHQgaGVpZ2h0IG9mIGEgdGVybWluYWwgcGFuZWwuICoqWW91IG1heSBlbnRlciBhIHZhbHVlIGluIHB4LCBlbSwgb3IgJS4qKidcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICczMDBweCdcbiAgICAgICAgdGhlbWU6XG4gICAgICAgICAgdGl0bGU6ICdUaGVtZSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NlbGVjdCBhIHRoZW1lIGZvciB0aGUgdGVybWluYWwuJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJ2xpbnV4J1xuICAgICAgICAgIGVudW06IFtcbiAgICAgICAgICAgICdzdGFuZGFyZCcsXG4gICAgICAgICAgICAnaW52ZXJzZScsXG4gICAgICAgICAgICAnbGludXgnLFxuICAgICAgICAgICAgJ2dyYXNzJyxcbiAgICAgICAgICAgICdob21lYnJldycsXG4gICAgICAgICAgICAnbWFuLXBhZ2UnLFxuICAgICAgICAgICAgJ25vdmVsJyxcbiAgICAgICAgICAgICdvY2VhbicsXG4gICAgICAgICAgICAncHJvJyxcbiAgICAgICAgICAgICdyZWQnLFxuICAgICAgICAgICAgJ3JlZC1zYW5kcycsXG4gICAgICAgICAgICAnc2lsdmVyLWFlcm9nZWwnLFxuICAgICAgICAgICAgJ3NvbGFyaXplZC1kYXJrJyxcbiAgICAgICAgICAgICdzb2xpZC1jb2xvcnMnLFxuICAgICAgICAgICAgJ2RyYWN1bGEnXG4gICAgICAgICAgXVxuICAgIGFuc2lDb2xvcnM6XG4gICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgb3JkZXI6IDRcbiAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgIG5vcm1hbDpcbiAgICAgICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgICAgIG9yZGVyOiAxXG4gICAgICAgICAgcHJvcGVydGllczpcbiAgICAgICAgICAgIGJsYWNrOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JsYWNrJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JsYWNrIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzAwMDAwMCdcbiAgICAgICAgICAgIHJlZDpcbiAgICAgICAgICAgICAgdGl0bGU6ICdSZWQnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUmVkIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnI0NEMDAwMCdcbiAgICAgICAgICAgIGdyZWVuOlxuICAgICAgICAgICAgICB0aXRsZTogJ0dyZWVuJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0dyZWVuIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzAwQ0QwMCdcbiAgICAgICAgICAgIHllbGxvdzpcbiAgICAgICAgICAgICAgdGl0bGU6ICdZZWxsb3cnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnWWVsbG93IGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnI0NEQ0QwMCdcbiAgICAgICAgICAgIGJsdWU6XG4gICAgICAgICAgICAgIHRpdGxlOiAnQmx1ZSdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCbHVlIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzAwMDBDRCdcbiAgICAgICAgICAgIG1hZ2VudGE6XG4gICAgICAgICAgICAgIHRpdGxlOiAnTWFnZW50YSdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdNYWdlbnRhIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnI0NEMDBDRCdcbiAgICAgICAgICAgIGN5YW46XG4gICAgICAgICAgICAgIHRpdGxlOiAnQ3lhbidcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDeWFuIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzAwQ0RDRCdcbiAgICAgICAgICAgIHdoaXRlOlxuICAgICAgICAgICAgICB0aXRsZTogJ1doaXRlJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1doaXRlIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnI0U1RTVFNSdcbiAgICAgICAgekJyaWdodDpcbiAgICAgICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgICAgIG9yZGVyOiAyXG4gICAgICAgICAgcHJvcGVydGllczpcbiAgICAgICAgICAgIGJyaWdodEJsYWNrOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBCbGFjaydcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgYmxhY2sgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjN0Y3RjdGJ1xuICAgICAgICAgICAgYnJpZ2h0UmVkOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBSZWQnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IHJlZCBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNGRjAwMDAnXG4gICAgICAgICAgICBicmlnaHRHcmVlbjpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgR3JlZW4nXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IGdyZWVuIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzAwRkYwMCdcbiAgICAgICAgICAgIGJyaWdodFllbGxvdzpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgWWVsbG93J1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCB5ZWxsb3cgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjRkZGRjAwJ1xuICAgICAgICAgICAgYnJpZ2h0Qmx1ZTpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgQmx1ZSdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgYmx1ZSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMDAwRkYnXG4gICAgICAgICAgICBicmlnaHRNYWdlbnRhOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBNYWdlbnRhJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCBtYWdlbnRhIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnI0ZGMDBGRidcbiAgICAgICAgICAgIGJyaWdodEN5YW46XG4gICAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IEN5YW4nXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IGN5YW4gY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjMDBGRkZGJ1xuICAgICAgICAgICAgYnJpZ2h0V2hpdGU6XG4gICAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IFdoaXRlJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCB3aGl0ZSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNGRkZGRkYnXG4gICAgaWNvbkNvbG9yczpcbiAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICBvcmRlcjogNVxuICAgICAgcHJvcGVydGllczpcbiAgICAgICAgcmVkOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gUmVkJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUmVkIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ3JlZCdcbiAgICAgICAgb3JhbmdlOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gT3JhbmdlJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnT3JhbmdlIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ29yYW5nZSdcbiAgICAgICAgeWVsbG93OlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gWWVsbG93J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnWWVsbG93IGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ3llbGxvdydcbiAgICAgICAgZ3JlZW46XG4gICAgICAgICAgdGl0bGU6ICdTdGF0dXMgSWNvbiBHcmVlbidcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0dyZWVuIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ2dyZWVuJ1xuICAgICAgICBibHVlOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gQmx1ZSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JsdWUgY29sb3IgdXNlZCBmb3Igc3RhdHVzIGljb24uJ1xuICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICBkZWZhdWx0OiAnYmx1ZSdcbiAgICAgICAgcHVycGxlOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gUHVycGxlJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHVycGxlIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ3B1cnBsZSdcbiAgICAgICAgcGluazpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIFBpbmsnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdQaW5rIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ2hvdHBpbmsnXG4gICAgICAgIGN5YW46XG4gICAgICAgICAgdGl0bGU6ICdTdGF0dXMgSWNvbiBDeWFuJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ3lhbiBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdjeWFuJ1xuICAgICAgICBtYWdlbnRhOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gTWFnZW50YSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ01hZ2VudGEgY29sb3IgdXNlZCBmb3Igc3RhdHVzIGljb24uJ1xuICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICBkZWZhdWx0OiAnbWFnZW50YSdcbiJdfQ==
