import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const assetsDir = path.join(distDir, 'assets');

function pickLatestFile(files, matcher) {
  return files
    .filter((file) => matcher.test(file))
    .sort((left, right) => right.localeCompare(left))[0];
}

async function main() {
  const assetFiles = await readdir(assetsDir);
  const jsFile = pickLatestFile(assetFiles, /^index-.*\.js$/);
  const cssFile = pickLatestFile(assetFiles, /^index-.*\.css$/);

  if (!jsFile) {
    throw new Error('dist/assets 안에서 앱 번들 파일을 찾지 못했습니다.');
  }

  const html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>국토 수호대 디지털 인벤토리 앱</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : ''}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/${jsFile}"></script>
  </body>
</html>
`;

  await writeFile(path.join(distDir, 'index.html'), html, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
