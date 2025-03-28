import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UsersService } from './users/users.service';
import { InventoryModule } from './inventory/inventory.module';
import { ModulesModule } from './modules/modules.module';
import { ModulesService } from './modules/modules.service';
// Yeni modüller buraya import edilecek
// import { SalesModule } from './modules/sales/sales.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'flaxerp'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
        autoLoadEntities: true,
      }),
    }),
    // Çekirdek modüller
    UsersModule,
    AuthModule,
    ModulesModule,
    
    // İsteğe bağlı modüller
    InventoryModule,
    // Yeni modüller burada aktive edilir
    // SalesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private modulesService: ModulesService
  ) {}

  async onModuleInit() {
    // Admin kullanıcısını seed'leme
    await this.usersService.seedAdmin();
    
    // Varsayılan modülleri seed'leme
    await this.modulesService.seedDefaultModules();
  }
}
