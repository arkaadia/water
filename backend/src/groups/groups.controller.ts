import { Controller, Get, Post, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { Request } from 'express';

@Controller('groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @RequirePermissions('groups.manage')
  findAll() {
    return this.groupsService.findAll();
  }

  @Post()
  @RequirePermissions('groups.manage')
  create(@Body() body: any, @Req() req: Request) {
    const actorId = (req.user as any).userId;
    return this.groupsService.create(body, actorId);
  }

  @Put(':id')
  @RequirePermissions('groups.manage')
  update(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    const actorId = (req.user as any).userId;
    return this.groupsService.update(id, body, actorId);
  }
}
