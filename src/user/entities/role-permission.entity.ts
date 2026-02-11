import { BaseEntity } from '@common/database/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { PermissionEntity } from './permission.entity';
import { RoleEntity } from './role.entity';

@Entity('role_permission')
@Unique(['roleId', 'permissionId'])
export class RolePermissionEntity extends BaseEntity {
  @Column('uuid')
  roleId: string;

  @Column('uuid')
  permissionId: string;

  @ManyToOne(() => RoleEntity, (role) => role.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @ManyToOne(() => PermissionEntity, (permission) => permission.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permission_id' })
  permission: PermissionEntity;
}
