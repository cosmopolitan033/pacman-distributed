import eventlet
eventlet.monkey_patch()
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import redis
import json
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'

# Redis connection (adjust host if needed)
redis_host = os.environ.get('REDIS_HOST', 'redis')
redis_port = int(os.environ.get('REDIS_PORT', 6379))
r = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)

# Use Redis-based pubsub message queue for multi-instance sync
socketio = SocketIO(app, cors_allowed_origins="*", message_queue=f'redis://{redis_host}:{redis_port}')

@app.route('/')
def index():
    # Render your HTML game page
    return render_template('index.html')

@app.route('/api/leaderboard')
def leaderboard():
    scores = r.hgetall('scores')
    sorted_scores = sorted(scores.items(), key=lambda x: int(x[1]), reverse=True)
    return jsonify(sorted_scores)

@socketio.on('connect')
def on_connect():
    print(f"Client connected: {request.sid}")
    emit('connected', {'player_id': request.sid})

@socketio.on('disconnect')
def on_disconnect():
    print(f"Client disconnected: {request.sid}")
    r.hdel('scores', request.sid)

@socketio.on('start_game')
def start_game(data):
    print(f"Game started for {request.sid}")
    emit('game_started', {'message': 'Game has started!'}, room=request.sid)

@socketio.on('update_score')
def update_score(data):
    score = int(data.get('score', 0))
    print(f"Updating score for {request.sid}: {score}")
    r.hset('scores', request.sid, score)
    scores = r.hgetall('scores')
    socketio.emit('leaderboard_update', {'scores': scores})

@socketio.on('game_over')
def game_over(data):
    print(f"Game over for {request.sid}")
    socketio.emit('game_over', {'player_id': request.sid})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5050, debug=True)
