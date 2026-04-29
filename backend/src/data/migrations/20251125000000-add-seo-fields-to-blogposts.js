'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('BlogPosts', 'metaTitle', {
      type: Sequelize.STRING(200),
      allowNull: true,
    });
    
    await queryInterface.addColumn('BlogPosts', 'metaDescription', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('BlogPosts', 'metaTitle');
    await queryInterface.removeColumn('BlogPosts', 'metaDescription');
  }
};
