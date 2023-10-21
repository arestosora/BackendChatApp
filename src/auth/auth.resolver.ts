import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse, RegisterResponse } from './types';
import { LoginDTO, RegisterDTO } from './dto';
import { BadRequestException } from '@nestjs/common';
import { Response, Request } from 'express';

@Resolver()
export class AuthResolver {

    constructor(private readonly authService: AuthService) {
    }

    @Mutation(() => RegisterResponse)
    public async register(@Args('registerInput') registerDTO: RegisterDTO, @Context() context: { res: Response }) {
        if (registerDTO.password !== registerDTO.confirmPassword) {
            throw new BadRequestException({ confirmPassword: 'Passwords do not match.' });
        }

        const { user } = await this.authService.register(registerDTO, context.res);
        return { user };
    }

    @Mutation(() => LoginResponse)
    public async login(@Args('loginInput') loginDTO: LoginDTO, @Context() context: { res: Response }) {
        return await this.authService.login(loginDTO, context.res);
    }

    @Mutation(() => String)
    public async refreshToken(@Context() context: { req: Request, res: Response }) {
        console.log('refreshToken');
        try {
            return await this.authService.refreshToken(context.req, context.res);
        } catch (error) {
            throw new BadRequestException(error.message);
        }

    }

    @Query(() => String)
    hello() {
        return 'Hello World!';
    }
}
