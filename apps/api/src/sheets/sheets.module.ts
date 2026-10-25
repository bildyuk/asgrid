import { Module } from '@nestjs/common';
import { SheetsService } from './sheets.service';
import { CellsService } from './cells.service';
import { SheetsController } from './sheets.controller';
import { WorkbooksModule } from '../workbooks/workbooks.module';

@Module({
  imports: [WorkbooksModule],
  providers: [SheetsService, CellsService],
  controllers: [SheetsController],
  exports: [SheetsService, CellsService],
})
export class SheetsModule {}