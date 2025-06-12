// scripts/createAdmin.js
const bcrypt = require('bcryptjs');
const { postgres } = require('../config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdmin() {
  try {
    console.log('🔧 Create Admin User');
    console.log('===================');

    const username = await question('Username: ');
    const password = await question('Password: ');
    const fullName = await question('Full Name: ');
    const email = await question('Email: ');
    const nim = await question('NIM/ID: ');

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert member
    const memberResult = await postgres.query(
      `INSERT INTO members (nim, full_name, email, department, year_joined, status) 
       VALUES ($1, $2, $3, 'Administrator', 2025, 'active') RETURNING id`,
      [nim, fullName, email]
    );

    // Insert user
    await postgres.query(
      `INSERT INTO users (member_id, username, password_hash, role) 
       VALUES ($1, $2, $3, 'admin')`,
      [memberResult.rows[0].id, username, passwordHash]
    );

    console.log('✅ Admin created successfully!');
    rl.close();

  } catch (error) {
    console.error('❌ Error:', error);
    rl.close();
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

createAdmin();