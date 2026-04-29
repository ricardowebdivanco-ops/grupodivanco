import {User} from '../data/models/index.js';
import bcrypt from 'bcryptjs';

export const createUser = async (req, res, next) => {
  try {
    const { email, name, username, password, role } = req.body;
    
    // Validar que el email esté presente
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es requerido'
      });
    }
    
    // Validar que la contraseña esté presente
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña es requerida'
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({ 
      email, 
      name,
      username, 
      password: hashedPassword, 
      role: role || 'user'
    });
    
    // Remover la contraseña de la respuesta
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear usuario'
    });
  }
};

export const getUsers = async (req, res, next) => {
  try {
    console.log('🔍 Obteniendo todos los usuarios...');
    
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // ✅ Excluir contraseñas por seguridad
    });
    
    console.log('✅ Usuarios encontrados:', users.length);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { email, name, username, password, role } = req.body;
    
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Actualizar campos si están presentes
    if (email) user.email = email;
    if (name !== undefined) user.name = name; // Permite valores null
    if (username !== undefined) user.username = username;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role) user.role = role;
    
    await user.save();
    
    // Remover la contraseña de la respuesta
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar usuario'
    });
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    await user.destroy();
    
    res.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al eliminar usuario'
    });
  }
};
