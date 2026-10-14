import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        groups: { select: { id: true, name: true } },
      },
    });
  }

  async create(data: any, actorId: string) {
    const existing = await this.prisma.user.findUnique({ where: { username: data.username } });
    if (existing) {
      throw new BadRequestException('Username already exists');
    }

    let passwordHash = undefined;
    if (data.password) {
        passwordHash = await bcrypt.hash(data.password, 10);
    }

    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        displayName: data.displayName,
        passwordHash,
        status: data.status || 'active',
        groups: data.groupIds ? { connect: data.groupIds.map(id => ({ id })) } : undefined,
      },
      select: { id: true, username: true, displayName: true }
    });

    await this.prisma.auditLog.create({
        data: {
            actorId,
            action: 'USER_CREATED',
            targetId: user.id,
            metadata: { username: user.username }
        }
    });

    return user;
  }

  async update(id: string, data: any, actorId: string) {
    if (data.password) {
        data.passwordHash = await bcrypt.hash(data.password, 10);
        delete data.password;
    }

    let groupUpdate = undefined;
    if (data.groupIds) {
       groupUpdate = { set: data.groupIds.map(gid => ({ id: gid })) };
       delete data.groupIds;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
          ...data,
          ...(groupUpdate ? { groups: groupUpdate } : {})
      },
      select: { id: true, username: true, displayName: true }
    });

    await this.prisma.auditLog.create({
        data: {
            actorId,
            action: 'USER_UPDATED',
            targetId: user.id,
            metadata: { updatedFields: Object.keys(data) }
        }
    });

    return user;
  }
}
