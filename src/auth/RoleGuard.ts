import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly requiredRoles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assuming JwtPayloadMiddleware has already decoded the JWT and set `req.user`

    if (!user || !user.resource_access || !user.resource_access['softy-rh']) {
      throw new ForbiddenException('Access Denied');
    }

    const userRoles = user.resource_access['softy-rh'].roles;

    const hasRole = this.requiredRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
