#!/usr/bin/env node

import { execSync } from 'child_process';
import { readdirSync, existsSync, writeFileSync } from 'fs';
import { basename, join } from 'path';

const mdFilesDir = 'contents';
const projectName = process.argv[2]; // 获取命令行参数

// 获取所有 .md 文件
const mdFiles = readdirSync(mdFilesDir)
  .filter(file => file.endsWith('.md'))
  .map(file => basename(file));

// 创建 dist/index.html
function createIndexHtml(projects) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentations</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 800px;
      margin: 80px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #333;
      margin-bottom: 40px;
    }
    .presentations {
      list-style: none;
      padding: 0;
    }
    .presentations li {
      margin-bottom: 15px;
    }
    .presentations a {
      display: block;
      padding: 20px 30px;
      background: white;
      color: #333;
      text-decoration: none;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.2s;
      font-size: 18px;
    }
    .presentations a:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <h1>📊 Available Presentations</h1>
  <ul class="presentations">
${projects.map(name => `    <li><a href="/${name}/">${name}</a></li>`).join('\n')}
  </ul>
</body>
</html>`;

  writeFileSync('dist/index.html', html);
  console.log('\n✓ Created dist/index.html');
}

// 如果提供了项目名参数，只构建该项目
if (projectName) {
  const targetFile = `${projectName}.md`;
  const targetPath = join(mdFilesDir, targetFile);

  if (!existsSync(targetPath)) {
    console.error(`Error: Project "${projectName}" not found.`);
    console.log('\nAvailable presentations:');
    mdFiles.forEach(file => console.log(`  - ${file.replace('.md', '')}`));
    process.exit(1);
  }

  console.log(`Building ${targetFile}...\n`);
  try {
    execSync(`slidev build ${mdFilesDir}/${targetFile} --out dist/${projectName}`, {
      stdio: 'inherit'
    });
    console.log(`\n✓ Successfully built ${targetFile} to dist/${projectName}`);

    // 创建 index.html（包含所有项目，不只是当前构建的）
    const allProjects = mdFiles.map(f => basename(f, '.md'));
    createIndexHtml(allProjects);
  } catch (error) {
    console.error(`✗ Failed to build ${targetFile}`);
    process.exit(1);
  }
} else {
  // 没有参数，构建所有演示文稿
  console.log(`Found ${mdFiles.length} presentation(s) to build:\n`);
  mdFiles.forEach(file => console.log(`  - ${file}`));
  console.log('');

  const builtProjects = [];

  mdFiles.forEach((file, index) => {
    const fileName = basename(file, '.md');
    console.log(`\n[${index + 1}/${mdFiles.length}] Building ${file}...`);
    try {
      execSync(`slidev build ${mdFilesDir}/${file} --out dist/${fileName}`, {
        stdio: 'inherit'
      });
      console.log(`✓ Successfully built ${file} to dist/${fileName}`);
      builtProjects.push(fileName);
    } catch (error) {
      console.error(`✗ Failed to build ${file}`);
      process.exit(1);
    }
  });

  console.log('\n✓ All presentations built successfully!');

  // 创建 index.html
  createIndexHtml(builtProjects);
}

