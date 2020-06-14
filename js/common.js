$(function () {
  function renderChart(eleId, data, opt) {
    // console.log(opt, data)
    var optDefort = {
      padding: [getPx(.15), getPx(3), getPx(.65), getPx(.45)],
      color: ['#345C7C', '#F4717F', '#E2AC92', '#73B49B', '#BF6D83', '#BF8891'],
      legendOffsetY: 0
    }
    opt = Object.assign(optDefort, opt)
    //只显示3个
    var n = 3,
      standard;
    var arr = data.map(n => n.percent)
    for (var i = 0; i < n; i++) {
      var max = Math.max(...arr)
      arr = arr.filter(n => n !== max)
      if (i === n - 1) {
        standard = max
      }
    }
    console.log(standard)

    var ds = new DataSet();
    var dv = ds.createView().source(data);

    var height = $('#' + eleId).height();
    var chart = new G2.Chart({
      container: eleId,
      forceFit: true,
      height,
      padding: opt.padding
    });
    chart.source(dv);
    chart.tooltip(false);
    chart.legend({
      position: opt.legendPosition,
      offsetX: opt.legendOffsetX,
      offsetY: opt.legendOffsetY,
      useHtml: true,
      containerTpl: `<div class="g2-legend">
                      <table class="g2-legend-list"></table>
                    </div>`,
      itemTpl: (value, color, checked, index) => {
        const obj = dv.rows[index];
        checked = checked ? 'checked' : 'unChecked';
        return `<tr class="g2-legend-list-item item-${index} checked" 
                    data-value="${value}"
                    data-color="${color}"
                >
                      <td>
                        <i class="g2-legend-marker" style="background-color:${color};"></i>
                        <span class="g2-legend-text">${value}</span>
                      </td>
                      <td>${percent(obj.percent)}%</td>
                </tr>`;
      },
    });
    chart.coord('theta', {
      radius: 1,
      innerRadius: .6
    });
    chart.intervalStack().position('percent')
      .color('type', opt.color)
      .opacity(.95)
      .label('percent', {
        useHtml: true,
        labelLine: false,
        offset: 0,
        htmlTemplate: (text, item, index) => {
          const point = item.point; // 每个弧度对应的点
          let p = point['percent'];
          if (p >= standard && p >= 0.06) {
            return `<span class="label-text" >${percent(p)}%</span>`;
          }
          return
        },
        // rotate: 0,
        autoRotate: false,
      });
    chart.render();
  }

  function getPx(n = 1) {
    if (isNaN(n)) return
    n = Number(n);
    let html = document.querySelector('html');
    let fontSize = window.getComputedStyle(html).getPropertyValue('font-size');
    return n * parseFloat(fontSize);
  }

  function int2str(num) {
    let numberStr = num.toString()
    let str = numberStr.split('').reverse()
    for (let i = 0; i < str.length; i++) {
      if ((i + 1) % 4 === 0) {
        str.splice(i, 0, ',')
      }
    }
    str.reverse()
    let handleResult = ''
    for (let j = 0; j < str.length; j++) {
      handleResult += str[j]
    }
    return handleResult
  }

  function percent(count) {
    return parseFloat((count * 100).toFixed(1));
  }

  function getDays() {
    let startTime = new Date('2020-06-20'); // 开始时间
    let endTime = new Date(); // 结束时间
    let days = Math.floor((startTime - endTime) / 1000 / 60 / 60 / 24) + 1 // 天数
    return '0' + days
  }

  $.get('http://sanotrack.stramogroup.com/overview', function (res) {
    $('.main-data .gmv').text(res.data.gmv);
    $('.main-data .volume').text(int2str(res.data.volume));

    $('.main-data .base_target').text(percent(res.data.base_target) + '%');
    $('.main-data .stretch_target').text(percent(res.data.stretch_target) + '%');
    $('.main-data .evol').text(percent(res.data.evol) + '%');

    if (res.data.base_target > .8) {
      $('.main-data .base_target').addClass('green')
    }
    if (res.data.stretch_target > .8) {
      $('.main-data .stretch_target').addClass('green')
    }
    if (res.data.evol > .8) {
      $('.main-data .evol').addClass('green')
    }
  });

  $.get('http://sanotrack.stramogroup.com/overview_brand', function (res) {
    var list = res.data;
    list.forEach(n => {
      $('.left tbody').append(function () {
        return `<tr align="center">
                  <td>${n.rank}</td>
                  <td style="color:#E4D8BC;">${n.brand}</td>
                  <td>${n.gmv_eu}</td>
                  <td class="${n.cont > 0.8 ? 'green' : ''}">${percent(n.cont)}%</td>
                  <td class="${n.stretch_target > 0.8 ? 'green' : ''}">${percent(n.stretch_target)}%</td>
                </tr>`
      })
    })

    var data1 = list.map(n => {
      return {
        type: n.brand,
        percent: n.cont
      }
    })
    renderChart('cont-by-brand', data1, {
      padding: [getPx(.7), getPx(5.2), getPx(.5), getPx(1)],
      legendPosition: 'right-center',
      legendOffsetX: getPx(.4),
    });
  })

  $.get('http://sanotrack.stramogroup.com/overview_platform', function (res) {
    //strategic
    var overview_strategic = res.data.overview_strategic;
    $('.strategic-box .gmv').text(overview_strategic.gmv);
    $('.strategic-box .target').text(percent(overview_strategic.stretch_target) + '%');
    $('.strategic-box .cont').text(percent(overview_strategic.cont) + '%');
    $('.strategic-box .days').text(getDays());
    if (overview_strategic.stretch_target > .8) {
      $('.strategic-box .target').addClass('green')
    }
    if (overview_strategic.cont > .8) {
      $('.strategic-box .cont').addClass('green')
    }
    //table
    res.data.detail_strategic.forEach(n => {
      $('.strategic-box tbody').append(function () {
        return `<tr align="center">
                  <td>${n.rank}</td>
                  <td style="color:#E4D8BC;">${n.platform}</td>
                  <td>${n.gmv}</td>
                  <td class="${n.cont > 0.8 ? 'green' : ''}">${percent(n.cont)}%</td>
                  <td class="${n.stretch_target > 0.8 ? 'green' : ''}">${percent(n.stretch_target)}%</td>
                </tr>`
      })
    })

    //d&g
    var overview_dng = res.data.overview_dng;
    $('.dg-box .gmv').text(overview_dng.gmv);
    $('.dg-box .target').text(percent(overview_dng.stretch_target) + '%');
    $('.dg-box .cont').text(percent(overview_dng.cont) + '%');
    $('.dg-box .days').text(getDays());
    if (overview_dng.stretch_target > .8) {
      $('.dg-box .target').addClass('green')
    }
    if (overview_dng.cont > .8) {
      $('.dg-box .cont').addClass('green')
    }
    //table
    res.data.detail_dng.forEach(n => {
      $('.dg-box tbody').append(function () {
        return `<tr align="center">
                  <td>${n.rank}</td>
                  <td style="color:#00FFEC;">${n.platform}</td>
                  <td>${n.gmv}</td>
                  <td class="${n.cont > 0.8 ? 'green' : ''}">${percent(n.cont)}%</td>
                  <td class="${n.stretch_target > 0.8 ? 'green' : ''}">${percent(n.stretch_target)}%</td>
                </tr>`
      })
    })

    //chart
    var data2 = res.data.detail_strategic.map(n => {
      return {
        type: n.platform,
        percent: n.cont
      }
    })
    renderChart('strategic', data2, {
      legendPosition: 'right-top',
      legendOffsetX: getPx(.1),
    });
    var data3 = res.data.detail_dng.map(n => {
      return {
        type: n.platform,
        percent: n.cont
      }
    })
    renderChart('dg', data3, {
      legendPosition: 'right-top',
      legendOffsetX: getPx(.1),
    });

    var data4 = [{
      type: 'Strategic',
      percent: overview_strategic.cont
    }, {
      type: 'D&G',
      percent: overview_dng.cont
    }];
    renderChart('strategic-vs-dg', data4, {
      legendPosition: 'right-top',
      legendOffsetX: getPx(.1),
      color: ['#D5B990', '#00FFEC'],
    });

  })

})
