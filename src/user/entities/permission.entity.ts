import { BaseEntity } from '@common/database/entities/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { RolePermissionEntity } from './role-permission.entity';

@Entity('permission')
export class PermissionEntity extends BaseEntity {
  @Column('text', { unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description: string;



  @OneToMany(() => RolePermissionEntity, (rolePermission) => rolePermission.permission)
  rolePermissions: RolePermissionEntity[];
}
