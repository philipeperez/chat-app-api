import {
  ConnectedSocket,
  MessageBody, OnGatewayConnection, OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Message, User } from './types';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger(this.constructor.name);
  private users: User[] = [];

  afterInit(server: any): any {
    this.logger.log('InitializedasdADSadADsd');
  }

  handleConnection(client: Socket, ...args: any[]): any {
    const user: User = {
      name: client.request._query.user,
      id: client.id,
    };
    const msg: Message = {
      time: Date.now(),
      user,
      txt: 'Connected'
    };
    this.users.push(user);
    this.logger.log(`Client connected: {name: ${user.name}, id: ${client.id}}`);
    this.wss.emit('onlineUserlistUpdated', this.users);
    this.wss.emit('userConnected', msg);
  }

  handleDisconnect(client: Socket): any {
    const user: User = this.users.find(user => user.id === client.id);
    this.users = this.users.filter(user => user.id !== client.id);
    this.logger.log(`Client disconnected: {name: ${user.name}, id:${client.id}}`);
    this.wss.emit('onlineUserlistUpdated', this.users);
    const msg: Message = {
      txt: 'Disconnected',
      user,
      time: Date.now()
    };
    this.wss.emit('userDisconnected', msg);
  }

  @SubscribeMessage('msgToServer')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() text: string): void {
    const message: Message = {
      time: Date.now(),
      txt: text,
      user: this.getUserById(client.id)
    };
    this.wss.emit('msgToClient', message);
  }

  private getUserById(id: string): User {
    return this.users.find(user => user.id === id)
  }

}
