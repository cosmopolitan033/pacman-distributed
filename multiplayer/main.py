from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory score storage: {socket_id: score}
scores = {}

@app.route('/')
def index():
    # Render your HTML game page
    return render_template('index.html')

@app.route('/api/leaderboard')
def leaderboard():
    # Sort scores in descending order and return as JSON
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return jsonify(sorted_scores)

@socketio.on('connect')
def on_connect():
    print(f"Client connected: {request.sid}")
    # Optionally, send back the assigned player id
    emit('connected', {'player_id': request.sid})

@socketio.on('disconnect')
def on_disconnect():
    print(f"Client disconnected: {request.sid}")
    # Clean up the player's score on disconnect
    scores.pop(request.sid, None)

@socketio.on('start_game')
def start_game(data):
    print(f"Game started for {request.sid}")
    # Initialization can go here
    emit('game_started', {'message': 'Game has started!'}, room=request.sid)

@socketio.on('update_score')
def update_score(data):
    # Expecting data: { score: <number> }
    score = data.get('score', 0)
    print(f"Updating score for {request.sid}: {score}")
    scores[request.sid] = score
    # Broadcast updated leaderboard to all clients
    socketio.emit('leaderboard_update', {'scores': scores})

@socketio.on('game_over')
def game_over(data):
    print(f"Game over for {request.sid}")
    # Here you could perform any end-of-game logic
    socketio.emit('game_over', {'player_id': request.sid}, )

if __name__ == '__main__':
    socketio.run(app, debug=True)
