# Hướng dẫn tạo NodeJS backend project tên `chatbot`

## 1. Khởi tạo project

```bash
mkdir chatbot
cd chatbot
npm init -y
```

## 2. Cài đặt các package cần thiết

```bash
npm install express
```

## 3. Tạo file khởi động

Tạo file `index.js` với nội dung:

```js
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello from chatbot backend!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
```

## 4. Chạy project

```bash
node index.js
```

Truy cập [http://localhost:3000](http://localhost:3000) để kiểm tra.

--- 
