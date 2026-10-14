import { Controller, Get, Post, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { Request } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users.view')
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @RequirePermissions('users.create')
  create(@Body() body: any, @Req() req: Request) {
    const actorId = (req.user as any).userId;
    return this.usersService.create(body, actorId);
  }

  @Put(':id')
  @RequirePermissions('users.update')
  update(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    const actorId = (req.user as any).userId;
    return this.usersService.update(id, body, actorId);
  }
}
