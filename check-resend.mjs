import https from 'https';

function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.resend.com',
      path,
      method,
      headers: {
        'Authorization': 'Bearer re_ZNV7bf4z_HFmbiLTrHuLGPitDdWuMdFsr',
        'Content-Type': 'application/json',
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// List audiences
const audiences = await request('/audiences');
console.log('Audiences:', audiences.status, audiences.body);
