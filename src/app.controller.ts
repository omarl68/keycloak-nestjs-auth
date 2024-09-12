// src/app.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { RoleGuard } from './auth/RoleGuard';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/api/user')
  @UseGuards(new RoleGuard(["client_user"]))
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/api/admin')
  @UseGuards(new RoleGuard(["client_admin"]))
  getHello2(): string {
    return this.appService.getHello2();
  }
}
