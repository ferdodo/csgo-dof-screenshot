import { render } from "./template";
import { ipcRenderer } from "electron";
import { formatEta } from "./util";
import { ref, Ref, onMounted, computed, defineComponent } from "vue";

export const screenshotsMerge = defineComponent({
	setup() {
		const selectedFiles: Ref<string[]> = ref([]);
		const mergeProgress: Ref<null | number> = ref(null);
		const startTime: Ref<null | Date> = ref(null);
		const mergedImageLocation: Ref<string> = ref("");
		const ready: Ref<boolean> = ref(false);
		const mergeSuccess: Ref<boolean> = ref(false);

		onMounted(async function() {
			mergedImageLocation.value = await ipcRenderer.invoke("getDefaultMergedImagePath");

			ipcRenderer.on("mergeProgressUpdate", function (_, data) {
				if (!startTime.value && data) startTime.value = new Date();
				if (!data) startTime.value = null;
				mergeProgress.value = data;
			});

			ready.value = true;
		});

		const eta = computed(async function() {
			if (startTime.value === null || mergeProgress.value === null) {
				return "";
			}
		
			return formatEta(startTime.value, mergeProgress.value);
		});


		async function mergeScreenshots() {
			mergeSuccess.value = false;

			const payload = JSON.parse(JSON.stringify({
				selectedFiles: selectedFiles.value,
				mergedImageLocation: mergedImageLocation.value
			}));

			await ipcRenderer.invoke("mergeScreenshots", payload);

			mergeSuccess.value = true;
		}

		function selectFiles(event) {
			const fileList = event.target.files;
			type yep = { path: string };
			const fileArrList: yep[] = Array.from(fileList) as yep[];
			const paths: string[] = fileArrList.map((file) => file.path)
			selectedFiles.value = paths;
		}

		async function selectMergedImagePath() {
			mergedImageLocation.value = await ipcRenderer.invoke("selectMergedImagePath");
		}

		return {
			mergeScreenshots,
			selectFiles,
			selectMergedImagePath,
			eta,
			selectedFiles,
			mergeProgress,
			startTime,
			mergedImageLocation,
			ready,
			mergeSuccess
		};
	},
	render
});
