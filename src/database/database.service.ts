import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(private readonly dataSource: DataSource) {}

  getRepository<Entity>(entity: { new (): Entity }): Repository<Entity> {
    return this.dataSource.getRepository(entity);
  }

  async executeQuery(query: string, parameters?: any[]): Promise<any> {
    return this.dataSource.query(query, parameters);
  }
}
