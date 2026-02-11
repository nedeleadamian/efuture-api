import { BaseEntity } from '@common/database/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany, type Relation } from 'typeorm';
import { MessageEntity } from '../../message/entities/message.entity';
import { RoleEntity } from './role.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Column('text', { nullable: true, select: false })
  refreshToken: string | null;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('uuid', { nullable: true })
  roleId: string | null;



  @ManyToOne(() => RoleEntity, { eager: true })
  @JoinColumn({ name: 'roleId' })
  role: RoleEntity;

  @OneToMany(() => MessageEntity, (message) => message.author)
  messages: Relation<MessageEntity>[];
}
