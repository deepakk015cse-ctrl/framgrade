import { Response } from 'express';

export interface LiveActivityEvent {
  id: string;
  type:
    | 'bid_placed'
    | 'bid_accepted'
    | 'bid_rejected'
    | 'bid_cancelled'
    | 'backup_available'
    | 'backup_confirmed'
    | 'sale_confirmed'
    | 'listing_created'
    | 'demand_updated';
  icon: '🔔' | '✅' | '⚠️' | '🔄';
  label: string;
  detail: string;
  listingId?: number;
  bidId?: number;
  cropName?: string;
  pricePerKg?: number;
  buyerName?: string;
  timestamp: string;
}

class RealtimeHub {
  private clients: Set<Response> = new Set();
  private recentEvents: LiveActivityEvent[] = [
    {
      id: 'evt-init-1',
      type: 'demand_updated',
      icon: '🔔',
      label: '🔔 Buyer demand updated',
      detail: '5 verified buyers actively procuring Grade A Tomato, Onion & Paddy lots',
      cropName: 'Tomato',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ];

  public addClient(res: Response) {
    this.clients.add(res);
    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  public recordAndBroadcast(
    event: Omit<LiveActivityEvent, 'id' | 'timestamp'> & { id?: string; timestamp?: string },
    payload: Record<string, any> = {}
  ) {
    const fullEvent: LiveActivityEvent = {
      ...event,
      id: event.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: event.timestamp || new Date().toISOString(),
    };

    // Deduplicate by id
    if (!this.recentEvents.some((e) => e.id === fullEvent.id)) {
      this.recentEvents = [fullEvent, ...this.recentEvents].slice(0, 30);
    }

    const message = JSON.stringify({
      event: fullEvent.type,
      activity: fullEvent,
      payload,
      timestamp: fullEvent.timestamp,
    });

    for (const client of this.clients) {
      try {
        client.write(`data: ${message}\n\n`);
      } catch {
        this.clients.delete(client);
      }
    }

    return fullEvent;
  }

  public getRecentEvents(): LiveActivityEvent[] {
    return this.recentEvents;
  }
}

export const realtimeHub = new RealtimeHub();
