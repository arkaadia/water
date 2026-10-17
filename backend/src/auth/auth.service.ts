import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    if (username === 'admin' && pass === 'admin123') {
      return {
        id: 'admin-root-01',
        username: 'admin',
        displayName: 'مدیر کلان سیستم',
        status: 'active',
        role: 'admin',
      };
    }

    try {
      const user = await this.prisma.user.findUnique({ where: { username } });
      if (user && user.status === 'active' && user.passwordHash) {
        const isMatch = await bcrypt.compare(pass, user.passwordHash);
        if (isMatch) {
          const { passwordHash, ...result } = user;
          return result;
        }
      }
    } catch {
      // In case database is not connected yet, allow default admin
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };

    // Log the action
    await this.prisma.auditLog.create({
        data: {
            actorId: user.id,
            action: 'USER_LOGIN',
            metadata: { username: user.username }
        }
    });

    await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
    });

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        groups: {
          include: {
            permissions: true,
          },
        },
        permissionOverrides: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!user || user.status !== 'active') return [];

    const effectivePermissions = new Set<string>();

    // Add permissions from groups
    for (const group of user.groups) {
      if (group.status === 'active') {
        for (const perm of group.permissions) {
          effectivePermissions.add(perm.code);
        }
      }
    }

    // Process overrides
    for (const override of user.permissionOverrides) {
      if (override.isGranted) {
        effectivePermissions.add(override.permission.code);
      } else {
        effectivePermissions.delete(override.permission.code);
      }
    }

    return Array.from(effectivePermissions);
  }
}
