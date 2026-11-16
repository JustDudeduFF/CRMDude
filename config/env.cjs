const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');
function loadEnvironment(root, selected) {
  const read = name => { const file = path.join(root, name); return fs.existsSync(file) ? parseEnv(fs.readFileSync(file, 'utf8')) : {}; };
  const common = read('.env');
  const mode = selected || process.env.APP_ENV || process.env.NODE_ENV || common.APP_ENV || 'development';
  if (!['development', 'production', 'test'].includes(mode)) throw new Error('APP_ENV must be development, production or test.');
  const values = { ...common, ...read(`.env.${mode}`), ...read(`.env.${mode}.local`), ...process.env, APP_ENV: mode };
  Object.assign(process.env, values);
  return mode;
}
module.exports = { loadEnvironment };
