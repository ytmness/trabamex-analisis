#!/bin/bash
echo '🚀 Iniciando deploy...'
cd /var/www/html/trabamex-master
npm run build
sudo systemctl restart apache2
echo '✅ Deploy completado!'
