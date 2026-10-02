import { Prisma } from "../generated/prisma/client";
import prisma from "../lib/prisma";
import type {
  CreateEventInput,
  UpdateEventInput,
} from "../validators/event.validators";

function parseEventStart(date: string, time: string): Date {
  const normalizedTime = time.replace(/\s+/g, " ").trim();
  const combined = `${date} ${normalizedTime}`;
  const parsed = new Date(combined);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid event date or time");
  }

  return parsed;
}
function formatCampusDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Unable to format event date");
  }

  return `${year}-${month}-${day}`;
}

function formatCampusTime(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;

  if (!hour || !minute) {
    throw new Error("Unable to format event time");
  }

  return `${hour}:${minute}`;
}

const eventInclude = {
  createdBy: true,
  organization: true,
  linkedOfficialPost: true,
};

type EventWithRelations = Prisma.EventGetPayload<{
  include: typeof eventInclude;
}>;

function formatEvent(event: EventWithRelations) {
  return {
    id: event.id,
    name: event.name,

    date: formatCampusDate(event.startAt),
    time: formatCampusTime(event.startAt),

    venue: event.venue,
    description: event.description,

    // Organization events show the organization.
    // Campus-wide admin events show the creator.
    createdBy: event.organization?.name ?? event.createdBy.name,
    createdById: event.createdById,

    organizationId: event.organizationId,
    organization: event.organization
      ? {
          id: event.organization.id,
          name: event.organization.name,
          type: event.organization.type,
        }
      : null,

    linkedOfficialPostId: event.linkedOfficialPostId,
    linkedOfficialPost: event.linkedOfficialPost
      ? {
          id: event.linkedOfficialPost.id,
          title: event.linkedOfficialPost.title,
          content: event.linkedOfficialPost.content,
          link: event.linkedOfficialPost.link,
          formUrl: event.linkedOfficialPost.formUrl,
          organizationId: event.linkedOfficialPost.organizationId,
        }
      : null,

    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

export async function getEvents() {
  const events = await prisma.event.findMany({
    orderBy: {
      startAt: "asc",
    },
    include: eventInclude,
  });

  return events.map(formatEvent);
}

export async function createEvent(
  userId: string,
  role: string,
  data: CreateEventInput,
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  let organizationId = data.organizationId;

  // Students can only create events for an organization
  // where they have an active membership.
  if (role !== "ADMIN") {
    if (!organizationId) {
      throw new Error(
        "Organization is required for student-created events",
      );
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        organizationId,
        status: "ACTIVE",
      },
    });

    if (!membership) {
      throw new Error(
        "You are not an active member of this organization",
      );
    }
  }

  if (organizationId) {
    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }
  }

  // If an official post is linked, it must belong to the
  // same organization as the event.
  if (data.linkedOfficialPostId) {
    const officialPost = await prisma.officialPost.findUnique({
      where: {
        id: data.linkedOfficialPostId,
      },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!officialPost) {
      throw new Error("Official post not found");
    }

    if (
      organizationId &&
      officialPost.organizationId !== organizationId
    ) {
      throw new Error(
        "Official post does not belong to this organization",
      );
    }

    if (!organizationId) {
      organizationId = officialPost.organizationId;
    }
  }

  const startAt = parseEventStart(data.date, data.time);

  const event = await prisma.event.create({
    data: {
      name: data.name,
      description: data.description,
      startAt,
      venue: data.venue,
      createdById: userId,
      organizationId,
      linkedOfficialPostId: data.linkedOfficialPostId,
    },
    include: eventInclude,
  });

  return formatEvent(event);
}

async function getEventForAuthorization(eventId: string) {
  return prisma.event.findUnique({
    where: {
      id: eventId,
    },
    select: {
      id: true,
      organizationId: true,
    },
  });
}

