'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // 1. Agregar columna temporal para almacenar los datos
      await queryInterface.addColumn('Projects', 'projectType_temp', {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true,
      }, { transaction });

      // 2. Copiar datos del enum al array (convertir el valor único en un array)
      await queryInterface.sequelize.query(`
        UPDATE "Projects" 
        SET "projectType_temp" = ARRAY["projectType"::text]
        WHERE "projectType" IS NOT NULL;
      `, { transaction });

      // 3. Eliminar la columna original con el ENUM
      await queryInterface.removeColumn('Projects', 'projectType', { transaction });

      // 4. Renombrar la columna temporal
      await queryInterface.renameColumn('Projects', 'projectType_temp', 'projectType', { transaction });

      // 5. Agregar el NOT NULL constraint y valor por defecto
      await queryInterface.changeColumn('Projects', 'projectType', {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
        defaultValue: ['Proyecto'],
      }, { transaction });

      // 6. Eliminar el tipo ENUM si existe
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_Projects_projectType" CASCADE;
      `, { transaction });

      await transaction.commit();
      console.log('✅ Migración completada: projectType convertido de ENUM a ARRAY');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en migración:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // 1. Recrear el ENUM
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_Projects_projectType" AS ENUM ('Diseño', 'Proyecto', 'Dirección de Obra');
      `, { transaction });

      // 2. Crear columna temporal con ENUM
      await queryInterface.addColumn('Projects', 'projectType_temp', {
        type: Sequelize.ENUM('Diseño', 'Proyecto', 'Dirección de Obra'),
        allowNull: true,
      }, { transaction });

      // 3. Copiar el primer valor del array al enum
      await queryInterface.sequelize.query(`
        UPDATE "Projects" 
        SET "projectType_temp" = ("projectType"[1])::"enum_Projects_projectType"
        WHERE "projectType" IS NOT NULL AND array_length("projectType", 1) > 0;
      `, { transaction });

      // 4. Eliminar columna array
      await queryInterface.removeColumn('Projects', 'projectType', { transaction });

      // 5. Renombrar columna temporal
      await queryInterface.renameColumn('Projects', 'projectType_temp', 'projectType', { transaction });

      // 6. Agregar NOT NULL
      await queryInterface.changeColumn('Projects', 'projectType', {
        type: Sequelize.ENUM('Diseño', 'Proyecto', 'Dirección de Obra'),
        allowNull: false,
        defaultValue: 'Proyecto',
      }, { transaction });

      await transaction.commit();
      console.log('✅ Rollback completado: projectType revertido a ENUM');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en rollback:', error);
      throw error;
    }
  }
};
