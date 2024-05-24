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

		if (cache.ui.showHelp) {
			ui.div(
				chalk.gray("[H] - show/hide help"),
				chalk.gray("[CTRL]+[C] - exit"),
				chalk.gray("[I] - incognito RPC")
			);
			ui.div(
				chalk.gray("[L] - show/hide latency chart"),
				chalk.gray("[P] - show/hide profit chart"),
				chalk.gray("[T] - show/hide trade history")
			);
			ui.div(
				chalk.gray("[E] - force execution"),
				chalk.gray("[R] - revert back swap"),
				chalk.gray("[S] - simulation mode switch")
			);
			ui.div(" ");
		}
	} catch (err) {
		console.log(err);
	}
}
