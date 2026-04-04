# Barman for a night

Soy un pseudo barman que cada tanto hace fiestas en su casa, por lo que no suelo tener un stock constante de alcohol. Me gusta prepararle tragos a mis invitados, pero suele ser dificil comunicarles los tragos que les puedo preparar. Idee una aplicaion que consta de dos modulos:
- Modulo cliente:
	- Tiene la lista de tragos disponibles para preparar en la noche, y puede enviar un pedido solo eligiendo uno y poniendo su nombre
- Modulo barman:
	- Tiene la administracion de la noche:
		- Puede crear una noche, la cual permite elegir la materia prima con la que cuento esa noche, a fin de que el sistema matchee de forma autoatica con los tragos que se pueden preparar con los ingredientes disponibles
		- Puedo crear un trago, agregandolo a la lista de posibles tragos que se preparar, los ingredientes que usa y las instrucciones para su preparacion
		- Puedo modificar una noche, cambiando el stock disponible
		- Puedo modificar el maestro de ingredientes, el cual contiene todos los ingredientes que alguna vez use o que se utilizar
		- Puedo ver los pedidos pendientes, y que me habilite a ver como se prepara el trago pedido y marcarlo como entregado
		- Finalmente puedo finalizar la noche, para evitar la carga de nuevos pedidos y habilitar a crear una noche nueva

Las APIs identificadas son las siguientes
- Modulo cliente:
	- /get_tragos -> [DONE]
	- /crear_pedido -> [DONE]
-Modulo barman:
	- /noche_activa -> [DONE]
	- /finalizar_noche -> [DONE]
	- En crear Noche:
		-/get_ingredientes -> [DONE]
		-/crear_noche -> [DONE]
	- En Crear trago:
		-/get_master_ingredientes
		-/crear_trago
	- En Ver Pedidos:
		-/get_pedidos -> [DONE]
		-/get_pedido/idPedido [DONE]

La base de datos consta de las siguientes tablas
- Master de ingredientes
	-idIngrediente
	-nombre
- Tragos
	-idTrago
	-Nombre
	-idTragoIngrediente
	-Instrucciones
- TragoIngrediente
	-idTragoIngrediente
	-idTrago
	-idIngrediente
	-Cantidad
	-Unidad_medida
-Noche:
	-idNoche
	-fecha
	-nocheIngredente
	-activo
-NocheIngrediente:
	-idNocheIngrediente
	-idIngrediente
	-idNoche
	-cantidad
-Pedidos:
	-idPedido
	-completado
	-fechaPedido
	-nombre
	-idTrago


Yo suelo trbajar con un template que usa: FastAPI, SQLAlchemy, MySQL y Boostrap. En routes se definen las rutas estaticas por un lado (que me permiten llamar a los html de cada pantalla), y las rutas de servicios por otro, suelo dividirlo tambien por funcionalidad/pantalla.
En static estan los archivos html,css y js necesarios para el renderizado.
En models defino el modelo de la base de datos.
Template:
requeriments.txt
.env
src:
|_commons
|_main.py
|_models
|_routes
|_schema
|_static


Quiero que:
- Me armes los HTML, JS y CSS de las pantallas involucradas, utilizando boostrap y siguiendo el diseño adjunto, obviamente agregandole color y haciendolo responsive
- Armes los servicios
- Armes el script de creacion de la base de datos en SQL
- Armes los models
- Interpretes los comentarios en la imagen y lo tengas en cuenta para el armado