#!/bin/bash
set -e

# Deploy script for Bolão RL → EC2
# IMPORTANTE: este arquivo NÃO contém segredos. As variáveis sensíveis ficam
# em server/.env (gitignored) e são enviadas por SCP (canal criptografado).
EC2_IP="52.87.63.44"
KEY="${BOLAO_SSH_KEY:-/Users/danylo-oliveira/.ssh/bolao-rl-key.pem}"
SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i $KEY"
PROJECT_DIR="/Users/danylo-oliveira/Documents/projetos/bolao-rl"

if [ ! -f "$PROJECT_DIR/server/.env" ]; then
  echo "❌ server/.env não encontrado. Crie a partir de server/.env.example."
  exit 1
fi

echo "📦 Building client..."
cd "$PROJECT_DIR/client"
npm install
npm run build

echo "📁 Creating deploy package..."
cd "$PROJECT_DIR"
tar czf /tmp/bolao-rl-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='client/node_modules' \
  --exclude='server/node_modules' \
  --exclude='server/.env' \
  --exclude='aws-userdata.sh' \
  --exclude='.claude' \
  .

echo "🚀 Uploading to EC2..."
scp $SSH_OPTS /tmp/bolao-rl-deploy.tar.gz ec2-user@${EC2_IP}:/tmp/

echo "🔐 Uploading env (server/.env local, fora do git)..."
scp $SSH_OPTS "$PROJECT_DIR/server/.env" ec2-user@${EC2_IP}:/tmp/bolao.env

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

# .env vem do arquivo enviado por SCP (nunca do repositório)
sudo mv /tmp/bolao.env /home/bolao/app/server/.env
sudo chown bolao:bolao /home/bolao/app/server/.env
sudo chmod 600 /home/bolao/app/server/.env

# Start/restart the service
sudo systemctl restart bolao-rl
sleep 3
sudo systemctl status bolao-rl --no-pager

echo "✅ Deploy complete!"
REMOTEOF

echo ""
echo "🎉 Deploy finalizado!"
echo "🌐 Acesse: http://${EC2_IP}"
