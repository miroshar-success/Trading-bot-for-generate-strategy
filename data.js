const { HttpClient } = require('@fugle/realtime');
const { DateTime } = require('luxon');

async function getData(options) {
  const symbol = options?.symbol ?? '2330';
  const lastYear = options?.lastYear ?? 2022;
  const recentYears = options?.recentYears ?? 3;
  const client = new HttpClient({ apiToken: process.env.FUGLE_REALTIME_API_TOKEN });
  const data = [];

  for (let i = 0, dt = DateTime.now().set({ year: lastYear }); i < recentYears; i++, dt = dt.minus({ year: 1 })) {
    const historical = await client.historical.candles({
      symbolId: symbol,
      from: dt.startOf('year').toISODate(),
      to: dt.endOf('year').toISODate(),
    });
    data.push(...historical.data);
  }

  return data;
}

exports.getData = getData;
