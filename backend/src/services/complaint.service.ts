import prisma from "../lib/prisma";
import type { CreateComplaintInput } from "../validators/complaint.validators";

function formatComplaint(complaint: any, options?: {
  includeIdentity?: boolean;
  isOwner?: boolean;
}) {
  const result: Record<string, unknown> = {
    id: complaint.id,
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    status: complaint.status,
    createdAt: complaint.createdAt,
    resolvedAt: complaint.resolvedAt,
  };

  if (options?.isOwner !== undefined) {
    result.isOwner = options.isOwner;
  }

  if (options?.includeIdentity && complaint.user) {
    result.poster = {
      id: complaint.user.id,
      name: complaint.user.name,
      rollNumber: complaint.user.rollNumber,
      instituteEmail: complaint.user.instituteEmail,
    };
  }

  return result;
}

export async function createComplaint(
  userId: string,
  data: CreateComplaintInput,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const complaint = await prisma.complaint.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      category: data.category ?? "OTHER",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          rollNumber: true,
          instituteEmail: true,
        },
      },
    },
  });

  return formatComplaint(complaint, {
    isOwner: true,
  });
}

export async function getComplaints(
  userId: string,
  role: string,
) {
  const complaints = await prisma.complaint.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          rollNumber: true,
          instituteEmail: true,
        },
      },
    },
  });

  const isAdmin = role === "ADMIN";

  return complaints.map((complaint) =>
    formatComplaint(complaint, {
      isOwner: complaint.userId === userId,
      includeIdentity: isAdmin,
    }),
  );
}

export async function resolveComplaint(
  complaintId: string,
  userId: string,
  role: string,
) {
  const complaint = await prisma.complaint.findUnique({
    where: {
      id: complaintId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          rollNumber: true,
          instituteEmail: true,
        },
      },
    },
  });

  if (!complaint) {
    throw new Error("Complaint not found");
  }

  const isAdmin = role === "ADMIN";
  const isOwner = complaint.userId === userId;

  if (!isAdmin && !isOwner) {
    throw new Error("You are not allowed to resolve this complaint");
  }

  const updated = await prisma.complaint.update({
    where: {
      id: complaintId,
    },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          rollNumber: true,
          instituteEmail: true,
        },
      },
    },
  });

  return formatComplaint(updated, {
    isOwner: updated.userId === userId,
    includeIdentity: isAdmin,
  });
}