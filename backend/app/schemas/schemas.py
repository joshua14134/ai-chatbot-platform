from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None
    exp: Optional[float] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectOut(ProjectBase):
    id: str
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ChatBase(BaseModel):
    title: str
    project_id: Optional[str] = None
    model_name: Optional[str] = "llama-3.3-70b-versatile"

class ChatCreate(ChatBase):
    id: str

class ChatOut(ChatBase):
    id: str
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CodeBlockSchema(BaseModel):
    filename: str
    content: str
    language: str

class ThoughtProcessSchema(BaseModel):
    steps: List[str]
    text: str

class MessageBase(BaseModel):
    text: str

class MessageCreate(MessageBase):
    id: str
    sender: str
    agent_used: Optional[str] = None
    thought_process: Optional[Dict[str, Any]] = None
    code_block: Optional[Dict[str, Any]] = None

class MessageOut(MessageBase):
    id: str
    chat_id: str
    sender: str
    timestamp: datetime
    agent_used: Optional[str] = None
    thought_process: Optional[Dict[str, Any]] = None
    code_block: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ChatWithMessagesOut(ChatOut):
    messages: List[MessageOut] = []

    class Config:
        from_attributes = True

class DocumentOut(BaseModel):
    id: str
    name: str
    file_type: str
    file_size: int
    created_at: datetime

    class Config:
        from_attributes = True

class MemoryBase(BaseModel):
    key: str
    value: str
    category: str
    project_id: Optional[str] = None

class MemoryCreate(MemoryBase):
    pass

class MemoryOut(MemoryBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserSettingsBase(BaseModel):
    theme: str = "dark"
    temperature: float = 0.2
    max_tokens: int = 4096
    system_prompt: Optional[str] = None
    active_agent_id: str = "router"

class UserSettingsUpdate(UserSettingsBase):
    pass

class UserSettingsOut(UserSettingsBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class APILogOut(BaseModel):
    id: int
    endpoint: str
    method: str
    status_code: int
    latency_ms: float
    tokens_used: int
    model_name: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
