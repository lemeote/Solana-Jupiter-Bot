console.clear();
require("dotenv").config();

const fs = require("fs");
const { setup } = require("./setup");

const configSpinner = ora({
	text: "Loading config...",
	discardStdin: false,
}).start();
const config = JSON.parse(fs.readFileSync("./config.json"));
configSpinner.succeed("Config loaded!");

const cache = {
	startTime: new Date(),
	firstSwap: true,
	firstSwapInQueue: false,
	queue: {},
	queueThrottle: 1,
	sideBuy: true,
	iteration: 0,
	iterationPerMinute: {
		start: performance.now(),
		value: 0,
		counter: 0,
	},
	initialBalance: {
		tokenA: 0,
		tokenB: 0,
	},

	currentBalance: {
		tokenA: 0,
		tokenB: 0,
	},
	currentProfit: {
		tokenA: 0,
		tokenB: 0,
	},
	lastBalance: {
		tokenA: 0,
		tokenB: 0,
	},
	profit: {
		tokenA: 0,
		tokenB: 0,
	},
	maxProfitSpotted: {
		buy: 0,
		sell: 0,
	},
	tradeCounter: {
		buy: { success: 0, fail: 0 },
		sell: { success: 0, fail: 0 },
	},
	ui: {
		defaultColor: config.ui.defaultColor,
		showPerformanceOfRouteCompChart: false,
		showProfitChart: true,
		showTradeHistory: true,
		hideRpc: false,
		showHelp: true,
	},
	chart: {
		spottedMax: {
			buy: new Array(120).fill(0),
			sell: new Array(120).fill(0),
		},
		performanceOfRouteComp: new Array(120).fill(0),
	},
	hotkeys: {
		e: false,
		r: false,
	},
	tradingEnabled: config.tradingEnabled,
	swappingRightNow: false,
	tradingMode: config.tradingMode,
	tradeHistory: new Array(),
	performanceOfTxStart: 0,
	availableRoutes: {
		buy: 0,
		sell: 0,
	},
};

const swap = async (jupiter, route) => {
	try {
		const performanceOfTxStart = performance.now();
		cache.performanceOfTxStart = performanceOfTxStart;

		const { execute } = await jupiter.exchange({
			routeInfo: route,
		});
		const result = await execute();

		const performanceOfTx = performance.now() - performanceOfTxStart;

		return [result, performanceOfTx];
	} catch (error) {
		console.log("Swap error: ", error);
	}
};
