import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from './entities/message.entity';
import { UsersModule } from '../users/users.module';
import { MessageGateway } from './messages.gateway';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, User]), UsersModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessageGateway],
  exports: [MessagesService],
})
export class MessagesModule {}
