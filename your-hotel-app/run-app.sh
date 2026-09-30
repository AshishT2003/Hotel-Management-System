#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  GRAND HORIZON LUXURY HOTEL MANAGEMENT SYSTEM"
echo "========================================================"
echo ""

if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "[1/2] Starting containers via Docker Compose..."
    docker-compose up -d --build
    echo ""
    echo "[2/2] Services started:"
    echo "  - Client:   http://localhost:3000"
    echo "  - Server:   http://localhost:5000/swagger"
    echo "  - Database: localhost:1433"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop:      docker-compose down"
else
    echo "[INFO] Docker not detected, launching in native mode..."
    (cd src/server && dotnet run --urls http://localhost:5000) &
    (cd src/client && npm run dev) &
    wait
fi
