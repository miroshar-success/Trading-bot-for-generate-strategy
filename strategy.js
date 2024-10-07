const { Strategy } = require('@fugle/backtest');
const { SMA, EMA, RSI, CrossUp, CrossDown } = require('technicalindicators');

// Function to generate dynamic strategies
function createStrategy({ shortPeriod, longPeriod, type = 'SMA' }) {
  class DynamicStrategy extends Strategy {
    params = { shortPeriod, longPeriod };

    init() {
      const values = this.data['close'].values;

      // Choose between different types of moving averages
      const shortMA = type === 'SMA'
        ? SMA.calculate({ period: this.params.shortPeriod, values })
        : EMA.calculate({ period: this.params.shortPeriod, values });

      const longMA = type === 'SMA'
        ? SMA.calculate({ period: this.params.longPeriod, values })
        : EMA.calculate({ period: this.params.longPeriod, values });

      this.addIndicator('shortMA', shortMA);
      this.addIndicator('longMA', longMA);

      // Create signals for crossovers
      const crossUp = CrossUp.calculate({
        lineA: this.getIndicator('shortMA'),
        lineB: this.getIndicator('longMA'),
      });
      this.addSignal('crossUp', crossUp);

      const crossDown = CrossDown.calculate({
        lineA: this.getIndicator('shortMA'),
        lineB: this.getIndicator('longMA'),
      });
      this.addSignal('crossDown', crossDown);
    }

    next(ctx) {
      const { index, signals } = ctx;
      if (index < this.params.shortPeriod || index < this.params.longPeriod) return;

      if (signals.get('crossUp')) this.buy({ size: 1000 });
      if (signals.get('crossDown')) this.sell({ size: 1000 });
    }
  }

  return DynamicStrategy;
}

exports.createStrategy = createStrategy;
