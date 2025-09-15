'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('health_declarations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      temperature: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: false,
      },
      hasSymptoms: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      symptoms: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      hasContact: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      contactDetails: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create indexes for better performance
    await queryInterface.addIndex('health_declarations', ['createdAt'], {
      name: 'IDX_health_declarations_created_at',
    });

    await queryInterface.addIndex('health_declarations', ['name'], {
      name: 'IDX_health_declarations_name',
    });

    await queryInterface.addIndex('health_declarations', ['status'], {
      name: 'IDX_health_declarations_status',
    });

    await queryInterface.addIndex('health_declarations', ['temperature'], {
      name: 'IDX_health_declarations_temperature',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop indexes first
    await queryInterface.removeIndex('health_declarations', 'IDX_health_declarations_temperature');
    await queryInterface.removeIndex('health_declarations', 'IDX_health_declarations_status');
    await queryInterface.removeIndex('health_declarations', 'IDX_health_declarations_name');
    await queryInterface.removeIndex('health_declarations', 'IDX_health_declarations_created_at');

    // Drop the table
    await queryInterface.dropTable('health_declarations');
  }
}; 