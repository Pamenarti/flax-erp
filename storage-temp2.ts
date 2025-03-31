
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Credit operations
  async getUserCredits(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user.credits;
  }

  async addCredits(userId: number, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({ credits: user.credits + amount })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async deductCredits(userId: number, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    if (user.credits < amount) {
      throw new Error("Insufficient credits");
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({ credits: user.credits - amount })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  // Module operations
  async getAllModules(): Promise<Module[]> {
    return db.select().from(modules).where(eq(modules.active, true));
  }

  async getModule(id: number): Promise<Module | undefined> {
    const [module] = await db.select().from(modules).where(eq(modules.id, id));
    return module;
  }

  async createModule(module: InsertModule): Promise<Module> {
    const [newModule] = await db.insert(modules).values(module).returning();
    return newModule;
  }

  async updateModule(id: number, data: Partial<Module>): Promise<Module> {
    const [updatedModule] = await db
      .update(modules)
      .set(data)
      .where(eq(modules.id, id))
      .returning();
    
    return updatedModule;
  }

  // User-Module operations
  async getUserModules(userId: number): Promise<UserModule[]> {
    return db
      .select()
      .from(userModules)
      .where(and(
        eq(userModules.userId, userId),
        eq(userModules.active, true)
      ));
  }

  async getUserWithModules(userId: number): Promise<{ user: User; modules: Module[] }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const userModulesList = await this.getUserModules(userId);
    const moduleIds = userModulesList.map(um => um.moduleId);
    
    const modulesList: Module[] = [];
    if (moduleIds.length > 0) {
      for (const moduleId of moduleIds) {
        const module = await this.getModule(moduleId);
        if (module) {
          modulesList.push(module);
        }
      }
    }
    
    return { user, modules: modulesList };
  }

  async activateModule(userId: number, moduleId: number): Promise<UserModule> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const module = await this.getModule(moduleId);
    if (!module) {
      throw new Error("Module not found");
    }
    
    const isActivated = await this.isModuleActivated(userId, moduleId);
    if (isActivated) {
      throw new Error("Module already activated");
    }
    
    if (user.credits < module.price) {
      throw new Error("Insufficient credits");
    }
    
    // Deduct credits
    await this.deductCredits(userId, module.price);
    
    // Activate module
    const [userModule] = await db
      .insert(userModules)
      .values({
        userId,
        moduleId,
        active: true
      })
      .returning();
    
    // Log the activity
    await this.createActivity({
      userId,
      action: "module_activated",
      details: `Activated module: ${module.name}`
    });
    
    return userModule;
  }

  async isModuleActivated(userId: number, moduleId: number): Promise<boolean> {
    const [userModule] = await db
      .select()
      .from(userModules)
      .where(and(
        eq(userModules.userId, userId),
        eq(userModules.moduleId, moduleId),
        eq(userModules.active, true)
      ));
    
    return !!userModule;
  }

  // Activity operations
  async getUserActivities(userId: number, limit: number = 10): Promise<Activity[]> {
    return db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.timestamp))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();
    
    return newActivity;
  }
}

// Choose the appropriate storage implementation based on environment
// For this project, we'll start with MemStorage for development
export const storage = new MemStorage();
