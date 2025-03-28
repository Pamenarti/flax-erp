const axios = require('axios');
const http = require('http');
const fs = require('fs');

// API endpoint'leri
const ENDPOINTS = [
  '/api/modules',
  '/modules',
  '/api/modules/active',
  '/modules/active',
  '/api/health'
];

// Backend port'u
const PORT = process.env.BACKEND_PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Her endpoint'i test et
async function testEndpoints() {
  console.log(`Backend URL: ${BASE_URL}`);
  
  for (const endpoint of ENDPOINTS) {
    try {
      console.log(`\nTesting endpoint: ${endpoint}`);
      const url = `${BASE_URL}${endpoint}`;
      
      // Axios ile istek
      try {
        console.log(`Axios ile istek yapılıyor: ${url}`);
        const response = await axios.get(url);
        console.log(`✅ Axios Response (${response.status}):`);
        console.log(JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
      } catch (axiosError) {
        console.error(`❌ Axios Error:`, axiosError.message);
        if (axiosError.response) {
          console.error(`Status: ${axiosError.response.status}`);
          console.error(`Data:`, axiosError.response.data);
        }
      }
      
      // Native HTTP ile istek
      try {
        console.log(`\nNative HTTP ile istek yapılıyor: ${url}`);
        const httpResult = await new Promise((resolve, reject) => {
          http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
              data += chunk;
            });
            res.on('end', () => {
              resolve({ status: res.statusCode, data: data });
            });
          }).on('error', (err) => {
            reject(err);
          });
        });
        
        console.log(`✅ HTTP Response (${httpResult.status}):`);
        try {
          const jsonData = JSON.parse(httpResult.data);
          console.log(JSON.stringify(jsonData, null, 2).substring(0, 200) + '...');
        } catch (e) {
          console.log(httpResult.data.substring(0, 200) + '...');
        }
      } catch (httpError) {
        console.error(`❌ HTTP Error:`, httpError.message);
      }
    } catch (error) {
      console.error(`❌ Test Error:`, error.message);
    }
  }
}

// Ana fonksiyon
async function main() {
  console.log('API Endpoint Test Tool');
  console.log('=====================\n');
  
  await testEndpoints();
}

main().catch(console.error);
