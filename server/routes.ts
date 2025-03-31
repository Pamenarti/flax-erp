import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  const { isAuthenticated } = setupAuth(app);

  // Module routes
  app.get("/api/modules", async (req, res) => {
    try {
      const modules = await storage.getAllModules();
      res.json(modules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/modules/:id", async (req, res) => {
    try {
      const moduleId = parseInt(req.params.id);
      const module = await storage.getModule(moduleId);
      
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      res.json(module);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User-Module routes (protected)
  app.get("/api/user/modules", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const userWithModules = await storage.getUserWithModules(userId);
      res.json(userWithModules.modules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/modules/:id/activate", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const moduleId = parseInt(req.params.id);
      
      // Check if module exists
      const module = await storage.getModule(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      // Check if already activated
      const isActivated = await storage.isModuleActivated(userId, moduleId);
      if (isActivated) {
        return res.status(400).json({ message: "Module already activated" });
      }
      
      // Check if user has enough credits
      const userCredits = await storage.getUserCredits(userId);
      if (userCredits < module.price) {
        return res.status(400).json({ message: "Insufficient credits" });
      }
      
      // Activate the module
      await storage.activateModule(userId, moduleId);
      
      // Return updated modules list
      const userWithModules = await storage.getUserWithModules(userId);
      res.json(userWithModules.modules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Credits routes (protected)
  app.get("/api/user/credits", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const credits = await storage.getUserCredits(userId);
      res.json({ credits });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/user/credits/add", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { amount } = req.body;
      
      if (!amount || amount <= 0 || typeof amount !== 'number') {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      const user = await storage.addCredits(userId, amount);
      
      // Log the activity
      await storage.createActivity({
        userId,
        action: "credits_added",
        details: `Added ${amount} credits`
      });
      
      res.json({ credits: user.credits });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Activity routes (protected)
  app.get("/api/user/activities", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const activities = await storage.getUserActivities(userId, limit);
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
