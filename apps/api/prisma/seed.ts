import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('aprovame', 10);
  
  const user = await prisma.user.upsert({
    where: { login: 'aprovame' },
    update: {},
    create: {
      id: 'default-user-id',
      login: 'aprovame',
      password: hashedPassword,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
