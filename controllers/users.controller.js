function publicUser(user) {
  return {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    estado: user.estado,
    fecha_registro: user.fecha_registro,
    ultima_conexion: user.ultima_conexion,
    roles: (user.roles || []).map((role) => role.nombre),
  };
}

function getMe(req, res) {
  res.status(200).json({ usuario: publicUser(req.user) });
}

module.exports = { publicUser, getMe };
