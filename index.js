async function deviceListIntoSummary(url) {
  // This only works with node version 17^ otherwise I need to use the node-fetch pacakge
  const data = await fetch(url).then((res) => res.json());

  let count = 0;
  let min = Infinity;
  let max = 0;
  let average = 0;
  let stdDevHash = {}; // used to store weights of each item (not multiplied by quantity)
  let stdDev = 0;

  await data.devices.forEach((el) => {
    // update count
    count = count + el.quantity;

    // update min & max & average
    if (el.weight.units === "pounds") {
      el.weight.value * 16 < min ? (min = el.weight.value * 16) : (min = min);
      el.weight.value * 16 > max ? (max = el.weight.value * 16) : (max = max);

      const tempAvg = el.quantity * (el.weight.value * 16);
      average = average + tempAvg;

      stdDevHash[el.weight.value * 16] = el.weight.value * 16;
    } else if (el.weight.unts === "ounces") {
      el.weight.value < min ? (min = el.weight.value) : (min = min);
      el.weight.value > max ? (max = el.weight.value) : (max = max);

      const tempAvg = el.quantity * el.weight.value;
      average = average + tempAvg;

      stdDevHash[el.weight.value] = el.weight.value;
    }
  });

  // calculate Average
  average = average / count;

  // Use average to calc Standard Deviation
  Object.keys(stdDevHash).forEach((val) => {
    const temp = val - average;
    const tempSquared = Math.pow(temp, 2);
    stdDev = stdDev + tempSquared;
  });

  stdDev = stdDev / (data.devices.length - 1);
  stdDev = Math.sqrt(stdDev);

  // return the results
  return { count, min, max, average, stdDev };
}

deviceListIntoSummary(process.env.FILE).then((res) => console.log(res));
