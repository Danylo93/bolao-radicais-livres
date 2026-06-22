#!/bin/bash
set -e

# Deploy script for Bolão RL → EC2
EC2_IP="52.87.63.44"
KEY="/Users/danylo-oliveira/.ssh/bolao-rl-key.pem"
SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i $KEY"
PROJECT_DIR="/Users/danylo-oliveira/Documents/projetos/bolao-rl"

echo "📦 Building client..."
cd "$PROJECT_DIR/client"
npm install
npm run build

echo "📁 Creating deploy package..."
cd "$PROJECT_DIR"
# Create a tarball excluding node_modules, .git, etc
tar czf /tmp/bolao-rl-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='client/node_modules' \
  --exclude='server/node_modules' \
  --exclude='aws-userdata.sh' \
  --exclude='.claude' \
  .

echo "🚀 Uploading to EC2..."
scp $SSH_OPTS /tmp/bolao-rl-deploy.tar.gz ec2-user@${EC2_IP}:/tmp/

echo "⚙️  Setting up on EC2..."
ssh $SSH_OPTS ec2-user@${EC2_IP} << 'REMOTEOF'
set -ex

# Extract to app directory
sudo mkdir -p /home/bolao/app
sudo tar xzf /tmp/bolao-rl-deploy.tar.gz -C /home/bolao/app
sudo chown -R bolao:bolao /home/bolao/app

# Install production dependencies
cd /home/bolao/app
sudo -u bolao npm install --production
cd server && sudo -u bolao npm install --production && cd ..

# Setup production .env
sudo tee /home/bolao/app/server/.env > /dev/null << 'ENVEOF'
DATABASE_URL=postgresql://bolao_admin:Albnrfc96p7J5sJtqxTMQBCir67e@bolao-rl-db.c29mkas48exm.us-east-1.rds.amazonaws.com:5432/bolao_rl
ADMIN_KEY=rl2026
PORT=4010
API_FOOTBALL_KEY=3853a4152a565651480ca245e1dade4d
CRON_SECRET=bolao-rl-cron-secret-2026
ENVEOF
sudo chown bolao:bolao /home/bolao/app/server/.env

# Start/restart the service
sudo systemctl restart bolao-rl
sleep 3
sudo systemctl status bolao-rl --no-pager

echo "✅ Deploy complete!"
REMOTEOF

echo ""
echo "🎉 Deploy finalizado!"
echo "🌐 Acesse: http://${EC2_IP}"
