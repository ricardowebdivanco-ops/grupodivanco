'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar columna isOnSale a la tabla Products
    await queryInterface.addColumn('Products', 'isOnSale', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remover columna isOnSale de la tabla Products
    await queryInterface.removeColumn('Products', 'isOnSale');
  }
};
