import { Router } from "express";
import { getRootUsers, promoteToAdmin, demoteToClient, deleteRootUser } from "../controllers/rootController";

const router = Router();

// Listar clientes y admins
router.get("/root/users", getRootUsers);

// Promover cliente a admin
router.post("/root/users/:id/make-admin", promoteToAdmin);

// Degradar admin a cliente
router.post("/root/users/:id/make-client", demoteToClient);

// Eliminar usuario
router.delete("/root/users/:id", deleteRootUser);

export default router;
