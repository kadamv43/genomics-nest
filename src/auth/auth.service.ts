import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateUser({ username, password }: AuthPayloadDto) {
    const findUser: any = await this.usersService.findByField({
      email: username,
    });
    if (!findUser) throw new UnauthorizedException('invalid credentials');
    if (
      findUser &&
      (await this.usersService.validatePassword(password, findUser.password))
    ) {
      return {
        token: this.jwtService.sign({
          username: findUser.email,
          sub: findUser._id,
          role: findUser.role,
        }),
      };
    }
  }
}
