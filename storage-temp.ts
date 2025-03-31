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

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;

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
