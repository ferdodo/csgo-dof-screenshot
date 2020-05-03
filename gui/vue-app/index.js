import style from "./style.css";
import Vue from "vue";

var div = document.createElement("div");
div.id = "app";
document.body.appendChild(div);

new Vue({
	el: "#app",
	template: "<div><cfg-gen></cfg-gen><screenshots-merge></screenshots-merge></div>",
});
