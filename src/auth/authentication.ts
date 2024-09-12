import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify, createRemoteJWKSet, JWTVerifyResult } from 'jose';

@Injectable()
export class JwtPayloadMiddleware implements NestMiddleware {
  private JWKS_URI: string;
  private ISSUER: string;
  private JWK_SET: ReturnType<typeof createRemoteJWKSet>;

  constructor(private configService: ConfigService) {
    const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL');
    const realmName = this.configService.get<string>('REALM_NAME');

    if (!keycloakUrl || !realmName) {
      throw new Error('KEYCLOAK_PUBLIC_URL or REALM_NAME is not defined');
    }

    this.JWKS_URI = `${keycloakUrl}/realms/${realmName}/protocol/openid-connect/certs`;
    this.ISSUER = `${keycloakUrl}/realms/${realmName}`;
    this.JWK_SET = createRemoteJWKSet(new URL(this.JWKS_URI));
    console.log(this.JWKS_URI, this.ISSUER);
  }

  async use(req: any, res: any, next: () => void) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token found');
    }

    const token = authHeader.split(' ')[1];

    try {
      const { payload } = (await jwtVerify(token, this.JWK_SET, {
        algorithms: ['RS256'],
      })) as JWTVerifyResult;
      this.validateTokenClaims(payload);
      req.user = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  private validateTokenClaims(tokenData: any) {
    const currentTime = Math.floor(Date.now() / 1000);

    if (tokenData.exp < currentTime) {
      throw new UnauthorizedException('Token has expired');
    }

    if (tokenData.iss !== this.ISSUER) {
      throw new UnauthorizedException('Invalid token issuer');
    }

    const expectedAudience = this.configService.get<string>('CLIENT_ID');
    const audiences = Array.isArray(tokenData.aud)
      ? tokenData.aud
      : [tokenData.aud];
    if (!audiences.includes(expectedAudience)) {
      throw new UnauthorizedException('Invalid token audience');
    }
  }
}
