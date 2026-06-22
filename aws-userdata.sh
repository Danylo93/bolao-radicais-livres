#!/bin/bash
set -ex

# ======================== User Data: Bolão RL EC2 Bootstrap ========================
# Logs: /var/log/cloud-init-output.log

# -- System update + essentials --
dnf update -y
dnf install -y nginx cronie

# -- Node.js 20 LTS via NodeSource --
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

# -- Create app user and directory --
useradd -m -s /bin/bash bolao || true
mkdir -p /home/bolao/app
chown bolao:bolao /home/bolao/app

# -- Nginx reverse proxy --
cat > /etc/nginx/conf.d/bolao-rl.conf << 'NGXEOF'
server {
    listen 80;
    server_name _;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 256;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://127.0.0.1:4010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
NGXEOF

# Remove default nginx server block
rm -f /etc/nginx/conf.d/default.conf

systemctl enable nginx
systemctl restart nginx

# -- Systemd service (will start after code deploy) --
cat > /etc/systemd/system/bolao-rl.service << 'SVCEOF'
[Unit]
Description=Bolao RL - Node.js App
After=network.target

[Service]
Type=simple
User=bolao
WorkingDirectory=/home/bolao/app/server
ExecStart=/usr/bin/node index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable bolao-rl

# -- Cron sync every 5 minutes (lê o CRON_SECRET do .env, sem hardcode) --
cat > /etc/cron.d/bolao-sync << 'CRONEOF'
*/5 * * * * bolao bash -c 'curl -s -H "Authorization: Bearer $(grep -E ^CRON_SECRET= /home/bolao/app/server/.env | cut -d= -f2-)" http://localhost:4010/api/cron/sync >/dev/null 2>&1'
CRONEOF
chmod 644 /etc/cron.d/bolao-sync
systemctl enable crond
systemctl start crond

echo "=== Bolao RL bootstrap complete — waiting for code deploy ==="
