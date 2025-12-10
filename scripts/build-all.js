#!/usr/bin/env node

import { execSync } from 'child_process';
import { readdirSync, existsSync } from 'fs';
import { basename, join } from 'path';

const mdFilesDir = 'contents';
const projectName = process.argv[2]; // 获取命令行参数

// 获取所有 .md 文件
const mdFiles = readdirSync(mdFilesDir)
  .filter(file => file.endsWith('.md'))
  .map(file => basename(file));

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
  } catch (error) {
    console.error(`✗ Failed to build ${targetFile}`);
    process.exit(1);
  }
} else {
  // 没有参数，构建所有演示文稿
  console.log(`Found ${mdFiles.length} presentation(s) to build:\n`);
  mdFiles.forEach(file => console.log(`  - ${file}`));
  console.log('');

  mdFiles.forEach((file, index) => {
    const fileName = basename(file, '.md');
    console.log(`\n[${index + 1}/${mdFiles.length}] Building ${file}...`);
    try {
      execSync(`slidev build ${mdFilesDir}/${file} --out dist/${fileName}`, {
        stdio: 'inherit'
      });
      console.log(`✓ Successfully built ${file} to dist/${fileName}`);
    } catch (error) {
      console.error(`✗ Failed to build ${file}`);
      process.exit(1);
    }
  });

  console.log('\n✓ All presentations built successfully!');
}

