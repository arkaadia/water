import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.group.findMany({
      include: {
        permissions: true,
        _count: {
            select: { users: true }
        }
      },
    });
  }

  async create(data: any, actorId: string) {
    const group = await this.prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissionIds ? { connect: data.permissionIds.map(id => ({ id })) } : undefined,
      },
    });

    await this.prisma.auditLog.create({
        data: {
            actorId,
            action: 'GROUP_CREATED',
            targetId: group.id,
            metadata: { name: group.name }
        }
    });

    return group;
  }

  async update(id: string, data: any, actorId: string) {
    let permUpdate = undefined;
    if (data.permissionIds) {
       permUpdate = { set: data.permissionIds.map(pid => ({ id: pid })) };
       delete data.permissionIds;
    }

    const group = await this.prisma.group.update({
      where: { id },
      data: {
          ...data,
          ...(permUpdate ? { permissions: permUpdate } : {})
      },
    });

    await this.prisma.auditLog.create({
        data: {
            actorId,
            action: 'GROUP_UPDATED',
            targetId: group.id,
            metadata: { updatedFields: Object.keys(data) }
        }
    });

    return group;
  }
}
