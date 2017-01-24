(function() {
  var CSON, S, Settings, applyButtonToolbar, applyHtmlWithOrg, applyInstallPanelOnSwitch, applySectionHeadings, applySpecialHeading, applyTextContentBySettingsId, applyTextWithOrg, applyToPanel, getTextMatchElement, isAlreadyLocalized;

  CSON = require('cson');

  S = CSON.load(__dirname + '/../def/settings.cson');

  applyToPanel = function(e) {
    var d, i, info, inst, len, ref, span, sv, tc, tp1, tp2;
    ref = S.Settings.settings;
    for (i = 0, len = ref.length; i < len; i++) {
      d = ref[i];
      applyTextContentBySettingsId(d);
    }
    sv = document.querySelector('.settings-view');
    sv.querySelector('#core-settings-note').innerHTML = "下述为Atom核心部分的设置，个别扩展包可能拥有额外独立设置，浏览扩展包设置请在 <a class='link packages-open'>扩展包列表</a> 中选择对应名称扩展的设置。";
    sv.querySelector('#editor-settings-note').innerHTML = "下述为Atom文本编辑器部分的设置，其中一些设置将会基于每个语言覆盖，检查语言设置请在 <a class='link packages-open'>扩展包列表</a> 中选择对应语言扩展的设置。";
    sv.querySelector('[title="System Settings"]').closest('.panels-item').querySelector('.text').innerHTML = "这些设置可以将Atom集成到你的操作系统中。";
    info = sv.querySelector('.keybinding-panel>div:nth-child(2)');
    if (!isAlreadyLocalized(info)) {
      info.querySelector('span:nth-child(2)').textContent = "您可以覆盖这些按键绑定通过复制　";
      info.querySelector('span:nth-child(4)').textContent = "并且粘贴进";
      info.querySelector('a.link').textContent = " 用户键盘映射 ";
      span = document.createElement('span');
      span.textContent = "进行修改。";
      info.appendChild(span);
      info.setAttribute('data-localized', 'true');
    }
    info = sv.querySelector('.themes-panel>div>div:nth-child(2)');
    if (!isAlreadyLocalized(info)) {
      info.querySelector('span').textContent = "您也可以在";
      info.querySelector('a.link').textContent = " 用户样式设置 ";
      span = document.createElement('span');
      span.textContent = "中扩展 Atom 的样式。";
      info.appendChild(span);
      tp1 = sv.querySelector('.themes-picker>div:nth-child(1)');
      tp1.querySelector('.setting-title').textContent = "UI 主题";
      tp1.querySelector('.setting-description').textContent = "该主题将应用在标签，状态栏，树形视图和下拉菜单等。";
      tp2 = sv.querySelector('.themes-picker>div:nth-child(2)');
      tp2.querySelector('.setting-title').textContent = "语法主题";
      tp2.querySelector('.setting-description').textContent = "该主题将应用在编辑器内的文本。";
      info.setAttribute('data-localized', 'true');
    }
    applySpecialHeading(sv, "Available Updates", 2, "可用更新");
    applyTextWithOrg(sv.querySelector('.update-all-button.btn-primary'), "全部更新");
    applyTextWithOrg(sv.querySelector('.update-all-button:not(.btn-primary)'), "检查更新");
    applyTextWithOrg(sv.querySelector('.alert.icon-hourglass'), "检查更新中...");
    applyTextWithOrg(sv.querySelector('.alert.icon-heart'), "已安装的扩展都是最新的!");
    applySectionHeadings();
    inst = document.querySelector('div.section:not(.themes-panel)');
    info = inst.querySelector('.native-key-bindings');
    if (!isAlreadyLocalized(info)) {
      info.querySelector('span:nth-child(2)').textContent = "扩展·主题 ";
      tc = info.querySelector('span:nth-child(4)');
      tc.textContent = tc.textContent.replace("and are installed to", "它们将被安装在 ");
      info.setAttribute('data-localized', 'true');
    }
    applyTextWithOrg(inst.querySelector('.search-container .btn:nth-child(1)'), "扩展");
    applyTextWithOrg(inst.querySelector('.search-container .btn:nth-child(2)'), "主题");
    return applyButtonToolbar();
  };

  applyInstallPanelOnSwitch = function() {
    var info, inst;
    applySectionHeadings(true);
    applyButtonToolbar();
    inst = document.querySelector('div.section:not(.themes-panel)');
    info = inst.querySelector('.native-key-bindings');
    return info.querySelector('span:nth-child(2)').textContent = "扩展·主题 ";
  };

  applySpecialHeading = function(area, org, childIdx, text) {
    var sh, span;
    sh = getTextMatchElement(area, '.section-heading', org);
    if (!(sh && !isAlreadyLocalized(sh))) {
      return;
    }
    sh.childNodes[childIdx].textContent = null;
    span = document.createElement('span');
    span.textContent = org;
    applyTextWithOrg(span, text);
    return sh.appendChild(span);
  };

  applySectionHeadings = function(force) {
    var el, i, j, len, len1, ref, ref1, results, sh, sv;
    sv = document.querySelector('.settings-view');
    ref = S.Settings.sectionHeadings;
    for (i = 0, len = ref.length; i < len; i++) {
      sh = ref[i];
      el = getTextMatchElement(sv, '.section-heading', sh.label);
      if (!el) {
        continue;
      }
      if (!isAlreadyLocalized(el) && force) {
        applyTextWithOrg(el, sh.value);
      }
    }
    ref1 = S.Settings.subSectionHeadings;
    results = [];
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      sh = ref1[j];
      el = getTextMatchElement(sv, '.sub-section-heading', sh.label);
      if (!el) {
        continue;
      }
      if (!isAlreadyLocalized(el) && force) {
        results.push(applyTextWithOrg(el, sh.value));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  applyButtonToolbar = function() {
    var btn, i, j, k, l, len, len1, len2, len3, len4, m, ref, ref1, ref2, ref3, ref4, results, sv;
    sv = document.querySelector('.settings-view');
    ref = sv.querySelectorAll('.meta-controls .install-button');
    for (i = 0, len = ref.length; i < len; i++) {
      btn = ref[i];
      applyTextWithOrg(btn, "安装");
    }
    ref1 = sv.querySelectorAll('.meta-controls .settings');
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      btn = ref1[j];
      applyTextWithOrg(btn, "设置");
    }
    ref2 = sv.querySelectorAll('.meta-controls .uninstall-button');
    for (k = 0, len2 = ref2.length; k < len2; k++) {
      btn = ref2[k];
      applyTextWithOrg(btn, "卸载");
    }
    ref3 = sv.querySelectorAll('.meta-controls .icon-playback-pause span');
    for (l = 0, len3 = ref3.length; l < len3; l++) {
      btn = ref3[l];
      applyTextWithOrg(btn, "关闭");
    }
    ref4 = sv.querySelectorAll('.meta-controls .icon-playback-play span');
    results = [];
    for (m = 0, len4 = ref4.length; m < len4; m++) {
      btn = ref4[m];
      results.push(applyTextWithOrg(btn, "启用"));
    }
    return results;
  };

  getTextMatchElement = function(area, query, text) {
    var el, elems, i, len, result;
    elems = area.querySelectorAll(query);
    result;
    for (i = 0, len = elems.length; i < len; i++) {
      el = elems[i];
      if (el.textContent.includes(text)) {
        result = el;
        break;
      }
    }
    return result;
  };

  isAlreadyLocalized = function(elem) {
    var localized;
    if (elem) {
      localized = elem.getAttribute('data-localized');
    }
    return localized === 'true';
  };

  applyTextContentBySettingsId = function(data) {
    var before, ctrl, el, i, len, opt, options, results;
    el = document.querySelector("[id='" + data.id + "']");
    if (!el) {
      return;
    }
    ctrl = el.closest('.control-group');
    applyTextWithOrg(ctrl.querySelector('.setting-title'), data.title);
    applyHtmlWithOrg(ctrl.querySelector('.setting-description'), data.desc);
    if (data.selectOptions) {
      options = el.querySelectorAll('option');
      results = [];
      for (i = 0, len = options.length; i < len; i++) {
        opt = options[i];
        before = String(opt.textContent);
        results.push(applyTextWithOrg(opt, data.selectOptions[before].value));
      }
      return results;
    }
  };

  applyTextWithOrg = function(elem, text) {
    var before;
    if (!text) {
      return;
    }
    before = String(elem.textContent);
    if (before === text) {
      return;
    }
    elem.textContent = text;
    elem.setAttribute('title', before);
    return elem.setAttribute('data-localized', 'true');
  };

  applyHtmlWithOrg = function(elem, text) {
    var before;
    if (!text) {
      return;
    }
    before = String(elem.textContent);
    if (before === text) {
      return;
    }
    elem.innerHTML = text;
    elem.setAttribute('title', before);
    return elem.setAttribute('data-localized', 'true');
  };

  Settings = {
    init: function() {
      var btn, btns, d, e, el, ext, font, i, j, k, lastMenu, len, len1, len2, menu, panelMenus, pm, ref, results, settingsEnabled, settingsTab, sv;
      settingsTab = document.querySelector('.tab-bar [data-type="SettingsView"]');
      if (settingsTab) {
        settingsEnabled = settingsTab.className.includes('active');
      }
      if (!(settingsTab && settingsEnabled)) {
        return;
      }
      try {
        sv = document.querySelector('.settings-view');
        if (process.platform === 'win32') {
          font = atom.config.get('editor.fontFamily');
          if (font) {
            sv.style["fontFamily"] = font;
          } else {
            sv.style["fontFamily"] = "'Segoe UI', Microsoft Yahei, sans-serif";
            sv.style["fontSize"] = "12px";
          }
        }
        lastMenu = sv.querySelector('.panels-menu .active a');
        panelMenus = sv.querySelectorAll('.settings-view .panels-menu li a');
        for (i = 0, len = panelMenus.length; i < len; i++) {
          pm = panelMenus[i];
          pm.click();
          pm.addEventListener('click', applyInstallPanelOnSwitch);
        }
        if (lastMenu) {
          lastMenu.click();
        }
        applyToPanel();
        menu = sv.querySelector('.settings-view .panels-menu');
        if (!menu) {
          return;
        }
        ref = S.Settings.menu;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          d = ref[j];
          el = menu.querySelector("[name='" + d.label + "']>a");
          applyTextWithOrg(el, d.value);
        }
        ext = sv.querySelector('.settings-view .icon-link-external');
        applyTextWithOrg(ext, "打开插件源码目录");
        btns = sv.querySelectorAll('div.section:not(.themes-panel) .search-container .btn');
        results = [];
        for (k = 0, len2 = btns.length; k < len2; k++) {
          btn = btns[k];
          results.push(btn.addEventListener('click', applyInstallPanelOnSwitch));
        }
        return results;
      } catch (error) {
        e = error;
        return console.error("软件汉化失败。", e);
      }
    }
  };

  module.exports = Settings;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvd2FuZ3MvLmF0b20vcGFja2FnZXMvc2ltcGxpZmllZC1jaGluZXNlLW1lbnUvdG9vbHMvc2V0dGluZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsQ0FBQSxHQUFJLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBQSxHQUFZLHVCQUF0Qjs7RUFFSixZQUFBLEdBQWUsU0FBQyxDQUFEO0FBRWIsUUFBQTtBQUFBO0FBQUEsU0FBQSxxQ0FBQTs7TUFDRSw0QkFBQSxDQUE2QixDQUE3QjtBQURGO0lBR0EsRUFBQSxHQUFLLFFBQVEsQ0FBQyxhQUFULENBQXVCLGdCQUF2QjtJQUVMLEVBQUUsQ0FBQyxhQUFILENBQWlCLHFCQUFqQixDQUF1QyxDQUFDLFNBQXhDLEdBQW9EO0lBQ3BELEVBQUUsQ0FBQyxhQUFILENBQWlCLHVCQUFqQixDQUF5QyxDQUFDLFNBQTFDLEdBQXNEO0lBRXRELEVBQUUsQ0FBQyxhQUFILENBQWlCLDJCQUFqQixDQUE2QyxDQUFDLE9BQTlDLENBQXNELGNBQXRELENBQXFFLENBQUMsYUFBdEUsQ0FBb0YsT0FBcEYsQ0FBNEYsQ0FBQyxTQUE3RixHQUF5RztJQUV6RyxJQUFBLEdBQU8sRUFBRSxDQUFDLGFBQUgsQ0FBaUIsb0NBQWpCO0lBQ1AsSUFBQSxDQUFPLGtCQUFBLENBQW1CLElBQW5CLENBQVA7TUFDRSxJQUFJLENBQUMsYUFBTCxDQUFtQixtQkFBbkIsQ0FBdUMsQ0FBQyxXQUF4QyxHQUFzRDtNQUN0RCxJQUFJLENBQUMsYUFBTCxDQUFtQixtQkFBbkIsQ0FBdUMsQ0FBQyxXQUF4QyxHQUFzRDtNQUN0RCxJQUFJLENBQUMsYUFBTCxDQUFtQixRQUFuQixDQUE0QixDQUFDLFdBQTdCLEdBQTJDO01BQzNDLElBQUEsR0FBTyxRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QjtN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QSxDQUFBO1FBR0EsSUFBQSxHQUFPLEVBQUUsQ0FBQyxhQUFILENBQWlCLDZCQUFqQjtRQUNQLElBQUEsQ0FBYyxJQUFkO0FBQUEsaUJBQUE7O0FBQ0E7QUFBQSxhQUFBLHVDQUFBOztVQUNFLEVBQUEsR0FBSyxJQUFJLENBQUMsYUFBTCxDQUFtQixTQUFBLEdBQVUsQ0FBQyxDQUFDLEtBQVosR0FBa0IsTUFBckM7VUFDTCxnQkFBQSxDQUFpQixFQUFqQixFQUFxQixDQUFDLENBQUMsS0FBdkI7QUFGRjtRQUtBLEdBQUEsR0FBTSxFQUFFLENBQUMsYUFBSCxDQUFpQixvQ0FBakI7UUFDTixnQkFBQSxDQUFpQixHQUFqQixFQUFzQixVQUF0QjtRQUdBLElBQUEsR0FBTyxFQUFFLENBQUMsZ0JBQUgsQ0FBb0IsdURBQXBCO0FBQ1A7YUFBQSx3Q0FBQTs7dUJBQ0UsR0FBRyxDQUFDLGdCQUFKLENBQXFCLE9BQXJCLEVBQThCLHlCQUE5QjtBQURGO3VCQXZDRjtPQUFBLGFBQUE7UUEwQ007ZUFDSixPQUFPLENBQUMsS0FBUixDQUFjLFNBQWQsRUFBeUIsQ0FBekIsRUEzQ0Y7O0lBSkssQ0FBUDs7O0VBaURGLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBeE1qQiIsInNvdXJjZXNDb250ZW50IjpbIkNTT04gPSByZXF1aXJlICdjc29uJ1xuI+iuvue9rlxuUyA9IENTT04ubG9hZCBfX2Rpcm5hbWUgKyAnLy4uL2RlZi9zZXR0aW5ncy5jc29uJ1xuXG5hcHBseVRvUGFuZWwgPSAoZSkgLT5cbiAgIyBTZXR0aW5ncyBwYW5lbFxuICBmb3IgZCBpbiBTLlNldHRpbmdzLnNldHRpbmdzXG4gICAgYXBwbHlUZXh0Q29udGVudEJ5U2V0dGluZ3NJZChkKVxuXG4gIHN2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNldHRpbmdzLXZpZXcnKVxuXG4gIHN2LnF1ZXJ5U2VsZWN0b3IoJyNjb3JlLXNldHRpbmdzLW5vdGUnKS5pbm5lckhUTUwgPSBcIuS4i+i/sOS4ukF0b23moLjlv4Ppg6jliIbnmoTorr7nva7vvIzkuKrliKvmianlsZXljIXlj6/og73mi6XmnInpop3lpJbni6znq4vorr7nva7vvIzmtY/op4jmianlsZXljIXorr7nva7or7flnKggPGEgY2xhc3M9J2xpbmsgcGFja2FnZXMtb3Blbic+5omp5bGV5YyF5YiX6KGoPC9hPiDkuK3pgInmi6nlr7nlupTlkI3np7DmianlsZXnmoTorr7nva7jgIJcIlxuICBzdi5xdWVyeVNlbGVjdG9yKCcjZWRpdG9yLXNldHRpbmdzLW5vdGUnKS5pbm5lckhUTUwgPSBcIuS4i+i/sOS4ukF0b23mlofmnKznvJbovpHlmajpg6jliIbnmoTorr7nva7vvIzlhbbkuK3kuIDkupvorr7nva7lsIbkvJrln7rkuo7mr4/kuKror63oqIDopobnm5bvvIzmo4Dmn6Xor63oqIDorr7nva7or7flnKggPGEgY2xhc3M9J2xpbmsgcGFja2FnZXMtb3Blbic+5omp5bGV5YyF5YiX6KGoPC9hPiDkuK3pgInmi6nlr7nlupTor63oqIDmianlsZXnmoTorr7nva7jgIJcIlxuXG4gIHN2LnF1ZXJ5U2VsZWN0b3IoJ1t0aXRsZT1cIlN5c3RlbSBTZXR0aW5nc1wiXScpLmNsb3Nlc3QoJy5wYW5lbHMtaXRlbScpLnF1ZXJ5U2VsZWN0b3IoJy50ZXh0JykuaW5uZXJIVE1MID0gXCLov5nkupvorr7nva7lj6/ku6XlsIZBdG9t6ZuG5oiQ5Yiw5L2g55qE5pON5L2c57O757uf5Lit44CCXCJcbiAgIyBLZXliaW5kaW5nc1xuICBpbmZvID0gc3YucXVlcnlTZWxlY3RvcignLmtleWJpbmRpbmctcGFuZWw+ZGl2Om50aC1jaGlsZCgyKScpXG4gIHVubGVzcyBpc0FscmVhZHlMb2NhbGl6ZWQoaW5mbylcbiAgICBpbmZvLnF1ZXJ5U2VsZWN0b3IoJ3NwYW46bnRoLWNoaWxkKDIpJykudGV4dENvbnRlbnQgPSBcIuaCqOWPr+S7peimhueblui/meS6m+aMiemUrue7keWumumAmui/h+WkjeWItuOAgFwiXG4gICAgaW5mby5xdWVyeVNlbGVjdG9yKCdzcGFuOm50aC1jaGlsZCg0KScpLnRleHRDb250ZW50ID0gXCLlubbkuJTnspjotLTov5tcIlxuICAgIGluZm8ucXVlcnlTZWxlY3RvcignYS5saW5rJykudGV4dENvbnRlbnQgPSBcIiDnlKjmiLfplK7nm5jmmKDlsIQgXCJcbiAgICBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgc3Bhbi50ZXh0Q29udGVudCA9IFwi6L+b6KGM5L+u5pS544CCXCJcbiAgICBpbmZvLmFwcGVuZENoaWxkKHNwYW4pXG4gICAgaW5mby5zZXRBdHRyaWJ1dGUoJ2RhdGEtbG9jYWxpemVkJywgJ3RydWUnKVxuXG4gICMgVGhlbWVzIHBhbmVsXG4gIGluZm8gPSBzdi5xdWVyeVNlbGVjdG9yKCcudGhlbWVzLXBhbmVsPmRpdj5kaXY6bnRoLWNoaWxkKDIpJylcbiAgdW5sZXNzIGlzQWxyZWFkeUxvY2FsaXplZChpbmZvKVxuICAgIGluZm8ucXVlcnlTZWxlY3Rvcignc3BhbicpLnRleHRDb250ZW50ID0gXCLmgqjkuZ/lj6/ku6XlnKhcIlxuICAgIGluZm8ucXVlcnlTZWxlY3RvcignYS5saW5rJykudGV4dENvbnRlbnQgPSBcIiDnlKjmiLfmoLflvI/orr7nva4gXCJcbiAgICBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgc3Bhbi50ZXh0Q29udGVudCA9IFwi5Lit5omp5bGVIEF0b20g55qE5qC35byP44CCXCJcbiAgICAjIGNvbnNvbGUubG9nIGluZm9cbiAgICBpbmZvLmFwcGVuZENoaWxkKHNwYW4pXG4gICAgdHAxID0gc3YucXVlcnlTZWxlY3RvcignLnRoZW1lcy1waWNrZXI+ZGl2Om50aC1jaGlsZCgxKScpXG4gICAgdHAxLnF1ZXJ5U2VsZWN0b3IoJy5zZXR0aW5nLXRpdGxlJykudGV4dENvbnRlbnQgPSBcIlVJIOS4u+mimFwiXG4gICAgdHAxLnF1ZXJ5U2VsZWN0b3IoJy5zZXR0aW5nLWRlc2NyaXB0aW9uJykudGV4dENvbnRlbnQgPSBcIuivpeS4u+mimOWwhuW6lOeUqOWcqOagh+etvu+8jOeKtuaAgeagj++8jOagkeW9ouinhuWbvuWSjOS4i+aLieiPnOWNleetieOAglwiXG4gICAgdHAyID0gc3YucXVlcnlTZWxlY3RvcignLnRoZW1lcy1waWNrZXI+ZGl2Om50aC1jaGlsZCgyKScpXG4gICAgdHAyLnF1ZXJ5U2VsZWN0b3IoJy5zZXR0aW5nLXRpdGxlJykudGV4dENvbnRlbnQgPSBcIuivreazleS4u+mimFwiXG4gICAgdHAyLnF1ZXJ5U2VsZWN0b3IoJy5zZXR0aW5nLWRlc2NyaXB0aW9uJykudGV4dENvbnRlbnQgPSBcIuivpeS4u+mimOWwhuW6lOeUqOWcqOe8lui+keWZqOWGheeahOaWh+acrOOAglwiXG4gICAgaW5mby5zZXRBdHRyaWJ1dGUoJ2RhdGEtbG9jYWxpemVkJywgJ3RydWUnKVxuXG4gICMgVXBkYXRlcyBwYW5lbFxuICBhcHBseVNwZWNpYWxIZWFkaW5nKHN2LCBcIkF2YWlsYWJsZSBVcGRhdGVzXCIsIDIsIFwi5Y+v55So5pu05pawXCIpXG4gIGFwcGx5VGV4dFdpdGhPcmcoc3YucXVlcnlTZWxlY3RvcignLnVwZGF0ZS1hbGwtYnV0dG9uLmJ0bi1wcmltYXJ5JyksIFwi5YWo6YOo5pu05pawXCIpXG4gIGFwcGx5VGV4dFdpdGhPcmcoc3YucXVlcnlTZWxlY3RvcignLnVwZGF0ZS1hbGwtYnV0dG9uOm5vdCguYnRuLXByaW1hcnkpJyksIFwi5qOA5p+l5pu05pawXCIpXG4gIGFwcGx5VGV4dFdpdGhPcmcoc3YucXVlcnlTZWxlY3RvcignLmFsZXJ0Lmljb24taG91cmdsYXNzJyksIFwi5qOA5p+l5pu05paw5LitLi4uXCIpXG4gIGFwcGx5VGV4dFdpdGhPcmcoc3YucXVlcnlTZWxlY3RvcignLmFsZXJ0Lmljb24taGVhcnQnKSwgXCLlt7Llronoo4XnmoTmianlsZXpg73mmK/mnIDmlrDnmoQhXCIpXG5cbiAgIyBJbnN0YWxsIHBhbmVsXG4gIGFwcGx5U2VjdGlvbkhlYWRpbmdzKClcbiAgaW5zdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5zZWN0aW9uOm5vdCgudGhlbWVzLXBhbmVsKScpXG4gIGluZm8gPSBpbnN0LnF1ZXJ5U2VsZWN0b3IoJy5uYXRpdmUta2V5LWJpbmRpbmdzJylcbiAgdW5sZXNzIGlzQWxyZWFkeUxvY2FsaXplZChpbmZvKVxuICAgIGluZm8ucXVlcnlTZWxlY3Rvcignc3BhbjpudGgtY2hpbGQoMiknKS50ZXh0Q29udGVudCA9IFwi5omp5bGVwrfkuLvpopggXCJcbiAgICB0YyA9IGluZm8ucXVlcnlTZWxlY3Rvcignc3BhbjpudGgtY2hpbGQoNCknKVxuICAgIHRjLnRleHRDb250ZW50ID0gdGMudGV4dENvbnRlbnQucmVwbGFjZShcImFuZCBhcmUgaW5zdGFsbGVkIHRvXCIsIFwi5a6D5Lus5bCG6KKr5a6J6KOF5ZyoIFwiKVxuICAgICMgaW5mby5hcHBlbmRDaGlsZChzcGFuKVxuICAgIGluZm8uc2V0QXR0cmlidXRlKCdkYXRhLWxvY2FsaXplZCcsICd0cnVlJylcbiAgYXBwbHlUZXh0V2l0aE9yZyhpbnN0LnF1ZXJ5U2VsZWN0b3IoJy5zZWFyY2gtY29udGFpbmVyIC5idG46bnRoLWNoaWxkKDEpJyksIFwi5omp5bGVXCIpXG4gIGFwcGx5VGV4dFdpdGhPcmcoaW5zdC5xdWVyeVNlbGVjdG9yKCcuc2VhcmNoLWNvbnRhaW5lciAuYnRuOm50aC1jaGlsZCgyKScpLCBcIuS4u+mimFwiKVxuXG4gICMgQnV0dG9uc1xuICBhcHBseUJ1dHRvblRvb2xiYXIoKVxuXG5hcHBseUluc3RhbGxQYW5lbE9uU3dpdGNoID0gKCkgLT5cbiAgYXBwbHlTZWN0aW9uSGVhZGluZ3ModHJ1ZSlcbiAgYXBwbHlCdXR0b25Ub29sYmFyKClcbiAgaW5zdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5zZWN0aW9uOm5vdCgudGhlbWVzLXBhbmVsKScpXG4gIGluZm8gPSBpbnN0LnF1ZXJ5U2VsZWN0b3IoJy5uYXRpdmUta2V5LWJpbmRpbmdzJylcbiAgaW5mby5xdWVyeVNlbGVjdG9yKCdzcGFuOm50aC1jaGlsZCgyKScpLnRleHRDb250ZW50ID0gXCLmianlsZXCt+S4u+mimCBcIlxuXG5hcHBseVNwZWNpYWxIZWFkaW5nID0gKGFyZWEsIG9yZywgY2hpbGRJZHgsIHRleHQpIC0+XG4gIHNoID0gZ2V0VGV4dE1hdGNoRWxlbWVudChhcmVhLCAnLnNlY3Rpb24taGVhZGluZycsIG9yZylcbiAgcmV0dXJuIHVubGVzcyBzaCAmJiAhaXNBbHJlYWR5TG9jYWxpemVkKHNoKVxuICBzaC5jaGlsZE5vZGVzW2NoaWxkSWR4XS50ZXh0Q29udGVudCA9IG51bGxcbiAgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICBzcGFuLnRleHRDb250ZW50ID0gb3JnXG4gIGFwcGx5VGV4dFdpdGhPcmcoc3BhbiwgdGV4dClcbiAgc2guYXBwZW5kQ2hpbGQoc3BhbilcblxuYXBwbHlTZWN0aW9uSGVhZGluZ3MgPSAoZm9yY2UpIC0+XG4gIHN2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNldHRpbmdzLXZpZXcnKVxuICBmb3Igc2ggaW4gUy5TZXR0aW5ncy5zZWN0aW9uSGVhZGluZ3NcbiAgICBlbCA9IGdldFRleHRNYXRjaEVsZW1lbnQoc3YsICcuc2VjdGlvbi1oZWFkaW5nJywgc2gubGFiZWwpXG4gICAgY29udGludWUgdW5sZXNzIGVsXG4gICAgaWYgIWlzQWxyZWFkeUxvY2FsaXplZChlbCkgYW5kIGZvcmNlXG4gICAgICBhcHBseVRleHRXaXRoT3JnKGVsLCBzaC52YWx1ZSlcbiAgZm9yIHNoIGluIFMuU2V0dGluZ3Muc3ViU2VjdGlvbkhlYWRpbmdzXG4gICAgZWwgPSBnZXRUZXh0TWF0Y2hFbGVtZW50KHN2LCAnLnN1Yi1zZWN0aW9uLWhlYWRpbmcnLCBzaC5sYWJlbClcbiAgICBjb250aW51ZSB1bmxlc3MgZWxcbiAgICBpZiAhaXNBbHJlYWR5TG9jYWxpemVkKGVsKSBhbmQgZm9yY2VcbiAgICAgIGFwcGx5VGV4dFdpdGhPcmcoZWwsIHNoLnZhbHVlKVxuXG5hcHBseUJ1dHRvblRvb2xiYXIgPSAoKSAtPlxuICBzdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZXR0aW5ncy12aWV3JylcbiAgZm9yIGJ0biBpbiBzdi5xdWVyeVNlbGVjdG9yQWxsKCcubWV0YS1jb250cm9scyAuaW5zdGFsbC1idXR0b24nKVxuICAgIGFwcGx5VGV4dFdpdGhPcmcoYnRuLCBcIuWuieijhVwiKVxuICBmb3IgYnRuIGluIHN2LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZXRhLWNvbnRyb2xzIC5zZXR0aW5ncycpXG4gICAgYXBwbHlUZXh0V2l0aE9yZyhidG4sIFwi6K6+572uXCIpXG4gIGZvciBidG4gaW4gc3YucXVlcnlTZWxlY3RvckFsbCgnLm1ldGEtY29udHJvbHMgLnVuaW5zdGFsbC1idXR0b24nKVxuICAgIGFwcGx5VGV4dFdpdGhPcmcoYnRuLCBcIuWNuOi9vVwiKVxuICBmb3IgYnRuIGluIHN2LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZXRhLWNvbnRyb2xzIC5pY29uLXBsYXliYWNrLXBhdXNlIHNwYW4nKVxuICAgIGFwcGx5VGV4dFdpdGhPcmcoYnRuLCBcIuWFs+mXrVwiKVxuICBmb3IgYnRuIGluIHN2LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZXRhLWNvbnRyb2xzIC5pY29uLXBsYXliYWNrLXBsYXkgc3BhbicpXG4gICAgYXBwbHlUZXh0V2l0aE9yZyhidG4sIFwi5ZCv55SoXCIpXG5cbmdldFRleHRNYXRjaEVsZW1lbnQgPSAoYXJlYSwgcXVlcnksIHRleHQpIC0+XG4gIGVsZW1zID0gYXJlYS5xdWVyeVNlbGVjdG9yQWxsKHF1ZXJ5KVxuICByZXN1bHRcbiAgZm9yIGVsIGluIGVsZW1zXG4gICAgaWYgZWwudGV4dENvbnRlbnQuaW5jbHVkZXModGV4dClcbiAgICAgIHJlc3VsdCA9IGVsXG4gICAgICBicmVha1xuICByZXR1cm4gcmVzdWx0XG5cbmlzQWxyZWFkeUxvY2FsaXplZCA9IChlbGVtKSAtPlxuICBsb2NhbGl6ZWQgPSBlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1sb2NhbGl6ZWQnKSBpZiBlbGVtXG4gIHJldHVybiBsb2NhbGl6ZWQgaXMgJ3RydWUnXG5cbmFwcGx5VGV4dENvbnRlbnRCeVNldHRpbmdzSWQgPSAoZGF0YSkgLT5cbiAgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2lkPScje2RhdGEuaWR9J11cIilcbiAgcmV0dXJuIHVubGVzcyBlbFxuICBjdHJsID0gZWwuY2xvc2VzdCgnLmNvbnRyb2wtZ3JvdXAnKVxuICBhcHBseVRleHRXaXRoT3JnKGN0cmwucXVlcnlTZWxlY3RvcignLnNldHRpbmctdGl0bGUnKSwgZGF0YS50aXRsZSlcbiAgYXBwbHlIdG1sV2l0aE9yZyhjdHJsLnF1ZXJ5U2VsZWN0b3IoJy5zZXR0aW5nLWRlc2NyaXB0aW9uJyksIGRhdGEuZGVzYylcbiAgaWYgZGF0YS5zZWxlY3RPcHRpb25zXG4gICAgb3B0aW9ucyA9IGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ29wdGlvbicpXG4gICAgZm9yIG9wdCBpbiBvcHRpb25zXG4gICAgICBiZWZvcmUgPSBTdHJpbmcob3B0LnRleHRDb250ZW50KVxuICAgICAgYXBwbHlUZXh0V2l0aE9yZyhvcHQsIGRhdGEuc2VsZWN0T3B0aW9uc1tiZWZvcmVdLnZhbHVlKVxuXG5hcHBseVRleHRXaXRoT3JnID0gKGVsZW0sIHRleHQpIC0+XG4gIHJldHVybiB1bmxlc3MgdGV4dFxuICBiZWZvcmUgPSBTdHJpbmcoZWxlbS50ZXh0Q29udGVudClcbiAgcmV0dXJuIGlmIGJlZm9yZSBpcyB0ZXh0XG4gIGVsZW0udGV4dENvbnRlbnQgPSB0ZXh0XG4gIGVsZW0uc2V0QXR0cmlidXRlKCd0aXRsZScsIGJlZm9yZSlcbiAgZWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtbG9jYWxpemVkJywgJ3RydWUnKVxuXG5hcHBseUh0bWxXaXRoT3JnID0gKGVsZW0sIHRleHQpIC0+XG4gIHJldHVybiB1bmxlc3MgdGV4dFxuICBiZWZvcmUgPSBTdHJpbmcoZWxlbS50ZXh0Q29udGVudClcbiAgcmV0dXJuIGlmIGJlZm9yZSBpcyB0ZXh0XG4gIGVsZW0uaW5uZXJIVE1MID0gdGV4dFxuICBlbGVtLnNldEF0dHJpYnV0ZSgndGl0bGUnLCBiZWZvcmUpXG4gIGVsZW0uc2V0QXR0cmlidXRlKCdkYXRhLWxvY2FsaXplZCcsICd0cnVlJylcblxuXG5TZXR0aW5ncyA9XG4gIGluaXQgOiAoKSAtPlxuICAgIHNldHRpbmdzVGFiID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRhYi1iYXIgW2RhdGEtdHlwZT1cIlNldHRpbmdzVmlld1wiXScpXG4gICAgc2V0dGluZ3NFbmFibGVkID0gc2V0dGluZ3NUYWIuY2xhc3NOYW1lLmluY2x1ZGVzICdhY3RpdmUnIGlmIHNldHRpbmdzVGFiXG4gICAgcmV0dXJuIHVubGVzcyBzZXR0aW5nc1RhYiAmJiBzZXR0aW5nc0VuYWJsZWRcbiAgICB0cnlcbiAgICAgICMgVGFiIHRpdGxlXG4gICAgICAjIHNldHRpbmdzVGFiLnF1ZXJ5U2VsZWN0b3IoJy50aXRsZScpLnRleHRDb250ZW50ID0gXCLorr7nva5cIlxuICAgICAgc3YgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2V0dGluZ3MtdmlldycpXG5cbiAgICAgICMgRm9udFxuICAgICAgaWYgcHJvY2Vzcy5wbGF0Zm9ybSBpcyAnd2luMzInXG4gICAgICAgIGZvbnQgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250RmFtaWx5JylcbiAgICAgICAgaWYgZm9udFxuICAgICAgICAgIHN2LnN0eWxlW1wiZm9udEZhbWlseVwiXSA9IGZvbnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHN2LnN0eWxlW1wiZm9udEZhbWlseVwiXSA9IFwiJ1NlZ29lIFVJJywgTWljcm9zb2Z0IFlhaGVpLCBzYW5zLXNlcmlmXCJcbiAgICAgICAgICBzdi5zdHlsZVtcImZvbnRTaXplXCJdID0gXCIxMnB4XCJcblxuICAgICAgIyBMb2FkIGFsbCBzZXR0aW5ncyBwYW5lbHNcbiAgICAgIGxhc3RNZW51ID0gc3YucXVlcnlTZWxlY3RvcignLnBhbmVscy1tZW51IC5hY3RpdmUgYScpXG4gICAgICBwYW5lbE1lbnVzID0gc3YucXVlcnlTZWxlY3RvckFsbCgnLnNldHRpbmdzLXZpZXcgLnBhbmVscy1tZW51IGxpIGEnKVxuICAgICAgZm9yIHBtIGluIHBhbmVsTWVudXNcbiAgICAgICAgcG0uY2xpY2soKVxuICAgICAgICBwbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFwcGx5SW5zdGFsbFBhbmVsT25Td2l0Y2gpXG4gICAgICAjIFJlc3RvcmUgbGFzdCBhY3RpdmUgbWVudVxuICAgICAgbGFzdE1lbnUuY2xpY2soKSBpZiBsYXN0TWVudVxuXG4gICAgICAjIG9uIEluaXRcbiAgICAgIGFwcGx5VG9QYW5lbCgpXG5cbiAgICAgICMgTGVmdC1zaWRlIG1lbnVcbiAgICAgIG1lbnUgPSBzdi5xdWVyeVNlbGVjdG9yKCcuc2V0dGluZ3MtdmlldyAucGFuZWxzLW1lbnUnKVxuICAgICAgcmV0dXJuIHVubGVzcyBtZW51XG4gICAgICBmb3IgZCBpbiBTLlNldHRpbmdzLm1lbnVcbiAgICAgICAgZWwgPSBtZW51LnF1ZXJ5U2VsZWN0b3IoXCJbbmFtZT0nI3tkLmxhYmVsfSddPmFcIilcbiAgICAgICAgYXBwbHlUZXh0V2l0aE9yZyBlbCwgZC52YWx1ZVxuXG4gICAgICAjIExlZnQtc2lkZSBidXR0b25cbiAgICAgIGV4dCA9IHN2LnF1ZXJ5U2VsZWN0b3IoJy5zZXR0aW5ncy12aWV3IC5pY29uLWxpbmstZXh0ZXJuYWwnKVxuICAgICAgYXBwbHlUZXh0V2l0aE9yZyBleHQsIFwi5omT5byA5o+S5Lu25rqQ56CB55uu5b2VXCJcblxuICAgICAgIyBBZGQgRXZlbnRzXG4gICAgICBidG5zID0gc3YucXVlcnlTZWxlY3RvckFsbCgnZGl2LnNlY3Rpb246bm90KC50aGVtZXMtcGFuZWwpIC5zZWFyY2gtY29udGFpbmVyIC5idG4nKVxuICAgICAgZm9yIGJ0biBpbiBidG5zXG4gICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFwcGx5SW5zdGFsbFBhbmVsT25Td2l0Y2gpXG5cbiAgICBjYXRjaCBlXG4gICAgICBjb25zb2xlLmVycm9yIFwi6L2v5Lu25rGJ5YyW5aSx6LSl44CCXCIsIGVcblxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5nc1xuIl19
