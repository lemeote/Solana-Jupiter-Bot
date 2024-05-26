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

const successSwapHandler = (tx, tradeEntry, tokenA, tokenB) => {
	// update counter
	cache.tradeCounter[cache.sideBuy ? "buy" : "sell"].success++;

	// update balance
	if (cache.sideBuy) {
		cache.lastBalance.tokenA = cache.currentBalance.tokenA;
		cache.currentBalance.tokenA = 0;
		cache.currentBalance.tokenB = tx.outputAmount;
	} else {
		cache.lastBalance.tokenB = cache.currentBalance.tokenB;
		cache.currentBalance.tokenB = 0;
		cache.currentBalance.tokenA = tx.outputAmount;
	}

	if (cache.firstSwap) {
		cache.lastBalance.tokenB = tx.outputAmount;
		cache.initialBalance.tokenB = tx.outputAmount;
	}

	// update profit
	if (cache.sideBuy) {
		cache.currentProfit.tokenA = 0;
		cache.currentProfit.tokenB = calculateProfit(
			cache.initialBalance.tokenB,
			cache.currentBalance.tokenB
		);
	} else {
		cache.currentProfit.tokenB = 0;
		cache.currentProfit.tokenA = calculateProfit(
			cache.initialBalance.tokenA,
			cache.currentBalance.tokenA
		);
	}

	// update trade history
	let tempHistory = cache.tradeHistory || [];

	tradeEntry.inAmount = toDecimal(
		tx.inputAmount,
		cache.sideBuy ? tokenA.decimals : tokenB.decimals
	);
	tradeEntry.outAmount = toDecimal(
		tx.outputAmount,
		cache.sideBuy ? tokenB.decimals : tokenA.decimals
	);

	tradeEntry.profit = calculateProfit(
		cache.lastBalance[cache.sideBuy ? "tokenB" : "tokenA"],
		tx.outputAmount
	);

	tempHistory.push(tradeEntry);
	cache.tradeHistory = tempHistory;

	// first swap done
	if (cache.firstSwap) {
		cache.firstSwap = false;
		cache.firstSwapInQueue = false;
	}
};
