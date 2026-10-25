import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

type Listener = (e: { workbookId: string; event: string; payload: any }) => void;

@Injectable()
export class EventsService {
  private emitter = new EventEmitter();

  emit(workbookId: string, event: string, payload: any) {
    this.emitter.emit('event', { workbookId, event, payload });
  }

  on(handler: Listener) {
    this.emitter.on('event', handler);
  }
}