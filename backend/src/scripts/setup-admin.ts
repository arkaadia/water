import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function bootstrap() {
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'admin123';

  console.log(`Checking if admin user '${username}' exists...`);

  const existingAdmin = await prisma.user.findUnique({
    where: { username },
  });

  if (existingAdmin) {
    console.log(`User '${username}' already exists. Setup aborted.`);
    return;
  }

  // Create Super Administrator Group
  const adminGroup = await prisma.group.upsert({
    where: { name: 'Super Administrator' },
    update: {},
    create: {
      name: 'Super Administrator',
      description: 'Full access to all modules and operations',
    },
  });

  // Assign all necessary initial permissions
  const permissionsToCreate = [
    { code: 'dashboard.view', description: 'View dashboard' },
    { code: 'users.view', description: 'View users' },
    { code: 'users.create', description: 'Create users' },
    { code: 'users.update', description: 'Update users' },
    { code: 'groups.manage', description: 'Manage groups and roles' },
    { code: 'products.manage', description: 'Manage products' },
  ];

  const createdPerms = [];
  for (const p of permissionsToCreate) {
    const perm = await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
    createdPerms.push(perm);
  }

  // Assign permissions to the admin group
  await prisma.group.update({
    where: { id: adminGroup.id },
    data: {
      permissions: {
        connect: createdPerms.map((p) => ({ id: p.id })),
      },
    },
  });

  // Create Admin User
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      displayName: 'System Administrator',
      passwordHash,
      status: 'active',
      groups: {
        connect: { id: adminGroup.id },
      },
    },
  });

  // Audit
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_BOOTSTRAP',
      targetId: user.id,
      metadata: { username },
    },
  });

  console.log(`Successfully created Super Administrator '${username}'.`);
  console.log(`Password: ${password}`);
  console.log('Please change the password upon first login and remove this setup script.');
}

bootstrap()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
