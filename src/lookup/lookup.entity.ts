import { Entity, Column, ObjectIdColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Lookup {
  @ObjectIdColumn()
  id: string;

  @Column()
  ip: string;

  @Column()
  country: string;

  @Column()
  region: string;

  @Column()
  city: string;

  @Column()
  isp: string;

  @Column()
  timezone: string;

  @CreateDateColumn()
  createdAt: Date;
}
