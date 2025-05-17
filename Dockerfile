# Base image
FROM node:20

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy package.json và cài dependencies
COPY package.json package-lock.json* ./
RUN pnpm install

# Copy toàn bộ mã nguồn
COPY . .

# Mở cổng mà app sử dụng
EXPOSE 3000

# Lệnh khởi động container
CMD ["node", "server.js"]
