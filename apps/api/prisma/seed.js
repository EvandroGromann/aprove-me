const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const login = process.env.SEED_USER_LOGIN || 'aprovame';
  const password = process.env.SEED_USER_PASSWORD || 'aprovame';
  const id = process.env.SEED_USER_ID || 'default-user-id';

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { login },
    update: {},
    create: {
      id,
      login,
      password: hashedPassword,
    },
  });

  console.log('Usuário padrão criado:', { id: user.id, login: user.login });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
