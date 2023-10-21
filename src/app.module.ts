/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { TokenService } from './token/token.service';

const pubSub = new RedisPubSub({
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    retryStrategy: (times) => {
      return Math.min(times * 50, 2000);
    }
  }
})


@Module({
  imports:
    [
      AuthModule,
      UserModule,
      GraphQLModule.forRootAsync({
        imports: [ConfigModule, AppModule],
        inject: [ConfigService],
        driver: ApolloDriver,
        useFactory: async (configService: ConfigService, tokenService: TokenService) => ({
          installSubscriptionHandlers: true,
          playground: true,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          subscriptions: {
            'graphql-ws': true,
            'subscriptions-transport-ws': true,
          },
          onConnect: async (connectionParams) => {
            const token = tokenService.extractToken(connectionParams);
            if(!token){
              throw new Error('Token not provided!');
            }

            const user = tokenService.validateToken(token);
            if(!user){
              throw new Error('Invalid Token');
            }

            return { user };
          },
        })
      }),

      ConfigModule.forRoot({ isGlobal: true })
    ],
  controllers: [AppController],
  providers: [AppService, TokenService],
})
export class AppModule { }
