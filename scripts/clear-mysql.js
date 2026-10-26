
const mysql = require('mysql2/promise');

const connectionString = 'mysql://root:qLxsvkmrgwzeTQVDkEPeaTUVKyWTUqJG@yamanote.proxy.rlwy.net:33598/railway';

async function clearData() {
  console.log('Connecting to MySQL database...');
  const connection = await mysql.createConnection(connectionString);

  try {
    console.log('Connected!');

    // List of tables to clear
    const tables = [
      'blog_posts',
      'skills',
      'projects',
      'certificates',
      'work_experience',
      'education',
      'testimonials',
      'recommendations',
      'contact_messages',
      'about_values',
      'about_experience',
      'about'
    ];

    for (const table of tables) {
      console.log(`Clearing table: ${table}`);
      await connection.execute(`DELETE FROM ${table}`);
    }

    console.log('All dynamic content tables cleared successfully!');

  } catch (error) {
    console.error('Error during clearing:', error);
  } finally {
    await connection.end();
  }
}

clearData();
