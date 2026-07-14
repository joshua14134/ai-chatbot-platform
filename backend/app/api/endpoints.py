import os
import uuid
import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core import security
from app.core.config import settings
from app.models import models
from app.schemas import schemas
from app.services import rag
from app.services.groq_ollama import AIService
from app.agents.graph import NexusOrchestrator

router = APIRouter()

def get_current_user(token: str, db: Session = Depends(get_db)) -> models.User:
    payload = security.decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate active JWT access credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/auth/register", response_model=schemas.UserOut, status_code=201)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account is already configured with this email.")

    hashed = security.hash_password(user_in.password)
    user = models.User(
        email=user_in.email,
        hashed_password=hashed,
        full_name=user_in.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    user_settings = models.UserSettings(user_id=user.id)
    db.add(user_settings)
    db.commit()

    return user

@router.post("/auth/login", response_model=schemas.Token)
def login(credentials: schemas.UserCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not security.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid login credentials provided")

    access = security.create_access_token(user.id)
    refresh = security.create_refresh_token(user.id)

    session_id = f"sess-{uuid.uuid4()}"
    expiry = datetime.datetime.utcnow() + datetime.timedelta(days=30)
    sess = models.UserSession(
        id=session_id,
        user_id=user.id,
        refresh_token=refresh,
        expires_at=expiry
    )
    db.add(sess)
    db.commit()

    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}

@router.post("/auth/refresh", response_model=schemas.Token)
def refresh_token(payload_in: Dict[str, str], db: Session = Depends(get_db)):
    refresh = payload_in.get("refresh_token")
    if not refresh:
        raise HTTPException(status_code=400, detail="Missing refresh token")

    payload = security.decode_token(refresh)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid session token")

    user_id = payload.get("sub")
    sess = db.query(models.UserSession).filter(
        models.UserSession.user_id == int(user_id),
        models.UserSession.refresh_token == refresh
    ).first()

    if not sess or sess.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=401, detail="Session expired or invalidated")

    new_access = security.create_access_token(user_id)
    new_refresh = security.create_refresh_token(user_id)

    sess.refresh_token = new_refresh
    sess.expires_at = datetime.datetime.utcnow() + datetime.timedelta(days=30)
    db.commit()

    return {"access_token": new_access, "refresh_token": new_refresh, "token_type": "bearer"}

@router.get("/users/me", response_model=schemas.UserOut)
def get_user_profile(user: models.User = Depends(get_current_user)):
    return user

