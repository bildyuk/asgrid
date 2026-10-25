import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkbooksService } from '../workbooks/workbooks.service';

@Injectable()
export class SheetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workbooks: WorkbooksService,
  ) {}

  async create(workbookId: string, userId: string, name: string) {
    await this.workbooks.assertMember(workbookId, userId);
    const count = await this.prisma.sheet.count({ where: { workbookId } });
    return this.prisma.sheet.create({
      data: { workbookId, name, position: count },
    });
  }

  async list(workbookId: string, userId: string) {
    await this.workbooks.assertMember(workbookId, userId);
    return this.prisma.sheet.findMany({
      where: { workbookId },
      orderBy: { position: 'asc' },
    });
  }

  async getWithAccess(sheetId: string, userId: string) {
    const sheet = await this.prisma.sheet.findUnique({ where: { id: sheetId } });
    if (!sheet) throw new NotFoundException('Sheet not found');
    await this.workbooks.assertMember(sheet.workbookId, userId);
    return sheet;
  }
}