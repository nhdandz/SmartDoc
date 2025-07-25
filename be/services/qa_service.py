# app/services/qa_service.py
import os
import asyncio
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
import json

# Fix imports - use relative imports or get settings from database
try:
    from database import settings
except ImportError:
    # Fallback settings if database not available
    class FallbackSettings:
        OPENAI_API_KEY = ""
        ANTHROPIC_API_KEY = ""
        DEFAULT_LLM_MODEL = "gpt-3.5-turbo"
        CHROMA_DB_PATH = "./chroma_db"
    settings = FallbackSettings()

from models import Document, ChatSession, ChatMessage, VectorStore
from schemas import QARequest, ChatSessionCreate, QASource

# Optional LangChain imports with fallbacks
try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain.embeddings.openai import OpenAIEmbeddings
    from langchain.embeddings.huggingface import HuggingFaceEmbeddings
    from langchain.vectorstores.chroma import Chroma
    # Fix deprecated imports
    try:
        from langchain_community.chat_models import ChatOpenAI
        from langchain_community.llms import Ollama
    except ImportError:
        from langchain.chat_models import ChatOpenAI
        from langchain.llms import Ollama
    from langchain.schema import Document as LangChainDocument
    from langchain.prompts import ChatPromptTemplate
    from langchain.schema.runnable import RunnablePassthrough
    from langchain.schema.output_parser import StrOutputParser
    LANGCHAIN_AVAILABLE = True
except ImportError:
    print("Warning: LangChain not available, QA service will have limited functionality")
    LANGCHAIN_AVAILABLE = False

