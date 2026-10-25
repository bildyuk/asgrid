import { Module } from '@nestjs/common';
import { WorkbooksService } from './workbooks.service';
import { WorkbooksController } from './workbooks.controller';

@Module({
  providers: [WorkbooksService],
  controllers: [WorkbooksController],
  exports: [WorkbooksService],
})
export class WorkbooksModule {}