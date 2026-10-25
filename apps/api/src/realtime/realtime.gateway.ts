import { OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket, MessageBody, SubscribeMessage,
  WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { WorkbooksService } from '../workbooks/workbooks.service';
import { CellsService } from '../sheets/cells.service';
import { EventsService } from '../events/events.service';

@WebSocketGateway({
  namespace: '/ws',
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway implements OnModuleInit {
  @WebSocketServer() server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly workbooks: WorkbooksService,
    private readonly cells: CellsService,
    private readonly events: EventsService,
  ) {}

  onModuleInit() {
    this.events.on(({ workbookId, event, payload }) => {
      this.server.to(`wb:${workbookId}`).emit(event, payload);
    });
  }

  async handleConnection(client: Socket) {
    const token = (client.handshake.auth?.token ?? '') as string;
    try {
      const payload = await this.jwt.verifyAsync(token);
      (client.data as any).user = payload;
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('workbook:join')
  async join(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { workbookId: string },
  ) {
    const user = (client.data as any).user;
    if (!user) return { ok: false, error: 'unauthenticated' };
    try {
      await this.workbooks.assertMember(body.workbookId, user.sub);
      client.join(`wb:${body.workbookId}`);
      return { ok: true };
    } catch {
      return { ok: false, error: 'forbidden' };
    }
  }

  @SubscribeMessage('cell:mutate')
  async mutate(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: {
      workbookId: string;
      sheetId: string;
      mutationId: string;
      changes: any[];
    },
  ) {
    const user = (client.data as any).user;
    if (!user) return { ok: false, error: 'unauthenticated' };
    try {
      const result = await this.cells.patchCells(
        body.sheetId, user.sub, body.mutationId, body.changes,
      );
      return { ok: true, ...result };
    } catch (e: any) {
      const resp = e?.getResponse?.() ?? {};
      client.emit('cell:conflict', {
        sheetId: body.sheetId,
        mutationId: body.mutationId,
        conflicts: resp?.details?.conflicts ?? [],
      });
      return { ok: false, error: resp?.code ?? 'ERROR' };
    }
  }
}