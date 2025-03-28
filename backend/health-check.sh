#!/bin/sh

# Basit sağlık kontrolü
response=$(wget -qO- http://localhost:3000/health 2>/dev/null || echo "failed")

if echo "$response" | grep -q "status.*ok"; then
    echo "Backend service is healthy"
    exit 0
else
    echo "Backend service is unhealthy: $response"
    exit 1
fi
