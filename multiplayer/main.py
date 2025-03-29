import socketio
from fastapi import FastAPI
import uvicorn

# Create Socket.IO server and FastAPI app
sio = socketio.AsyncServer(cors_allowed_origins='*')
app = FastAPI()
sio_app = socketio.ASGIApp(sio, other_asgi_app=app)

# Store connected players
players = {}

@sio.event
async def connect(sid, environ):
    print(f"Player connected: {sid}")
    players[sid] = {'x': 0, 'y': 0, 'direction': 'LEFT', 'score': 0}
    await sio.emit('player_update', players)

@sio.event
async def disconnect(sid):
    print(f"Player disconnected: {sid}")
    players.pop(sid, None)
    await sio.emit('player_update', players)

@sio.event
async def move(sid, data):
    if sid in players:
        players[sid]['direction'] = data['direction']
        players[sid]['x'] = data['x']
        players[sid]['y'] = data['y']
        players[sid]['score'] = data['score']
        await sio.emit('player_update', players)

if __name__ == "__main__":
    uvicorn.run(sio_app, host="0.0.0.0", port=8000)