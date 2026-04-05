from fastapi import APIRouter, HTTPException
from models.models import (CrearPedido, IngredientesNoche, CrearTrago, CrearIngrediente, IngredientesModificarNoche)
from commons.querys import Querys
import commons.utils as utils

router = APIRouter(prefix="/bar")
q = Querys()

# Cliente

@router.get("/get_tragos")
async def get_tragos(): # Falta agregar que devuelva el nombre del trago, no solo el id
    noche = q.noche_activa()
    
    if noche:
        ingredientes = q.get_ingredientes_noche(noche["value"])
        tragosIngredientes = q.get_tragos_ingredientes()
        tragosPreparables = utils.tragos_preparables(ingredientes, tragosIngredientes)
        tragosFinales = []
        for trago in tragosPreparables:
            trago_info = q.get_trago(trago)
            tragosFinales.append({"idTrago": trago, "nombre": trago_info["nombre"], "descripcion": trago_info["descripcion"]})
    else:
        tragosPreparables = []
    return tragosFinales

@router.get("/get_all_tragos")
async def get_all_tragos():
    tragos = q.get_all_tragos()
    return tragos

@router.post("/crear_pedido")
async def crear_pedido(pedido: CrearPedido):
    pedido = q.crear_pedido(pedido)
    return {"message": "Pedido creado"}

# Barman
@router.get("/noche_activa")
async def get_noche_activa():
    noche = q.noche_activa()
    return noche

@router.get("/get_ingredientes_noche")
async def get_ingredientes_noche():
    noche = q.noche_activa()
        
    if not noche:
        return {"activos": [], "para_agregar": []}
        
    ingredientes_activos = q.get_ingredientes_noche(noche["value"])
    todos_ingredientes = q.get_ingredientes()

    activos = []
    inactivos = []
    for i in todos_ingredientes:
        if i['idIngrediente'] in ingredientes_activos:
            activos.append(i)
        else:
            inactivos.append(i) 
        
    return {"activos": activos, "para_agregar": inactivos}

@router.post("/modificar_noche")
async def modificar_noche(ingredientes: IngredientesModificarNoche):
    # Validar que exista una noche activa
    noche_activa = q.noche_activa()

    if not noche_activa:
        raise HTTPException(status_code=400, detail="No hay ninguna noche activa")

    result = q.modificar_noche(ingredientes)
    return result

@router.post("/finalizar_noche")
async def finalizar_noche():
    q.borrar_pedidos()
    result = q.finalizar_noche()
    return result

@router.get("/get_pedidos")
async def get_pedidos():
    pedidos = q.get_pedidos() # [{idPedido, idTrago, nombreCliente}]
    return pedidos

@router.get("/get_pedido/{idPedido}")
async def get_pedido(idPedido: int):
    pedido = q.get_pedido_by_id(idPedido) # {idPedido, idTrago, nombreCliente}
    
    trago = q.get_trago(pedido["idTrago"]) # {idTrago, nombre, instrucciones, ingredientes[]}
    return {"idPedido": idPedido, "nombreCliente": pedido["nombre_cliente"], "trago": trago}

@router.get("/get_ingredientes")
async def get_ingredientes():
    ingredientes = q.get_ingredientes() # Llamo al master de ingredientes, para luego seleccionar e ingresar la cantidad disponible de cada uno
    return ingredientes # [{"idIngrediente", "nombre"}]

@router.post("/crear_noche")
async def crear_noche(ingredientes: IngredientesNoche):
    # Validar que no exista una noche activa
    noche_activa = q.noche_activa()

    # Si hay noche activa, finalizarla
    if noche_activa:
        q.finalizar_noche()
        q.borrar_pedidos()
    
    result = q.crear_noche(ingredientes)

    return result

@router.post("/crear_trago")
async def crear_trago(trago: CrearTrago):
    result = q.crear_trago(trago)
    return result

@router.post("/completar_pedido/{idPedido}")
async def completar_pedido(idPedido: int):
    result = q.completar_pedido(idPedido)
    return result

@router.post("/crear_ingrediente")
async def crear_ingrediente(ingrediente: CrearIngrediente):
    result = q.crear_ingrediente(ingrediente) # result es el id del ingrediente creado
    return {"message": "Ingrediente creado", "idIngrediente": result}

@router.post("/eliminar_ingrediente/{idIngrediente}")
async def eliminar_ingrediente(idIngrediente: int):
    result = q.eliminar_ingrediente(idIngrediente)
    return result
