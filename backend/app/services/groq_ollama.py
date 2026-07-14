import httpx
import json
import logging
from typing import Optional, Dict, Any, Generator
from app.core.config import settings

logger = logging.getLogger("nexus.ai")

class AIService:
    @staticmethod
    def query_groq(model: str, system_prompt: str, user_prompt: str, temperature: float = 0.2) -> Dict[str, Any]:
        """
        Directly queries Groq API with robust error handling and payload formatting.
        """
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not configured in the system environment.")

        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature,
        }
        if "json" in system_prompt.lower():
            payload["response_format"] = {"type": "json_object"}

        try:
            with httpx.Client(timeout=60.0) as client:
                response = client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload
                )
                if response.status_code != 200:
                    logger.error(f"Groq API returned error {response.status_code}: {response.text}")
                    raise httpx.HTTPStatusError("Groq Error", request=response.request, response=response)

                result = response.json()
                content = result["choices"][0]["message"]["content"]
                tokens_used = result.get("usage", {}).get("total_tokens", 0)
                return {"text": content, "tokens": tokens_used, "provider": "groq"}
        except Exception as e:
            logger.error(f"Failed to query Groq: {e}")
            raise e

    @staticmethod
    def query_ollama(model: str, system_prompt: str, user_prompt: str, temperature: float = 0.2) -> Dict[str, Any]:
        """
        Queries a local or network Ollama instance.
        """
        headers = {"Content-Type": "application/json"}
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "options": {
                "temperature": temperature
            },
            "stream": False,
        }
        if "json" in system_prompt.lower():
            payload["format"] = "json"

        try:
            with httpx.Client(timeout=90.0) as client:
                response = client.post(
                    f"{settings.OLLAMA_URL}/api/chat",
                    headers=headers,
                    json=payload
                )
                if response.status_code != 200:
                    logger.error(f"Ollama API returned error {response.status_code}: {response.text}")
                    raise httpx.HTTPStatusError("Ollama Error", request=response.request, response=response)

                result = response.json()
                content = result["message"]["content"]
                return {"text": content, "tokens": 0, "provider": "ollama"}
        except Exception as e:
            logger.error(f"Failed to query local Ollama: {e}")
            raise e

    @classmethod
    def query_llm(cls, model: str, system_prompt: str, user_prompt: str, temperature: float = 0.2) -> Dict[str, Any]:
        """
        Orchestrates LLM query with automatic fallback from Groq to Ollama.
        """

        is_groq_model = model in settings.GROQ_MODELS or any(g in model.lower() for g in ["llama-3.3", "qwen3", "deepseek-r1-distill"])

        if is_groq_model and settings.GROQ_API_KEY:
            try:
                return cls.query_groq(model, system_prompt, user_prompt, temperature)
            except Exception as e:
                logger.warning(f"Groq primary provider query failed, falling back to local Ollama: {e}")
                fallback_model = "deepseek-r1" if "deepseek" in model else "llama3.2"
                return cls.query_ollama(fallback_model, system_prompt, user_prompt, temperature)
        else:

            ollama_model = model if model in settings.OLLAMA_MODELS else "llama3.2"
            return cls.query_ollama(ollama_model, system_prompt, user_prompt, temperature)

    @classmethod
    def query_stream_llm(cls, model: str, system_prompt: str, user_prompt: str, temperature: float = 0.2) -> Generator[str, None, None]:
        """
        Generates text stream compatible with Server-Sent Events (SSE).
        """
        is_groq_model = model in settings.GROQ_MODELS or any(g in model.lower() for g in ["llama-3.3", "qwen3", "deepseek-r1-distill"])

        if is_groq_model and settings.GROQ_API_KEY:
            headers = {
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": temperature,
                "stream": True
            }
            try:
                with httpx.Client(timeout=60.0) as client:
                    with client.stream("POST", "https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload) as response:
                        for line in response.iter_lines():
                            if line.startswith("data: "):
                                if line.strip() == "data: [DONE]":
                                    break
                                try:
                                    chunk = json.loads(line[6:])
                                    text = chunk["choices"][0]["delta"].get("content", "")
                                    if text:
                                        yield text
                                except Exception:
                                    continue
            except Exception as e:
                logger.error(f"Streaming error on Groq, yielding fallback explanation: {e}")
                yield f"\n[System: High-concurrency fallback active due to network timeout]\n"
        else:

            headers = {"Content-Type": "application/json"}
            payload = {
                "model": "llama3.2",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "options": {"temperature": temperature},
                "stream": True
            }
            try:
                with httpx.Client(timeout=90.0) as client:
                    with client.stream("POST", f"{settings.OLLAMA_URL}/api/chat", headers=headers, json=payload) as response:
                        for line in response.iter_lines():
                            if line:
                                try:
                                    chunk = json.loads(line)
                                    text = chunk["message"].get("content", "")
                                    if text:
                                        yield text
                                except Exception:
                                    continue
            except Exception as e:
                logger.error(f"Streaming error on Ollama: {e}")
                yield f"\n[Ollama Connection Refused]\n"
