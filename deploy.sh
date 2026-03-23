#!/bin/bash
# 初中生学习助手 - 一键部署脚本

echo "📚 初中生学习助手部署脚本"
echo "=========================="

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then 
    echo "❌ 请使用 root 权限运行: sudo bash deploy.sh"
    exit 1
fi

# 设置部署目录
DEPLOY_DIR="/var/www/study-app"
DOMAIN=""

# 询问部署方式
echo ""
echo "请选择部署方式:"
echo "1) Nginx 部署 (推荐，需要 Nginx)"
echo "2) Apache 部署"
echo "3) 仅复制文件到指定目录"
read -p "请输入选项 (1-3): " choice

# 创建部署目录
echo ""
echo "📁 创建部署目录..."
mkdir -p $DEPLOY_DIR

# 复制文件
echo "📂 复制文件..."
cp -r ./* $DEPLOY_DIR/ 2>/dev/null || true
rm $DEPLOY_DIR/deploy.sh 2>/dev/null || true

echo "✅ 文件已复制到 $DEPLOY_DIR"

# 根据选择进行配置
case $choice in
    1)
        echo ""
        echo "🌐 Nginx 部署配置"
        read -p "请输入域名或IP (直接回车使用IP): " DOMAIN
        
        if [ -z "$DOMAIN" ]; then
            DOMAIN=$(curl -s ip.sb)
            echo "使用IP: $DOMAIN"
        fi
        
        # 检查 Nginx 是否安装
        if ! command -v nginx &> /dev/null; then
            echo "⚠️ Nginx 未安装，正在安装..."
            apt-get update
            apt-get install -y nginx
        fi
        
        # 创建 Nginx 配置
        cat > /etc/nginx/conf.d/study-app.conf << EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $DEPLOY_DIR;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ =404;
    }
    
    # 启用 gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
EOF
        
        # 测试并重载配置
        nginx -t && nginx -s reload
        
        echo ""
        echo "✅ Nginx 配置完成！"
        echo "🌐 访问地址: http://$DOMAIN"
        ;;
        
    2)
        echo ""
        echo "🌐 Apache 部署配置"
        read -p "请输入域名或IP (直接回车使用IP): " DOMAIN
        
        if [ -z "$DOMAIN" ]; then
            DOMAIN=$(curl -s ip.sb)
            echo "使用IP: $DOMAIN"
        fi
        
        # 检查 Apache 是否安装
        if ! command -v apache2 &> /dev/null && ! command -v httpd &> /dev/null; then
            echo "⚠️ Apache 未安装，正在安装..."
            apt-get update
            apt-get install -y apache2
        fi
        
        # 创建 Apache 配置
        cat > /etc/apache2/sites-available/study-app.conf << EOF
<VirtualHost *:80>
    ServerName $DOMAIN
    DocumentRoot $DEPLOY_DIR
    
    <Directory $DEPLOY_DIR>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog \${APACHE_LOG_DIR}/study-app-error.log
    CustomLog \${APACHE_LOG_DIR}/study-app-access.log combined
</VirtualHost>
EOF
        
        # 启用站点
        a2ensite study-app.conf
        a2enmod rewrite
        systemctl reload apache2
        
        echo ""
        echo "✅ Apache 配置完成！"
        echo "🌐 访问地址: http://$DOMAIN"
        ;;
        
    3)
        echo ""
        echo "✅ 文件已复制到 $DEPLOY_DIR"
        echo "请手动配置你的 Web 服务器指向此目录"
        ;;
        
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

echo ""
echo "=========================="
echo "🎉 部署完成！"
echo ""
echo "📂 部署目录: $DEPLOY_DIR"
echo ""
echo "📋 后续操作:"
echo "1. 确保防火墙放行 80 端口"
echo "2. 如果使用域名，配置 DNS 解析"
echo "3. 如需 HTTPS，建议配置 SSL 证书"
echo ""
echo "有问题随时联系！"
