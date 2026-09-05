# Hosting guide for Waterkloof Hills Secondary School website

## Assumption
This guide assumes you are using a Linux VPS (Ubuntu 22.04 or 24.04) with SSH access, which is the most common setup for a domain hosted by the same provider.

## 1) Prepare the VPS
1. Create or open your VPS from the same hosting provider where you bought the domain.
2. Make sure it has:
   - Ubuntu 22.04/24.04
   - at least 2 GB RAM if possible
   - public IP address
3. Connect to the VPS with SSH:
   - ssh root@YOUR_SERVER_IP

## 2) Install Node.js and build tools
Run these commands:

```bash
apt update
apt install -y curl git unzip nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v
```

## 3) Install PM2 for process management
```bash
npm install -g pm2
```

## 4) Upload your project to the VPS
You can use Git or SFTP/FTP. A simple option is:

```bash
cd /var/www
git clone YOUR_REPO_URL waterkloof-hills
cd /var/www/waterkloof-hills
npm install
```

If you are using files uploaded by SFTP, place the project into:

```bash
/var/www/waterkloof-hills
```

## 5) Create the environment file
In the project folder create a .env file:

```bash
nano /var/www/waterkloof-hills/.env
```

Use values like this:

```env
PORT=3000
HOST=0.0.0.0
ADMIN_USERNAME=WHSSCHOOL
ADMIN_PASSWORD=Waterkloof@2026
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SENDER_EMAIL=
RECEIVER_EMAIL=admin@waterkloofhillsschool.co.za
EMAIL_SUBJECT=New Admissions Application
```

## 6) Make sure folders are writable
The admin portal and image upload features need write access to these folders:

```bash
mkdir -p /var/www/waterkloof-hills/data /var/www/waterkloof-hills/billbord /var/www/waterkloof-hills/applications /var/www/waterkloof-hills/slides
chown -R www-data:www-data /var/www/waterkloof-hills/data /var/www/waterkloof-hills/billbord /var/www/waterkloof-hills/applications /var/www/waterkloof-hills/slides
chmod -R 755 /var/www/waterkloof-hills/data /var/www/waterkloof-hills/billbord /var/www/waterkloof-hills/applications /var/www/waterkloof-hills/slides
```

## 7) Start the app with PM2
```bash
cd /var/www/waterkloof-hills
pm2 start server.js --name waterkloof-hills
pm2 save
pm2 startup
```

## 8) Configure Nginx as a reverse proxy
Create a site config:

```bash
nano /etc/nginx/sites-available/waterkloof-hills
```

Use this content:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:

```bash
ln -s /etc/nginx/sites-available/waterkloof-hills /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 9) Point your domain to the VPS
In your domain provider’s DNS panel:
- Create an A record for `@` pointing to your VPS public IP
- Create an A record for `www` pointing to the same IP

If your provider supports it, also create an AAAA record if you have IPv6.

## 10) Enable HTTPS with Let’s Encrypt
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 11) Test everything
Open:
- https://yourdomain.com/
- https://yourdomain.com/admin

## 12) Useful commands
```bash
pm2 logs waterkloof-hills
pm2 restart waterkloof-hills
pm2 status
systemctl status nginx
```

## Notes
- The admin portal saves content to `data/site-content.json`.
- Billboard images and uploaded files are stored in the project folders, so they must stay writable.
- If your hosting provider offers cPanel/WHM instead of raw Ubuntu, ask them whether they support Node.js apps and reverse proxying; the same general idea still applies.