async function canManageEvent(
  userId: string,
  role: string,
  organizationId: string | null,
) {
  if (role === "ADMIN") {
    return true;
  }

  if (!organizationId) {
    return false;
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      organizationId,
      status: "ACTIVE",
    },
  });

  return Boolean(membership);
}

export async function updateEvent(
  userId: string,
  role: string,
  eventId: string,
  data: UpdateEventInput,
) {
  const existing = await getEventForAuthorization(eventId);

  if (!existing) {
    throw new Error("Event not found");
  }

  const allowed = await canManageEvent(
    userId,
    role,
    existing.organizationId,
  );

  if (!allowed) {
    throw new Error(
      "You are not authorized to manage this event",
    );
  }

  // Calculate the final organization that the event will have.
  let organizationId =
    data.organizationId !== undefined
      ? data.organizationId
      : existing.organizationId;

  // Calculate the final official post relationship.
  const finalLinkedOfficialPostId =
    data.linkedOfficialPostId !== undefined
      ? data.linkedOfficialPostId || null
      : undefined;

  // Non-admin users must still be members of the final organization.
  if (role !== "ADMIN") {
    if (!organizationId) {
      throw new Error(
        "Organization is required for student-created events",
      );
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        organizationId,
        status: "ACTIVE",
      },
    });

    if (!membership) {
      throw new Error(
        "You are not an active member of this organization",
      );
    }
  }

  if (organizationId) {
    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }
  }

  // Validate the final Event ↔ OfficialPost relationship.
  if (finalLinkedOfficialPostId) {
    const officialPost = await prisma.officialPost.findUnique({
      where: {
        id: finalLinkedOfficialPostId,
      },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!officialPost) {
      throw new Error("Official post not found");
    }

    if (
      organizationId &&
      officialPost.organizationId !== organizationId
    ) {
      throw new Error(
        "Official post does not belong to this organization",
      );
    }

    organizationId =
      organizationId ?? officialPost.organizationId;
  }

  const updateData: {
    name?: string;
    description?: string;
    startAt?: Date;
    venue?: string;
    organizationId?: string | null;
    linkedOfficialPostId?: string | null;
  } = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (
    data.date !== undefined ||
    data.time !== undefined
  ) {
    const current = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        startAt: true,
      },
    });

    if (!current) {
      throw new Error("Event not found");
    }

    // Use campus timezone rather than UTC when one half
    // of the date/time pair is being preserved.
    const date =
      data.date ?? formatCampusDate(current.startAt);

    const time =
      data.time ?? formatCampusTime(current.startAt);

    updateData.startAt = parseEventStart(date, time);
  }

  if (data.venue !== undefined) {
    updateData.venue = data.venue;
  }

  if (data.organizationId !== undefined) {
    updateData.organizationId = organizationId;
  }

  if (data.linkedOfficialPostId !== undefined) {
    updateData.linkedOfficialPostId =
      finalLinkedOfficialPostId;
  }

  const event = await prisma.event.update({
    where: {
      id: eventId,
    },
    data: updateData,
    include: eventInclude,
  });

  return formatEvent(event);
}

export async function deleteEvent(
  userId: string,
  role: string,
  eventId: string,
) {
  const existing = await getEventForAuthorization(eventId);

  if (!existing) {
    throw new Error("Event not found");
  }

  const allowed = await canManageEvent(
    userId,
    role,
    existing.organizationId,
  );

  if (!allowed) {
    throw new Error(
      "You are not authorized to manage this event",
    );
  }

  await prisma.$transaction(async (tx) => {
  const event = await tx.event.findUnique({
    where: {
      id: eventId,
    },
    select: {
      linkedOfficialPostId: true,
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.linkedOfficialPostId) {
    await tx.event.update({
      where: {
        id: eventId,
      },
      data: {
        linkedOfficialPostId: null,
      },
    });

    await tx.officialPost.delete({
      where: {
        id: event.linkedOfficialPostId,
      },
    });
  }

  await tx.event.delete({
    where: {
      id: eventId,
    },
  });
});
}