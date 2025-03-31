import { 
  users, modules, subModules, userModules, 
  roles, userRoles, modulePermissions, activities
} from "@shared/schema";
import type { 
  User, InsertUser, Module, InsertModule, SubModule, InsertSubModule,
  UserModule, InsertUserModule, Role, InsertRole, 
  UserRole, InsertUserRole, ModulePermission, InsertModulePermission,
  Activity, InsertActivity 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);
const PostgresStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  
  // Credit operations
  getUserCredits(userId: number): Promise<number>;
  addCredits(userId: number, amount: number): Promise<User>;
  deductCredits(userId: number, amount: number): Promise<User>;
  
  // Module operations
  getAllModules(): Promise<Module[]>;
  getModule(id: number): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: number, data: Partial<Module>): Promise<Module>;
  
  // User-Module operations
  getUserModules(userId: number): Promise<UserModule[]>;
  getUserWithModules(userId: number): Promise<{ user: User; modules: Module[] }>;
  activateModule(userId: number, moduleId: number): Promise<UserModule>;
  isModuleActivated(userId: number, moduleId: number): Promise<boolean>;
  
  // Activity operations
  getUserActivities(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Session store
  sessionStore: any;
}

// In-memory storage implementation for development
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private modules: Map<number, Module>;
  private subModules: Map<number, SubModule>;
  private userModules: Map<number, UserModule>;
  private roles: Map<number, Role>;
  private userRoles: Map<number, UserRole>;
  private modulePermissions: Map<number, ModulePermission>;
  private activities: Map<number, Activity>;
  private userId: number;
  private moduleId: number;
  private subModuleId: number;
  private userModuleId: number;
  private roleId: number;
  private userRoleId: number;
  private modulePermissionId: number;
  private activityId: number;
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.modules = new Map();
    this.subModules = new Map();
    this.userModules = new Map();
    this.roles = new Map();
    this.userRoles = new Map();
    this.modulePermissions = new Map();
    this.activities = new Map();
    this.userId = 1;
    this.moduleId = 1;
    this.subModuleId = 1;
    this.userModuleId = 1;
    this.roleId = 1;
    this.userRoleId = 1;
    this.modulePermissionId = 1;
    this.activityId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });

    // Seed with default modules and roles
    this.seedModules();
    this.seedRoles();
  }

  private seedRoles() {
    const defaultRoles = [
      {
        name: "Admin",
        description: "System administrator with full access to all modules and features"
      },
      {
        name: "Manager",
        description: "Department manager with access to assigned modules and features"
      },
      {
        name: "Employee",
        description: "Regular employee with limited access to assigned modules and features"
      },
      {
        name: "Customer",
        description: "External customer with access to customer portal only"
      },
      {
        name: "Supplier",
        description: "External supplier with access to supplier portal only"
      }
    ];
    
    // Seed roles
    for (const role of defaultRoles) {
      const id = this.roleId++;
      const now = new Date();
      this.roles.set(id, {
        ...role,
        id,
        createdAt: now
      });
    }
  }

  private seedModules() {
    const defaultModules = [
      {
        name: "Finans Yönetimi",
        description: "Genel muhasebe, alacaklar, borçlar ve bütçeleme içeren eksiksiz finansal yönetim.",
        price: 500,
        icon: "dollar-sign",
        type: "finance" as const,
        features: "Muhasebe, Alacaklar, Borçlar, Bütçeleme",
        slug: "finans-yonetimi",
        active: true
      },
      {
        name: "Satış Yönetimi",
        description: "Satış sürecinizi, potansiyel müşteri oluşturmadan sipariş takibine ve müşteri hizmetlerine kadar yönetin.",
        price: 400,
        icon: "shopping-bag",
        type: "sales" as const,
        features: "Müşteri Yönetimi, Siparişler, Teklifler, Faturalama",
        slug: "satis-yonetimi",
        active: true
      },
      {
        name: "Stok Yönetimi",
        description: "Stok seviyelerini, siparişleri, satışları ve teslimatları çoklu depo desteğiyle takip edin.",
        price: 350,
        icon: "package",
        type: "inventory" as const,
        features: "Stok Takibi, Depo Yönetimi, Barkod Sistemi, Sayım",
        slug: "stok-yonetimi",
        active: true
      },
      {
        name: "İnsan Kaynakları",
        description: "Çalışan kayıtlarını, zaman takibini, performans değerlendirmelerini ve bordro işlemlerini yönetin.",
        price: 450,
        icon: "users",
        type: "hr" as const,
        features: "Personel Yönetimi, İzin Takibi, Bordro, Performans",
        slug: "insan-kaynaklari",
        active: true
      },
      {
        name: "Proje Yönetimi",
        description: "Görev ataması, Gantt şemaları ve kaynak tahsisi ile projeleri planlayın, yürütün ve takip edin.",
        price: 300,
        icon: "clipboard",
        type: "project" as const,
        features: "Proje Planlama, Görev Yönetimi, Zaman Takibi, Raporlama",
        slug: "proje-yonetimi",
        active: true
      },
      {
        name: "Satın Alma",
        description: "Tedarikçi yönetimi, satın alma siparişleri ve stok girişleri için kapsamlı satın alma modülü.",
        price: 400,
        icon: "shopping-cart",
        type: "purchase" as const,
        features: "Tedarikçi Yönetimi, Satın Alma Siparişleri, Teklifler, Gider Takibi",
        slug: "satin-alma",
        active: true
      },
      {
        name: "Belge Yönetimi",
        description: "Şirket belgelerini güvenli bir şekilde saklayın, düzenleyin ve paylaşın.",
        price: 250,
        icon: "file-text",
        type: "document" as const,
        features: "Belge Arşivi, Versiyon Kontrolü, OCR, Paylaşım",
        slug: "belge-yonetimi",
        active: true
      },
      {
        name: "Raporlama ve Analiz",
        description: "İş zekası araçları ile özelleştirilebilir raporlar ve gerçek zamanlı gösterge panelleri oluşturun.",
        price: 350,
        icon: "bar-chart-2",
        type: "report" as const,
        features: "Grafikler, Özelleştirilebilir Raporlar, İş Zekası, Tahminler",
        slug: "raporlama-analiz",
        active: true
      }
    ];

    // Seed modules
    defaultModules.forEach(module => {
      const id = this.moduleId++;
      const now = new Date();
      const newModule: Module = {
        ...module,
        id,
        createdAt: now,
        updatedAt: now
      };
      this.modules.set(id, newModule);
      
      // Add sub-modules for each module
      this.addSubModules(id, module.type);
    });
  }
  
  // Helper method to add sub-modules
  private addSubModules(moduleId: number, moduleType: string) {
    let subModules: { name: string; description: string; }[] = [];
    
    switch(moduleType) {
      case "finance":
        subModules = [
          { name: "Genel Muhasebe", description: "Genel muhasebe işlemleri ve finans raporları" },
          { name: "Alacak Yönetimi", description: "Müşteri alacakları ve tahsilat yönetimi" },
          { name: "Borç Yönetimi", description: "Tedarikçi borçları ve ödeme yönetimi" },
          { name: "Bütçe Planlama", description: "Bütçe oluşturma ve takip etme" }
        ];
        break;
      case "sales":
        subModules = [
          { name: "Müşteri Yönetimi", description: "Müşteri bilgileri ve ilişki yönetimi" },
          { name: "Sipariş Yönetimi", description: "Satış siparişlerinin oluşturulması ve takibi" },
          { name: "Teklif Yönetimi", description: "Müşterilere teklif hazırlama ve takip" },
          { name: "Faturalama", description: "Satış faturalarının oluşturulması ve takibi" }
        ];
        break;
      case "inventory":
        subModules = [
          { name: "Stok Takibi", description: "Ürün stok seviyelerinin izlenmesi" },
          { name: "Depo Yönetimi", description: "Birden fazla depo lokasyonu yönetimi" },
          { name: "Barkod Sistemi", description: "Ürün barkod sistemleri ve etiketleme" },
          { name: "Sayım İşlemleri", description: "Fiziksel sayım ve envanter düzeltme" }
        ];
        break;
      case "hr":
        subModules = [
          { name: "Personel Yönetimi", description: "Çalışan bilgilerinin yönetimi" },
          { name: "İzin Takibi", description: "Çalışan izinlerinin takibi ve onay süreci" },
          { name: "Bordro İşlemleri", description: "Maaş hesaplama ve bordro yönetimi" },
          { name: "Performans Değerlendirme", description: "Çalışan performans değerlendirme sistemi" }
        ];
        break;
      case "project":
        subModules = [
          { name: "Proje Planlama", description: "Proje oluşturma ve planlama" },
          { name: "Görev Yönetimi", description: "Görev atama ve takip etme" },
          { name: "Zaman Takibi", description: "Proje ve görev süre takibi" },
          { name: "Proje Raporları", description: "Detaylı proje ilerleme raporları" }
        ];
        break;
      case "purchase":
        subModules = [
          { name: "Tedarikçi Yönetimi", description: "Tedarikçi bilgileri ve ilişki yönetimi" },
          { name: "Satın Alma Siparişleri", description: "Satın alma siparişlerinin oluşturulması ve takibi" },
          { name: "Teklif Alma", description: "Tedarikçilerden teklif toplama ve değerlendirme" },
          { name: "Gider Takibi", description: "Satın alma giderlerinin bütçe takibi" }
        ];
        break;
    }
    
    // Create sub-modules
    for (const subModule of subModules) {
      const id = this.subModuleId++;
      const now = new Date();
      this.subModules.set(id, {
        id,
        moduleId,
        name: subModule.name,
        description: subModule.description,
        createdAt: now,
        updatedAt: now,
        active: true
      });
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      credits: 0,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
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
    
    const updatedUser = { 
      ...user, 
      credits: user.credits + amount 
    };
    this.users.set(userId, updatedUser);
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
    
    const updatedUser = { 
      ...user, 
      credits: user.credits - amount 
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Module operations
  async getAllModules(): Promise<Module[]> {
    return Array.from(this.modules.values());
  }

  async getModule(id: number): Promise<Module | undefined> {
    return this.modules.get(id);
  }

  async createModule(module: InsertModule): Promise<Module> {
    const id = this.moduleId++;
    const newModule: Module = { ...module, id };
    this.modules.set(id, newModule);
    return newModule;
  }

  async updateModule(id: number, data: Partial<Module>): Promise<Module> {
    const module = await this.getModule(id);
    if (!module) {
      throw new Error("Module not found");
    }
    
    const updatedModule = { ...module, ...data };
    this.modules.set(id, updatedModule);
    return updatedModule;
  }

  // User-Module operations
  async getUserModules(userId: number): Promise<UserModule[]> {
    return Array.from(this.userModules.values()).filter(
      (userModule) => userModule.userId === userId
    );
  }

  async getUserWithModules(userId: number): Promise<{ user: User; modules: Module[] }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const userModules = await this.getUserModules(userId);
    const modules = await Promise.all(
      userModules.map(async (userModule) => {
        const module = await this.getModule(userModule.moduleId);
        if (!module) {
          throw new Error(`Module with ID ${userModule.moduleId} not found`);
        }
        return module;
      })
    );
    
    return { user, modules };
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
    const id = this.userModuleId++;
    const now = new Date();
    const userModule: UserModule = {
      id,
      userId,
      moduleId,
      activatedAt: now,
      active: true
    };
    
    this.userModules.set(id, userModule);
    
    // Log the activity
    await this.createActivity({
      userId,
      action: "module_activated",
      details: `Activated module: ${module.name}`
    });
    
    return userModule;
  }

  async isModuleActivated(userId: number, moduleId: number): Promise<boolean> {
    const userModules = await this.getUserModules(userId);
    return userModules.some(
      (userModule) => userModule.moduleId === moduleId && userModule.active
    );
  }

  // Activity operations
  async getUserActivities(userId: number, limit: number = 10): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .filter((activity) => activity.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    return activities;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const now = new Date();
    const newActivity: Activity = {
      ...activity,
      id,
      timestamp: now
    };
    
    this.activities.set(id, newActivity);
    return newActivity;
  }
}

// For development using DatabaseStorage with Drizzle ORM and PostgreSQL
export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Using PostgresStore with connect-pg-simple to store sessions in PostgreSQL
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Uncomment below and comment above when connect-pg-simple is installed
    /*
    this.sessionStore = new PostgresStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true
    });
    */
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

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
// Switched to DatabaseStorage to use PostgreSQL
export const storage = new DatabaseStorage();
