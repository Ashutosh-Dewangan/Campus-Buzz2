import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

import prisma from "../lib/prisma";

import type { LoginInput } from "../validators/auth.validators";

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findFirst({
    where: {
      rollNumber: input.rollNumber,
      instituteEmail: input.instituteEmail,
    },
    include: {
      memberships: {
        where: {
          status: "ACTIVE",
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      },
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
      name: user.name,
      rollNumber: user.rollNumber,
      instituteEmail: user.instituteEmail,
      role: user.role,

      memberships: user.memberships.map((membership) => ({
        id: membership.id,
        status: membership.status,
        organization: {
          id: membership.organization.id,
          name: membership.organization.name,
          type: membership.organization.type,
        },
      })),
    },
  };
}