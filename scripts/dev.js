#!/usr/bin/env node

import { execSync } from 'child_process';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import readline from 'readline';

const mdFilesDir = 'contents';
const projectName = process.argv[2]; // 获取命令行参数

// 获取所有 .md 文件
const mdFiles = readdirSync(mdFilesDir)
  .filter(file => file.endsWith('.md'));

if (mdFiles.length === 0) {
  console.error('No .md files found in contents/');
  process.exit(1);
}

// 如果提供了项目名参数，直接运行
if (projectName) {
  const targetFile = `${projectName}.md`;
  const targetPath = join(mdFilesDir, targetFile);

  if (!existsSync(targetPath)) {
    console.error(`Error: Project "${projectName}" not found.`);
    console.log('\nAvailable presentations:');
    mdFiles.forEach(file => console.log(`  - ${file.replace('.md', '')}`));
    process.exit(1);
  }

  console.log(`Starting ${targetFile}...\n`);
  try {
    execSync(`slidev ${mdFilesDir}/${targetFile} --port 3080 --open`, {
      stdio: 'inherit'
    });
  } catch (error) {
    process.exit(1);
  }
} else {
  // 没有参数，显示选择列表
  console.log('Available presentations:\n');
  mdFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\nSelect a presentation to run (1-' + mdFiles.length + '): ', (answer) => {
    const index = parseInt(answer) - 1;

    if (index >= 0 && index < mdFiles.length) {
      const selectedFile = mdFiles[index];
      console.log(`\nStarting ${selectedFile}...\n`);
      rl.close();

      try {
        execSync(`slidev ${mdFilesDir}/${selectedFile} --port 3080 --open`, {
          stdio: 'inherit'
        });
      } catch (error) {
        process.exit(1);
      }
    } else {
      console.error('Invalid selection');
      rl.close();
      process.exit(1);
    }
  });
}

