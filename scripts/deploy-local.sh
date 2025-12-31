#!/bin/bash

echo "=== Starting Local Deployment ==="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

# Build and start services
echo "Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 10

# Check backend health
echo "Checking backend health..."
curl -f http://localhost:5000/health || echo "Backend not ready yet"

# Check frontend
echo "Checking frontend..."
curl -f http://localhost:3000 || echo "Frontend not ready yet"

echo ""
echo "=== Deployment Complete ==="
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo "API Health: http://localhost:5000/health"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
