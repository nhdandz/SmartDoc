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

# LangChain imports
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.embeddings.huggingface import HuggingFaceEmbeddings
from langchain.vectorstores.chroma import Chroma
from langchain.chat_models import ChatOpenAI
from langchain.llms import Ollama
from langchain.schema import Document as LangChainDocument
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser

from app.models import Document, ChatSession, ChatMessage, VectorStore
from app.schemas import QARequest, ChatSessionCreate, QASource
from app.config import settings

class QAService:
    def __init__(self):
        self.embeddings = self._initialize_embeddings()
        self.llm = self._initialize_llm()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        self.vector_store = self._initialize_vector_store()

    def _initialize_embeddings(self):
        """Khởi tạo embedding model"""
        try:
            if settings.OPENAI_API_KEY:
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
        try:
            if settings.OPENAI_API_KEY:
                return ChatOpenAI(
                    model_name=settings.DEFAULT_LLM_MODEL,
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
        try:
            if self.embeddings:
                return Chroma(
                    persist_directory=settings.CHROMA_DB_PATH,
                    embedding_function=self.embeddings
                )
        except Exception as e:
            print(f"Warning: Could not initialize vector store: {e}")
            return None

    async def ask_question(self, db: Session, qa_request: QARequest, user_id: UUID):
        """Xử lý câu hỏi từ người dùng"""
        
        if not self.llm:
            raise HTTPException(status_code=500, detail="LLM chưa được cấu hình")
        
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
                metadata={
                    "model_used": settings.DEFAULT_LLM_MODEL,
                    "context_docs_count": len(relevant_docs)
                }
            )
            db.add(assistant_message)
            db.commit()
            db.refresh(assistant_message)
            
            return {
                "id": assistant_message.id,
                "type": "assistant",
                "content": answer,
                "timestamp": assistant_message.timestamp.isoformat(),
                "sources": sources,
                "session_id": session.id
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
            # Search using vector similarity if vector store is available
            if self.vector_store:
                try:
                    # Search in vector store
                    results = self.vector_store.similarity_search(
                        question, k=5  # Get top 5 relevant chunks
                    )
                    
                    for result in results:
                        relevant_docs.append({
                            "id": result.metadata.get("document_id", "unknown"),
                            "title": result.metadata.get("title", "Unknown Document"),
                            "content": result.page_content,
                            "type": result.metadata.get("type", "text")
                        })
                except Exception as e:
                    print(f"Vector search failed: {e}")
            
            # Fallback: search by keywords in document text
            if not relevant_docs:
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
        
        try:
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
                "session_id": session.id,
                "title": session.title,
                "created_at": session.created_at.isoformat(),
                "updated_at": session.updated_at.isoformat(),
                "recent_messages": [
                    {
                        "id": msg.id,
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
            "id": session.id,
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
            "id": session.id,
            "title": session.title,
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat(),
            "messages": [
                {
                    "id": msg.id,
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
        
        if not self.vector_store:
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