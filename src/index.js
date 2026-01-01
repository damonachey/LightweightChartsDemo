const chart = LightweightCharts.createChart(document.body, {
  width: window.innerWidth,
  height: window.innerHeight,
  layout: {
    background: {
      type: 'solid',
      color: '#0d0d0d'
    },
    textColor: '#ffffff'
  },
  grid: {
    vertLines: {
      color: '#2a2a2a'
    },
    horzLines: {
      color: '#2a2a2a'
    }
  },
  crosshair: {
    mode: LightweightCharts.CrosshairMode.Normal,
    vertLine: {
      color: '#4a4a4a',
      width: 1
    },
    horzLine: {
      color: '#4a4a4a',
      width: 1
    }
  },
  priceScale: {
    borderColor: '#2a2a2a',
    textColor: '#ffffff'
  },
  timeScale: {
    borderColor: '#2a2a2a',
    textColor: '#ffffff'
  }
});

const candleSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
  upColor: '#26a69a',
  downColor: '#ef5350',
  borderDownColor: '#ef5350',
  borderUpColor: '#26a69a',
  wickDownColor: '#666666',
  wickUpColor: '#666666'
});

const volumeSeries = chart.addSeries(LightweightCharts.HistogramSeries, {
  color: '#7c4dff',
  lineWidth: 2,
  priceFormat: {
    type: 'volume'
  }
}, 1); // Add to pane 1 (second pane)

// Add watermark using the new plugin system
const firstPane = chart.panes()[0];
LightweightCharts.createTextWatermark(firstPane, {
  horzAlign: 'center',
  vertAlign: 'center',
  lines: [{
    text: "XYZ",
    fontSize: 256,
    color: "rgba(255, 255, 255, 0.05)",
  }]
});

// Configure volume pane size
const volumePane = chart.panes()[1];
volumePane.setHeight(80); // Set height to 80 pixels

for (let i = 0; i < 150; i++) {
  const bar = nextBar();
  candleSeries.update(bar);
  volumeSeries.update(bar);
}

resize();

setInterval(() => {
  const bar = nextBar();
  candleSeries.update(bar);
  volumeSeries.update(bar);
}, 3000);

window.addEventListener("resize", resize, false);

function resize() {
  chart.applyOptions({ width: window.innerWidth, height: window.innerHeight });

  setTimeout(() => chart.timeScale().fitContent(), 0);
}

function nextBar() {
  if (!nextBar.date) nextBar.date = new Date(2020, 0, 0);
  if (!nextBar.bar) nextBar.bar = { open: 100, high: 104, low: 98, close: 103 };

  nextBar.date.setDate(nextBar.date.getDate() + 1);
  nextBar.bar.time = {
    year: nextBar.date.getFullYear(),
    month: nextBar.date.getMonth() + 1,
    day: nextBar.date.getDate()
  };

  let old_price = nextBar.bar.close;
  let volatility = 0.1;
  let rnd = Math.random();
  let change_percent = 2 * volatility * rnd;

  if (change_percent > volatility) change_percent -= 2 * volatility;

  let change_amount = old_price * change_percent;
  nextBar.bar.open = nextBar.bar.close;
  nextBar.bar.close = old_price + change_amount;
  nextBar.bar.high =
    Math.max(nextBar.bar.open, nextBar.bar.close) +
    Math.abs(change_amount) * Math.random();
  nextBar.bar.low =
    Math.min(nextBar.bar.open, nextBar.bar.close) -
    Math.abs(change_amount) * Math.random();
  nextBar.bar.value = Math.random() * 100;
  nextBar.bar.color =
    nextBar.bar.close < nextBar.bar.open
      ? "rgba(255, 128, 159, 0.25)"
      : "rgba(107, 255, 193, 0.25)";

  return nextBar.bar;
}
