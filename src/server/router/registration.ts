
import { prisma } from "../db/client"
import { Prisma } from '@prisma/client';
import { createRouter } from "./context"
import { z } from "zod";
import * as trpc from "@trpc/server";
import { hash } from "argon2";


/*
type User = {
    id: string;
    email: string;
    password: string;
    repeatedPassword: string;
}
*/

// Google: trigger tRPC on button click (hook)
export const registrationRouter = createRouter()
    .mutation('createUser', { //specifying the input types of the end point
        input: z.object({ 
            email: z.string(), //.min(2).max(20),
            password: z.string(), //.min(2).max(20),
         }),
        resolve: async function ({input, ctx}) {
            const {email, password} = input;
            console.log(email)
            console.log(password)
            // Check if user exists.
            // Here we can check the google table as well.
            const exists = await prisma.credentialUser.findFirst({
                where: { email },
              });
          
              if (exists) {
                throw new trpc.TRPCError({
                  code: "CONFLICT",
                  message: "User already exists.",
                });
              }
            
           // const hashedPassword = await hash(password);


            try {
                const result = await prisma.user.create({
                    data: {
                        id: Math.floor(Math.random() * 1000000000).toString(),
                        name: email,
                        email: email,
                        emailVerified: null,
                        image: '',
                        accounts: undefined,
                        searches: undefined,
                        sessions: undefined,
                        //hashedPassword: hashedPassword,
                    }
                });
                return {
                    status: 201,
                    message: "Account created successfully",
                    result: result.email,
                  };
            } catch (error) {
                console.log(error)
            }
          
        },
    })