import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "../generated/prisma";
 
const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    trustedOrigins: ["http://localhost:5173"],
    emailAndPassword: {  
        enabled: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: true,
    },
    account: {
        accountLinking: {
            enabled: true,
        },
    },
    socialProviders: { 
        google: { 
           clientId: process.env.AUTH_GOOGLE_ID as string, 
           clientSecret: process.env.AUTH_GOOGLE_SECRET as string, 
        }, 
    }, 
});