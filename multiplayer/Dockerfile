# multiplayer/Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY multiplayer /app
RUN pip install flask flask-socketio eventlet

CMD ["python", "main.py"]
