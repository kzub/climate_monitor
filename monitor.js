const request = require('request-promise-native');
const config = require('./config.js');

let wip = false;

const defaultOpts = () => {
  return {
    timeout: 5000, 
  };
};

const writeMetricOpts = (data) => {
  return {
    ...defaultOpts(),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: data,
  };
};

const main = async () => {
  if (wip) {
    console.log('work in progress');
    return;
  }
  wip = true;

  for (let sensor of config.sensors) {
    try {
      console.log(`[loading ${sensor.name}]`);
      const res = await request(`${sensor.addr}`, defaultOpts());
      console.log(res);
      const data = JSON.parse(res);
      const payload = sensor.extractor(data);
      await request.post(`${config.timeseries.addr}/write?db=${sensor.database}`, writeMetricOpts(payload));
      // console.log(`${config.timeseries.addr}/write?db=${sensor.database}`, writeMetricOpts(payload));
    } catch (err) {
      console.log(err);
      wip = false;
    }
  }

  wip = false;
};

setInterval(main, 5000);
main();