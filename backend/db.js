require('./load-env');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

function convertBulkInsert(query, params) {
  const rows = params[0];
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Bulk insert requires at least one row');
  }

  const columnCount = rows[0].length;
  const values = [];
  const placeholders = rows
    .map((row, rowIndex) => {
      const rowPlaceholders = row.map((_, colIndex) => {
        values.push(row[colIndex]);
        return `$${rowIndex * columnCount + colIndex + 1}`;
      });
      return `(${rowPlaceholders.join(', ')})`;
    })
    .join(', ');

  return {
    text: query.replace('VALUES ?', `VALUES ${placeholders}`),
    values
  };
}

function convertQuery(query, params = []) {
  if (query.includes('VALUES ?')) {
    return convertBulkInsert(query, params);
  }

  let index = 0;
  const text = query.replace(/\?/g, () => `$${++index}`);
  return { text, values: params };
}

function isRetryableDbError(err) {
  const message = String(err?.message || '');
  const causeCode = err?.sourceError?.cause?.code || err?.cause?.code;
  return (
    causeCode === 'UND_ERR_CONNECT_TIMEOUT' ||
    message.includes('fetch failed') ||
    message.includes('Connect Timeout')
  );
}

async function query(queryText, params = []) {
  const { text, values } = convertQuery(queryText, params);
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const rows = await sql.query(text, values);
      return [rows];
    } catch (err) {
      lastError = err;
      if (!isRetryableDbError(err) || attempt === 3) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
  throw lastError;
}

module.exports = { query };
