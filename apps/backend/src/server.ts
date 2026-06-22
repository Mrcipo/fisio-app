import "dotenv/config";
import { createApp } from "./app";
import { prisma } from "./lib/prisma";

const port = Number(process.env.PORT || 4000);
const app = createApp();

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
