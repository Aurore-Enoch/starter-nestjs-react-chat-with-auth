import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private usersService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    userId: string,
  ): Promise<Message> {
    console.log('createMessageDto : ', createMessageDto);
    const user = await this.usersService.findOne(userId);
    const message = this.messagesRepository.create({
      ...createMessageDto,
      user,
    });
    return this.messagesRepository.save(message);
  }

  findAll(): Promise<Message[]> {
    return this.messagesRepository.find({
      relations: ['user', 'likedBy'],
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async update(
    id: string,
    updateMessageDto: CreateMessageDto,
  ): Promise<Message> {
    await this.messagesRepository.update(id, updateMessageDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.messagesRepository.softDelete(id);
  }

  async likeMessage(userId: string, messageId: string): Promise<Message> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const message = await this.messagesRepository.findOne({
      where: { id: messageId },
      relations: ['likedBy', 'user'],
    });

    if (!user || !message) {
      throw new Error('User or Message not found');
    }

    if (!message.likedBy.some((u) => u.id === user.id)) {
      message.likedBy.push(user);
      await this.messagesRepository.save(message);
    }

    return message;
  }

  async unlikeMessage(userId: string, messageId: string): Promise<Message> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const message = await this.messagesRepository.findOne({
      where: { id: messageId },
      relations: ['likedBy', 'user'],
    });

    if (!user || !message) {
      throw new Error('User or Message not found');
    }

    message.likedBy = message.likedBy.filter((u) => u.id !== user.id);
    await this.messagesRepository.save(message);

    return message;
  }
}
