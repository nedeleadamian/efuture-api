import { BaseEntity } from '@common/database/entities/base.entity';
import { Entity, Column, OneToMany, type Relation } from 'typeorm';
import { MessageEntity } from '../../message/entities/message.entity';

@Entity('tag')
export class TagEntity extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => MessageEntity, (message) => message.tag)
  messages: Relation<MessageEntity>[];
}
