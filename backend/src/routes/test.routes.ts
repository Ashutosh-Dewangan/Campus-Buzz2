import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { requireOrganizationMembership } from "../middleware/organization.middleware";

const router = Router();

router.get("/student", authenticate, requireRole("STUDENT", "ADMIN"), (req, res) => {
  res.json({
    message: "You can access the student area",
    user: req.user,
  });
});

router.get("/admin", authenticate, requireRole("ADMIN"), (req, res) => {
  res.json({
    message: "You can access the admin area",
    user: req.user,
  });
});

router.get(
    "/organizations/:organizationId",
    authenticate,
    requireOrganizationMembership,
    (req, res) => {
      res.json({
        message: "You are an active member of this organization",
        user: req.user,
        organizationId: req.params.organizationId,
      });
    },
  );

export default router;