from schema.models import (Noche, TragoIngrediente, Trago, Pedidos, MasterIngrediente, NocheIngrediente, Base)
from sqlalchemy import create_engine, func, and_, or_, update
from sqlalchemy.orm import sessionmaker, aliased
from datetime import datetime
import commons.env as env

class Querys():
    def __init__(self):
        # Ruta relativa o absoluta de la base de datos SQLite3
        ruta_db = "tragos.db"

        # Crear la conexión a la base de datos SQLite3
        engine = create_engine(f"sqlite:///{ruta_db}")
        Base.metadata.create_all(engine)
        Session = sessionmaker(bind=engine)

        self.session = Session()


    def noche_activa(self):
        try:
            # select idNoche from Noche where activo = 1;
            result = self.session.query(Noche.idNoche).filter(Noche.activo == 1).first()
            
            return {"value": result[0]}
        except Exception as e:
            return {"value": 0}

    # Devuelve array de idIngredientes disponibles en la noche activa
    def get_ingredientes_noche(self):
        try:
            # select idIngrediente from NocheIngrediente where idNoche = 1;
            result = self.session.query(NocheIngrediente.idIngrediente).filter(NocheIngrediente.idNoche == 1).all()
            return [r[0] for r in result]
        except Exception as e:
            return {"value": 0}

    def get_tragos_ingredientes(self):
        try:
            # select idTrago, idIngrediente from TragoIngrediente;
            result = self.session.query(TragoIngrediente.idTrago, TragoIngrediente.idIngrediente).all()
            # Agrupar ingredientes por idTrago
            tragos_dict = {}
            for trago_id, ingrediente_id in result:
                if trago_id not in tragos_dict:
                    tragos_dict[trago_id] = []
                tragos_dict[trago_id].append(ingrediente_id)
            
            return [{"idTrago": trago_id, "ingredientes": ingredientes} 
                    for trago_id, ingredientes in tragos_dict.items()]
        except Exception as e:
            return [{"idTrago": 0, "ingredientes": []}]

    def get_tragos_by_id(self, id):
        try:
            # select Nombre from Tragos where idTrago = id;
            result = self.session.query(Trago.nombre).filter(Trago.idTrago == id).first()
            return {"nombre": result[0]}
        except Exception as e:
            return {"value": 0}

    def crear_pedido(self, pedido):
        try:
            # Insertar nuevo pedido en la tabla Pedidos
            new_pedido = Pedidos(
                idTrago=pedido.idTrago,
                idNoche=pedido.idNoche,
                nombre_cliente=pedido.nombre_cliente,
                fechaPedido=datetime.utcnow(),
                completado=False
            )
            self.session.add(new_pedido)
            self.session.commit()
            return {"message": "Pedido creado"}
        except Exception as e:
            self.session.rollback()
            return {"message": "Error al crear el pedido"}

    def finalizar_noche(self):
        try:
            # Update Noche set activo = 0 where activo = 1;
            self.session.query(Noche).filter(Noche.activo == 1).update({Noche.activo: 0})
            self.session.commit()
            return {"message": "Noche finalizada"}
        except Exception as e:
            self.session.rollback()
            return {"message": "Error al finalizar la noche"}

    def get_pedidos(self):
        try:
            # select tp.idPedido, tp.idTrago, tp.nombre_cliente, t.nombre from tragos.pedidos tp
            # inner join tragos.tragos t on tp.idTrago = t.idTrago;
            result = self.session.query(Pedidos.idPedido, Pedidos.idTrago, Pedidos.nombre_cliente, Trago.nombre).join(Trago, Pedidos.idTrago == Trago.idTrago).all()
            return [{"idPedido": r[0], "idTrago": r[1], "nombreCliente": r[2], "nombreTrago": r[3]} for r in result]
        except Exception as e:
            return []

    def get_pedido_by_id(self, idPedido):
        try:
            # select idPedido, idTrago, nombreCliente from Pedidos where idPedido = id;
            result = self.session.query(Pedidos.idPedido, Pedidos.idTrago, Pedidos.nombre_cliente).filter(and_(Pedidos.idPedido == idPedido, Pedidos.completado == False)).first()
            return {"idPedido": result[0], "idTrago": result[1], "nombre_cliente": result[2]}
        except Exception as e:
            return {"idPedido": 0, "idTrago": 0, "nombre_cliente": ""}

    def get_trago(self, idTrago):
        try:
            # select idTrago, nombre, instrucciones from Tragos where idTrago = id;
            result = self.session.query(Trago.idTrago, Trago.nombre, Trago.instrucciones).filter(Trago.idTrago == idTrago).first()

            
            ingredientes_result = self.session.query(
                MasterIngrediente.nombre,
                TragoIngrediente.cantidad,
                TragoIngrediente.unidad_medida
            ).join(
                MasterIngrediente,
                MasterIngrediente.idIngrediente == TragoIngrediente.idIngrediente
            ).filter(TragoIngrediente.idTrago == idTrago).all()

            ingredientes = [
                {
                    "nombreIngrediente": ing[0],
                    "cantidad": ing[1],
                    "unidad_medida": ing[2]
                }
                for ing in ingredientes_result
            ]
            print(ingredientes)
            return {
                "idTrago": result[0],
                "nombre": result[1],
                "instrucciones": result[2],
                "ingredientes": ingredientes
            }
        except Exception as e:
            print(e)
            return {"idTrago": 0, "nombre": "", "instrucciones": "", "ingredientes": []}

    def get_ingredientes(self):
        try:
            # select idIngrediente, nombre from MasterIngredientes;
            result = self.session.query(MasterIngrediente.idIngrediente, MasterIngrediente.nombre).all()
            return [{"idIngrediente": r[0], "nombre": r[1]} for r in result]
        except Exception as e:
            return []

    def crear_noche(self, ingredientes):
        try:
            # Insertar nueva noche
            new_noche = Noche(
                fecha=datetime.utcnow(),
                activo=True
            )
            self.session.add(new_noche)
            self.session.commit()

            # Obtener el id de la noche recién creada
            id_noche = new_noche.idNoche

            # Borrar todos los ingredientes de noches anteriores (si es que hay)
            self.session.query(NocheIngrediente).delete()
            self.session.commit()

            # Insertar los ingredientes de la nueva noche
            for ingrediente in ingredientes.ingredientes:
                new_noche_ingrediente = NocheIngrediente(
                    idNoche=id_noche,
                    idIngrediente=ingrediente["idIngrediente"],
                    cantidad_disponible=ingrediente["cantidad"]
                )
                self.session.add(new_noche_ingrediente)
            self.session.commit()

            # Validar si hay nuevos ingredientes para agregar al master
            for nuevo in ingredientes.nuevos:
                new_ingrediente = MasterIngrediente(
                    nombre=nuevo["nombre"]
                )
                self.session.add(new_ingrediente)
                self.session.commit()

                # Obtener el id del nuevo ingrediente agregado al master
                id_ingrediente = new_ingrediente.idIngrediente
                # Insertar el nuevo ingrediente en la noche actual con la cantidad disponible
                new_noche_ingrediente = NocheIngrediente(
                    idNoche=id_noche,
                    idIngrediente=id_ingrediente,
                    cantidad_disponible=nuevo["cantidad"]
                )
                self.session.add(new_noche_ingrediente)
                self.session.commit()
            return {"idNoche": id_noche, "message": "Noche creada"}
        except Exception as e:
            print(e)
            self.session.rollback()
            return {"message": "Error al crear la noche"}

    # Cierro la sesion de la base
    def sessionClose(self):
        self.session.close()
