import { BaseEntity } from '@common/database/entities/base.entity';
import {
  Entity,
  Column,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  type Relation,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { TagEntity } from '../../tag/entities/tag.entity';

@Index(['createdAt'])
@Index(['authorId', 'createdAt'])
@Index(['tagId', 'createdAt'])
@Entity('message')
export class MessageEntity extends BaseEntity {
  @Column('varchar', { length: 240 })
  content: string;

  @DeleteDateColumn({ select: false })
  deletedAt: Date;

  @Column('uuid')
  authorId: string;

  @ManyToOne(() => UserEntity, (user) => user.messages)
  @JoinColumn({ name: 'author_id' })
  author: Relation<UserEntity>;

  @Column('uuid')
  tagId: string;

  @ManyToOne(() => TagEntity, (tag) => tag.messages)
  @JoinColumn({ name: 'tag_id' })
  tag: Relation<TagEntity>;
}
