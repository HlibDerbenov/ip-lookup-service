import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Lookup E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /lookup - should fetch and cache IP info', async () => {
    const response = await request(app.getHttpServer())
      .post('/lookup')
      .send({ ip: '8.8.8.8' });

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject({
      ip: '8.8.8.8',
      country: expect.any(String),
      region: expect.any(String),
      city: expect.any(String),
    });
  });

  it('DELETE /lookup/:ip - should delete cached IP info', async () => {
    const deleteResponse = await request(app.getHttpServer()).delete(
      '/lookup/8.8.8.8',
    );

    expect(deleteResponse.status).toBe(HttpStatus.OK);
    expect(deleteResponse.body).toMatchObject({
      message: 'IP 8.8.8.8 successfully deleted',
    });
  });

  it('POST /lookup - should return 400 for invalid IP', async () => {
    const response = await request(app.getHttpServer())
      .post('/lookup')
      .send({ ip: 'invalid-ip' });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('ip must be an ip address');
  });
});
