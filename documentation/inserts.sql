-- Insertar ingredientes
INSERT INTO MasterIngredientes (nombre) VALUES
('Vodka'),
('Ron'),
('Ginebra'),
('Limón'),
('Lima'),
('Jugo de Naranja'),
('Jugo de Cranberry'),
('Refresco de Cola'),
('Hielo'),
('Azúcar');

-- Insertar tragos
INSERT INTO Tragos (nombre, instrucciones) VALUES
('Margarita', 'Mezclar tequila, triple sec y jugo de limón. Servir en vaso con hielo y sal en el borde.'),
('Mojito', 'Machacar menta con azúcar. Añadir ron y hielo. Rellenar con soda.'),
('Cosmopolitan', 'Mezclar vodka, triple sec, jugo de cranberry y limón. Servir en vaso de cóctel.');

-- Insertar recetas (TragoIngrediente)
INSERT INTO TragoIngrediente (idTrago, idIngrediente, cantidad, unidad_medida) VALUES
(1, 3, 2, 'oz'),
(1, 4, 1.5, 'oz'),
(2, 2, 2, 'oz'),
(2, 5, 0.5, 'oz'),
(2, 10, 6, 'piezas'),
(3, 1, 1.5, 'oz'),
(3, 7, 1, 'oz'),
(3, 4, 0.5, 'oz');

-- Insertar noche
INSERT INTO Noche (activo) VALUES (TRUE);

-- Insertar stock de la noche
INSERT INTO NocheIngrediente (idNoche, idIngrediente, cantidad_disponible) VALUES
(1, 1, 1000),
(1, 2, 800),
(1, 3, 600),
(1, 4, 500),
(1, 5, 400);

-- Insertar pedidos
INSERT INTO Pedidos (idTrago, idNoche, nombre_cliente, completado) VALUES
(1, 1, 'Juan Pérez', FALSE),
(2, 1, 'María García', TRUE),
(3, 1, 'Carlos López', FALSE);