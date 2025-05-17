root@localhost:/home/chatbot# k6 run  /home/chatbot/tests/performance/webhook_test.js

         /\      Grafana   /‾‾/  
    /\  /  \     |\  __   /  /   
   /  \/    \    | |/ /  /   ‾‾\ 
  /          \   |   (  |  (‾)  |
 / __________ \  |_|\_\  \_____/ 

     execution: local
        script: /home/chatbot/tests/performance/webhook_test.js
        output: -

     scenarios: (100.00%) 1 scenario, 50 max VUs, 1m0s max duration (incl. graceful stop):
              * default: 50 looping VUs for 30s (gracefulStop: 30s)



  █ TOTAL RESULTS 

    checks_total.......................: 12030   399.705223/s
    checks_succeeded...................: 100.00% 12030 out of 12030
    checks_failed......................: 0.00%   0 out of 12030

    ✓ status is 200

    HTTP
    http_req_duration.......................................................: avg=21.87ms  min=1.27ms   med=15.48ms  max=163.69ms p(90)=46.51ms  p(95)=62.57ms 
      { expected_response:true }............................................: avg=21.87ms  min=1.27ms   med=15.48ms  max=163.69ms p(90)=46.51ms  p(95)=62.57ms 
    http_req_failed.........................................................: 0.00%  0 out of 12030
    http_reqs...............................................................: 12030  399.705223/s

    EXECUTION
    iteration_duration......................................................: avg=124.85ms min=101.95ms med=117.94ms max=280.75ms p(90)=152.34ms p(95)=169.19ms
    iterations..............................................................: 12030  399.705223/s
    vus.....................................................................: 50     min=50         max=50
    vus_max.................................................................: 50     min=50         max=50

    NETWORK
    data_received...........................................................: 2.8 MB 92 kB/s
    data_sent...............................................................: 2.7 MB 89 kB/s




running (0m30.1s), 00/50 VUs, 12030 complete and 0 interrupted iterations
default ✓ [======================================] 50 VUs  30s