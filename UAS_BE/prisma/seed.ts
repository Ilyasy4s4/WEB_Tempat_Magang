import { PrismaClient, users_role } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {

    const email = "superadmin@gmail.com";

    const existingUser = await prisma.users.findUnique({
        where: {
            email
        }
    });

    if (existingUser) {
        console.log("⚠️ Super Admin sudah ada.");
        return;
    }

    const hashedPassword = await bcrypt.hash("12345678", 10);

    await prisma.users.create({

        data: {

            id: randomUUID(),

            name: "Super Admin",

            email,

            password: hashedPassword,

            role: users_role.super_admin

        }

    });

    console.log("✅ Super Admin berhasil dibuat.");

}

main()
.then(async () => {
    await prisma.$disconnect();
})
.catch(async (e) => {

    console.error(e);

    await prisma.$disconnect();

    process.exit(1);

});