import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/database/entities/base.entity';
import { UserRole } from '../enums/user-role.enum';
import { RolePermissionEntity } from './role-permission.entity';

@Entity('role')
export class RoleEntity extends BaseEntity {
  @Column('text', { unique: true })
  name: UserRole;



  @OneToMany(() => RolePermissionEntity, (rolePermission) => rolePermission.role)
  permissions: RolePermissionEntity[];
}
