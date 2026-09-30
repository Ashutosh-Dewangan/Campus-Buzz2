import type { Request, Response } from "express";

import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from "../services/event.service";

import {
  createEventSchema,
  updateEventSchema,
} from "../validators/event.validators";

export async function getEventsController(
  _req: Request,
  res: Response,
) {
  try {
    const events = await getEvents();

    res.json(events);
  } catch (error) {
    console.error("Get events failed:", error);

    res.status(500).json({
      message: "Failed to fetch events",
    });
  }
}

export async function createEventController(
  req: Request,
  res: Response,
) {
  if (!req.user) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  const result =
    createEventSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Invalid event data",
      errors: result.error.issues,
    });
    return;
  }

  try {
    const event = await createEvent(
      req.user.userId,
      req.user.role,
      result.data,
    );

    res.status(201).json(event);
  } catch (error) {
    if (!(error instanceof Error)) {
      res.status(500).json({
        message: "Failed to create event",
      });
      return;
    }

    if (
      error.message ===
      "You are not an active member of this organization"
    ) {
      res.status(403).json({
        message: error.message,
      });
      return;
    }

    if (
      error.message ===
      "Organization is required for student-created events"
    ) {
      res.status(400).json({
        message: error.message,
      });
      return;
    }

    if (
      error.message ===
        "Organization not found" ||
      error.message ===
        "Official post not found"
    ) {
      res.status(404).json({
        message: error.message,
      });
      return;
    }

    if (
      error.message ===
      "Official post does not belong to this organization"
    ) {
      res.status(400).json({
        message: error.message,
      });
      return;
    }

    console.error("Create event failed:", error);

    res.status(500).json({
      message: "Failed to create event",
    });
  }
}

export async function updateEventController(
  req: Request,
  res: Response,
) {
    const eventId = req.params.id;

    if (typeof eventId !== "string") {
      res.status(400).json({
        message: "Invalid event ID",
      });
      return;
    }
    if (!req.user) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  const result =
    updateEventSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Invalid event data",
      errors: result.error.issues,
    });
    return;
  }

  try {
    const event = await updateEvent(
      req.user.userId,
      req.user.role,
      eventId,
      result.data,
    );

    res.json(event);
  } catch (error) {
    if (!(error instanceof Error)) {
      res.status(500).json({
        message: "Failed to update event",
      });
      return;
    }

    if (error.message === "Event not found") {
      res.status(404).json({
        message: error.message,
      });
      return;
    }

    if (
      error.message ===
      "You are not authorized to manage this event"
    ) {
      res.status(403).json({
        message: error.message,
      });
      return;
    }

    if (
      error.message ===
      "You are not an active member of this organization"
    ) {
      res.status(403).json({
        message: error.message,
      });
      return;
    }

    if (
      error.message ===
        "Organization not found" ||
      error.message ===
        "Official post not found"
    ) {
      res.status(404).json({
        message: error.message,
      });
      return;
    }

    if (
      error.message ===
      "Official post does not belong to this organization"
    ) {
      res.status(400).json({
        message: error.message,
      });
      return;
    }

    console.error("Update event failed:", error);

    res.status(500).json({
      message: "Failed to update event",
    });
  }
}

export async function deleteEventController(
  req: Request,
  res: Response,
) {
    const eventId = req.params.id;

  if (typeof eventId !== "string") {
    res.status(400).json({
      message: "Invalid event ID",
    });
    return;
  }
  if (!req.user) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  try {
    await deleteEvent(
      req.user.userId,
      req.user.role,
      eventId,
    );

    res.json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    if (!(error instanceof Error)) {
      res.status(500).json({
        message: "Failed to delete event",
      });
      return;
    }

    if (error.message === "Event not found") {
      res.status(404).json({
        message: error.message,
      });
      return;
    }

    if (
      error.message ===
      "You are not authorized to manage this event"
    ) {
      res.status(403).json({
        message: error.message,
      });
      return;
    }

    console.error("Delete event failed:", error);

    res.status(500).json({
      message: "Failed to delete event",
    });
  }
}