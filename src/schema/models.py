from sqlalchemy import Boolean, Column , ForeignKey
from sqlalchemy import DateTime, Integer, String, Text, Float, Date
from sqlalchemy.types import DECIMAL
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class MasterIngrediente(Base):
    __tablename__ = "MasterIngredientes"
    idIngrediente = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)

class Trago(Base):
    __tablename__ = "Tragos"
    idTrago = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    instrucciones = Column(Text)
    
    ingredientes = relationship("TragoIngrediente", back_populates="trago")

class TragoIngrediente(Base):
    __tablename__ = "TragoIngrediente"
    idTragoIngrediente = Column(Integer, primary_key=True, index=True)
    idTrago = Column(Integer, ForeignKey("Tragos.idTrago", ondelete="CASCADE"))
    idIngrediente = Column(Integer, ForeignKey("MasterIngredientes.idIngrediente", ondelete="CASCADE"))
    cantidad = Column(DECIMAL(10, 2), nullable=False)
    unidad_medida = Column(String(20), nullable=False)
    
    trago = relationship("Trago", back_populates="ingredientes")
    ingrediente = relationship("MasterIngrediente")

class Noche(Base):
    __tablename__ = "Noche"
    idNoche = Column(Integer, primary_key=True, index=True)
    fecha = Column(DateTime, default=datetime.utcnow)
    activo = Column(Boolean, default=True)
    
    inventario = relationship("NocheIngrediente", back_populates="noche")

class NocheIngrediente(Base):
    __tablename__ = "NocheIngrediente"
    idNocheIngrediente = Column(Integer, primary_key=True, index=True)
    idNoche = Column(Integer, ForeignKey("Noche.idNoche", ondelete="CASCADE"))
    idIngrediente = Column(Integer, ForeignKey("MasterIngredientes.idIngrediente", ondelete="CASCADE"))
    cantidad_disponible = Column(DECIMAL    (10, 2), nullable=False)
    
    noche = relationship("Noche", back_populates="inventario")
    ingrediente = relationship("MasterIngrediente")

class Pedidos(Base):
    __tablename__ = "Pedidos"
    idPedido = Column(Integer, primary_key=True, index=True)
    idTrago = Column(Integer, ForeignKey("Tragos.idTrago"))
    idNoche = Column(Integer, ForeignKey("Noche.idNoche"))
    nombre_cliente = Column(String(100), nullable=False)
    fechaPedido = Column(DateTime, default=datetime.utcnow)
    completado = Column(Boolean, default=False)
    
    trago = relationship("Trago")