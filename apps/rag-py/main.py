import argparse
from services.rag_pipeline import run_rag_pipeline
from config.logging_config import configure_logging

def main():

    configure_logging()

    parser = argparse.ArgumentParser(description="Run RAG pipeline manually")
    parser.add_argument('--url', required=True, help='Document URL')
    parser.add_argument('--query', required=True, help='Query to ask')
    args = parser.parse_args()

    results = run_rag_pipeline(args.url, args.query)
    for i, res in enumerate(results, 1):
        print(f"[{i}] {res}...\n")

if __name__ == "__main__":
    main()
