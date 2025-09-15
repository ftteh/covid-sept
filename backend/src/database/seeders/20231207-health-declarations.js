'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { v4: uuidv4 } = require('uuid');
    

    const existingRecords = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM health_declarations',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (existingRecords[0].count > 0) {
      console.log('Health declarations already seeded, skipping...');
      return;
    }

    const now = new Date();
    const sampleDeclarations = [
      {
        id: uuidv4(),
        name: 'John Smith',
        temperature: 36.5,
        hasSymptoms: false,
        symptoms: null,
        hasContact: false,
        contactDetails: null,
        status: 'approved',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(now.getTime() - 86400000), // Yesterday
        updatedAt: new Date(now.getTime() - 86400000),
      },
      {
        id: uuidv4(),
        name: 'Jane Doe',
        temperature: 37.2,
        hasSymptoms: true,
        symptoms: 'mild headache, fatigue',
        hasContact: false,
        contactDetails: null,
        status: 'pending',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(now.getTime() - 43200000), // 12 hours ago
        updatedAt: new Date(now.getTime() - 43200000),
      },
      {
        id: uuidv4(),
        name: 'Mike Johnson',
        temperature: 38.5,
        hasSymptoms: true,
        symptoms: 'fever, cough, body aches',
        hasContact: true,
        contactDetails: 'Family member tested positive 3 days ago',
        status: 'rejected',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        createdAt: new Date(now.getTime() - 21600000), // 6 hours ago
        updatedAt: new Date(now.getTime() - 21600000),
      },
      {
        id: uuidv4(),
        name: 'Sarah Wilson',
        temperature: 36.8,
        hasSymptoms: true,
        symptoms: 'runny nose, sore throat',
        hasContact: false,
        contactDetails: null,
        status: 'approved',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(now.getTime() - 10800000), // 3 hours ago
        updatedAt: new Date(now.getTime() - 10800000),
      },
      {
        id: uuidv4(),
        name: 'David Brown',
        temperature: 36.3,
        hasSymptoms: false,
        symptoms: null,
        hasContact: true,
        contactDetails: 'Colleague tested positive but we maintained social distance',
        status: 'approved',
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        createdAt: new Date(now.getTime() - 7200000), // 2 hours ago
        updatedAt: new Date(now.getTime() - 7200000),
      },
      {
        id: uuidv4(),
        name: 'Lisa Anderson',
        temperature: 37.8,
        hasSymptoms: true,
        symptoms: 'fever, breathing difficulties, loss of taste',
        hasContact: true,
        contactDetails: 'Attended gathering where 2 people later tested positive',
        status: 'rejected',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        createdAt: new Date(now.getTime() - 3600000), // 1 hour ago
        updatedAt: new Date(now.getTime() - 3600000),
      },
      {
        id: uuidv4(),
        name: 'Robert Taylor',
        temperature: 36.4,
        hasSymptoms: false,
        symptoms: null,
        hasContact: false,
        contactDetails: null,
        status: 'approved',
        ipAddress: '192.168.1.106',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(now.getTime() - 1800000), // 30 minutes ago
        updatedAt: new Date(now.getTime() - 1800000),
      },
      {
        id: uuidv4(),
        name: 'Emily Davis',
        temperature: 36.9,
        hasSymptoms: true,
        symptoms: 'mild cough',
        hasContact: false,
        contactDetails: null,
        status: 'pending',
        ipAddress: '192.168.1.107',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(now.getTime() - 900000), // 15 minutes ago
        updatedAt: new Date(now.getTime() - 900000),
      },
      {
        id: uuidv4(),
        name: 'Kevin Martinez',
        temperature: 36.6,
        hasSymptoms: false,
        symptoms: null,
        hasContact: false,
        contactDetails: null,
        status: 'approved',
        ipAddress: '192.168.1.108',
        userAgent: 'Mozilla/5.0 (Android 13; Mobile; rv:106.0) Gecko/106.0 Firefox/106.0',
        createdAt: new Date(now.getTime() - 300000), // 5 minutes ago
        updatedAt: new Date(now.getTime() - 300000),
      },
      {
        id: uuidv4(),
        name: 'Amanda Garcia',
        temperature: 37.1,
        hasSymptoms: true,
        symptoms: 'headache, fatigue, diarrhea',
        hasContact: false,
        contactDetails: null,
        status: 'pending',
        ipAddress: '192.168.1.109',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert('health_declarations', sampleDeclarations);

    console.log(`Successfully seeded ${sampleDeclarations.length} health declarations`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('health_declarations', null, {});
  }
}; 