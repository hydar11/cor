// netlify/functions/cors-proxy.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const url = event.queryStringParameters.url;
  if (!url) {
    return {
      statusCode: 400,
      body: 'Missing url parameter'
    };
  }

  // Forward the method, headers, and body
  const method = event.httpMethod;
  const headers = { ...event.headers };
  delete headers.host; // Remove host header

  let body = event.body;
  if (event.isBase64Encoded) {
    body = Buffer.from(event.body, 'base64').toString('utf8');
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: ['GET', 'HEAD'].includes(method) ? undefined : body,
    });

    const responseBody = await response.text();

    // Convert all header values to strings
    const rawHeaders = response.headers.raw ? response.headers.raw() : {};
    const stringHeaders = {};
    for (const [key, value] of Object.entries(rawHeaders)) {
      stringHeaders[key] = Array.isArray(value) ? value.join(', ') : String(value);
    }

    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*',
        ...stringHeaders
      },
      body: responseBody,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: err.toString()
    };
  }
};
