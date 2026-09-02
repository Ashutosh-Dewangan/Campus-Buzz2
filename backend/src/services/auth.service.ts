import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import type { LoginInput } from "../validators/auth.validators";
const JWT_SECRET: string = process.env.JWT_SECRET || "default_jwt_secret_dev";

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findFirst({
    where: {
      rollNumber: input.rollNumber,
      instituteEmail: input.instituteEmail,
    },
  });

  if (!user) {
    throw new Error("Invalid roll number or institute email");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  return {
    token,
    user: {
      id: user.id,
      rollNumber: user.rollNumber,
      instituteEmail: user.instituteEmail,
      role: user.role,
    },
  };
}