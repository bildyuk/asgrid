import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { WorkbooksModule } from '../workbooks/workbooks.module';
import { SheetsModule } from '../sheets/sheets.module';

@Module({
  imports: [WorkbooksModule, SheetsModule],
  providers: [RealtimeGateway],
})
export class RealtimeModule {}