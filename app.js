require('dotenv').config();

const { Backtest } = require('@fugle/backtest');
const { SmaCross } = require('./strategy');

async function main() {
  try {
    // const data = await getData(); // fetch real time data from fugle api

    const data = require('./historicalData.json');
    const backtest = new Backtest(data, SmaCross, {
      cash: 1000000,
      tradeOnClose: true,
    });
    await backtest.optimize({
      params: {
        n1: [5, 10, 20],
        n2: [60, 120, 240],
      },
    })
      .then(results => {
        results.print();  // print out the results of the optimized parameters
        results.plot();   // plot the equity curve of the optimized parameters
      });
  } catch (e) {
    console.log(e)
  }
}

main();
