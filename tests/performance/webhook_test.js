// Description: This script tests the performance of the webhook endpoint.
// brew install k6          # macOS
// sudo apt install k6      # Ubuntu

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,            // 50 người dùng đồng thời; 50 users concurrent
  duration: '30s',    // trong 30 giây
};

export default function () {
  const payload = JSON.stringify({
    entry: [{
      messaging: [{
        sender: { id: "test_user" },
        message: { text: "Hello chatbot" }
      }]
    }]
  });

  const headers = { 'Content-Type': 'application/json' };
  const res = http.post('http://localhost:3000/webhook', payload, { headers });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(0.1);
}


