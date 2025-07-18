import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
  const roles = this.reflector.get<Role[]>('roles', context.getHandler());
  if (!roles) {
    return true;
  }
  const request = context.switchToHttp().getRequest();
  const user = request.user;
  console.log('User in RolesGuard:', user); // Debugging log
  if (!user) {
    return false;
  }
  return roles.includes(user.role);
  }
}
