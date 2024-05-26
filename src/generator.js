"use strict";

const DefaultBox = require("../Components/DefaultBox");

require("dotenv").config();
const React = require("react");
const { useState, useEffect } = require("react");
const fs = requrie("fs");
const { Text, Box, useApp, useInput, Newline, useStdin } = require("ink");
const { default: SelectInput } = require("ink-select-input");

const tradingNodes = [
	{ label: "pingpong", value: "pingpong" },
	{ lable: "arbitrage (coming soon)", value: " arbitrage" },
];

const App = (props) => {
	const [network, setNetwork] = useState(props.network || "");
	const [rpcURL, setRpcURL] = useState(props.rpc);
	const [rpc, setRpc] = useState([]);
	const [isRpcsSet, setIsRpcsSet] = useState(false);
	const [tradingMode, setTradingMode] = useState("");
	const [tokens, setTokens] = useState([]);
	const [tokenA, setTokenA] = useState({});
	const [tokenB, setTokenB] = useState({});
	const [tokenAisSet, setTokenAisSet] = useState(false);
	const [tokenBisSet, setTokenBisSet] = useState(false);
	const [tradingEnabled, setTradingEnabled] = useState(undefined);
	const [tradeSize, setTradeSize] = useState("");
	const [minPercProfit, setMinPercProfit] = useState("1");
	const [isMinPercProfitSet, setIsMinPercProfitSet] = useState(false);
	const [minInterval, setMinInterval] = useState("30");
	const [storeFailedTxInHistory, setStoreFailedTxInHistory] = useState(true);
	const [readyToStart, setReadyToStart] = useState(false);

	const { exit } = useApp();

	useInput((input, key) => {
		if (key.escape) exit();
		if (key.tab && !isRpcsSet) {
			setRpc([process.env.DEFAULT_RPC]);
			setIsRpcsSet(true);
		}
		if (readyToStart && key.return) {
			const config = {
				tokenA,
				tokenB,
				tradingMode,
				tradeSize: parseFloat(tradeSize),
				network,
				rpc,
				minPercProfit: parseFloat(minPercProfit),
				minInterval: parseInt(minInterval),
				tradingEnabled,
				storeFailedTxInHistory,
				ui: {
					defaultColor: "cyan",
				},
			};

			// save config to config.json file
			fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));

			// save tokenst to tokens.json file
			fs.writeFileSync("./temp/tokens.json", JSON.stringify(tokens, null, 2));
			exit();
		}
	});

	const { setRawMode } = useStdin();

	useEffect(() => {
		setRawMode(true);

		return () => {
			setRawMode(false);
		};
	});

	useEffect(() => {
		network != "" &&
			axios.get(TOKEN_LIST_URL[network]).then((res) => setTokens(res.data));
	}, [network]);

	if (!network)
		return (
			<DefaultBox>
				<Text>
					Select Solana <Text color="magenta">Network</Text>:
				</Text>
				<SelectInput
					items={networks}
					onSelect={(item) => setNetwork(item.value)}
				/>
				<EscNotification />
			</DefaultBox>
		);

	return <DefaultBox></DefaultBox>;
};

module.exports = App;
