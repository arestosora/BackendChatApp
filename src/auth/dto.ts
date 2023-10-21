import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

@InputType()
export class LoginDTO {
    @Field()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format.' })
    email: string;

    @Field()
    @IsNotEmpty({ message: 'Email is required' })
    password: string;
}

@InputType()
export class RegisterDTO {
    @Field()
    @IsNotEmpty({ message: 'Full name is required' })
    fullName: string;

    @Field()
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @Field()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8 , { message: 'Invalid email format.' })
    password: string;

    @Field()
    @IsNotEmpty({ message: 'Confirm Password is required' })
    confirmPassword: string;
}

