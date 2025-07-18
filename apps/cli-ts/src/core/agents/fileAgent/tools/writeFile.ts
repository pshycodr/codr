import { startLoader, stopLoader } from "@cli/ui/Loader/loaderManager";
import fs from "fs";

const writeFile = async ({
	fileName,
	data,
}: {
	fileName: string;
	data: string;
}) => {
	try {
		startLoader(`Writing on file: ${fileName}`);

		await fs.writeFile(fileName, data, "utf-8", (err) => {
			if (err) {
				console.error(`ERROR in \"writeFile\": ${err}`);
				return { success: false, error: err };
			} else {
				return { success: true };
			}
		});
		stopLoader(`File ${fileName} written successfully`);
		return { success: true };
	} catch (error) {
		console.error(`ERROR in \"writeFile\": ${error}`);
		return { success: false, error };
	}
};

export default writeFile;
