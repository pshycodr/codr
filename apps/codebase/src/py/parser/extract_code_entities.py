import ast
import os

from typing import List, Dict, Union


CodeEntity = Dict[str, Union[str, int]]


def extract_code_entities(file_path: str) -> List[CodeEntity]:
    with open(file_path, "r", encoding="utf-8") as f:
        code = f.read()
    lines = code.splitlines()

    tree = ast.parse(code)
    entities: List[CodeEntity] = []

    def get_code(start: int, end: int) -> str:
        return "\n".join(lines[start - 1:end])

    class CodeVisitor(ast.NodeVisitor):
        def visit_FunctionDef(self, node: ast.FunctionDef):
            entity_type = "method" if isinstance(getattr(node, "parent", None), ast.ClassDef) else "function"
            entities.append({
                "entity_name": node.name,
                "entity_type": entity_type,
                "start_line": node.lineno,
                "end_line": getattr(node, "end_lineno", node.lineno),
                "code": get_code(node.lineno, getattr(node, "end_lineno", node.lineno)),
                "file_path": file_path
            })
            self.generic_visit(node)

        def visit_ClassDef(self, node: ast.ClassDef):
            start = node.lineno
            end = getattr(node, "end_lineno", start)
            entities.append({
                "entity_name": node.name,
                "entity_type": "class",
                "start_line": start,
                "end_line": end,
                "code": get_code(start, end),
                "file_path": file_path
            })

            # Add parent info to detect methods
            for child in node.body:
                setattr(child, "parent", node)

            self.generic_visit(node)

    # Add parent tracking to tree
    for node in ast.walk(tree):
        for child in ast.iter_child_nodes(node):
            setattr(child, "parent", node)

    visitor = CodeVisitor()
    visitor.visit(tree)
    return entities
