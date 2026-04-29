// Migración para sincronizar estructura en producción
export async function up(queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log('🔄 Ejecutando migración de sincronización...');
    
    // Verificar y crear tablas si no existen
    const tables = await queryInterface.showAllTables();
    
    // Tabla Categories
    if (!tables.includes('Categories')) {
      await queryInterface.createTable('Categories', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        slug: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        description: Sequelize.TEXT,
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        order: {
          type: Sequelize.INTEGER,
          defaultValue: 1
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
      }, { transaction });
      console.log('✅ Tabla Categories creada');
    }
    
    // Tabla Subcategories
    if (!tables.includes('Subcategories')) {
      await queryInterface.createTable('Subcategories', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        slug: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        description: Sequelize.TEXT,
        categoryId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Categories',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        order: {
          type: Sequelize.INTEGER,
          defaultValue: 1
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
      }, { transaction });
      console.log('✅ Tabla Subcategories creada');
    }
    
    // Tabla Products
    if (!tables.includes('Products')) {
      await queryInterface.createTable('Products', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        slug: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        description: Sequelize.TEXT,
        price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        currency: {
          type: Sequelize.STRING,
          defaultValue: 'COP'
        },
        stock: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        subcategoryId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Subcategories',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        isFeatured: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        order: {
          type: Sequelize.INTEGER,
          defaultValue: 1
        },
        specifications: {
          type: Sequelize.JSON,
          defaultValue: {}
        },
        images: {
          type: Sequelize.JSON,
          defaultValue: []
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
      }, { transaction });
      console.log('✅ Tabla Products creada');
    }
    
    await transaction.commit();
    console.log('✅ Migración de sincronización completada');
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error en migración:', error);
    throw error;
  }
}

export async function down(queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    await queryInterface.dropTable('Products', { transaction });
    await queryInterface.dropTable('Subcategories', { transaction });
    await queryInterface.dropTable('Categories', { transaction });
    
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
