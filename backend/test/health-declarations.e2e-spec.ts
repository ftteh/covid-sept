import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { HealthDeclarationsModule } from '../src/health-declarations/health-declarations.module';
import { HealthDeclaration } from '../src/health-declarations/models/health-declaration.model';

describe('HealthDeclarations (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env'],
        }),
        SequelizeModule.forRoot({
          dialect: 'sqlite',
          storage: ':memory:',
          models: [HealthDeclaration],
          autoLoadModels: true,
          synchronize: true,
          logging: false,
        }),
        ThrottlerModule.forRoot([{
          ttl: 60000,
          limit: 1000,
        }]),
        HealthDeclarationsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await HealthDeclaration.destroy({ where: {}, truncate: true });
  });

  describe('/api/health-declarations (POST)', () => {
    const validDeclaration = {
      name: 'John Doe',
      temperature: 36.5,
      hasSymptoms: false,
      hasContact: false,
    };

    it('should create a health declaration', () => {
      return request(app.getHttpServer())
        .post('/api/health-declarations')
        .send(validDeclaration)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('John Doe');
          expect(res.body.temperature).toBe(36.5);
          expect(res.body.hasSymptoms).toBe(false);
          expect(res.body.hasContact).toBe(false);
          expect(res.body.status).toBe('pending');
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/health-declarations')
        .send({})
        .expect(400);
    });

    it('should validate temperature range', () => {
      return request(app.getHttpServer())
        .post('/api/health-declarations')
        .send({
          ...validDeclaration,
          temperature: 50, // Invalid temperature
        })
        .expect(400);
    });

    it('should validate name format', () => {
      return request(app.getHttpServer())
        .post('/api/health-declarations')
        .send({
          ...validDeclaration,
          name: 'A', // Too short
        })
        .expect(400);
    });

    it('should require symptoms when hasSymptoms is true', () => {
      return request(app.getHttpServer())
        .post('/api/health-declarations')
        .send({
          ...validDeclaration,
          hasSymptoms: true,
          // symptoms not provided
        })
        .expect(400);
    });

    it('should require contactDetails when hasContact is true', () => {
      return request(app.getHttpServer())
        .post('/api/health-declarations')
        .send({
          ...validDeclaration,
          hasContact: true,
          // contactDetails not provided
        })
        .expect(400);
    });

    it('should accept declaration with symptoms', () => {
      return request(app.getHttpServer())
        .post('/api/health-declarations')
        .send({
          ...validDeclaration,
          hasSymptoms: true,
          symptoms: 'cough, fever',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.hasSymptoms).toBe(true);
          expect(res.body.symptoms).toBe('cough, fever');
        });
    });

    it('should accept declaration with contact details', () => {
      return request(app.getHttpServer())
        .post('/api/health-declarations')
        .send({
          ...validDeclaration,
          hasContact: true,
          contactDetails: 'Family member tested positive',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.hasContact).toBe(true);
          expect(res.body.contactDetails).toBe('Family member tested positive');
        });
    });
  });

  describe('/api/health-declarations (GET)', () => {
    beforeEach(async () => {
      // Create test data
      await HealthDeclaration.bulkCreate([
        {
          name: 'John Smith',
          temperature: 36.5,
          hasSymptoms: false,
          hasContact: false,
          status: 'approved',
        },
        {
          name: 'Jane Doe',
          temperature: 37.2,
          hasSymptoms: true,
          symptoms: 'headache',
          hasContact: false,
          status: 'pending',
        },
        {
          name: 'Mike Johnson',
          temperature: 38.1,
          hasSymptoms: true,
          symptoms: 'fever, cough',
          hasContact: true,
          contactDetails: 'Colleague tested positive',
          status: 'rejected',
        },
      ]);
    });

    it('should return paginated health declarations', () => {
      return request(app.getHttpServer())
        .get('/api/health-declarations')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total', 3);
          expect(res.body).toHaveProperty('page', 1);
          expect(res.body).toHaveProperty('limit', 10);
          expect(res.body).toHaveProperty('totalPages', 1);
          expect(res.body.data).toHaveLength(3);
        });
    });

    it('should handle pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/api/health-declarations?page=1&limit=2')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.total).toBe(3);
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(2);
          expect(res.body.totalPages).toBe(2);
        });
    });

    it('should filter by status', () => {
      return request(app.getHttpServer())
        .get('/api/health-declarations?status=approved')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].status).toBe('approved');
        });
    });

    it('should search by name', () => {
      return request(app.getHttpServer())
        .get('/api/health-declarations?search=John')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
        });
    });

    it('should sort declarations', () => {
      return request(app.getHttpServer())
        .get('/api/health-declarations?sortBy=name&sortOrder=ASC')
        .expect(200)
        .expect((res) => {
          expect(res.body.data[0].name).toBe('Jane Doe');
          expect(res.body.data[1].name).toBe('John Smith');
          expect(res.body.data[2].name).toBe('Mike Johnson');
        });
    });
  });

  describe('/api/health-declarations/stats (GET)', () => {
    beforeEach(async () => {
      const now = new Date();
      await HealthDeclaration.bulkCreate([
        {
          name: 'User 1',
          temperature: 36.5,
          hasSymptoms: false,
          hasContact: false,
          status: 'approved',
          createdAt: now,
        },
        {
          name: 'User 2',
          temperature: 37.0,
          hasSymptoms: true,
          symptoms: 'headache',
          hasContact: false,
          status: 'pending',
          createdAt: now,
        },
        {
          name: 'User 3',
          temperature: 38.0,
          hasSymptoms: true,
          symptoms: 'fever',
          hasContact: true,
          contactDetails: 'Contact details',
          status: 'rejected',
          createdAt: new Date(now.getTime() - 86400000), // Yesterday
        },
      ]);
    });

    it('should return statistics', () => {
      return request(app.getHttpServer())
        .get('/api/health-declarations/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            total: 3,
            pending: 1,
            approved: 1,
            rejected: 1,
            todaySubmissions: 2,
          });
        });
    });
  });

  describe('/api/health-declarations/:id (GET)', () => {
    let declarationId: string;

    beforeEach(async () => {
      const declaration = await HealthDeclaration.create({
        name: 'Test User',
        temperature: 36.8,
        hasSymptoms: false,
        hasContact: false,
        status: 'pending',
      });
      declarationId = declaration.id;
    });

    it('should return a health declaration by ID', () => {
      return request(app.getHttpServer())
        .get(`/api/health-declarations/${declarationId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(declarationId);
          expect(res.body.name).toBe('Test User');
        });
    });

    it('should return 404 for non-existent ID', () => {
      return request(app.getHttpServer())
        .get('/api/health-declarations/non-existent-id')
        .expect(404);
    });
  });

  describe('/api/health-declarations/:id (PATCH)', () => {
    let declarationId: string;

    beforeEach(async () => {
      const declaration = await HealthDeclaration.create({
        name: 'Test User',
        temperature: 36.8,
        hasSymptoms: false,
        hasContact: false,
        status: 'pending',
      });
      declarationId = declaration.id;
    });

    it('should update a health declaration', () => {
      return request(app.getHttpServer())
        .patch(`/api/health-declarations/${declarationId}`)
        .send({ status: 'approved' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('approved');
        });
    });

    it('should return 404 for non-existent ID', () => {
      return request(app.getHttpServer())
        .patch('/api/health-declarations/non-existent-id')
        .send({ status: 'approved' })
        .expect(404);
    });

    it('should validate update data', () => {
      return request(app.getHttpServer())
        .patch(`/api/health-declarations/${declarationId}`)
        .send({ status: 'invalid-status' })
        .expect(400);
    });
  });

  describe('/api/health-declarations/:id (DELETE)', () => {
    let declarationId: string;

    beforeEach(async () => {
      const declaration = await HealthDeclaration.create({
        name: 'Test User',
        temperature: 36.8,
        hasSymptoms: false,
        hasContact: false,
        status: 'pending',
      });
      declarationId = declaration.id;
    });

    it('should delete a health declaration', () => {
      return request(app.getHttpServer())
        .delete(`/api/health-declarations/${declarationId}`)
        .expect(200);
    });

    it('should return 404 for non-existent ID', () => {
      return request(app.getHttpServer())
        .delete('/api/health-declarations/non-existent-id')
        .expect(404);
    });
  });
}); 