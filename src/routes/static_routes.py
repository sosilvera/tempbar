from fastapi import APIRouter
from fastapi.responses import FileResponse


router = APIRouter(prefix="/tempbar")

@router.get("/pedir")
async def read_root():
    return FileResponse("static/cliente.html")

@router.get("/barman")
async def read_root():
    return FileResponse("static/barman.html")

@router.get("/pedidos")
async def read_root():
    return FileResponse("static/pedidos.html")