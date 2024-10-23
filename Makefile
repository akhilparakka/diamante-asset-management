# Define directories
SERVER_DIR=server
FRONTEND_DIR=frontend

start-server:
	cd $(SERVER_DIR) && node index.js

start-frontend:
	cd $(FRONTEND_DIR) && yarn dev

start:
	make start-server & make start-frontend
