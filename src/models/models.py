from pydantic import BaseModel

# Modelos Pydantic para las solicitudes y respuestas
class CrearPedido(BaseModel):
    idTrago: int
    idNoche: int
    nombre_cliente: str

class IngredientesNoche(BaseModel):
    ingredientes: list[dict]
    nuevos: list[dict] # [{"nombre": "Ingrediente1", cantidad: 10}, {"nombre": "Ingrediente2", cantidad: 5}]