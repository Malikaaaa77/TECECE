const bcrypt = require('bcryptjs');

const password = 'admin123';
bcrypt.hash(password, 12, (err, hash) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Password:', password);
    console.log('Hash:', hash);
  }
});