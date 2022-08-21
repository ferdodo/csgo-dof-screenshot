import { Vector3D } from "../lib/vector-3d";
import { CsgoCamera } from "../lib/csgo-camera";
import { formatScript } from "./util";
import { ipcRenderer } from "electron";
import { defineComponent, ref, Ref, onMounted, computed } from "vue";
import { render } from "./template";

export const cfgGen = defineComponent({
	setup() {
		const cameraX: Ref<number> = ref(680);
		const cameraY: Ref<number> = ref(571);
		const cameraZ: Ref<number> = ref(122);
		const targetX: Ref<number> = ref(693);
		const targetY: Ref<number> = ref(546);
		const targetZ: Ref<number> = ref(122);
		const dofStrength: Ref<number> = ref(3);
		const bindKey: Ref<string> = ref("I");
		const scriptSaved: Ref<boolean | "pending"> = ref(false);
		const scriptLocation: Ref<string> = ref("");
		const ready: Ref<boolean> = ref(false);

		onMounted(async function() {
			scriptLocation.value = await ipcRenderer.invoke("getDefaultScriptPath");
			ready.value = true;
		});

		async function selectScriptPath() {
			scriptLocation.value = await ipcRenderer.invoke("selectScriptPath");
		}

		const script = computed(function () {
			const target = new Vector3D(targetX.value, targetY.value, targetZ.value);
			const camera = new CsgoCamera(cameraX.value, cameraY.value, cameraZ.value);
			return formatScript(target, camera, Number(dofStrength.value), String(bindKey.value));
		});

		async function saveScript() {
			scriptSaved.value = "pending";

			await ipcRenderer.invoke("saveScript", {
				script: script.value,
				scriptLocation: scriptLocation.value
			});

			scriptSaved.value = true;
		}

		return {
			script,
			saveScript,
			selectScriptPath,
			cameraX,
			cameraY,
			cameraZ,
			targetX,
			targetY,
			targetZ,
			dofStrength,
			bindKey,
			scriptSaved,
			scriptLocation,
			ready
		}
	},
	render
});
