#!/bin/bash

# Renkli log mesajları için
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SERVER_IP="88.218.130.67"
SSH_USER="root"

echo -e "${BLUE}Sunucu ${SERVER_IP} Durum Kontrolü${NC}"
echo "-------------------------------------------"

# Ağ bağlantısını kontrol et
echo -e "${YELLOW}1. Ağ Bağlantısı Kontrolü:${NC}"
if ping -c 3 ${SERVER_IP} &> /dev/null; then
    echo -e "  Ping: ${GREEN}Başarılı${NC}"
    RTT=$(ping -c 1 ${SERVER_IP} | grep -oP 'time=\K[0-9.]+')
    echo -e "  Gecikme: ${RTT} ms"
else
    echo -e "  Ping: ${RED}Başarısız${NC}"
    echo -e "  Sebepler:"
    echo -e "  - Sunucu çalışmıyor olabilir"
    echo -e "  - Ağ bağlantınızda sorun olabilir"
    echo -e "  - ICMP paketleri engellenmiş olabilir"
    exit 1
fi

# SSH bağlantısını kontrol et
echo -e "\n${YELLOW}2. SSH Bağlantısı Kontrolü:${NC}"
if ssh -o ConnectTimeout=5 -o BatchMode=yes -o StrictHostKeyChecking=no ${SSH_USER}@${SERVER_IP} "echo 'SSH connection successful'" &> /dev/null; then
    echo -e "  SSH Bağlantısı: ${GREEN}Başarılı${NC}"
else
    echo -e "  SSH Bağlantısı: ${RED}Başarısız${NC}"
    echo -e "  Sebepler:"
    echo -e "  - SSH anahtarı yapılandırması yanlış olabilir"
    echo -e "  - SSH servisi sunucuda çalışmıyor olabilir"
    echo -e "  - Firewall SSH bağlantılarını engelliyor olabilir"
    echo -e "  Çözüm için manuel SSH bağlantısı deneyin:"
    echo -e "  $ ssh ${SSH_USER}@${SERVER_IP}"
    exit 1
fi

# Sunucu kaynaklarını kontrol et
echo -e "\n${YELLOW}3. Sunucu Kaynakları:${NC}"
ssh -o ConnectTimeout=5 ${SSH_USER}@${SERVER_IP} "
    echo '  CPU Kullanımı:' 
    top -bn1 | grep 'Cpu(s)' | awk '{print \"  \" \$2+\$4 \"%\"}' 
    echo '  Bellek Kullanımı:' 
    free -m | grep Mem | awk '{print \"  \" \$3/\$2*100 \"%  (\" \$3 \"MB / \" \$2 \"MB)\"}' 
    echo '  Disk Kullanımı:' 
    df -h / | awk 'NR==2 {print \"  \" \$5 \"  (\" \$3 \" / \" \$2 \")\"}'"

# Docker durumunu kontrol et
echo -e "\n${YELLOW}4. Docker Durumu:${NC}"
if ssh -o ConnectTimeout=5 ${SSH_USER}@${SERVER_IP} "command -v docker" &> /dev/null; then
    echo -e "  Docker: ${GREEN}Kurulu${NC}"
    
    # Docker servisini kontrol et
    if ssh -o ConnectTimeout=5 ${SSH_USER}@${SERVER_IP} "systemctl is-active docker" &> /dev/null; then
        echo -e "  Docker Servisi: ${GREEN}Çalışıyor${NC}"
        
        # Docker imajlarını ve konteynerleri listele
        echo -e "  Docker Konteynerleri:"
        ssh -o ConnectTimeout=5 ${SSH_USER}@${SERVER_IP} "docker ps -a" | awk 'NR>1 {print \"  - \" \$NF \" (\"\$2\"): \" \$(NF-1)}'
    else
        echo -e "  Docker Servisi: ${RED}Çalışmıyor${NC}"
        echo -e "  Docker servisini başlatmak için:"
        echo -e "  $ ssh ${SSH_USER}@${SERVER_IP} \"systemctl start docker\""
    fi
else
    echo -e "  Docker: ${RED}Kurulu Değil${NC}"
    echo -e "  Docker'ı yüklemek için:"
    echo -e "  $ ssh ${SSH_USER}@${SERVER_IP} \"curl -fsSL https://get.docker.com | sh\""
fi

# Port kontrollerini yap
echo -e "\n${YELLOW}5. Port Kontrolleri:${NC}"
for port in 22 80 443 3000 8080; do
    nc -z -w 2 ${SERVER_IP} ${port} &>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "  Port ${port}: ${GREEN}Açık${NC}"
    else
        echo -e "  Port ${port}: ${RED}Kapalı${NC}"
    fi
done

# Uygulama kontrolü
echo -e "\n${YELLOW}6. Flax-ERP Uygulama Kontrolü:${NC}"
echo -e "  Backend API:"
curl -s -o /dev/null -w "  HTTP Durum: %{http_code}\n" --connect-timeout 5 http://${SERVER_IP}:3000/health || echo -e "  ${RED}Erişilemiyor${NC}"

echo -e "  Frontend:"
curl -s -o /dev/null -w "  HTTP Durum: %{http_code}\n" --connect-timeout 5 http://${SERVER_IP}:8080 || echo -e "  ${RED}Erişilemiyor${NC}"

echo -e "\n${BLUE}Sunucu kontrol tamamlandı.${NC}"