class QAService:
    def __init__(self):
        if not LANGCHAIN_AVAILABLE:
            print("QA Service initialized without LangChain - limited functionality")
            self.embeddings = None
            self.llm = None
            self.text_splitter = None
            self.vector_store = None
            return
            
        try:
            self.embeddings = self._initialize_embeddings()
            self.llm = self._initialize_llm()
            if LANGCHAIN_AVAILABLE:
                self.text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000,
                    chunk_overlap=200,
                    length_function=len,
                )
            self.vector_store = self._initialize_vector_store()
        except Exception as e:
            print(f"Warning: Could not fully initialize QA service: {e}")
            self.embeddings = None
            self.llm = None
            self.text_splitter = None
            self.vector_store = None

    def _initialize_embeddings(self):
        """Khởi tạo embedding model"""
        if not LANGCHAIN_AVAILABLE:
            return None
            
        try:
            if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
                return OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY)
            else:
                # Fallback to local embeddings
                return HuggingFaceEmbeddings(
                    model_name="sentence-transformers/all-MiniLM-L6-v2"
                )
        except Exception as e:
            print(f"Warning: Could not initialize embeddings: {e}")
            return None

    def _initialize_llm(self):
        """Khởi tạo LLM model"""
        if not LANGCHAIN_AVAILABLE:
            return None
            
        try:
            if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
                return ChatOpenAI(
                    model_name=getattr(settings, 'DEFAULT_LLM_MODEL', 'gpt-3.5-turbo'),
                    openai_api_key=settings.OPENAI_API_KEY,
                    temperature=0.7
                )
            else:
                # Fallback to local LLM (Ollama)
                return Ollama(model="llama2")
        except Exception as e:
            print(f"Warning: Could not initialize LLM: {e}")
            return None

    def _initialize_vector_store(self):
        """Khởi tạo vector database"""
        if not LANGCHAIN_AVAILABLE or not self.embeddings:
            return None
            
        try:
            chroma_path = getattr(settings, 'CHROMA_DB_PATH', './chroma_db')
            return Chroma(
                persist_directory=chroma_path,
                embedding_function=self.embeddings
            )
        except Exception as e:
            print(f"Warning: Could not initialize vector store: {e}")
            return None

    async def ask_question(self, db: Session, qa_request: QARequest, user_id: UUID):
        """Xử lý câu hỏi từ người dùng"""
        
        if not LANGCHAIN_AVAILABLE or not self.llm:
            # Fallback response when LLM not available
            return {
                "id": "fallback-response",
                "type": "assistant", 
                "content": "Xin lỗi, hệ thống AI chưa được cấu hình. Vui lòng liên hệ quản trị viên để thiết lập API keys.",
                "timestamp": datetime.now().isoformat(),
                "sources": [],
                "session_id": None
            }
        
        try:
            # Get or create chat session
            session = await self._get_or_create_session(db, qa_request.session_id, user_id)
            
            # Save user message
            user_message = ChatMessage(
                session_id=session.id,
                type="user",
                content=qa_request.question,
                timestamp=datetime.now()
            )
            db.add(user_message)
            db.commit()
            
            # Get relevant documents for context
            relevant_docs = await self._get_relevant_documents(
                db, qa_request.question, qa_request.context, user_id
            )
            
            # Generate answer using LLM
            answer, sources = await self._generate_answer(
                qa_request.question, relevant_docs
            )
            
            # Save assistant message
            assistant_message = ChatMessage(
                session_id=session.id,
                type="assistant",
                content=answer,
                timestamp=datetime.now(),
                sources=json.dumps([source.dict() for source in sources]) if sources else None,
                msg_metadata={
                    "model_used": getattr(settings, 'DEFAULT_LLM_MODEL', 'unknown'),
                    "context_docs_count": len(relevant_docs)
                }
            )
            db.add(assistant_message)
            db.commit()
            db.refresh(assistant_message)
            
            return {
                "id": str(assistant_message.id),
                "type": "assistant",
                "content": answer,
                "timestamp": assistant_message.timestamp.isoformat(),
                "sources": sources,
                "session_id": str(session.id)
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý câu hỏi: {str(e)}")

    async def _get_or_create_session(self, db: Session, session_id: Optional[UUID], user_id: UUID) -> ChatSession:
        """Lấy hoặc tạo session chat"""
        
        if session_id:
            session = db.query(ChatSession).filter(
                and_(ChatSession.id == session_id, ChatSession.user_id == user_id)
            ).first()
            if session:
                return session
        
        # Create new session
        session = ChatSession(
            user_id=user_id,
            title=f"Chat session {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        
        return session

    async def _get_relevant_documents(
        self, 
        db: Session, 
        question: str, 
        context_doc_ids: Optional[List[str]], 
        user_id: UUID
    ) -> List[Dict[str, Any]]:
        """Tìm các tài liệu liên quan đến câu hỏi"""
        
        relevant_docs = []
        
        if context_doc_ids:
            # Use specific documents if provided
            for doc_id in context_doc_ids:
                document = db.query(Document).filter(
                    and_(
                        Document.id == doc_id,
                        or_(
                            Document.user_id == user_id,
                            Document.shared == True  # Add permission check later
                        )
                    )
                ).first()
                
                if document and document.extracted_text:
                    relevant_docs.append({
                        "id": str(document.id),
                        "title": document.name,
                        "content": document.extracted_text,
                        "type": document.type
                    })
        else:
            # Fallback: search by keywords in document text
            keywords = self._extract_keywords(question)
            for keyword in keywords:
                documents = db.query(Document).filter(
                    and_(
                        or_(
                            Document.user_id == user_id,
                            Document.shared == True
                        ),
                        Document.extracted_text.ilike(f"%{keyword}%")
                    )
                ).limit(3).all()
                
                for doc in documents:
                    relevant_docs.append({
                        "id": str(doc.id),
                        "title": doc.name,
                        "content": doc.extracted_text,
                        "type": doc.type
                    })
        
        return relevant_docs[:5]  # Limit to top 5 documents

    async def _generate_answer(self, question: str, relevant_docs: List[Dict[str, Any]]) -> tuple[str, List[QASource]]:
        """Tạo câu trả lời sử dụng LLM"""
        
        # Prepare context from relevant documents
        context_text = ""
        sources = []
        
        for doc in relevant_docs:
            context_text += f"\n\n--- {doc['title']} ---\n{doc['content'][:1000]}"
            sources.append(QASource(
                title=doc['title'],
                excerpt=doc['content'][:200] + "..." if len(doc['content']) > 200 else doc['content'],
                document_id=doc['id']
            ))
        
        if not LANGCHAIN_AVAILABLE or not self.llm:
            # Simple fallback answer
            if relevant_docs:
                return f"Dựa trên tài liệu '{relevant_docs[0]['title']}', tôi tìm thấy thông tin liên quan nhưng cần cấu hình AI để đưa ra câu trả lời chi tiết.", sources
            else:
                return "Xin lỗi, tôi không tìm thấy thông tin liên quan trong tài liệu của bạn.", sources
        
        try:
            # Create prompt template
            prompt_template = ChatPromptTemplate.from_template("""
Bạn là một trợ lý AI thông minh, giúp trả lời câu hỏi dựa trên các tài liệu được cung cấp.

Ngữ cảnh từ các tài liệu:
{context}

Câu hỏi của người dùng: {question}

Hướng dẫn:
1. Trả lời câu hỏi dựa trên thông tin trong các tài liệu được cung cấp
2. Nếu không tìm thấy thông tin liên quan, hãy nói rõ điều đó
3. Trả lời bằng tiếng Việt, rõ ràng và dễ hiểu
4. Nếu có thể, hãy trích dẫn tên tài liệu chứa thông tin

Câu trả lời:
""")
            
            # Create chain
            chain = (
                {"context": RunnablePassthrough(), "question": RunnablePassthrough()}
                | prompt_template
                | self.llm
                | StrOutputParser()
            )
            
            # Generate answer
            answer = await asyncio.to_thread(
                chain.invoke,
                {"context": context_text, "question": question}
            )
            
            return answer, sources
            
        except Exception as e:
            return f"Xin lỗi, tôi không thể trả lời câu hỏi này lúc này. Lỗi: {str(e)}", sources

    def _extract_keywords(self, question: str) -> List[str]:
        """Trích xuất từ khóa từ câu hỏi"""
        # Simple keyword extraction - can be improved with NLP libraries
        import re
        
        # Remove common words
        stop_words = {
            'là', 'gì', 'như', 'thế', 'nào', 'có', 'được', 'của', 'cho', 'trong', 
            'với', 'về', 'từ', 'khi', 'mà', 'này', 'đó', 'để', 'và', 'hoặc'
        }
        
        # Clean and split question
        clean_question = re.sub(r'[^\w\s]', ' ', question.lower())
        words = clean_question.split()
        
        # Filter keywords
        keywords = [word for word in words if len(word) > 2 and word not in stop_words]
        
        return keywords[:5]  # Return top 5 keywords

    async def get_history(self, db: Session, user_id: UUID) -> List[dict]:
        """Lấy lịch sử hỏi đáp của người dùng"""
        
        sessions = db.query(ChatSession).filter(
            ChatSession.user_id == user_id
        ).order_by(ChatSession.updated_at.desc()).limit(10).all()
        
        history = []
        for session in sessions:
            messages = db.query(ChatMessage).filter(
                ChatMessage.session_id == session.id
            ).order_by(ChatMessage.timestamp.desc()).limit(4).all()
            
            session_data = {
                "session_id": str(session.id),
                "title": session.title,
                "created_at": session.created_at.isoformat(),
                "updated_at": session.updated_at.isoformat(),
                "recent_messages": [
                    {
                        "id": str(msg.id),
                        "type": msg.type,
                        "content": msg.content[:100] + "..." if len(msg.content) > 100 else msg.content,
                        "timestamp": msg.timestamp.isoformat()
                    } for msg in reversed(messages)
                ]
            }
            history.append(session_data)
        
        return history

    async def create_session(self, db: Session, session_data: ChatSessionCreate, user_id: UUID):
        """Tạo session chat mới"""
        
        session = ChatSession(
            user_id=user_id,
            title=session_data.title
        )
        
        db.add(session)
        db.commit()
        db.refresh(session)
        
        return {
            "id": str(session.id),
            "title": session.title,
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat(),
            "message_count": 0
        }

    async def get_session(self, db: Session, session_id: str, user_id: UUID):
        """Lấy chi tiết session chat"""
        
        session = db.query(ChatSession).filter(
            and_(ChatSession.id == session_id, ChatSession.user_id == user_id)
        ).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Không tìm thấy session chat")
        
        messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == session.id
        ).order_by(ChatMessage.timestamp.asc()).all()
        
        return {
            "id": str(session.id),
            "title": session.title,
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat(),
            "messages": [
                {
                    "id": str(msg.id),
                    "type": msg.type,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat(),
                    "sources": json.loads(msg.sources) if msg.sources else None,
                    "rating": msg.rating
                } for msg in messages
            ]
        }

    async def index_document(self, document_id: UUID, document_text: str, document_metadata: dict):
        """Đánh index tài liệu vào vector store"""
        
        if not self.vector_store or not self.text_splitter:
            print(f"Vector store not available, skipping indexing for document {document_id}")
            return False
        
        try:
            # Split document into chunks
            texts = self.text_splitter.split_text(document_text)
            
            # Create documents for vector store
            documents = []
            for i, text in enumerate(texts):
                doc = LangChainDocument(
                    page_content=text,
                    metadata={
                        **document_metadata,
                        "document_id": str(document_id),
                        "chunk_index": i
                    }
                )
                documents.append(doc)
            
            # Add to vector store
            self.vector_store.add_documents(documents)
            
            return True
            
        except Exception as e:
            print(f"Error indexing document {document_id}: {e}")
            return False