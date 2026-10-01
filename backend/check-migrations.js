const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT
      migration_name,
      checksum,
      finished_at,
      rolled_back_at,
      started_at
    FROM "_prisma_migrations"
    ORDER BY started_at;
  `);

  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
