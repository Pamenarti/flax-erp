     1	import { 
     2	  users, modules, subModules, userModules, 
     3	  roles, userRoles, modulePermissions, activities
     4	} from "@shared/schema";
     5	import type { 
     6	  User, InsertUser, Module, InsertModule, SubModule, InsertSubModule,
     7	  UserModule, InsertUserModule, Role, InsertRole, 
     8	  UserRole, InsertUserRole, ModulePermission, InsertModulePermission,
     9	  Activity, InsertActivity 
    10	} from "@shared/schema";
    11	import { db } from "./db";
    12	import { eq, and, desc } from "drizzle-orm";
    13	import session from "express-session";
    14	import createMemoryStore from "memorystore";
    15	
    16	const MemoryStore = createMemoryStore(session);
    17	
    18	export interface IStorage {
    19	  // User operations
    20	  getUser(id: number): Promise<User | undefined>;
    21	  getUserByUsername(username: string): Promise<User | undefined>;
    22	  getUserByEmail(email: string): Promise<User | undefined>;
    23	  createUser(user: InsertUser): Promise<User>;
    24	  updateUser(id: number, data: Partial<User>): Promise<User>;
    25	  
    26	  // Credit operations
    27	  getUserCredits(userId: number): Promise<number>;
    28	  addCredits(userId: number, amount: number): Promise<User>;
    29	  deductCredits(userId: number, amount: number): Promise<User>;
    30	  
    31	  // Module operations
    32	  getAllModules(): Promise<Module[]>;
    33	  getModule(id: number): Promise<Module | undefined>;
    34	  createModule(module: InsertModule): Promise<Module>;
    35	  updateModule(id: number, data: Partial<Module>): Promise<Module>;
    36	  
    37	  // User-Module operations
    38	  getUserModules(userId: number): Promise<UserModule[]>;
    39	  getUserWithModules(userId: number): Promise<{ user: User; modules: Module[] }>;
    40	  activateModule(userId: number, moduleId: number): Promise<UserModule>;
    41	  isModuleActivated(userId: number, moduleId: number): Promise<boolean>;
    42	  
    43	  // Activity operations
    44	  getUserActivities(userId: number, limit?: number): Promise<Activity[]>;
    45	  createActivity(activity: InsertActivity): Promise<Activity>;
    46	  
    47	  // Session store
    48	  sessionStore: any;
    49	}
    50	
    51	// In-memory storage implementation for development
    52	export class MemStorage implements IStorage {
    53	  private users: Map<number, User>;
    54	  private modules: Map<number, Module>;
    55	  private subModules: Map<number, SubModule>;
    56	  private userModules: Map<number, UserModule>;
    57	  private roles: Map<number, Role>;
    58	  private userRoles: Map<number, UserRole>;
    59	  private modulePermissions: Map<number, ModulePermission>;
    60	  private activities: Map<number, Activity>;
    61	  private userId: number;
    62	  private moduleId: number;
    63	  private subModuleId: number;
    64	  private userModuleId: number;
    65	  private roleId: number;
    66	  private userRoleId: number;
    67	  private modulePermissionId: number;
    68	  private activityId: number;
    69	  sessionStore: session.SessionStore;
    70	
    71	  constructor() {
    72	    this.users = new Map();
    73	    this.modules = new Map();
    74	    this.subModules = new Map();
    75	    this.userModules = new Map();
    76	    this.roles = new Map();
    77	    this.userRoles = new Map();
    78	    this.modulePermissions = new Map();
    79	    this.activities = new Map();
    80	    this.userId = 1;
    81	    this.moduleId = 1;
    82	    this.subModuleId = 1;
    83	    this.userModuleId = 1;
    84	    this.roleId = 1;
    85	    this.userRoleId = 1;
    86	    this.modulePermissionId = 1;
    87	    this.activityId = 1;
    88	    this.sessionStore = new MemoryStore({
    89	      checkPeriod: 86400000 // 24 hours
    90	    });
    91	
    92	    // Seed with default modules and roles
    93	    this.seedModules();
    94	    this.seedRoles();
    95	  }
    96	
    97	  private seedRoles() {
    98	    const defaultRoles = [
    99	      {
   100	        name: "Admin",
   101	        description: "System administrator with full access to all modules and features"
   102	      },
   103	      {
   104	        name: "Manager",
   105	        description: "Department manager with access to assigned modules and features"
   106	      },
   107	      {
   108	        name: "Employee",
   109	        description: "Regular employee with limited access to assigned modules and features"
   110	      },
   111	      {
   112	        name: "Customer",
   113	        description: "External customer with access to customer portal only"
   114	      },
   115	      {
   116	        name: "Supplier",
   117	        description: "External supplier with access to supplier portal only"
   118	      }
   119	    ];
   120	    
   121	    // Seed roles
   122	    for (const role of defaultRoles) {
   123	      const id = this.roleId++;
   124	      const now = new Date();
   125	      this.roles.set(id, {
   126	        ...role,
   127	        id,
   128	        createdAt: now
   129	      });
   130	    }
   131	  }
   132	
   133	  private seedModules() {
   134	    const defaultModules = [
   135	      {
   136	        name: "Finans Yönetimi",
   137	        description: "Genel muhasebe, alacaklar, borçlar ve bütçeleme içeren eksiksiz finansal yönetim.",
   138	        price: 500,
   139	        icon: "dollar-sign",
   140	        type: "finance" as const,
   141	        features: "Muhasebe, Alacaklar, Borçlar, Bütçeleme",
   142	        slug: "finans-yonetimi",
   143	        active: true
   144	      },
   145	      {
   146	        name: "Satış Yönetimi",
   147	        description: "Satış sürecinizi, potansiyel müşteri oluşturmadan sipariş takibine ve müşteri hizmetlerine kadar yönetin.",
   148	        price: 400,
   149	        icon: "shopping-bag",
   150	        type: "sales" as const,
   151	        features: "Müşteri Yönetimi, Siparişler, Teklifler, Faturalama",
   152	        slug: "satis-yonetimi",
   153	        active: true
   154	      },
   155	      {
   156	        name: "Stok Yönetimi",
   157	        description: "Stok seviyelerini, siparişleri, satışları ve teslimatları çoklu depo desteğiyle takip edin.",
   158	        price: 350,
   159	        icon: "package",
   160	        type: "inventory" as const,
   161	        features: "Stok Takibi, Depo Yönetimi, Barkod Sistemi, Sayım",
   162	        slug: "stok-yonetimi",
   163	        active: true
   164	      },
   165	      {
   166	        name: "İnsan Kaynakları",
   167	        description: "Çalışan kayıtlarını, zaman takibini, performans değerlendirmelerini ve bordro işlemlerini yönetin.",
   168	        price: 450,
   169	        icon: "users",
   170	        type: "hr" as const,
   171	        features: "Personel Yönetimi, İzin Takibi, Bordro, Performans",
   172	        slug: "insan-kaynaklari",
   173	        active: true
   174	      },
   175	      {
   176	        name: "Proje Yönetimi",
   177	        description: "Görev ataması, Gantt şemaları ve kaynak tahsisi ile projeleri planlayın, yürütün ve takip edin.",
   178	        price: 300,
   179	        icon: "clipboard",
   180	        type: "project" as const,
   181	        features: "Proje Planlama, Görev Yönetimi, Zaman Takibi, Raporlama",
   182	        slug: "proje-yonetimi",
   183	        active: true
   184	      },
   185	      {
   186	        name: "Satın Alma",
   187	        description: "Tedarikçi yönetimi, satın alma siparişleri ve stok girişleri için kapsamlı satın alma modülü.",
   188	        price: 400,
   189	        icon: "shopping-cart",
   190	        type: "purchase" as const,
   191	        features: "Tedarikçi Yönetimi, Satın Alma Siparişleri, Teklifler, Gider Takibi",
   192	        slug: "satin-alma",
   193	        active: true
   194	      },
   195	      {
   196	        name: "Belge Yönetimi",
   197	        description: "Şirket belgelerini güvenli bir şekilde saklayın, düzenleyin ve paylaşın.",
   198	        price: 250,
   199	        icon: "file-text",
   200	        type: "document" as const,
   201	        features: "Belge Arşivi, Versiyon Kontrolü, OCR, Paylaşım",
   202	        slug: "belge-yonetimi",
   203	        active: true
   204	      },
   205	      {
   206	        name: "Raporlama ve Analiz",
   207	        description: "İş zekası araçları ile özelleştirilebilir raporlar ve gerçek zamanlı gösterge panelleri oluşturun.",
   208	        price: 350,
   209	        icon: "bar-chart-2",
   210	        type: "report" as const,
   211	        features: "Grafikler, Özelleştirilebilir Raporlar, İş Zekası, Tahminler",
   212	        slug: "raporlama-analiz",
   213	        active: true
   214	      }
   215	    ];
   216	
   217	    // Seed modules
   218	    defaultModules.forEach(module => {
   219	      const id = this.moduleId++;
   220	      const now = new Date();
   221	      const newModule: Module = {
   222	        ...module,
   223	        id,
   224	        createdAt: now,
   225	        updatedAt: now
   226	      };
   227	      this.modules.set(id, newModule);
   228	      
   229	      // Add sub-modules for each module
   230	      this.addSubModules(id, module.type);
   231	    });
   232	  }
   233	  
   234	  // Helper method to add sub-modules
   235	  private addSubModules(moduleId: number, moduleType: string) {
   236	    let subModules: { name: string; description: string; }[] = [];
   237	    
   238	    switch(moduleType) {
   239	      case "finance":
   240	        subModules = [
   241	          { name: "Genel Muhasebe", description: "Genel muhasebe işlemleri ve finans raporları" },
   242	          { name: "Alacak Yönetimi", description: "Müşteri alacakları ve tahsilat yönetimi" },
   243	          { name: "Borç Yönetimi", description: "Tedarikçi borçları ve ödeme yönetimi" },
   244	          { name: "Bütçe Planlama", description: "Bütçe oluşturma ve takip etme" }
   245	        ];
   246	        break;
   247	      case "sales":
   248	        subModules = [
   249	          { name: "Müşteri Yönetimi", description: "Müşteri bilgileri ve ilişki yönetimi" },
   250	          { name: "Sipariş Yönetimi", description: "Satış siparişlerinin oluşturulması ve takibi" },
   251	          { name: "Teklif Yönetimi", description: "Müşterilere teklif hazırlama ve takip" },
   252	          { name: "Faturalama", description: "Satış faturalarının oluşturulması ve takibi" }
   253	        ];
   254	        break;
   255	      case "inventory":
   256	        subModules = [
   257	          { name: "Stok Takibi", description: "Ürün stok seviyelerinin izlenmesi" },
   258	          { name: "Depo Yönetimi", description: "Birden fazla depo lokasyonu yönetimi" },
   259	          { name: "Barkod Sistemi", description: "Ürün barkod sistemleri ve etiketleme" },
   260	          { name: "Sayım İşlemleri", description: "Fiziksel sayım ve envanter düzeltme" }
   261	        ];
   262	        break;
   263	      case "hr":
   264	        subModules = [
   265	          { name: "Personel Yönetimi", description: "Çalışan bilgilerinin yönetimi" },
   266	          { name: "İzin Takibi", description: "Çalışan izinlerinin takibi ve onay süreci" },
   267	          { name: "Bordro İşlemleri", description: "Maaş hesaplama ve bordro yönetimi" },
   268	          { name: "Performans Değerlendirme", description: "Çalışan performans değerlendirme sistemi" }
   269	        ];
   270	        break;
   271	      case "project":
   272	        subModules = [
   273	          { name: "Proje Planlama", description: "Proje oluşturma ve planlama" },
   274	          { name: "Görev Yönetimi", description: "Görev atama ve takip etme" },
   275	          { name: "Zaman Takibi", description: "Proje ve görev süre takibi" },
   276	          { name: "Proje Raporları", description: "Detaylı proje ilerleme raporları" }
   277	        ];
   278	        break;
   279	      case "purchase":
   280	        subModules = [
   281	          { name: "Tedarikçi Yönetimi", description: "Tedarikçi bilgileri ve ilişki yönetimi" },
   282	          { name: "Satın Alma Siparişleri", description: "Satın alma siparişlerinin oluşturulması ve takibi" },
   283	          { name: "Teklif Alma", description: "Tedarikçilerden teklif toplama ve değerlendirme" },
   284	          { name: "Gider Takibi", description: "Satın alma giderlerinin bütçe takibi" }
   285	        ];
   286	        break;
   287	    }
   288	    
   289	    // Create sub-modules
   290	    for (const subModule of subModules) {
   291	      const id = this.subModuleId++;
   292	      const now = new Date();
   293	      this.subModules.set(id, {
   294	        id,
   295	        moduleId,
   296	        name: subModule.name,
   297	        description: subModule.description,
   298	        createdAt: now,
   299	        updatedAt: now,
   300	        active: true
   301	      });
   302	    }
   303	  }
   304	
   305	  // User operations
   306	  async getUser(id: number): Promise<User | undefined> {
   307	    return this.users.get(id);
   308	  }
   309	
   310	  async getUserByUsername(username: string): Promise<User | undefined> {
   311	    return Array.from(this.users.values()).find(
   312	      (user) => user.username === username
   313	    );
   314	  }
   315	
   316	  async getUserByEmail(email: string): Promise<User | undefined> {
   317	    return Array.from(this.users.values()).find(
   318	      (user) => user.email === email
   319	    );
   320	  }
   321	
   322	  async createUser(insertUser: InsertUser): Promise<User> {
   323	    const id = this.userId++;
   324	    const now = new Date();
   325	    const user: User = { 
   326	      ...insertUser, 
   327	      id, 
   328	      credits: 0,
   329	      createdAt: now
   330	    };
   331	    this.users.set(id, user);
   332	    return user;
   333	  }
   334	
   335	  async updateUser(id: number, data: Partial<User>): Promise<User> {
   336	    const user = await this.getUser(id);
   337	    if (!user) {
   338	      throw new Error("User not found");
   339	    }
   340	    
   341	    const updatedUser = { ...user, ...data };
   342	    this.users.set(id, updatedUser);
   343	    return updatedUser;
   344	  }
   345	
   346	  // Credit operations
   347	  async getUserCredits(userId: number): Promise<number> {
   348	    const user = await this.getUser(userId);
   349	    if (!user) {
   350	      throw new Error("User not found");
   351	    }
   352	    return user.credits;
   353	  }
   354	
   355	  async addCredits(userId: number, amount: number): Promise<User> {
   356	    const user = await this.getUser(userId);
   357	    if (!user) {
   358	      throw new Error("User not found");
   359	    }
   360	    
   361	    const updatedUser = { 
   362	      ...user, 
   363	      credits: user.credits + amount 
   364	    };
   365	    this.users.set(userId, updatedUser);
   366	    return updatedUser;
   367	  }
   368	
   369	  async deductCredits(userId: number, amount: number): Promise<User> {
   370	    const user = await this.getUser(userId);
   371	    if (!user) {
   372	      throw new Error("User not found");
   373	    }
   374	    
   375	    if (user.credits < amount) {
   376	      throw new Error("Insufficient credits");
   377	    }
   378	    
   379	    const updatedUser = { 
   380	      ...user, 
   381	      credits: user.credits - amount 
   382	    };
   383	    this.users.set(userId, updatedUser);
   384	    return updatedUser;
   385	  }
   386	
   387	  // Module operations
   388	  async getAllModules(): Promise<Module[]> {
   389	    return Array.from(this.modules.values());
   390	  }
   391	
   392	  async getModule(id: number): Promise<Module | undefined> {
   393	    return this.modules.get(id);
   394	  }
   395	
   396	  async createModule(module: InsertModule): Promise<Module> {
   397	    const id = this.moduleId++;
   398	    const newModule: Module = { ...module, id };
   399	    this.modules.set(id, newModule);
   400	    return newModule;
   401	  }
   402	
   403	  async updateModule(id: number, data: Partial<Module>): Promise<Module> {
   404	    const module = await this.getModule(id);
   405	    if (!module) {
   406	      throw new Error("Module not found");
   407	    }
   408	    
   409	    const updatedModule = { ...module, ...data };
   410	    this.modules.set(id, updatedModule);
   411	    return updatedModule;
   412	  }
   413	
   414	  // User-Module operations
   415	  async getUserModules(userId: number): Promise<UserModule[]> {
   416	    return Array.from(this.userModules.values()).filter(
   417	      (userModule) => userModule.userId === userId
   418	    );
   419	  }
   420	
   421	  async getUserWithModules(userId: number): Promise<{ user: User; modules: Module[] }> {
   422	    const user = await this.getUser(userId);
   423	    if (!user) {
   424	      throw new Error("User not found");
   425	    }
   426	    
   427	    const userModules = await this.getUserModules(userId);
   428	    const modules = await Promise.all(
   429	      userModules.map(async (userModule) => {
   430	        const module = await this.getModule(userModule.moduleId);
   431	        if (!module) {
   432	          throw new Error(`Module with ID ${userModule.moduleId} not found`);
   433	        }
   434	        return module;
   435	      })
   436	    );
   437	    
   438	    return { user, modules };
   439	  }
   440	
   441	  async activateModule(userId: number, moduleId: number): Promise<UserModule> {
   442	    const user = await this.getUser(userId);
   443	    if (!user) {
   444	      throw new Error("User not found");
   445	    }
   446	    
   447	    const module = await this.getModule(moduleId);
   448	    if (!module) {
   449	      throw new Error("Module not found");
   450	    }
   451	    
   452	    const isActivated = await this.isModuleActivated(userId, moduleId);
   453	    if (isActivated) {
   454	      throw new Error("Module already activated");
   455	    }
   456	    
   457	    if (user.credits < module.price) {
   458	      throw new Error("Insufficient credits");
   459	    }
   460	    
   461	    // Deduct credits
   462	    await this.deductCredits(userId, module.price);
   463	    
   464	    // Activate module
   465	    const id = this.userModuleId++;
   466	    const now = new Date();
   467	    const userModule: UserModule = {
   468	      id,
   469	      userId,
   470	      moduleId,
   471	      activatedAt: now,
   472	      active: true
   473	    };
   474	    
   475	    this.userModules.set(id, userModule);
   476	    
   477	    // Log the activity
   478	    await this.createActivity({
   479	      userId,
   480	      action: "module_activated",
   481	      details: `Activated module: ${module.name}`
   482	    });
   483	    
   484	    return userModule;
   485	  }
   486	
   487	  async isModuleActivated(userId: number, moduleId: number): Promise<boolean> {
   488	    const userModules = await this.getUserModules(userId);
   489	    return userModules.some(
   490	      (userModule) => userModule.moduleId === moduleId && userModule.active
   491	    );
   492	  }
   493	
   494	  // Activity operations
   495	  async getUserActivities(userId: number, limit: number = 10): Promise<Activity[]> {
   496	    const activities = Array.from(this.activities.values())
   497	      .filter((activity) => activity.userId === userId)
   498	      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
   499	      .slice(0, limit);
   500	    
   501	    return activities;
   502	  }
   503	
   504	  async createActivity(activity: InsertActivity): Promise<Activity> {
   505	    const id = this.activityId++;
   506	    const now = new Date();
   507	    const newActivity: Activity = {
   508	      ...activity,
   509	      id,
   510	      timestamp: now
   511	    };
   512	    
   513	    this.activities.set(id, newActivity);
   514	    return newActivity;
   515	  }
   516	}
   517	
   518	// For development using DatabaseStorage with Drizzle ORM and PostgreSQL
   519	export class DatabaseStorage implements IStorage {
   520	  sessionStore: session.SessionStore;
   521	
   522	  constructor() {
   523	    this.sessionStore = new MemoryStore({
   524	      checkPeriod: 86400000 // 24 hours
   525	    });
   526	  }
   527	
   528	  // User operations
   529	  async getUser(id: number): Promise<User | undefined> {
   530	    const [user] = await db.select().from(users).where(eq(users.id, id));
   531	    return user;
   532	  }
   533	
   534	  async getUserByUsername(username: string): Promise<User | undefined> {
   535	    const [user] = await db.select().from(users).where(eq(users.username, username));
   536	    return user;
   537	  }
   538	
   539	  async getUserByEmail(email: string): Promise<User | undefined> {
   540	    const [user] = await db.select().from(users).where(eq(users.email, email));
   541	    return user;
   542	  }
   543	
   544	  async createUser(insertUser: InsertUser): Promise<User> {
   545	    const [user] = await db.insert(users).values(insertUser).returning();
   546	    return user;
   547	  }
   548	
   549	  async updateUser(id: number, data: Partial<User>): Promise<User> {
   550	    const [updatedUser] = await db
   551	      .update(users)
   552	      .set(data)
   553	      .where(eq(users.id, id))
   554	      .returning();
   555	    return updatedUser;
   556	  }
   557	
   558	  // Credit operations
   559	  async getUserCredits(userId: number): Promise<number> {
   560	    const user = await this.getUser(userId);
   561	    if (!user) {
   562	      throw new Error("User not found");
   563	    }
   564	    return user.credits;
   565	  }
   566	
   567	  async addCredits(userId: number, amount: number): Promise<User> {
   568	    const user = await this.getUser(userId);
   569	    if (!user) {
   570	      throw new Error("User not found");
   571	    }
   572	    
   573	    const [updatedUser] = await db
   574	      .update(users)
   575	      .set({ credits: user.credits + amount })
   576	      .where(eq(users.id, userId))
   577	      .returning();
   578	    
   579	    return updatedUser;
   580	  }
   581	
   582	  async deductCredits(userId: number, amount: number): Promise<User> {
   583	    const user = await this.getUser(userId);
   584	    if (!user) {
   585	      throw new Error("User not found");
   586	    }
   587	    
   588	    if (user.credits < amount) {
   589	      throw new Error("Insufficient credits");
   590	    }
   591	    
   592	    const [updatedUser] = await db
   593	      .update(users)
   594	      .set({ credits: user.credits - amount })
   595	      .where(eq(users.id, userId))
   596	      .returning();
   597	    
   598	    return updatedUser;
   599	  }
   600	
   601	  // Module operations
   602	  async getAllModules(): Promise<Module[]> {
   603	    return db.select().from(modules).where(eq(modules.active, true));
   604	  }
   605	
   606	  async getModule(id: number): Promise<Module | undefined> {
   607	    const [module] = await db.select().from(modules).where(eq(modules.id, id));
   608	    return module;
   609	  }
   610	
   611	  async createModule(module: InsertModule): Promise<Module> {
   612	    const [newModule] = await db.insert(modules).values(module).returning();
   613	    return newModule;
   614	  }
   615	
   616	  async updateModule(id: number, data: Partial<Module>): Promise<Module> {
   617	    const [updatedModule] = await db
   618	      .update(modules)
   619	      .set(data)
   620	      .where(eq(modules.id, id))
   621	      .returning();
   622	    
   623	    return updatedModule;
   624	  }
   625	
   626	  // User-Module operations
   627	  async getUserModules(userId: number): Promise<UserModule[]> {
   628	    return db
   629	      .select()
   630	      .from(userModules)
   631	      .where(and(
   632	        eq(userModules.userId, userId),
   633	        eq(userModules.active, true)
   634	      ));
   635	  }
   636	
   637	  async getUserWithModules(userId: number): Promise<{ user: User; modules: Module[] }> {
   638	    const user = await this.getUser(userId);
   639	    if (!user) {
   640	      throw new Error("User not found");
   641	    }
   642	    
   643	    const userModulesList = await this.getUserModules(userId);
   644	    const moduleIds = userModulesList.map(um => um.moduleId);
   645	    
   646	    const modulesList: Module[] = [];
   647	    if (moduleIds.length > 0) {
   648	      for (const moduleId of moduleIds) {
   649	        const module = await this.getModule(moduleId);
   650	        if (module) {
   651	          modulesList.push(module);
   652	        }
   653	      }
   654	    }
   655	    
   656	    return { user, modules: modulesList };
   657	  }
   658	
   659	  async activateModule(userId: number, moduleId: number): Promise<UserModule> {
   660	    const user = await this.getUser(userId);
   661	    if (!user) {
   662	      throw new Error("User not found");
   663	    }
   664	    
   665	    const module = await this.getModule(moduleId);
   666	    if (!module) {
   667	      throw new Error("Module not found");
   668	    }
   669	    
   670	    const isActivated = await this.isModuleActivated(userId, moduleId);
   671	    if (isActivated) {
   672	      throw new Error("Module already activated");
   673	    }
   674	    
   675	    if (user.credits < module.price) {
   676	      throw new Error("Insufficient credits");
   677	    }
   678	    
   679	    // Deduct credits
   680	    await this.deductCredits(userId, module.price);
   681	    
   682	    // Activate module
   683	    const [userModule] = await db
   684	      .insert(userModules)
   685	      .values({
   686	        userId,
   687	        moduleId,
   688	        active: true
   689	      })
   690	      .returning();
   691	    
   692	    // Log the activity
   693	    await this.createActivity({
   694	      userId,
   695	      action: "module_activated",
   696	      details: `Activated module: ${module.name}`
   697	    });
   698	    
   699	    return userModule;
   700	  }
   701	
   702	  async isModuleActivated(userId: number, moduleId: number): Promise<boolean> {
   703	    const [userModule] = await db
   704	      .select()
   705	      .from(userModules)
   706	      .where(and(
   707	        eq(userModules.userId, userId),
   708	        eq(userModules.moduleId, moduleId),
   709	        eq(userModules.active, true)
   710	      ));
   711	    
   712	    return !!userModule;
   713	  }
   714	
   715	  // Activity operations
   716	  async getUserActivities(userId: number, limit: number = 10): Promise<Activity[]> {
   717	    return db
   718	      .select()
   719	      .from(activities)
   720	      .where(eq(activities.userId, userId))
   721	      .orderBy(desc(activities.timestamp))
   722	      .limit(limit);
   723	  }
   724	
   725	  async createActivity(activity: InsertActivity): Promise<Activity> {
   726	    const [newActivity] = await db
   727	      .insert(activities)
   728	      .values(activity)
   729	      .returning();
   730	    
   731	    return newActivity;
   732	  }
   733	}
   734	
   735	// Choose the appropriate storage implementation based on environment
   736	// For this project, we'll start with MemStorage for development
   737	export const storage = new MemStorage();
