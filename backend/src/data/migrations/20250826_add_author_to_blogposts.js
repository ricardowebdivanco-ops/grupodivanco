import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface) => {
    try {
      // Verificar si la columna ya existe
      const tableDescription = await queryInterface.describeTable('BlogPosts');
      
      if (!tableDescription.author) {
        await queryInterface.addColumn('BlogPosts', 'author', {
          type: DataTypes.STRING(100),
          allowNull: true,
          defaultValue: 'Administrador'
        });
        console.log('✅ Columna author agregada a BlogPosts');
      } else {
        console.log('⚠️ Columna author ya existe en BlogPosts');
      }
    } catch (error) {
      console.error('❌ Error agregando columna author:', error);
      throw error;
    }
  },

  down: async (queryInterface) => {
    try {
      const tableDescription = await queryInterface.describeTable('BlogPosts');
      
      if (tableDescription.author) {
        await queryInterface.removeColumn('BlogPosts', 'author');
        console.log('✅ Columna author removida de BlogPosts');
      }
    } catch (error) {
      console.error('❌ Error removiendo columna author:', error);
      throw error;
    }
  }
};
