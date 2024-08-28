import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Measure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerCode: string;

  @Column('timestamptz')
  measureDatetime: Date;

  @Column()
  measureType: 'WATER' | 'GAS';

  @Column({ default: false })
  hasConfirmed: boolean;

  @Column()
  imageUrl: string;

  @Column()
  measureValue: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}