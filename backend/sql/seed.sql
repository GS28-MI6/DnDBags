USE dndbags;

INSERT IGNORE INTO rulesets (name, description) VALUES
('5e', 'Dungeons & Dragons 5ta Edición'),
('4e', 'Dungeons & Dragons 4ta Edición');

INSERT IGNORE INTO item_types (name) VALUES
('weapons'),
('armor'),
('objects'),
('tools');

-- Base items for 5e (ruleset_id = 1)
INSERT IGNORE INTO base_items (ruleset_id, name, weight, description, item_type_id) VALUES
(1, 'Espada larga', 3.000, 'Una espada de hoja larga y recta, versátil para combate cuerpo a cuerpo.', 1),
(1, 'Arco corto', 2.000, 'Arco ligero, ideal para arqueros ágiles.', 1),
(1, 'Daga', 1.000, 'Cuchillo pequeño y rápido, útil para combates cercanos.', 1),
(1, 'Hacha de batalla', 4.000, 'Hacha pesada diseñada para el combate.', 1),
(1, 'Lanza', 3.000, 'Arma de asta con punta de metal, para atacar a distancia.', 1),
(1, 'Armadura de cuero', 10.000, 'Armadura ligera confeccionada con cuero endurecido.', 2),
(1, 'Cota de malla', 55.000, 'Armadura pesada formada por anillos metálicos entrelazados.', 2),
(1, 'Escudo', 6.000, 'Escudo de madera y metal para deflectar ataques.', 2),
(1, 'Armadura de placas', 65.000, 'La armadura más resistente, compuesta de placas de metal.', 2),
(1, 'Mochila de aventurero', 5.000, 'Contiene suministros básicos para la aventura.', 3),
(1, 'Cuerda de cáñamo (15m)', 10.000, 'Cuerda resistente de 15 metros de largo.', 3),
(1, 'Antorcha', 1.000, 'Proporciona luz brillante en un radio de 6 metros.', 3),
(1, 'Poción de curación', 0.500, 'Restaura 2d4+2 puntos de golpe al beberla.', 3),
(1, 'Kit de herramientas de ladrón', 1.000, 'Herramientas para abrir cerraduras y desactivar trampas.', 4),
(1, 'Instrumento musical (laúd)', 2.000, 'Instrumento de cuerda para bardos y músicos.', 4),

-- Base items for 4e (ruleset_id = 2)
(2, 'Espada corta', 2.000, 'Espada de hoja corta, fácil de manejar.', 1),
(2, 'Martillo de guerra', 5.000, 'Martillo pesado para combate cuerpo a cuerpo.', 1),
(2, 'Ballesta ligera', 5.000, 'Arma de proyectiles fácil de usar.', 1),
(2, 'Armadura de cuero tachonado', 15.000, 'Armadura de cuero reforzada con tachuelas metálicas.', 2),
(2, 'Armadura de escamas', 45.000, 'Armadura de escamas metálicas superpuestas.', 2),
(2, 'Escudo de torre', 45.000, 'Escudo grande que proporciona cobertura total.', 2),
(2, 'Kit de supervivencia', 4.000, 'Herramientas esenciales para sobrevivir en la naturaleza.', 3),
(2, 'Tienda de campaña', 20.000, 'Refugio portátil para una o dos personas.', 3),
(2, 'Herramientas de herrero', 8.000, 'Conjunto de herramientas para trabajar el metal.', 4);
