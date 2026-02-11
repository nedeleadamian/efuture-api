import { Injectable } from '@nestjs/common';
import { CreateMessageCommand } from './commands/create-message.command';
import { FindAllMessagesCommand } from './commands/find-all-messages.command';
import { UpdateMessageCommand } from './commands/update-message.command';
import { RemoveMessageCommand } from './commands/remove-message.command';

@Injectable()
export class MessageService {
  constructor(
    private readonly createMessageCmd: CreateMessageCommand,
    private readonly findAllMessagesCmd: FindAllMessagesCommand,
    private readonly updateMessageCmd: UpdateMessageCommand,
    private readonly removeMessageCmd: RemoveMessageCommand,
  ) {}

  public create(
    ...params: Parameters<typeof this.createMessageCmd.execute>
  ): ReturnType<typeof this.createMessageCmd.execute> {
    return this.createMessageCmd.execute(...params);
  }

  public findAll(
    ...params: Parameters<typeof this.findAllMessagesCmd.execute>
  ): ReturnType<typeof this.findAllMessagesCmd.execute> {
    return this.findAllMessagesCmd.execute(...params);
  }

  public update(
    ...params: Parameters<typeof this.updateMessageCmd.execute>
  ): ReturnType<typeof this.updateMessageCmd.execute> {
    return this.updateMessageCmd.execute(...params);
  }

  public remove(
    userId: string,
    messageId: string,
  ): ReturnType<typeof this.removeMessageCmd.execute> {
    return this.removeMessageCmd.execute(messageId, userId);
  }
}
