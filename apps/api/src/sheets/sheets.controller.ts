import {
  Body, Controller, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { SheetsService } from './sheets.service';
import { CellsService } from './cells.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateSheetDto, PatchCellsDto } from './dto/sheets.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class SheetsController {
  constructor(
    private readonly sheets: SheetsService,
    private readonly cells: CellsService,
  ) {}

  @Get('workbooks/:id/sheets')
  list(@Param('id') workbookId: string, @CurrentUser() user: { sub: string }) {
    return this.sheets.list(workbookId, user.sub);
  }

  @Post('workbooks/:id/sheets')
  create(
    @Param('id') workbookId: string,
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateSheetDto,
  ) {
    return this.sheets.create(workbookId, user.sub, dto.name);
  }

  @Get('sheets/:id/rows')
  rows(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.cells.getRows(id, user.sub);
  }

  @Patch('sheets/:id/cells')
  patch(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
    @Body() dto: PatchCellsDto,
  ) {
    return this.cells.patchCells(id, user.sub, dto.mutationId, dto.changes);
  }

  @Get('sheets/:id/events')
  events(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
    @Query('after') after?: string,
  ) {
    return this.cells.getEvents(id, user.sub, Number(after ?? 0));
  }
}