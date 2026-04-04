from fastapi import APIRouter
from fastapi.responses import FileResponse


router = APIRouter(prefix="/bar")

@router.get("/")
async def read_root():
    return FileResponse("static/cliente.html")