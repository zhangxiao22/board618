;(function (designWidth, minWidth) {
  var doc = document,
    win = window,
    docEl = doc.documentElement,
    remStyle = document.createElement("style"),
    tid;

  function refreshRem() {
    var width = docEl.getBoundingClientRect().width;
    // var height = win.innerHeight;
    minWidth = minWidth || 1200;
    width < minWidth && (width = minWidth);
    // width = Math.min(width, height)
    var rem = width * 100 / designWidth;
    remStyle.innerHTML = 'html{font-size:' + rem + 'px;}';
  }

  if (docEl.firstElementChild) {
    docEl.firstElementChild.appendChild(remStyle);
  } else {
    var wrap = doc.createElement("div");
    wrap.appendChild(remStyle);
    doc.write(wrap.innerHTML);
    wrap = null;
  }
  //要等 wiewport 设置好后才能执行 refreshRem，不然 refreshRem 会执行2次；
  refreshRem();

  win.addEventListener("resize", function () {
    clearTimeout(tid); //防止执行两次
    tid = setTimeout(refreshRem, 300);
  }, false);

  // win.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function () {
  //     clearTimeout(tid); //防止执行两次
  //     tid = setTimeout(refreshRem, 300);
  // }, false);

  win.addEventListener("pageshow", function (e) {
    if (e.persisted) { // 浏览器后退的时候重新计算
      clearTimeout(tid);
      tid = setTimeout(refreshRem, 300);
    }
  }, false);

  if (doc.readyState === "complete") {
    doc.body.style.fontSize = "16px";
  } else {
    doc.addEventListener("DOMContentLoaded", function (e) {
      doc.body.style.fontSize = "16px";
    }, false);
  }
})(2560, 1200);
