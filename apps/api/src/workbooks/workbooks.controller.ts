import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { WorkbooksService } from './workbooks.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateWorkbookDto } from './dto/create-workbook.dto';

@Controller('workbooks')
@UseGuards(JwtAuthGuard)
export class WorkbooksController {
  constructor(private readonly workbooks: WorkbooksService) {}

  @Get()
  list(@CurrentUser() user: { sub: string }) {
    return this.workbooks.listForUser(user.sub);
  }

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateWorkbookDto) {
    return this.workbooks.create(user.sub, dto.name);
  }
}