import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GraphqlAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const gqlContext = context.getArgByIndex(2);
        const request: Request = gqlContext.req;
        const token = this.extractTokenFromCookie(request);

        if (!token) {
            throw new UnauthorizedException('No token found.');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
            });
            console.log('payload', token);
            request['user'] = payload;
        } catch (error) {
            console.log('error', error);
            throw new UnauthorizedException();
        }

        return true;
    }

    private extractTokenFromCookie(request: Request): string {
        const token = request.cookies['access_token'];
        return token;
    }
}