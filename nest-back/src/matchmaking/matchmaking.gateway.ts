import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { v4 } from 'uuid';
import { gameRooms } from './sharedRooms';
import { GameRoom } from './gameRoom';

@WebSocketGateway({
	cors: { origin: '*' }
})
export class MatchmakingGateway {
	@WebSocketServer() server: Server;
	private masterQueue: Socket[][] = [[], [], []];


	@SubscribeMessage('connection')
	handleConnection(client: Socket) {
		this.server.emit('game-message', "you joined !");

		client.on('disconnect', () => {
			console.log("Disconncted !!");
		})
	}

	@SubscribeMessage('joinQueue')
	joinQueue(client: Socket, gameMode: number) {
		this.masterQueue[gameMode].push(client);
		this.matchPlayers(gameMode);
	}

	@SubscribeMessage('leaveQueue')
	leaveQueue(client: Socket, gameMode: number) {
		const index = this.masterQueue[gameMode].indexOf(client);
		this.masterQueue[gameMode].splice(index, 1);
	}

	// if 2 players in the array, match them and create a new room
	matchPlayers(gameMode: number) {
		if (this.masterQueue[gameMode].length == 2) {
			const p1 = this.masterQueue[gameMode].shift();
			const p2 = this.masterQueue[gameMode].shift();
			const roomId = v4();

			// create a new room in the shared instance of GameRooms
			const room = new GameRoom(roomId, gameMode, p1, p2);
			gameRooms.push(room);
			console.log('players matched');

			// send roomId to players
			p2.emit('matched', roomId);
			p1.emit('matched', roomId);
		}
	}
}
