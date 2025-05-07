# Furniro-dev

Hướng dẫn này mô tả chi tiết quy trình triển khai ứng dụng NestJS Furniro trên EC2 của AWS, bao gồm thiết lập Nginx, SSL/HTTPS, cấu hình tên miền, lưu trữ S3 và CI/CD với GitHub Actions.

## Mục lục
1. [Thiết lập AWS EC2 Instance](#thiết-lập-aws-ec2-instance)
2. [Cấu hình Tường lửa](#cấu-hình-tường-lửa)
3. [Thiết lập S3 Bucket cho Lưu trữ File](#thiết-lập-s3-bucket-cho-lưu-trữ-file)
4. [Thiết lập CloudFront với Origin S3 Bucket](#thiết-lập-cloudfront-với-origin-s3-bucket)
5. [Cài đặt Phần mềm Cần thiết trên EC2](#cài-đặt-phần-mềm-cần-thiết-trên-ec2)
6. [Triển khai Ứng dụng trên EC2](#triển-khai-ứng-dụng-trên-ec2)
7. [Cấu hình Nginx làm Reverse Proxy](#cấu-hình-nginx-làm-reverse-proxy)
8. [Cấu hình Tên miền](#cấu-hình-tên-miền)
9. [Cấu hình SSL/HTTPS với Certbot](#cấu-hình-sslhttps-với-certbot)
10. [Cấu hình CI/CD với GitHub Actions](#cấu-hình-cicd-với-github-actions)
11. [Cập nhật và Bảo trì](#cập-nhật-và-bảo-trì)

## Thiết lập AWS EC2 Instance

### Khởi chạy EC2 Instance mới
1. Đăng nhập vào AWS Management Console
2. Chuyển đến dịch vụ EC2
3. Nhấp vào "Launch Instance"
4. Chọn Amazon Machine Image (AMI) - Khuyến nghị: Ubuntu Server 22.04 LTS
5. Chọn loại instance (khuyến nghị t2.micro để kiểm thử, t2.small hoặc t2.medium cho sản phẩm)
6. Cấu hình Chi tiết Instance:
   - Network: Default VPC
   - Subnet: Chọn bất kỳ subnet khả dụng nào
   - Auto-assign Public IP: Enable
7. Thêm lưu trữ: Mặc định 8GB là đủ để bắt đầu
8. Thêm Tags: Key=Name, Value=furniro-backend
9. Cấu hình Security Group (xem phần Cấu hình Tường lửa bên dưới)
10. Xem xét và Khởi chạy
11. Tạo cặp khóa mới hoặc sử dụng cặp khóa hiện có (lưu file .pem một cách an toàn)
12. Khởi chạy Instance

### Kết nối đến EC2 Instance
```bash
chmod 400 your-key-pair.pem
ssh -i your-key-pair.pem ubuntu@your-ec2-public-dns
```

### Cấu hình SSH cho Instance hiện tại (EC2-Nhat)
Để dễ dàng kết nối đến instance, bạn có thể thêm cấu hình sau vào file `~/.ssh/config` trên máy local của bạn:

```
Host EC2-Nhat
    HostName 13.250.2.31
    User nhatdev
    IdentityFile ~/.ssh/id_nhatdev
```

Sau khi cấu hình, bạn có thể kết nối đơn giản bằng lệnh:

```bash
ssh EC2-Nhat
```

## Cấu hình Tường lửa

### Thiết lập Security Group trong AWS Console
Cấu hình các quy tắc đến sau:
- SSH (cổng 22) - Nguồn: IP của bạn hoặc Anywhere (0.0.0.0/0) cho phát triển
- HTTP (cổng 80) - Nguồn: Anywhere (0.0.0.0/0)
- HTTPS (cổng 443) - Nguồn: Anywhere (0.0.0.0/0)
- Custom TCP (cổng 3000) - Nguồn: IP của bạn (để truy cập trực tiếp vào ứng dụng nếu cần)

### Thiết lập UFW trên Ubuntu Server
```bash
# Cài đặt UFW nếu chưa được cài đặt
sudo apt-get update
sudo apt-get install ufw

# Liệt kê các ứng dụng mà UFW biết
sudo ufw app list
```

Bạn sẽ thấy các profile có sẵn cho Nginx:
```
Available applications:
  Nginx Full
  Nginx HTTP
  Nginx HTTPS
  OpenSSH
```

Có 3 loại profile cho Nginx:
- **Nginx Full**: mở port 80 (HTTP) và port 443 (HTTPS)
- **Nginx HTTP**: Chỉ mở port 80 (HTTP)
- **Nginx HTTPS**: Chỉ mở port 443 (HTTPS)

```bash
# Cho phép Nginx Full
sudo ufw allow 'Nginx Full'

# Cho phép SSH
sudo ufw allow ssh
sudo ufw allow 3000/tcp  # Cổng ứng dụng

# Bật tường lửa
sudo ufw enable

# Kiểm tra trạng thái
sudo ufw status

# Yêu cầu tường lửa khởi động cùng hệ thống
sudo systemctl enable ufw
```

## Thiết lập S3 Bucket cho Lưu trữ File

1. Đăng nhập vào AWS Management Console
2. Chuyển đến dịch vụ S3
3. Nhấp vào "Create bucket"
4. Nhập tên bucket (ví dụ: furniro-files)
5. Chọn khu vực (chọn cùng khu vực với EC2 instance của bạn)
6. Chặn tất cả truy cập công khai (bỏ chọn nếu bạn cần truy cập công khai vào files)
7. Bật versioning nếu cần
8. Tạo bucket

### Cấu hình IAM User cho Truy cập S3

1. Chuyển đến dịch vụ IAM
2. Tạo người dùng mới với quyền truy cập programmatic
3. Đính kèm chính sách 'AmazonS3FullAccess' (hoặc tạo chính sách tùy chỉnh với quyền hạn giới hạn)
4. Lưu Access Key ID và Secret Access Key một cách an toàn

### Cập nhật File .env với Cấu hình S3
```
AWS_S3_REGION=khu-vực-của-bạn
AWS_S3_ACCESS_KEY=access-key-của-bạn
AWS_S3_SECRET_KEY=secret-key-của-bạn
AWS_S3_BUCKET=tên-bucket-của-bạn
```

> **Lưu ý**: Để cải thiện hiệu suất, bảo mật và giảm chi phí cho việc phân phối nội dung từ S3, bạn có thể thiết lập CloudFront CDN với S3 làm origin. Xem chi tiết tại phần [Thiết lập CloudFront với Origin S3 Bucket](#thiết-lập-cloudfront-với-origin-s3-bucket).

## Thiết lập CloudFront với Origin S3 Bucket

### Tạo CloudFront Distribution
1. Đăng nhập vào AWS Management Console
2. Chuyển đến dịch vụ CloudFront
3. Nhấp vào "Create Distribution"
4. Chọn S3 bucket của bạn làm Origin Domain
5. Cấu hình các thiết lập sau:
   - Restrict Bucket Access: Yes (để hạn chế truy cập trực tiếp vào bucket)
   - Origin Access Identity: Create a New Identity
   - Grant Read Permissions on Bucket: Yes, Update Bucket Policy
   - Viewer Protocol Policy: Redirect HTTP to HTTPS (khuyến nghị)
   - Allowed HTTP Methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE (tùy theo nhu cầu)
   - Cache Policy: Chọn hoặc tạo policy phù hợp với loại nội dung của bạn
   - Price Class: Chọn phù hợp với ngân sách (Use Only US, Canada and Europe cho chi phí thấp nhất)
   - Alternate Domain Names (CNAMEs): Thêm tên miền tùy chỉnh nếu cần
   - SSL Certificate: Chọn Default CloudFront Certificate hoặc sử dụng chứng chỉ tùy chỉnh

### Cấu hình CORS cho S3 Bucket
Nếu bạn cần hỗ trợ CORS, cấu hình chính sách CORS cho S3 bucket của bạn:
1. Đi đến S3 bucket của bạn
2. Chọn tab "Permissions"
3. Cuộn xuống đến phần "Cross-origin resource sharing (CORS)"
4. Chọn "Edit" và thêm chính sách CORS phù hợp:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Cấu hình Tên miền Tùy chỉnh cho CloudFront (nếu cần)
1. Tạo chứng chỉ SSL/TLS trong AWS Certificate Manager (ACM) cho tên miền của bạn
2. Thêm tên miền tùy chỉnh vào CloudFront distribution
3. Chọn chứng chỉ SSL/TLS đã tạo
4. Cập nhật DNS của tên miền của bạn để trỏ đến CloudFront domain (tạo bản ghi CNAME)

| Tên record (Host) | Type | Value | TTL |
|-------------------|------|-------|-----|
| cdn | CNAME | your-distribution-id.cloudfront.net | 300 |

### Cập nhật File .env với Cấu hình CloudFront
Cập nhật file .env của bạn để sử dụng CloudFront URL thay vì URL S3 trực tiếp:
```
AWS_CLOUDFRONT_URL=https://your-distribution-id.cloudfront.net
# hoặc nếu sử dụng tên miền tùy chỉnh
AWS_CLOUDFRONT_URL=https://cdn.your-domain.com
```

### Cập nhật Mã Ứng dụng để Sử dụng CloudFront
Đảm bảo ứng dụng của bạn sử dụng URL CloudFront cho các tài nguyên lưu trữ trong S3. Ví dụ, khi tạo URL cho tệp đã tải lên:

```typescript
// Thay vì tạo URL S3 trực tiếp
const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${fileName}`;

// Sử dụng URL CloudFront
const fileUrl = `${process.env.AWS_CLOUDFRONT_URL}/${fileName}`;
```

### Lợi ích của việc sử dụng CloudFront
1. **Hiệu suất cải thiện**: Nội dung được phân phối từ edge location gần nhất với người dùng
2. **Bảo mật nâng cao**: Truy cập trực tiếp vào S3 bucket bị chặn, tất cả yêu cầu phải đi qua CloudFront
3. **Chi phí truyền dữ liệu thấp hơn**: Giá cước truyền dữ liệu từ CloudFront thường thấp hơn từ S3 trực tiếp
4. **Giảm tải cho origin server**: CloudFront cache giúp giảm số lượng yêu cầu đến S3 bucket
5. **HTTPS miễn phí**: AWS cung cấp chứng chỉ SSL/TLS miễn phí cho CloudFront distributions

## Cài đặt Phần mềm Cần thiết trên EC2

### Cập nhật Hệ thống
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Cài đặt Node.js và npm sử dụng NVM
```bash
# Cài đặt NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Cài đặt Node.js
nvm install 22.11.0
nvm use 22.11.0
nvm alias default 22.11.0

# Xác minh cài đặt
node -v
npm -v
```

### Cài đặt Git
```bash
sudo apt-get install git -y
```

### Cài đặt PM2 cho Quản lý Tiến trình
```bash
npm install -g pm2
```

### Cài đặt Nginx
```bash
sudo apt-get install nginx -y
```

## Triển khai Ứng dụng trên EC2

### Clone Repository
```bash
cd ~
git clone https://github.com/yourusername/backend-nestjs-furniro-dev.git
cd backend-nestjs-furniro-dev
```

### Thiết lập Biến Môi trường
```bash
# Tạo file .env với giá trị cho môi trường production
nano .env
```

Thêm tất cả biến môi trường cần thiết bao gồm:
```
PORT=3000
DATABASE_URI=chuỗi-kết-nối-mongodb-của-bạn
JWT_SECRET=khóa-bí-mật-của-bạn
JWT_EXPIRATION=1d
# Cấu hình S3
AWS_S3_REGION=khu-vực-của-bạn
AWS_S3_ACCESS_KEY=access-key-của-bạn
AWS_S3_SECRET_KEY=secret-key-của-bạn
AWS_S3_BUCKET=tên-bucket-của-bạn
# Các biến cụ thể khác cho ứng dụng
```

### Cài đặt Phụ thuộc và Build
```bash
npm install --force
npm run build
```

### Khởi động Ứng dụng với PM2
```bash
pm2 start ecosystem.config.cjs
# HOẶC nếu bạn muốn khởi động mà không cần file cấu hình
pm2 start dist/main.js --name "BE Furniro dev"

# Thiết lập PM2 để khởi động khi boot
pm2 startup
# Thực thi lệnh mà PM2 cung cấp
pm2 save
```

## Cập nhật và Triển khai lại Ứng dụng

Trong tương lai, nếu có update code, tất cả những gì bạn cần làm là thực hiện theo các bước dưới đây:

1. Push thay đổi code lên Github/Gitlab
2. SSH vào VPS thông qua terminal với username đã tạo
3. cd vào folder dự án trên vps
4. Pull code về bằng lệnh git pull
5. Cài đặt lại các package nếu cần
6. Build lại ứng dụng
7. Restart lại tiến trình PM2

### Câu lệnh redeploy rút gọn:
```bash
cd ~/backend-nestjs-furniro-dev && git pull && npm install --force && npm run build && pm2 restart "BE Furniro dev"
```

Chỉ cần chạy câu lệnh này là hệ thống sẽ tự động làm hết mọi thứ, hoặc bạn có thể setup Github Action để tự động deploy.

## Cấu hình Nginx làm Reverse Proxy

### Kiểm tra Nginx
```bash
systemctl status nginx
```

### Tạo và cấu hình Nginx server block
```bash
cd /etc/nginx/sites-available
sudo touch furniro-backend
sudo nano furniro-backend
```

Thêm cấu hình sau (thay tên-miền-của-bạn.com bằng tên miền thực tế của bạn):
```nginx
server {
    listen 80;
    listen [::]:80;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;

    server_name hoangvannhat.top www.hoangvannhat.top;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Optional: Set client max body size for file uploads
    client_max_body_size 10M;
}
```

### Kích hoạt cấu hình Nginx
```bash
sudo ln -s /etc/nginx/sites-available/furniro-backend /etc/nginx/sites-enabled/
```

### Tối ưu hóa cấu hình Nginx
```bash
sudo nano /etc/nginx/nginx.conf
```

Tìm và bỏ comment dòng `server_names_hash_bucket_size 64;`:
```
http {
    ...
    server_names_hash_bucket_size 64;
    ...
}
```

### Kiểm tra và khởi động lại Nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Cấu hình Tên miền

### Trỏ tên miền chính về VPS
Đăng nhập vào nhà cung cấp tên miền của bạn và thêm 2 bản ghi sau:

| Tên record (Host) | Type | Value | TTL |
|-------------------|------|-------|-----|
| @ | A | ip_vps_address | 300 |
| www | CNAME | tên-miền-của-bạn.com | 300 |

*Lưu ý: Thay ip_vps_address bằng địa chỉ IP thực tế của VPS, và tên-miền-của-bạn.com bằng tên miền thực của bạn.*

> **Mẹo**: Vì sử dụng A record nên sau khi tạo, đợi ít nhất 1 phút sau mới truy cập để tránh bị dính cache DNS. Nếu bị dính cache DNS, bạn có thể phải đợi 24-48 giờ để thay đổi có hiệu lực.

### Trỏ tên miền con về VPS (nếu cần)
Trong trường hợp bạn dùng tên miền con (sub domain) dạng sub.tên-miền-của-bạn.com, thêm 2 bản ghi sau:

| Tên record | Type | Value | TTL |
|------------|------|-------|-----|
| sub | A | ip_vps_address | 300 |
| www.sub | A | ip_vps_address | 300 |

## Cấu hình SSL/HTTPS với Certbot

### Cài đặt Certbot
```bash
sudo apt-get install certbot python3-certbot-nginx -y
```

### Lấy và Cài đặt Chứng chỉ SSL
```bash
sudo certbot --nginx -d tên-miền-của-bạn.com -d www.tên-miền-của-bạn.com
```

Làm theo các lời nhắc:
1. Nhập địa chỉ email của bạn
2. Đồng ý với điều khoản dịch vụ
3. Chọn có chia sẻ email của bạn hay không
4. Chọn có chuyển hướng HTTP sang HTTPS hay không (khuyến nghị)

Certbot sẽ tự động cập nhật cấu hình Nginx để sử dụng SSL.

### Kiểm tra tự động gia hạn
```bash
sudo systemctl list-timers
```

## Cấu hình CI/CD với GitHub Actions

### Tạo GitHub Secrets
Trong repository GitHub của bạn, đi đến Settings > Secrets and Variables > Actions và thêm các secret sau:
- `HOST_PRODUCTION`: Địa chỉ IP công khai hoặc hostname của EC2 instance
- `USERNAME_PRODUCTION`: Tên người dùng EC2 (thường là 'ubuntu')
- `PORT_PRODUCTION`: Cổng SSH (thường là 22)
- `SSH_PRIVATE_KEY`: Nội dung khóa SSH riêng tư của bạn
- `ENV_PRODUCTION`: Nội dung đầy đủ của file .env cho môi trường production

### Tạo GitHub Workflow File
File workflow đã tồn tại tại `.github/workflows/deploy-production.yml`. Đây là đánh giá về những gì nó làm:

1. Được kích hoạt khi push/pull requests vào nhánh master
2. Build ứng dụng
3. Triển khai lên EC2 sử dụng SSH
4. Cập nhật ứng dụng và khởi động lại tiến trình PM2

```yaml
name: Deploy Production

on:
  push:
    branches: ['master']
  pull_request:
    branches: ['master']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22.11.0
          cache: 'npm'
      - name: Create .env file
        run: echo "${{ secrets.ENV_PRODUCTION }}" >> .env
      - run: npm i --force
      - run: npm run build
  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: 'Executing remote ssh commands using ssh key'
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.HOST_PRODUCTION }}
          username: ${{ secrets.USERNAME_PRODUCTION }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.PORT_PRODUCTION }}
          script: |
            export NVM_DIR=~/.nvm
            source ~/.nvm/nvm.sh
            cd ~/backend-nestjs-furniro-dev
            git fetch --all
            git reset --hard origin/master
            echo "${{ secrets.ENV_PRODUCTION }}" > .env
            npm install --force
            npm run build
            pm2 restart "BE Furniro dev"
```

## Cập nhật và Bảo trì

### Giám sát Ứng dụng với PM2
```bash
pm2 status
pm2 logs
pm2 monit  # Giám sát tương tác
```

### Nhật ký Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Gia hạn Chứng chỉ SSL
```bash
# Kiểm tra quy trình gia hạn
sudo certbot renew --dry-run

# Gia hạn cưỡng bức (nếu cần)
sudo certbot renew --force-renewal
```

### Cập nhật Máy chủ
Cập nhật máy chủ của bạn thường xuyên:
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Sao lưu Cơ sở dữ liệu và Môi trường
Thường xuyên sao lưu cơ sở dữ liệu MongoDB và file .env của bạn.

### Quản lý S3 Bucket
Thường xuyên kiểm tra mức sử dụng S3 bucket và xem xét triển khai các chính sách vòng đời để tối ưu hóa chi phí.

## Xử lý Sự cố

### Vấn đề Phổ biến và Giải pháp

1. **Ứng dụng không khởi động:**
   - Kiểm tra nhật ký PM2: `pm2 logs`
   - Xác minh biến môi trường: `cat .env`
   - Kiểm tra xung đột cổng: `sudo lsof -i :3000`

2. **Lỗi Nginx:**
   - Kiểm tra cấu hình: `sudo nginx -t`
   - Xem nhật ký: `sudo tail -f /var/log/nginx/error.log`

3. **Vấn đề chứng chỉ SSL:**
   - Kiểm tra hạn sử dụng: `sudo certbot certificates`
   - Gia hạn thủ công: `sudo certbot renew`

4. **GitHub Actions thất bại:**
   - Kiểm tra các lần chạy workflow trong GitHub repository
   - Xác minh tất cả secrets được thiết lập chính xác
   - Đảm bảo khóa SSH có quyền phù hợp trên EC2 instance

5. **Vấn đề kết nối S3:**
   - Xác minh quyền IAM
   - Kiểm tra kết nối mạng từ EC2 đến S3
   - Xác thực biến môi trường