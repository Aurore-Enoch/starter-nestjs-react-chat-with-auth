import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessagesService } from "./messages.service";
const users: User[] = [];

interface User {
    id: string;
    email: string;
    lastLogin?: Date;
    lastLogout?: Date;
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly messagesService: MessagesService) { }

    @SubscribeMessage("getUsers")
    getUsers(client: Socket) {
        client.emit("users", users);
    }


    handleConnection(client: Socket) {
        const email = client.handshake.auth.email as string;
        const loginDate = new Date();
        if (email) {
            const existingUserIndex = users.findIndex((u) => u.email === email);
            if (existingUserIndex !== -1) {
                users.splice(existingUserIndex, 1);
            }
            users.push({ id: client.id, email, lastLogin: loginDate, lastLogout: undefined, });
            this.server.emit("users", users);
        }
    }

    handleDisconnect(client: Socket) {
        const logoutDate = new Date();
        const user = users.find(user => user.id === client.id);
        if (user) {
            user.lastLogout = logoutDate;
        }
        // users.splice(users.findIndex(user => user.id === client.id), 1);
        console.log("Client disconnected:", client.id);
        this.server.emit("users", users);
    }

    @SubscribeMessage("sendMessageFromFront")
    handleMessage(client: Socket, payload: { text: string }) {
        console.log("Message from client:", payload);
        const messageDate = new Date();
        const user = users.find(user => user.id === client.id);
        this.server.emit("sendMessageFromBack", payload);
    }

    @SubscribeMessage('likeMessage')
    async handleLikeMessage(client: Socket, payload: { messageId: string }) {
        const userId = client.handshake.auth.userId;
        const updatedMessage = await this.messagesService.likeMessage(userId, payload.messageId);
        this.server.emit('messageLiked', updatedMessage); 
    }

    @SubscribeMessage('unlikeMessage')
    async handleUnlikeMessage(client: Socket, payload: { messageId: string }) {
        const userId = client.handshake.auth.userId;
        const updatedMessage = await this.messagesService.unlikeMessage(userId, payload.messageId);
        this.server.emit('messageUnliked', updatedMessage); 
    }
}