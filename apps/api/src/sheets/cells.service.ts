import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SheetsService } from './sheets.service';
import { EventsService } from '../events/events.service';
import { CellChangeDto } from './dto/sheets.dto';

@Injectable()
export class CellsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sheets: SheetsService,
    private readonly events: EventsService,
  ) {}

  async getRows(sheetId: string, userId: string) {
    const sheet = await this.sheets.getWithAccess(sheetId, userId);
    const cells = await this.prisma.cell.findMany({ where: { sheetId } });
    const byRow = new Map<number, Record<number, { value: any; version: number }>>();
    for (const c of cells) {
      if (!byRow.has(c.row)) byRow.set(c.row, {});
      byRow.get(c.row)![c.column] = { value: c.value, version: c.version };
    }
    return {
      sheetId: sheet.id,
      rows: Array.from(byRow.entries())
        .sort(([a], [b]) => a - b)
        .map(([row, cellsByCol]) => ({ row, cells: cellsByCol })),
    };
  }

  async getEvents(sheetId: string, userId: string, after: number) {
    const sheet = await this.sheets.getWithAccess(sheetId, userId);
    return this.prisma.workbookEvent.findMany({
      where: { workbookId: sheet.workbookId, seq: { gt: after } },
      orderBy: { seq: 'asc' },
      take: 1000,
    });
  }

  async patchCells(
    sheetId: string,
    userId: string,
    mutationId: string,
    changes: CellChangeDto[],
  ) {
    const sheet = await this.sheets.getWithAccess(sheetId, userId);

    const replay = await this.prisma.cellChange.findFirst({
      where: { mutationId },
      orderBy: { createdAt: 'asc' },
    });
    if (replay) {
      const all = await this.prisma.cellChange.findMany({ where: { mutationId } });
      return {
        mutationId,
        seq: replay.seq,
        replayed: true,
        results: all.map((r) => ({
          row: r.row, column: r.column, value: r.newValue, version: r.version,
        })),
      };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const conflicts: any[] = [];
      const prepared: Array<{ ch: CellChangeDto; existing: any; currentVersion: number }> = [];

      for (const ch of changes) {
        const existing = await tx.cell.findUnique({
          where: { sheetId_row_column: { sheetId, row: ch.row, column: ch.column } },
        });
        const currentVersion = existing?.version ?? 0;
        if (currentVersion !== ch.expectedVersion) {
          conflicts.push({
            row: ch.row, column: ch.column,
            expectedVersion: ch.expectedVersion,
            currentVersion,
            currentValue: existing?.value ?? null,
          });
        } else {
          prepared.push({ ch, existing, currentVersion });
        }
      }
      if (conflicts.length) {
        throw new ConflictException({
          code: 'VERSION_CONFLICT',
          message: 'One or more cells have a newer version',
          details: { conflicts },
        });
      }

      const event = await tx.workbookEvent.create({
        data: {
          workbookId: sheet.workbookId,
          sheetId,
          type: 'cell:changed',
          payload: {
            sheetId,
            mutationId,
            changes: changes.map((c) => ({
              row: c.row, column: c.column, value: c.value,
            })),
          } as any,
        },
      });

      const results: any[] = [];
      for (const { ch, existing, currentVersion } of prepared) {
        const newVersion = currentVersion + 1;
        const updated = await tx.cell.upsert({
          where: { sheetId_row_column: { sheetId, row: ch.row, column: ch.column } },
          create: {
            sheetId, row: ch.row, column: ch.column,
            value: ch.value as any, version: newVersion,
          },
          update: { value: ch.value as any, version: newVersion },
        });
        await tx.cellChange.create({
          data: {
            mutationId, sheetId, cellId: updated.id, userId,
            row: ch.row, column: ch.column,
            oldValue: (existing?.value as any) ?? null,
            newValue: ch.value as any,
            version: newVersion,
            seq: event.seq,
          },
        });
        results.push({
          row: ch.row, column: ch.column, value: ch.value, version: newVersion,
        });
      }
      return { mutationId, seq: event.seq, results };
    });

    this.events.emit(sheet.workbookId, 'cell:changed', {
      sheetId, seq: result.seq, changes: result.results,
    });
    return result;
  }
}