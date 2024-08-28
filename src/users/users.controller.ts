import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.schema';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AuthGuard } from '@nestjs/passport';
import { EmailService } from 'src/email/email.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private emailService: EmailService,
  ) {}

  @Post()
  @Roles(Role.Admin)
  create(@Body() createUserDto: User) {
    return this.usersService.create(createUserDto);
  }

  @Get('/')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('search')
  async findBy(@Query() query: Record<string, any>): Promise<User[]> {
    return this.usersService.findBy(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: User) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('forgot-password/:id')
  async forgotPassword(@Param('id') id: string) {
    return this.usersService.forgotPasswordEmail(id);
  }

  @Post('reset-password/:id')
  resetPassword(@Param('id') id: string, @Body() body: any) {
    return this.usersService.resetPassword(id, body);
  }
}
