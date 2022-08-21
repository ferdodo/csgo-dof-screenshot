import { createApp } from "vue";
import { render } from "./template";
import { cfgGen } from "../cfg-gen";
import { screenshotsMerge } from "../screenshots-merge";

const app = createApp({
	components: {
		cfgGen,
		screenshotsMerge
	},
	render
});

app.mount('body');
