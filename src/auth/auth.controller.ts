import { Controller, Get, Post,Req, UseGuards } from '@nestjs/common';
import { LocalGuard } from './guards/local.guard';
import {Request} from 'express'
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {

    @Post('login')
    @UseGuards(LocalGuard)
    login(@Req() req:Request){
        return req.user
    }

    @Get('details')
    @UseGuards(JwtAuthGuard)
    status(@Req() req : Request){
        return req.user
    }
}
