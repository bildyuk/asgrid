import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkbooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, name: string) {
    return this.prisma.workbook.create({
      data: {
        name,
        ownerId: userId,
        members: { create: { userId, role: 'owner' } },
      },
    });
  }

  async listForUser(userId: string) {
    return this.prisma.workbook.findMany({
      where: { members: { some: { userId } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assertMember(workbookId: string, userId: string) {
    const m = await this.prisma.workbookMember.findUnique({
      where: { workbookId_userId: { workbookId, userId } },
    });
    if (!m) throw new ForbiddenException('No access to workbook');
    return m;
  }
}