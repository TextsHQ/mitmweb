const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log(execSync('cd ./web && npm run build').toString().trim())

const installedAt = (function () {
  const mitmwebPath = execSync('which mitmweb').toString().trim();
  const data = fs.readFileSync(mitmwebPath, 'utf8');
  const match = data.match(/^#!(.+)/);
  if (match && match[1]) {
    return match[1].replace('bin/python', 'lib/python3.11/site-packages/mitmproxy').trim();
  } else {
    const actualPath = execSync('readlink -f $(which mitmweb)').toString().trim();
    if (!actualPath) {
      return 'Could not determine mitmproxy installation path';
    }
    return path.resolve(actualPath, '../../', 'Resources/mitmproxy')
  }
})();

console.log(`mitmproxy is installed at: ${installedAt}`);

const webPath = path.resolve(installedAt, 'tools/web')

console.log(`mitmweb files are at ${webPath}`)

execSync(`rm -rf ${webPath}`)
console.log(`removed ${webPath}`)

const newlyBuiltWebPath = path.resolve(__dirname, './mitmproxy/tools/web')
console.log(`copying ${newlyBuiltWebPath} to ${webPath}`)
execSync(`cp -r ${newlyBuiltWebPath} ${webPath}`)