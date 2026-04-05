CREATE TABLE IF NOT EXISTS MasterIngredientes (
    idIngrediente INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Tragos (
    idTrago INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    instrucciones TEXT,
    descripcion TEXT
);

-- Tabla intermedia para la receta del trago
CREATE TABLE IF NOT EXISTS TragoIngrediente (
    idTragoIngrediente INTEGER PRIMARY KEY AUTOINCREMENT,
    idTrago INTEGER NOT NULL,
    idIngrediente INTEGER NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL,
    FOREIGN KEY (idTrago) REFERENCES Tragos(idTrago) ON DELETE CASCADE,
    FOREIGN KEY (idIngrediente) REFERENCES MasterIngredientes(idIngrediente) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Noche (
    idNoche INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT 1
);

-- Tabla intermedia para el stock de esa noche
CREATE TABLE IF NOT EXISTS NocheIngrediente (
    idNocheIngrediente INTEGER PRIMARY KEY AUTOINCREMENT,
    idNoche INTEGER NOT NULL,
    idIngrediente INTEGER NOT NULL,
    cantidad_disponible DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (idNoche) REFERENCES Noche(idNoche) ON DELETE CASCADE,
    FOREIGN KEY (idIngrediente) REFERENCES MasterIngredientes(idIngrediente) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Pedidos (
    idPedido INTEGER PRIMARY KEY AUTOINCREMENT,
    idTrago INTEGER NOT NULL,
    idNoche INTEGER NOT NULL,
    nombre_cliente VARCHAR(100) NOT NULL,
    fechaPedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    completado BOOLEAN DEFAULT 0,
    FOREIGN KEY (idTrago) REFERENCES Tragos(idTrago),
    FOREIGN KEY (idNoche) REFERENCES Noche(idNoche)
);
