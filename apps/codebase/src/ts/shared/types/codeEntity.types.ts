export interface CodeEntity {
	entity_name: string;
	entity_type: "function" | "arrow_function" | "method" | "class";
	start_line: number;
	end_line: number;
	code: string;
	file_path: string;
}
