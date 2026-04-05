from pydantic import BaseModel

# Modelos Pydantic para las solicitudes y respuestas
class CrearPedido(BaseModel):
    idTrago: int
    idNoche: int
    nombre_cliente: str

class IngredientesNoche(BaseModel):
    ingredientes: list[dict]
    nuevos: list[dict] # [{"nombre": "Ingrediente1", cantidad: 10}, {"nombre": "Ingrediente2", cantidad: 5}]

class CrearTrago(BaseModel):
    nombre: str
    instrucciones: str
    ingredientes: list[dict] # [{"idIngrediente": 1, "cantidad": 10, "unidad_medida": "ml"}, {"idIngrediente": 2, "cantidad": 5, "unidad_medida": "g"}] 

class CrearIngrediente(BaseModel):
    nombre: str

class IngredientesModificarNoche(BaseModel):
    sacar: list[dict] # [{"idIngrediente": 1, "cantidad": 10, "unidad_medida": "ml"}, {"idIngrediente": 2, "cantidad": 5, "unidad_medida": "g"}]
    agregar: list[dict] # [{"nombre": "Ingrediente1", cantidad: 10, "unidad_medida": "ml"}, {"nombre": "Ingrediente2", cantidad: 5, "unidad_medida": "g"}]