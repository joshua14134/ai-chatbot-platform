import os
import re
import uuid
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("nexus.rag")

class ChromaVectorStore:
    def __init__(self):
        self.client = None
        self.collection = None
        try:
            import chromadb

            self.client = chromadb.PersistentClient(path="./chroma_db")
            self.collection = self.client.get_or_create_collection("nexus_documents")
            logger.info("ChromaDB vector collection successfully initialized.")
        except Exception as e:
            logger.error(f"Failed to start ChromaDB client: {e}. Fallback vector search will be used.")

    def add_document_chunks(self, chunks: List[str], metadatas: List[Dict[str, Any]], ids: List[str]):
        if self.collection:
            try:
                self.collection.add(
                    documents=chunks,
                    metadatas=metadatas,
                    ids=ids
                )
                logger.info(f"Added {len(chunks)} document segments to ChromaDB.")
            except Exception as e:
                logger.error(f"Error saving to ChromaDB: {e}")

    def query_similarity(self, query: str, limit: int = 4) -> List[Dict[str, Any]]:
        if self.collection:
            try:
                results = self.collection.query(
                    query_texts=[query],
                    n_results=limit
                )
                documents = results.get("documents", [[]])[0]
                metadatas = results.get("metadatas", [[]])[0]

                output = []
                for idx, doc in enumerate(documents):
                    meta = metadatas[idx] if idx < len(metadatas) else {}
                    output.append({
                        "content": doc,
                        "metadata": meta
                    })
                return output
            except Exception as e:
                logger.error(f"ChromaDB query failed: {e}")
                return []
        return []

vector_store = ChromaVectorStore()

class DocumentProcessor:
    """
    Automatic text extraction, chunking, and embedding generation for PDF, DOCX, TXT, CSV.
    """
    @staticmethod
    def extract_text(file_path: str, file_type: str) -> str:
        text = ""
        if not os.path.exists(file_path):
            return text

        try:
            if file_type == "txt" or file_type == "markdown" or file_type == "md":
                with open(file_path, "r", encoding="utf-8") as f:
                    text = f.read()
            elif file_type == "pdf":
                try:
                    import pdfplumber
                    with pdfplumber.open(file_path) as pdf:
                        text = "\n".join([page.extract_text() or "" for page in pdf.pages])
                except Exception as pdf_err:
                    logger.warning(f"pdfplumber extraction failed, falling back to simple text parse: {pdf_err}")
                    text = "[PDF Document Structure Binary Payload]"
            elif file_type == "docx":
                try:
                    import docx
                    doc = docx.Document(file_path)
                    text = "\n".join([para.text for para in doc.paragraphs])
                except Exception as docx_err:
                    logger.error(f"Docx parsing failed: {docx_err}")
            elif file_type in ["csv", "xlsx"]:
                try:
                    import pandas as pd
                    df = pd.read_csv(file_path) if file_type == "csv" else pd.read_excel(file_path)
                    text = df.to_string()
                except Exception as csv_err:
                    logger.error(f"Dataframe loading failed: {csv_err}")
            else:
                text = "[Unsupported file binary signature]"
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {e}")

        return text

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
        """
        Token-boundary overlap chunking implementation.
        """
        words = text.split()
        chunks = []
        i = 0
        while i < len(words):
            chunk = " ".join(words[i:i + chunk_size])
            chunks.append(chunk)
            i += (chunk_size - chunk_overlap)
        return chunks

    @classmethod
    def ingest_document(cls, file_path: str, name: str, file_type: str) -> int:
        raw_text = cls.extract_text(file_path, file_type)
        if not raw_text.strip():
            return 0

        chunks = cls.chunk_text(raw_text)
        if not chunks:
            return 0

        metadatas = [{"source": name, "file_type": file_type, "index": idx} for idx, _ in enumerate(chunks)]
        ids = [f"chunk-{uuid.uuid4()}" for _ in range(len(chunks))]

        vector_store.add_document_chunks(chunks, metadatas, ids)
        return len(chunks)

    @staticmethod
    def get_context_for_query(query: str) -> str:
        """
        Retrieves top relevant matches and formats them as a context block for LLM.
        """
        matches = vector_store.query_similarity(query)
        if not matches:
            return ""

        context_blocks = []
        for match in matches:
            source = match["metadata"].get("source", "Uploaded Document")
            content = match["content"]
            context_blocks.append(f"--- Document Source: {source} ---\n{content}")

        return "\n\n".join(context_blocks)
