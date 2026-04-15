
CREATE TABLE alumno (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    edad INT,
    correo VARCHAR(150) UNIQUE
);

CREATE TABLE materia (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    semestre INT,
    creditos INT
);

CREATE TABLE alumno_materia (
    id SERIAL PRIMARY KEY,
    alumno_id INT NOT NULL,
    materia_id INT NOT NULL,
    FOREIGN KEY (alumno_id) REFERENCES alumno(id),
    FOREIGN KEY (materia_id) REFERENCES materia(id)
);

INSERT INTO alumno (nombre, apellido, edad, correo) VALUES
('Juan', 'Pérez', 20, 'juan.perez@correo.com'),
('María', 'López', 22, 'maria.lopez@correo.com'),
('Carlos', 'Sánchez', 21, 'carlos.sanchez@correo.com'),
('Ana', 'Gómez', 19, 'ana.gomez@correo.com'),
('Luis', 'Martínez', 23, 'luis.martinez@correo.com');

INSERT INTO materia (nombre, semestre, creditos) VALUES
('Base de Datos', 4, 8),
('Programación Web', 5, 7),
('Ingeniería de Software', 6, 6),
('Redes', 4, 5);

INSERT INTO alumno_materia (alumno_id, materia_id) VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 3),
(3, 2),
(3, 4),
(4, 1),
(4, 4),
(5, 2),
(5, 3);