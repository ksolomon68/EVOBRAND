const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('Testing connection with direct credentials...');
    const connection = await mysql.createConnection({
      host: 'evobrandconcepts.com',
      user: 'evobrandconcepts_keisha',
      password: 'P[x_.?-G1y?S&yyu',
      port: 3306
    });
    console.log('Connection successful!');
    await connection.end();
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();
