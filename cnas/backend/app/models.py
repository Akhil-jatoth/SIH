from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from .database import Base

class Entity(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)  # Person, Vehicle, Phone, Account, Location, Organization
    attributes = Column(JSON, default=dict)
    risk_score = Column(Float, default=0.0)

    # Relationships as source and target
    outgoing_relations = relationship("Relationship", foreign_keys="Relationship.source_entity_id", back_populates="source")
    incoming_relations = relationship("Relationship", foreign_keys="Relationship.target_entity_id", back_populates="target")
    events = relationship("Event", back_populates="entity")

class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, index=True)
    source_entity_id = Column(Integer, ForeignKey("entities.id"), nullable=False)
    target_entity_id = Column(Integer, ForeignKey("entities.id"), nullable=False)
    relation_type = Column(String(100), nullable=False)  # called, transacted_with, co_located, owns, family_of, associate_of
    weight = Column(Float, default=1.0)
    timestamp = Column(String(50), nullable=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True)

    source = relationship("Entity", foreign_keys=[source_entity_id], back_populates="outgoing_relations")
    target = relationship("Entity", foreign_keys=[target_entity_id], back_populates="incoming_relations")
    case = relationship("Case", back_populates="relationships")

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="Active")  # Active, Under Review, Closed, Critical
    created_at = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)

    relationships = relationship("Relationship", back_populates="case")
    events = relationship("Event", back_populates="case")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(Integer, ForeignKey("entities.id"), nullable=False)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True)
    description = Column(Text, nullable=False)
    timestamp = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    entity = relationship("Entity", back_populates="events")
    case = relationship("Case", back_populates="events")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    actor = Column(String(100), default="Investigator #4092")
    details = Column(Text, nullable=False)
    block_hash = Column(String(64), nullable=False)


class MissionTransfer(Base):
    __tablename__ = "mission_transfers"

    id = Column(Integer, primary_key=True, index=True)
    operation_name = Column(String(255), nullable=False, index=True)  # Public, visible to anyone
    code_word_hash = Column(String(255), nullable=False)  # Hidden, SHA256 hashed
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True)
    
    # Present / Outgoing CBI Officer Details
    outgoing_officer_name = Column(String(255), nullable=False)
    outgoing_officer_badge = Column(String(100), nullable=False)
    outgoing_officer_rank = Column(String(100), nullable=False)
    outgoing_officer_department = Column(String(255), nullable=False)
    outgoing_officer_clearance = Column(String(100), default="LEVEL-V TOP SECRET")
    outgoing_officer_zone = Column(String(255), nullable=True)
    outgoing_officer_service_no = Column(String(100), nullable=True)
    handover_notes = Column(Text, nullable=True)
    
    # Target Recipient Officer Details
    target_officer_name = Column(String(255), nullable=False)
    target_officer_badge = Column(String(100), nullable=True)
    
    # Security State & Life Cycle
    status = Column(String(50), default="LOCKED_PENDING")  # LOCKED_PENDING, CLAIMED, COMPROMISED_ALERT, DESTROYED_PURGED
    failed_attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    created_at = Column(String(50), nullable=False)
    updated_at = Column(String(50), nullable=True)
    
    # Serialized Encrypted Intelligence Payload
    payload_json = Column(JSON, default=dict)


class IntruderBreachLog(Base):
    __tablename__ = "intruder_breach_logs"

    id = Column(Integer, primary_key=True, index=True)
    transfer_id = Column(Integer, nullable=True)
    operation_name = Column(String(255), nullable=False)
    attempt_number = Column(Integer, nullable=False)
    entered_code_sample = Column(String(50), default="***MASKED***")
    face_snapshot_base64 = Column(Text, nullable=True)  # Captured face image from camera
    timestamp = Column(String(50), nullable=False)
    ip_address = Column(String(100), default="127.0.0.1 (Local Terminal)")
    user_agent = Column(String(255), default="CBI Field Terminal v2.4")
    severity = Column(String(50), default="CRITICAL_BREACH")
    status = Column(String(50), default="ACTIVE_ALERT")  # ACTIVE_ALERT, VIEWED, PURGED

