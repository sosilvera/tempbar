from fastapi import APIRouter, HTTPException
from models.models import (CrearPedido, IngredientesNoche)
from commons.querys import Querys
import commons.utils as utils

router = APIRouter(prefix="/bar")
q = Querys()

# Cliente

@router.get("/get_tragos")
async def get_tragos(): # Falta agregar que devuelva el nombre del trago, no solo el id
    noche = q.noche_activa()
    
    if noche:
        ingredientes = q.get_ingredientes_noche()
        tragosIngredientes = q.get_tragos_ingredientes()

        tragosPreparables = utils.tragos_preparables(ingredientes, tragosIngredientes)
        tragosFinales = []
        for trago in tragosPreparables:
            trago_info = q.get_tragos_by_id(trago)
            print(trago_info)
            tragosFinales.append({"idTrago": trago, "nombre": trago_info["nombre"]})

    else:
        tragosPreparables = []
    return tragosFinales

@router.post("/crear_pedido")
async def crear_pedido(pedido: CrearPedido):
    print(pedido)
    pedido = q.crear_pedido(pedido)
    return {"message": "Pedido creado"}

# Barman
@router.get("/noche_activa")
async def get_noche_activa():
    noche = q.noche_activa()
    return noche

@router.post("/finalizar_noche")
async def finalizar_noche():
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
    
    result = q.crear_noche(ingredientes)
    
    return result