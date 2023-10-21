import { Resolver, Context, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.types';
import { Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { GraphqlAuthGuard } from 'src/auth/graphql-auth.guard';


@Resolver()
export class UserResolver {
    constructor(private readonly userService: UserService) { }

    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => User)
    public async updateProfile(@Args('fullName') fullName: string, @Args('file', { type: () => GraphQLUpload, nullable: true }) file: GraphQLUpload.FileUpload, @Context() context: { req: Request }) {
        const imageUrl = file ? await this.storeImageAndGetUrl(file) : null;
        const userId = context.req.user.sub;
        return this.userService.updateProfile(userId, fullName, imageUrl);
    }

    private async storeImageAndGetUrl(file: GraphQLUpload) {
        const { createReadStream, filename } = await file;
        const uniqueFilename = uuidv4() + filename;
        const imagePath = join(process.cwd(), 'public', uniqueFilename);
        const imageUrl = `${process.env.APP_URL}/${uniqueFilename}`;
        const readStream = createReadStream();
        readStream.pipe(createWriteStream(imagePath));
        return imageUrl;
    }
}
