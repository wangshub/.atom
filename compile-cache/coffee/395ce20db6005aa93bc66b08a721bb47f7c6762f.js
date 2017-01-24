(function() {
  var ChineseSetting,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ChineseSetting = (function() {
    function ChineseSetting() {
      this.delay = bind(this.delay, this);
      var CSON;
      CSON = require('cson');
      this.M = CSON.load(__dirname + '/../def/menu_' + process.platform + '.cson');
      this.C = CSON.load(__dirname + '/../def/context.cson');
    }

    ChineseSetting.prototype.activate = function(state) {
      return setTimeout(this.delay, 0);
    };

    ChineseSetting.prototype.delay = function() {
      var config;
      config = atom.config.get('simplified-chinese-menu');
      if (config.useMenu) {
        this.updateMenu(atom.menu.template, this.M.Menu);
        atom.menu.update();
      }
      if (config.useContext) {
        this.updateContextMenu();
      }
      if (config.useSetting) {
        this.updateSettings();
        return atom.workspace.onDidChangeActivePaneItem((function(_this) {
          return function(item) {
            var chineseStatus, settingsTab;
            if (item && item.uri && item.uri.indexOf('atom://config') !== -1) {
              settingsTab = document.querySelector('.tab-bar [data-type="SettingsView"]');
              chineseStatus = settingsTab.getAttribute('inChinese');
              if (chineseStatus !== 'true') {
                settingsTab.setAttribute('inChinese', 'true');
                return _this.updateSettings(true);
              }
            }
          };
        })(this));
      }
    };

    ChineseSetting.prototype.updateMenu = function(menuList, def) {
      var i, key, len, menu, results, set;
      if (!def) {
        return;
      }
      results = [];
      for (i = 0, len = menuList.length; i < len; i++) {
        menu = menuList[i];
        if (!menu.label) {
          continue;
        }
        key = menu.label;
        if (key.indexOf('…' !== -1)) {
          key = key.replace('…', '...');
        }
        set = def[key];
        if (!set) {
          continue;
        }
        if (key === 'VERSION') {
          if (set != null) {
            menu.label = set.value + ' ' + atom.appVersion;
          }
        } else {
          if (set != null) {
            menu.label = set.value;
          }
        }
        if (menu.submenu != null) {
          results.push(this.updateMenu(menu.submenu, set.submenu));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    ChineseSetting.prototype.updateContextMenu = function() {
      var i, item, itemSet, label, len, ref, results, set;
      console.log('执行 updateContextMenu');
      ref = atom.contextMenu.itemSets;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        itemSet = ref[i];
        set = this.C.Context[itemSet.selector];
        if (!set) {
          continue;
        }
        results.push((function() {
          var j, len1, ref1, results1;
          ref1 = itemSet.items;
          results1 = [];
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            item = ref1[j];
            if (item.type === "separator") {
              continue;
            }
            label = set[item.command];
            if (label != null) {
              results1.push(item.label = label);
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        })());
      }
      return results;
    };

    ChineseSetting.prototype.updateSettings = function(onSettingsOpen) {
      if (onSettingsOpen == null) {
        onSettingsOpen = false;
      }
      return setTimeout(this.delaySettings, 0, onSettingsOpen);
    };

    ChineseSetting.prototype.delaySettings = function(onSettingsOpen) {
      var settings;
      settings = require('./../tools/settings');
      return settings.init();
    };

    ChineseSetting.prototype.config = {
      useMenu: {
        title: '汉化菜单',
        description: '如果你不希望汉化`菜单`部分可以关闭此处,设置后可能需要重启 Atom。',
        type: 'boolean',
        "default": true
      },
      useSetting: {
        title: '汉化设置',
        description: '如果你不希望汉化`设置`部分可以关闭此处,设置后可能需要重启 Atom。',
        type: 'boolean',
        "default": true
      },
      useContext: {
        title: '汉化右键菜单',
        description: '如果你不希望汉化`右键菜单`部分可以关闭此处,设置后可能需要重启 Atom。',
        type: 'boolean',
        "default": true
      }
    };

    return ChineseSetting;

  })();

  module.exports = new ChineseSetting();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvc2ltcGxpZmllZC1jaGluZXNlLW1lbnUvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxjQUFBO0lBQUE7O0VBQU07SUFFUyx3QkFBQTs7QUFDWCxVQUFBO01BQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSO01BRVAsSUFBQyxDQUFBLENBQUQsR0FBSyxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQUEsR0FBWSxlQUFaLEdBQTRCLE9BQU8sQ0FBQyxRQUFwQyxHQUE2QyxPQUF2RDtNQUVMLElBQUMsQ0FBQSxDQUFELEdBQUssSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFBLEdBQVksc0JBQXRCO0lBTE07OzZCQVFiLFFBQUEsR0FBVSxTQUFDLEtBQUQ7YUFDUixVQUFBLENBQVcsSUFBQyxDQUFBLEtBQVosRUFBa0IsQ0FBbEI7SUFEUTs7NkJBR1YsS0FBQSxHQUFPLFNBQUE7QUFDTCxVQUFBO01BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5QkFBaEI7TUFFVCxJQUFHLE1BQU0sQ0FBQyxPQUFWO1FBRUUsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQXRCLEVBQWdDLElBQUMsQ0FBQSxDQUFDLENBQUMsSUFBbkM7UUFDQSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQVYsQ0FBQSxFQUhGOztNQUtBLElBQUcsTUFBTSxDQUFDLFVBQVY7UUFFRSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxFQUZGOztNQUlBLElBQUcsTUFBTSxDQUFDLFVBQVY7UUFFRSxJQUFDLENBQUEsY0FBRCxDQUFBO2VBRUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBZixDQUF5QyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLElBQUQ7QUFDdkMsZ0JBQUE7WUFBQSxJQUFHLElBQUEsSUFB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QVVBLFVBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxRQUFQO1FBQ0EsV0FBQSxFQUFhLHdDQURiO1FBRUEsSUFBQSxFQUFNLFNBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7T0FYRjs7Ozs7OztFQWdCSixNQUFNLENBQUMsT0FBUCxHQUFxQixJQUFBLGNBQUEsQ0FBQTtBQXZGckIiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDaGluZXNlU2V0dGluZ1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIENTT04gPSByZXF1aXJlICdjc29uJ1xuICAgICPoj5zljZVcbiAgICBATSA9IENTT04ubG9hZCBfX2Rpcm5hbWUgKyAnLy4uL2RlZi9tZW51XycrcHJvY2Vzcy5wbGF0Zm9ybSsnLmNzb24nXG4gICAgI+WPs+mUruiPnOWNlVxuICAgIEBDID0gQ1NPTi5sb2FkIF9fZGlybmFtZSArICcvLi4vZGVmL2NvbnRleHQuY3NvbidcblxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgc2V0VGltZW91dChAZGVsYXksMClcblxuICBkZWxheTogKCkgPT5cbiAgICBjb25maWcgPSBhdG9tLmNvbmZpZy5nZXQgJ3NpbXBsaWZpZWQtY2hpbmVzZS1tZW51J1xuXG4gICAgaWYgY29uZmlnLnVzZU1lbnVcbiAgICAgICMgTWVudVxuICAgICAgQHVwZGF0ZU1lbnUoYXRvbS5tZW51LnRlbXBsYXRlLCBATS5NZW51KVxuICAgICAgYXRvbS5tZW51LnVwZGF0ZSgpXG5cbiAgICBpZiBjb25maWcudXNlQ29udGV4dFxuICAgICAgIyBDb250ZXh0TWVudVxuICAgICAgQHVwZGF0ZUNvbnRleHRNZW51KClcblxuICAgIGlmIGNvbmZpZy51c2VTZXR0aW5nXG4gICAgICAjIFNldHRpbmdzIChvbiBpbml0IGFuZCBvcGVuKVxuICAgICAgQHVwZGF0ZVNldHRpbmdzKClcbiAgICAgICPph43ovb3lkI7liIfmjaLov4fmnaXml7ZcbiAgICAgIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gKGl0ZW0pID0+XG4gICAgICAgIGlmIGl0ZW0gYW5kIGl0ZW0udXJpIGFuZCBpdGVtLnVyaS5pbmRleE9mKCdhdG9tOi8vY29uZmlnJykgaXNudCAtMVxuICAgICAgICAgIHNldHRpbmdzVGFiID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRhYi1iYXIgW2RhdGEtdHlwZT1cIlNldHRpbmdzVmlld1wiXScpXG4gICAgICAgICAgY2hpbmVzZVN0YXR1cyA9IHNldHRpbmdzVGFiLmdldEF0dHJpYnV0ZSgnaW5DaGluZXNlJylcbiAgICAgICAgICBpZiBjaGluZXNlU3RhdHVzIGlzbnQgJ3RydWUnXG4gICAgICAgICAgICBzZXR0aW5nc1RhYi5zZXRBdHRyaWJ1dGUoJ2luQ2hpbmVzZScsJ3RydWUnKVxuICAgICAgICAgICAgQHVwZGF0ZVNldHRpbmdzKHRydWUpXG5cbiAgdXBkYXRlTWVudSA6IChtZW51TGlzdCwgZGVmKSAtPlxuICAgIHJldHVybiBpZiBub3QgZGVmXG4gICAgZm9yIG1lbnUgaW4gbWVudUxpc3RcbiAgICAgIGNvbnRpbnVlIGlmIG5vdCBtZW51LmxhYmVsXG4gICAgICBrZXkgPSBtZW51LmxhYmVsXG4gICAgICBpZiBrZXkuaW5kZXhPZiAn4oCmJyBpc250IC0xXG4gICAgICAgIGtleSA9IGtleS5yZXBsYWNlKCfigKYnLCcuLi4nKVxuICAgICAgc2V0ID0gZGVmW2tleV1cbiAgICAgIGNvbnRpbnVlIGlmIG5vdCBzZXRcbiAgICAgIGlmIGtleSBpcyAnVkVSU0lPTidcbiAgICAgICAgbWVudS5sYWJlbCA9IHNldC52YWx1ZSsnICcrYXRvbS5hcHBWZXJzaW9uIGlmIHNldD9cbiAgICAgIGVsc2VcbiAgICAgICAgbWVudS5sYWJlbCA9IHNldC52YWx1ZSBpZiBzZXQ/XG4gICAgICBpZiBtZW51LnN1Ym1lbnU/XG4gICAgICAgIEB1cGRhdGVNZW51KG1lbnUuc3VibWVudSwgc2V0LnN1Ym1lbnUpXG5cbiAgdXBkYXRlQ29udGV4dE1lbnU6ICgpIC0+XG4gICAgY29uc29sZS5sb2cgJ+aJp+ihjCB1cGRhdGVDb250ZXh0TWVudSdcbiAgICBmb3IgaXRlbVNldCBpbiBhdG9tLmNvbnRleHRNZW51Lml0ZW1TZXRzXG4gICAgICBzZXQgPSBAQy5Db250ZXh0W2l0ZW1TZXQuc2VsZWN0b3JdXG4gICAgICBjb250aW51ZSBpZiBub3Qgc2V0XG4gICAgICBmb3IgaXRlbSBpbiBpdGVtU2V0Lml0ZW1zXG4gICAgICAgIGNvbnRpbnVlIGlmIGl0ZW0udHlwZSBpcyBcInNlcGFyYXRvclwiXG4gICAgICAgIGxhYmVsID0gc2V0W2l0ZW0uY29tbWFuZF1cbiAgICAgICAgaXRlbS5sYWJlbCA9IGxhYmVsIGlmIGxhYmVsP1xuXG4gIHVwZGF0ZVNldHRpbmdzOiAob25TZXR0aW5nc09wZW4gPSBmYWxzZSkgLT5cbiAgICBzZXRUaW1lb3V0KEBkZWxheVNldHRpbmdzLCAwLCBvblNldHRpbmdzT3BlbilcblxuICBkZWxheVNldHRpbmdzOiAob25TZXR0aW5nc09wZW4pIC0+XG4gICAgc2V0dGluZ3MgPSByZXF1aXJlICcuLy4uL3Rvb2xzL3NldHRpbmdzJ1xuICAgIHNldHRpbmdzLmluaXQoKVxuXG4gIGNvbmZpZzpcbiAgICB1c2VNZW51OlxuICAgICAgdGl0bGU6ICfmsYnljJboj5zljZUnXG4gICAgICBkZXNjcmlwdGlvbjogJ+WmguaenOS9oOS4jeW4jOacm+axieWMlmDoj5zljZVg6YOo5YiG5Y+v5Lul5YWz6Zet5q2k5aSELOiuvue9ruWQjuWPr+iDvemcgOimgemHjeWQryBBdG9t44CCJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgdXNlU2V0dGluZzpcbiAgICAgIHRpdGxlOiAn5rGJ5YyW6K6+572uJ1xuICAgICAgZGVzY3JpcHRpb246ICflpoLmnpzkvaDkuI3luIzmnJvmsYnljJZg6K6+572uYOmDqOWIhuWPr+S7peWFs+mXreatpOWkhCzorr7nva7lkI7lj6/og73pnIDopoHph43lkK8gQXRvbeOAgidcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIHVzZUNvbnRleHQ6XG4gICAgICB0aXRsZTogJ+axieWMluWPs+mUruiPnOWNlSdcbiAgICAgIGRlc2NyaXB0aW9uOiAn5aaC5p6c5L2g5LiN5biM5pyb5rGJ5YyWYOWPs+mUruiPnOWNlWDpg6jliIblj6/ku6XlhbPpl63mraTlpIQs6K6+572u5ZCO5Y+v6IO96ZyA6KaB6YeN5ZCvIEF0b23jgIInXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgQ2hpbmVzZVNldHRpbmcoKVxuIl19
