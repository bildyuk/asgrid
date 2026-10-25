import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { WorkbooksModule } from './workbooks/workbooks.module';
import { SheetsModule } from './sheets/sheets.module';
import { RealtimeModule } from './realtime/realtime.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    PrismaModule,
    EventsModule,
    AuthModule,
    WorkbooksModule,
    SheetsModule,
    RealtimeModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}