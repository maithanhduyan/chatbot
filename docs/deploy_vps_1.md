Tuyệt vời! Dưới đây là hướng dẫn **triển khai dự án chatbot Node.js (ES Module)** có Redis, PostgreSQL và Docker lên **VPS Ubuntu** từ A-Z. Mình giả định bạn đang dùng Ubuntu 20.04+ và có quyền `sudo`.

---

## 🚀 Hướng dẫn deploy lên VPS Ubuntu (Docker + Docker Compose)

---

### ✅ 1. **Cài đặt Docker & Docker Compose**

```bash
# Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Thêm quyền chạy Docker không cần sudo (có thể cần logout/login lại)
sudo usermod -aG docker $USER

# Kiểm tra Docker
docker --version

# Cài Docker Compose
sudo apt install docker-compose -y
```

---

### ✅ 2. **Clone project lên VPS**

```bash
git clone https://github.com/your-username/chatbot.git
cd chatbot
```

> Nếu bạn không dùng GitHub, bạn có thể SCP file ZIP từ local lên VPS:

```bash
scp chatbot.zip user@your-vps-ip:/home/user/
```

---

### ✅ 3. **Cấu hình `.env`**

```bash
cp .env.example .env
nano .env
```

Điền thông tin Facebook, Redis, PostgreSQL, OpenAI hoặc Gemini API Key.

---

### ✅ 4. **Cấu trúc thư mục cần thiết**

Đảm bảo có các file:

```
.
├── Dockerfile
├── docker-compose.yml
├── package.json
├── server.js
├── src/...
├── .env
```

---

### ✅ 5. **Chạy ứng dụng**

```bash
docker-compose up -d --build
```

Kiểm tra:

```bash
docker ps
```

---

### ✅ 6. **Mở cổng 3000 và webhook từ Facebook**

#### 🔧 Nếu dùng `ufw` (firewall Ubuntu):

```bash
sudo ufw allow 3000/tcp
```

#### 🌐 Nếu dùng domain: trỏ `chatbot.yourdomain.com` về IP VPS

#### ✅ Dùng `nginx` hoặc `Caddy` để reverse proxy (HTTPS):

Ví dụ cấu hình Nginx (ở `/etc/nginx/sites-available/chatbot`):

```nginx
server {
    listen 80;
    server_name chatbot.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Kích hoạt & reload:

```bash
sudo ln -s /etc/nginx/sites-available/chatbot /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

---

### ✅ 7. **Webhook Facebook cấu hình**

Vào Facebook Developer Portal:

* Đặt URL: `https://chatbot.yourdomain.com/webhook`
* Verify Token: cùng với `.env`
* Kết nối page và test

---

## ✅ Quản lý dịch vụ

| Lệnh                     | Tác dụng                 |
| ------------------------ | ------------------------ |
| `docker-compose logs -f` | Xem log toàn bộ          |
| `docker-compose restart` | Khởi động lại            |
| `docker-compose down`    | Tắt app và xóa container |

---

## ✅ Gợi ý tăng bảo mật / ổn định

* Dùng HTTPS (Let’s Encrypt + nginx)
* Giới hạn số lượng API gọi tới OpenAI để giảm chi phí
* Dùng `fail2ban` + `ufw` bảo vệ server
* Backup PostgreSQL định kỳ (`pg_dump`)

---

Bạn có muốn mình tạo sẵn **script auto-deploy** hoặc gửi file cấu hình Nginx/Caddy đầy đủ không?
