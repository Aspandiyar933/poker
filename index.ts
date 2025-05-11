import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { PockerGame, activeGames } from './game/PokerGame';
import { v4 as uuid } from 'uuid';
import type { ClientMessage, ServerMessage } from './types/game';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map<WebSocket, string>();

wss.on('connection', (ws)=>{
  ws.on('message', (data)=>{
    try {
      const msg = JSON.parse(data.toString()) as ClientMessage;

      switch (msg.type) {
        case 'CREATE_GAME': {
          const game = new PockerGame();
          const player = game.addPlayer(msg.playerName, 1000);
          activeGames.set(game.id, game);
          clients.set(ws, game.id);

          ws.send(JSON.stringify({type:'GAME_CREATED', gameId: game.id}));
          broadcastGameState(game.id);
          break;
        }
        
        case 'JOIN_GAME': {
          const game = activeGames.get(msg.gameId);
          if (!game) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Game not found' }));
            return;
          }
          const player = game.addPlayer(msg.playerName, 1000);
          clients.set(ws, msg.gameId);
          broadcastGameState(msg.gameId);
          break;
        }
        
        case 'BET': {
          const game = activeGames.get(msg.gameId);
          if (!game) return;
          game.betPlayer(msg.gameId, msg.amount);
          game.moveToNextPlayer();
          broadcastGameState(msg.gameId);
          break;
        }

        case 'FOLD': {
          const game = activeGames.get(msg.gameId);
          if (!game) return;
          game.foldPlayer(msg.gameId);
          game.moveToNextPlayer();
          broadcastGameState(msg.gameId);
          break;
        }
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid message format' }));
    }
  });
});

function broadcastGameState(gameId: string) {
  const game = activeGames.get(gameId);
  if (!game) return;
  const state = {
    id: game.id,
    pot: game.pot,
    players: game.players,
    communityCards: game.communityCards,
    round: game.round,
    currentPlayerIndex: game.currentPlayerIndex,
  };
  for (const [client, gid] of clients.entries()) {
    if (gid === gameId) {
      client.send(JSON.stringify({ type: 'GAME_STATE', state }));
    }
  }
}

server.listen(3001, ()=>{
  console.log('Poker server listening on port 3001');
});