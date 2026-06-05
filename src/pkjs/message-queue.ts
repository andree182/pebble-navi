interface QueuedMessage {
  data: Record<string, any>;
  ackCallback: (e: PebbleKit.AppMessageEvent) => void;
  nackCallback: (e: PebbleKit.AppMessageEvent) => void;
}

class MessageQueue {
  private queue: QueuedMessage[] = [];
  private sending = false;

  enqueue(
    data: Record<string, any>,
    ackCallback: (e: PebbleKit.AppMessageEvent) => void = () => {},
    nackCallback: (e: PebbleKit.AppMessageEvent) => void = (e) =>
      console.error('Send failed:', e.error),
  ): void {
    this.queue.push({ data, ackCallback, nackCallback });
    this.processQueue();
  }

  private processQueue(): void {
    if (this.sending || this.queue.length === 0) {
      return;
    }

    const message = this.queue.shift()!;
    this.sending = true;

    console.info('Sending message', Object.keys(message.data));

    Pebble.sendAppMessage(
      message.data,
      (e) => {
        message.ackCallback(e);
        this.sending = false;
        this.processQueue();
      },
      (e) => {
        message.nackCallback(e);
        this.sending = false;
        this.processQueue();
      },
    );
  }

  clear(): void {
    this.queue = [];
  }

  get length(): number {
    return this.queue.length;
  }
}

export const messageQueue = new MessageQueue();
