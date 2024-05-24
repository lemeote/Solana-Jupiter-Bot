const ui = require("cliui")({ width: 140 });
const chart = require("asciichart");
const moment = require("moment");
const chalk = require("chalk");
const { toDecimal } = require("./utils");

function printToConsole({
	date,
	i,
	performanceOfRouteComp,
	inputToken,
	outputToken,
	tokenA,
	tokenB,
	route,
	simulatedProfit,
	cache,
	config,
}) {
	try {
		if (cache.ui.showProfitChart) {
			let spottetMaxTemp =
				cache.chart.spottedMax[cache.sideBuy ? "buy" : "sell"];
			spottetMaxTemp.shift();
			spottetMaxTemp.push(
				simulatedProfit === Infinity
					? 0
					: parseFloat(simulatedProfit.toFixed(2))
			);
			cache.chart.spottedMax.buy = spottetMaxTemp;
		}

		if (cache.ui.showPerformanceOfRouteCompChart) {
			let performanceTemp = cache.chart.performanceOfRouteComp;
			performanceTemp.shift();
			performanceTemp.push(parseInt(performanceOfRouteComp.toFixed()));
			cache.chart.performanceOfRouteComp = performanceTemp;
		}
        		// check swap status
		let swapStatus;
		if (cache.swappingRightNow) {
			swapStatus = performance.now() - cache.performanceOfTxStart;
		}

		// refresh console before print
		console.clear();
		ui.resetOutput();
	} catch (err) {
		console.log(err);
	}
}
