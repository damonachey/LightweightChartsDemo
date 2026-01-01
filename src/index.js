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

// Bollinger Bands
const bbLength = 20;
const bbMultiplier = 2;
const priceData = [];

// Bollinger Bands series
const bbUpperSeries = chart.addSeries(LightweightCharts.LineSeries, {
  color: '#ff9800',
  lineWidth: 1,
  lineStyle: LightweightCharts.LineStyle.Dashed
});

const bbMiddleSeries = chart.addSeries(LightweightCharts.LineSeries, {
  color: '#2196f3',
  lineWidth: 1
});

const bbLowerSeries = chart.addSeries(LightweightCharts.LineSeries, {
  color: '#ff9800',
  lineWidth: 1,
  lineStyle: LightweightCharts.LineStyle.Dashed
});

function calculateBollingerBands(closePrices, length, multiplier) {
  const upper = [];
  const middle = [];
  const lower = [];
  
  for (let i = 0; i < closePrices.length; i++) {
    if (i < length - 1) {
      upper.push(null);
      middle.push(null);
      lower.push(null);
      continue;
    }
    
    // Calculate SMA
    let sum = 0;
    for (let j = 0; j < length; j++) {
      sum += closePrices[i - j];
    }
    const sma = sum / length;
    
    // Calculate standard deviation
    let squaredDifferencesSum = 0;
    for (let j = 0; j < length; j++) {
      squaredDifferencesSum += Math.pow(closePrices[i - j] - sma, 2);
    }
    const stdDev = Math.sqrt(squaredDifferencesSum / length);
    
    // Calculate bands
    upper.push(sma + (multiplier * stdDev));
    middle.push(sma);
    lower.push(sma - (multiplier * stdDev));
  }
  
  return { upper, middle, lower };
}

// Generate initial data
for (let i = 0; i < 150; i++) {
  const bar = nextBar();
  candleSeries.update(bar);
  volumeSeries.update(bar);
  priceData.push(bar.close);
}

// Calculate and set Bollinger Bands
const bands = calculateBollingerBands(priceData, bbLength, bbMultiplier);
const bbUpperData = [];
const bbMiddleData = [];
const bbLowerData = [];

for (let i = 0; i < priceData.length; i++) {
  const date = new Date(2020, 0, 1);
  date.setDate(date.getDate() + i);
  const time = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  };
  
  if (bands.upper[i] !== null) {
    bbUpperData.push({ time, value: bands.upper[i] });
    bbMiddleData.push({ time, value: bands.middle[i] });
    bbLowerData.push({ time, value: bands.lower[i] });
  }
}

bbUpperSeries.setData(bbUpperData);
bbMiddleSeries.setData(bbMiddleData);
bbLowerSeries.setData(bbLowerData);

resize();

setInterval(() => {
  const bar = nextBar();
  candleSeries.update(bar);
  volumeSeries.update(bar);
  priceData.push(bar.close);
  
  // Keep only last 500 data points
  if (priceData.length > 500) {
    priceData.shift();
  }
  
  // Update Bollinger Bands
  const bands = calculateBollingerBands(priceData, bbLength, bbMultiplier);
  const lastIndex = priceData.length - 1;
  
  if (lastIndex >= bbLength - 1 && bands.upper[lastIndex] !== null) {
    bbUpperSeries.update({ time: bar.time, value: bands.upper[lastIndex] });
    bbMiddleSeries.update({ time: bar.time, value: bands.middle[lastIndex] });
    bbLowerSeries.update({ time: bar.time, value: bands.lower[lastIndex] });
  }
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
