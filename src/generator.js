"use strict";

const DefaultBox = require("../Components/DefaultBox");

require("dotenv").config();

const tradingNodes = [
	{ label: "pingpong", value: "pingpong" },
	{ lable: "arbitrage (coming soon)", value: " arbitrage" },
];

const App = (props) => {
    return <DefaultBox></DefaultBox>
};

module.exports = App;