@router.get("/projects", response_model=List[schemas.ProjectOut])
def get_projects(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return db.query(models.Project).filter(models.Project.user_id == user.id).all()

@router.post("/projects", response_model=schemas.ProjectOut)
def create_project(proj_in: schemas.ProjectCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    proj = models.Project(
        id=f"proj-{uuid.uuid4()}",
        name=proj_in.name,
        description=proj_in.description,
        user_id=user.id
    )
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return proj

@router.get("/chats", response_model=List[schemas.ChatOut])
def get_chats(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return db.query(models.Chat).filter(models.Chat.user_id == user.id).all()

@router.get("/chats/{chat_id}", response_model=schemas.ChatWithMessagesOut)
def get_chat_thread(chat_id: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    chat = db.query(models.Chat).filter(models.Chat.id == chat_id, models.Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat thread not found")
    return chat

@router.post("/chats", response_model=schemas.ChatOut)
def create_chat(chat_in: schemas.ChatCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    chat = models.Chat(
        id=chat_in.id,
        title=chat_in.title,
        user_id=user.id,
        project_id=chat_in.project_id,
        model_name=chat_in.model_name
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

@router.post("/chats/{chat_id}/messages", response_model=schemas.MessageOut)
def send_message(
    chat_id: str,
    msg_in: schemas.MessageBase,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):

    start_time = datetime.datetime.utcnow()

    chat = db.query(models.Chat).filter(models.Chat.id == chat_id, models.Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat session not found")

    user_msg_id = f"msg-{uuid.uuid4()}"
    user_msg = models.Message(
        id=user_msg_id,
        chat_id=chat_id,
        sender="user",
        text=msg_in.text
    )
    db.add(user_msg)
    db.commit()

    user_settings = db.query(models.UserSettings).filter(models.UserSettings.user_id == user.id).first()
    active_model = chat.model_name or "llama-3.3-70b-versatile"

    context_prefix = ""
    if user_settings and user_settings.system_prompt:
        context_prefix = user_settings.system_prompt

    rag_context = rag.DocumentProcessor.get_context_for_query(msg_in.text)
    full_prompt = msg_in.text
    if rag_context:
        full_prompt = f"Using this document context to reply:\n{rag_context}\n\nUser request: {msg_in.text}"

    agent_output = NexusOrchestrator.process_pipeline(full_prompt, active_model)

    assistant_msg_id = f"msg-{uuid.uuid4()}"
    assistant_msg = models.Message(
        id=assistant_msg_id,
        chat_id=chat_id,
        sender="assistant",
        text=agent_output["text"],
        agent_used=agent_output["thoughtProcess"]["steps"][-2] if len(agent_output["thoughtProcess"]["steps"]) >= 2 else "Coordinator",
        thought_process=agent_output["thoughtProcess"],
        code_block=agent_output["code"]
    )
    db.add(assistant_msg)

    db.commit()
    db.refresh(assistant_msg)

    end_time = datetime.datetime.utcnow()
    latency_ms = (end_time - start_time).total_seconds() * 1000.0
    api_log = models.APILog(
        user_id=user.id,
        endpoint=f"/chats/{chat_id}/messages",
        method="POST",
        status_code=200,
        latency_ms=latency_ms,
        model_name=active_model
    )
    db.add(api_log)
    db.commit()

    return assistant_msg

@router.get("/chats/{chat_id}/stream")
def stream_chat(
    chat_id: str,
    prompt: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    chat = db.query(models.Chat).filter(models.Chat.id == chat_id, models.Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat session not found")

    active_model = chat.model_name or "llama-3.3-70b-versatile"

    def event_generator():
        system_prompt = "You are the Nexus Multi-Agent system assistant. Yield crisp and formatted markdown chunks."

        context = rag.DocumentProcessor.get_context_for_query(prompt)
        enhanced_prompt = prompt
        if context:
            enhanced_prompt = f"Document Reference Context:\n{context}\n\nPrompt: {prompt}"

        yield f"event: thought\ndata: {{\"steps\": [\"Router\", \"RAG Document Engine\", \"Streaming Agent\"], \"text\": \"Querying vector indexes... yielding direct streaming tokens.\"}}\n\n"

        for text_chunk in AIService.query_stream_llm(active_model, system_prompt, enhanced_prompt):
            payload = {"content": text_chunk}
            yield f"event: chunk\ndata: {json.dumps(payload)}\n\n"

        yield "event: done\ndata: [DONE]\n\n"

    import json
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/documents/upload", response_model=schemas.DocumentOut)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    project_id: Optional[str] = None,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    doc_id = f"doc-{uuid.uuid4()}"
    file_type = file.filename.split(".")[-1].lower() if "." in file.filename else "txt"

    os.makedirs("./temp_uploads", exist_ok=True)
    file_path = f"./temp_uploads/{doc_id}.{file_type}"

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    doc = models.Document(
        id=doc_id,
        name=file.filename,
        file_type=file_type,
        file_path=file_path,
        file_size=len(content),
        user_id=user.id,
        project_id=project_id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    background_tasks.add_task(
        rag.DocumentProcessor.ingest_document,
        file_path,
        file.filename,
        file_type
    )

    return doc

@router.get("/memory", response_model=List[schemas.MemoryOut])
def get_memories(
    category: Optional[str] = None,
    project_id: Optional[str] = None,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    query = db.query(models.Memory)
    if category:
        query = query.filter(models.Memory.category == category)
    if project_id:
        query = query.filter(models.Memory.project_id == project_id)
    return query.all()

@router.post("/memory", response_model=schemas.MemoryOut)
def store_memory(mem_in: schemas.MemoryBase, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    mem = models.Memory(
        id=f"mem-{uuid.uuid4()}",
        key=mem_in.key,
        value=mem_in.value,
        category=mem_in.category,
        project_id=mem_in.project_id
    )
    db.add(mem)
    db.commit()
    db.refresh(mem)
    return mem

@router.get("/settings", response_model=schemas.UserSettingsOut)
def get_settings(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    settings_obj = db.query(models.UserSettings).filter(models.UserSettings.user_id == user.id).first()
    if not settings_obj:
        settings_obj = models.UserSettings(user_id=user.id)
        db.add(settings_obj)
        db.commit()
        db.refresh(settings_obj)
    return settings_obj

@router.put("/settings", response_model=schemas.UserSettingsOut)
def update_settings(set_in: schemas.UserSettingsUpdate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    settings_obj = db.query(models.UserSettings).filter(models.UserSettings.user_id == user.id).first()
    if not settings_obj:
        settings_obj = models.UserSettings(user_id=user.id)
        db.add(settings_obj)

    settings_obj.theme = set_in.theme
    settings_obj.temperature = set_in.temperature
    settings_obj.max_tokens = set_in.max_tokens
    settings_obj.system_prompt = set_in.system_prompt
    settings_obj.active_agent_id = set_in.active_agent_id

    db.commit()
    db.refresh(settings_obj)
    return settings_obj

@router.get("/models", response_model=Dict[str, List[str]])
def list_available_models():
    return {
        "groq": settings.GROQ_MODELS,
        "ollama": settings.OLLAMA_MODELS
    }

@router.get("/admin/logs", response_model=List[schemas.APILogOut])
def get_logs(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Unauthenticated access level to admin diagnostics.")
    return db.query(models.APILog).order_by(models.APILog.timestamp.desc()).limit(100).all()
