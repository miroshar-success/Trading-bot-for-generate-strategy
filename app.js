require('dotenv').config();
const { Backtest } = require('@fugle/backtest');
const { createStrategy } = require('./strategy');
const fs = require('fs');

// Load historical data
const data = require('./historicalData.json');

// Function to generate random strategy configurations
function generateRandomStrategyConfig() {
  const types = ['SMA', 'EMA'];  // Randomize between SMA and EMA
  const shortPeriod = Math.floor(Math.random() * 10) + 5; // Random periods between 5-15
  const longPeriod = Math.floor(Math.random() * 120) + 60; // Random periods between 60-180
  const type = types[Math.floor(Math.random() * types.length)];

  return { shortPeriod, longPeriod, type };
}

// Function to backtest a strategy and determine success
async function backtestStrategy(strategyConfig) {
  const StrategyClass = createStrategy(strategyConfig);
  const backtest = new Backtest(data, StrategyClass, {
    cash: 100000,
    tradeOnClose: true,
  });

  let results;
  try {
    results = await backtest.run();
    const resultIndex = results['_results'].$index;
    const resultMap = {};
    resultIndex.forEach((key, index) => {
      resultMap[key] = results['_results'].$dataIncolumnFormat[index];
    });
    console.log(resultMap);
    const winRate = resultMap['Win Rate [%]'];
    const totalProfit = resultMap['Expectancy [%]'];
    console.log(`Strategy: ${JSON.stringify(strategyConfig)} -> Profit: ${totalProfit}, Win Rate: ${winRate}`);

    if (totalProfit > 0 && winRate > 0.6) { // Criteria for a "good" strategy
      console.log('Good strategy found, optimizing...');
      await backtest.optimize({
        params: {
          shortPeriod: [5, 10, 20],
          longPeriod: [60, 120, 240],
        },
      }).then(optResults => {
        optResults.print();  // Print optimized results
        optResults.plot();   // Plot equity curve
        saveGoodStrategy(strategyConfig); // Save the strategy
      });
    }
  } catch (e) {
    console.error('Error during backtest:', e);
  }
}

// Function to save successful strategies to a file
function saveGoodStrategy(strategyConfig) {
  const savedStrategies = fs.existsSync('./goodStrategies.json')
    ? JSON.parse(fs.readFileSync('./goodStrategies.json'))
    : [];

  savedStrategies.push(strategyConfig);
  fs.writeFileSync('./goodStrategies.json', JSON.stringify(savedStrategies, null, 2));
  console.log('Strategy saved successfully!');
}

// Main function to run backtests until a good strategy is found
async function main() {
  try {
    let strategyConfig;
    let iterations = 0;
    const maxIterations = 100000; // Stop after 100 attempts to find a good strategy

    while (iterations < maxIterations) {
      strategyConfig = generateRandomStrategyConfig();
      console.log(`Backtesting strategy #${iterations + 1}:`, strategyConfig);
      await backtestStrategy(strategyConfig);
      iterations++;
    }

  } catch (e) {
    console.log('Error:', e);
  }
}

main();
