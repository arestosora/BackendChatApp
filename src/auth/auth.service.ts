import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { Request, Response } from 'express';
import { User } from 'src/user/user.types';
import { LoginDTO, RegisterDTO } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService) {
    }

    public async refreshToken(req: Request, res: Response) {
        const refreshToken = req.cookies['refresh_Token'];

        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token found.');
        }

        let payload: any;

        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            });
        } catch (err) {
            throw new UnauthorizedException('Refresh token is not valid.');
        }

        const UserExists = await this.prisma.user.findUnique({ where: { id: payload.userId } });

        if (!UserExists) {
            throw new BadRequestException('User not found.');
        }

        const expiresIn = 15000;
        const expiration = Math.floor(Date.now() / 1000) + expiresIn;
        const accessToken = this.jwtService.sign({ ...payload, exp: expiration }, { secret: this.configService.get<string>('ACCESS_TOKEN_SECRET') });

        res.cookie('access_token', accessToken, { httpOnly: true });

        return accessToken;
    }

    private async issueTokens(user: User, response: Response) {
        const payload = { username: user.fullName, sub: user.id };
        const accessToken = this.jwtService.sign({ ...payload }, { secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'), expiresIn: '150sec' });
        const refreshToken = this.jwtService.sign(payload, { secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'), expiresIn: '7d' });

        response.cookie('refresh_token', refreshToken, { httpOnly: true });
        response.cookie('access_token', accessToken, { httpOnly: true });

        return { user };
    }

    public async validateUser(loginDto: LoginDTO) {
        const user = await this.prisma.user.findUnique({ where: { email: loginDto.email } });
        if (!user && (await bcrypt.compare(loginDto.password, user.password))) {
            return user;
        }
        return null;
    }

    public async register(registerDto: RegisterDTO, response: Response) {
        const existingUser = await this.prisma.user.findUnique({ where: { email: registerDto.email } });
        if (existingUser) {
            throw new BadRequestException('Email already exists.');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                fullName: registerDto.fullName,
                email: registerDto.email,
                password: hashedPassword
            }
        });

        return this.issueTokens(user, response);
    }

    public async login(loginDto: LoginDTO, response: Response) {
        const user = await this.prisma.user.findUnique({ where: { email: loginDto.email } });
        if (!user) {
            throw new BadRequestException({ invalidCredentials: 'Invalid credentials.' });
        }
        return this.issueTokens(user, response);
    }

    public async logout(response: Response) {
        response.clearCookie('refresh_token');
        response.clearCookie('access_token');
        return { message: 'Logged out successfully.' };
    }
}
