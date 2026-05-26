const express = require("express");
const connectMongoDB = require("./mongoConnection");
const pool = require("./db");
const app = express();
const Vehiculo = require("./Vehiculos");

//Conexión a MongoDB
connectMongoDB();
app.use(express.json());

pool
  .connect()
  .then(() => {
    console.log("Conexión exitosa a PostgreSQL");
  })
  .catch((err) => {
    console.error("Error de conexión:", err);
  });

app.get("/", (req, res) => {
  res.send("API funcionando");
});

// Ruta GET: Obtener todos los alumnos
app.get("/alumnos", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM alumno");
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al consultar alumnos:", error);
    res.status(500).json({ error: "Error al obtener los alumnos" });
  }
});

app.post("/alumnos", async (req, res) => {
  try {
    const { nombre, apellido, edad, correo } = req.body;
    if (!nombre || !apellido || !edad || !correo) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }
    const resultado = await pool.query(
      "INSERT INTO alumno (nombre, apellido, edad, correo) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre, apellido, edad, correo],
    );
    res.status(201).json({
      mensaje: "Alumno insertado correctamente",
      alumno: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al insertar alumno:", error);
    res.status(500).json({ error: "Error al insertar el alumno" });
  }
});

app.get("/alumnos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ error: "El id debe ser numérico" });
    }

    const resultado = await pool.query("SELECT * FROM alumno WHERE id = $1", [
      id,
    ]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al consultar alumno:", error);
    res.status(500).json({ error: "Error al obtener el alumno" });
  }
});

app.get("/materias", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM materia");
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al consultar materias:", error);
    res.status(500).json({ error: "Error al obtener las materias" });
  }
});

app.post("/materias", async (req, res) => {
  try {
    const { nombre, semestre, creditos } = req.body;
    if (!nombre || !semestre || !creditos) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    const resultado = await pool.query(
      "INSERT INTO materia (nombre, semestre, creditos) VALUES ($1, $2, $3) RETURNING *",
      [nombre, semestre, creditos],
    );

    res.status(201).json({
      mensaje: "Materia insertada correctamente",
      materia: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al insertar materia:", error);
    res.status(500).json({ error: "Error al insertar la materia" });
  }
});

app.get("/materias/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ error: "El id debe ser numérico" });
    }

    const resultado = await pool.query("SELECT * FROM materia WHERE id = $1", [
      id,
    ]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al consultar materia:", error);
    res.status(500).json({ error: "Error al obtener la materia" });
  }
});

app.post("/api/assignMateriaToAlumno", async (req, res) => {
  try {
    const { alumno_id, materia_id } = req.body;

    if (!alumno_id || !materia_id) {
      return res.status(400).json({
        message: "Los campos alumno_id y materia_id son obligatorios",
      });
    }
    if (isNaN(alumno_id) || isNaN(materia_id)) {
      return res.status(400).json({ message: "Los IDs deben ser numéricos" });
    }

    const checkAlumno = await pool.query(
      'SELECT * FROM alumno WHERE id = $1 AND "isActive" = true',
      [alumno_id],
    );
    if (checkAlumno.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "El alumno no existe o está inactivo" });
    }

    const checkMateria = await pool.query(
      "SELECT * FROM materia WHERE id = $1",
      [materia_id],
    );
    if (checkMateria.rows.length === 0) {
      return res.status(404).json({ message: "La materia no existe" });
    }

    const checkRelacion = await pool.query(
      "SELECT * FROM alumno_materia WHERE alumno_id = $1 AND materia_id = $2",
      [alumno_id, materia_id],
    );
    if (checkRelacion.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "El alumno ya tiene asignada esta materia" });
    }

    await pool.query(
      "INSERT INTO alumno_materia (alumno_id, materia_id) VALUES ($1, $2)",
      [alumno_id, materia_id],
    );

    res.status(201).json({
      message: "Materia asignada al alumno correctamente",
      data: { alumno_id, materia_id },
    });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.get("/api/getMateriasByAlumnoId/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ message: "El ID del alumno debe ser numérico" });
    }

    const checkAlumno = await pool.query(
      'SELECT * FROM alumno WHERE id = $1 AND "isActive" = true',
      [id],
    );
    if (checkAlumno.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "El alumno no existe o está inactivo" });
    }

    const consulta = `
      SELECT m.id, m.nombre, m.semestre, m.creditos 
      FROM materia m
      JOIN alumno_materia am ON m.id = am.materia_id
      WHERE am.alumno_id = $1
    `;
    const resultado = await pool.query(consulta, [id]);

    res.status(200).json({
      message: "Materias consultadas correctamente",
      data: resultado.rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.get("/api/getMateriasCountByAlumnoId/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ message: "El ID del alumno debe ser numérico" });
    }

    const checkAlumno = await pool.query(
      'SELECT * FROM alumno WHERE id = $1 AND "isActive" = true',
      [id],
    );
    if (checkAlumno.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "El alumno no existe o está inactivo" });
    }

    const resultado = await pool.query(
      "SELECT COUNT(*) FROM alumno_materia WHERE alumno_id = $1",
      [id],
    );

    const total = parseInt(resultado.rows[0].count, 10);

    res.status(200).json({
      message: "Conteo de materias exitoso",
      data: { total_materias: total },
    });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
});
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});

//Mongodb Endpoints

app.get("/api/getVehiculos", async (req, res) => {
  try {
    const vehiculos = await Vehiculo.find();

    res.status(200).json({
      message: "Vehículos consultados correctamente",
      data: vehiculos,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al consultar vehículos",
      error: error.message,
    });
  }
});

app.post("/api/createVehiculo", async (req, res) => {
  try {
    const { marca, modelo, anio } = req.body;

    if (!marca || !modelo || !anio) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    if (isNaN(anio)) {
      return res.status(400).json({
        message: "El año debe ser numérico",
      });
    }

    const nuevoVehiculo = new Vehiculo({
      marca,
      modelo,
      anio,
    });

    await nuevoVehiculo.save();

    res.status(201).json({
      message: "Vehículo creado correctamente",
      data: nuevoVehiculo,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear vehículo",
      error: error.message,
    });
  }
});
