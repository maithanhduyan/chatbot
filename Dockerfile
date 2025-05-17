# Base image
FROM node:20 

# Tạo thư mục làm việc trong container
WORKDIR /app

# Cài pnpm
RUN corepack enable && corepack prepare pnpm@8.6.12 --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy  mã nguồn
COPY . .

# Mở cổng mà app sử dụng
EXPOSE 3000

# Lệnh khởi động container
CMD ["node", "server.js"]


