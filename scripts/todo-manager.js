#!/usr/bin/env node

/**
 * 🚀 GLOBAL TODO MANAGER
 * Universal todo list management system for PawfectMatch
 * Can be run from anywhere in the project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class GlobalTodoManager {
  constructor() {
    this.todoFile = path.join(__dirname, '..', 'TODO_GLOBAL.md');
    this.backupDir = path.join(__dirname, '..', '.todo-backups');
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // Create backup of current todo file
  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `todo-backup-${timestamp}.md`);
    fs.copyFileSync(this.todoFile, backupFile);
    console.log(`📁 Backup created: ${backupFile}`);
  }

  // Read current todo file
  readTodos() {
    try {
      return fs.readFileSync(this.todoFile, 'utf8');
    } catch (error) {
      console.error('❌ Error reading todo file:', error.message);
      return null;
    }
  }

  // Write updated todo file
  writeTodos(content) {
    try {
      this.createBackup();
      fs.writeFileSync(this.todoFile, content, 'utf8');
      console.log('✅ Todo file updated successfully');
    } catch (error) {
      console.error('❌ Error writing todo file:', error.message);
    }
  }

  // Add new task
  addTask(category, task, priority = 'medium') {
    const content = this.readTodos();
    if (!content) return;

    const priorityEmoji = {
      high: '🔥',
      medium: '⚡',
      low: '🌟'
    };

    const newTask = `- [ ] **${task}** - ${priorityEmoji[priority]} ${priority.toUpperCase()} PRIORITY`;
    
    // Find the category section and add task
    const categoryRegex = new RegExp(`(### \\*\\*${category}\\*\\*[\\s\\S]*?)(###|##|$)`, 'i');
    const match = content.match(categoryRegex);
    
    if (match) {
      const updatedContent = content.replace(
        categoryRegex,
        `$1\n${newTask}\n\n$2`
      );
      this.writeTodos(updatedContent);
      console.log(`✅ Added task to ${category}: ${task}`);
    } else {
      console.log(`❌ Category "${category}" not found`);
    }
  }

  // Mark task as complete
  completeTask(taskDescription) {
    const content = this.readTodos();
    if (!content) return;

    const updatedContent = content.replace(
      new RegExp(`- \\[ \\] \\*\\*${taskDescription}\\*\\*`, 'g'),
      `- [x] **${taskDescription}**`
    );

    this.writeTodos(updatedContent);
    console.log(`✅ Marked task as complete: ${taskDescription}`);
  }

  // Show current status
  showStatus() {
    const content = this.readTodos();
    if (!content) return;

    // Extract completed and pending tasks
    const completedTasks = (content.match(/- \[x\]/g) || []).length;
    const pendingTasks = (content.match(/- \[ \]/g) || []).length;
    const totalTasks = completedTasks + pendingTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    console.log('\n📊 TODO STATUS OVERVIEW');
    console.log('========================');
    console.log(`✅ Completed: ${completedTasks}`);
    console.log(`⏳ Pending: ${pendingTasks}`);
    console.log(`📈 Completion Rate: ${completionRate}%`);
    console.log(`🎯 Total Tasks: ${totalTasks}`);

    // Show recent activities
    console.log('\n🔥 HIGH PRIORITY TASKS');
    console.log('======================');
    const highPriorityTasks = content.match(/- \[ \] \*\*.*?\*\* - 🔥 HIGH PRIORITY/g) || [];
    highPriorityTasks.slice(0, 5).forEach(task => {
      console.log(`  ${task.replace(/- \[ \] \*\*|\*\* - 🔥 HIGH PRIORITY/g, '')}`);
    });

    console.log('\n⚡ MEDIUM PRIORITY TASKS');
    console.log('========================');
    const mediumPriorityTasks = content.match(/- \[ \] \*\*.*?\*\* - ⚡ MEDIUM PRIORITY/g) || [];
    mediumPriorityTasks.slice(0, 5).forEach(task => {
      console.log(`  ${task.replace(/- \[ \] \*\*|\*\* - ⚡ MEDIUM PRIORITY/g, '')}`);
    });
  }

  // Search tasks
  searchTasks(keyword) {
    const content = this.readTodos();
    if (!content) return;

    const lines = content.split('\n');
    const matchingTasks = lines.filter(line => 
      line.includes(keyword) && (line.includes('- [ ]') || line.includes('- [x]'))
    );

    console.log(`\n🔍 SEARCH RESULTS for "${keyword}"`);
    console.log('================================');
    matchingTasks.forEach(task => {
      const status = task.includes('- [x]') ? '✅' : '⏳';
      console.log(`  ${status} ${task.replace(/^- \[[ x]\] \*\*|\*\*/g, '')}`);
    });
  }

  // Generate progress report
  generateReport() {
    const content = this.readTodos();
    if (!content) return;

    const report = {
      timestamp: new Date().toISOString(),
      completed: (content.match(/- \[x\]/g) || []).length,
      pending: (content.match(/- \[ \]/g) || []).length,
      highPriority: (content.match(/- \[ \] \*\*.*?\*\* - 🔥 HIGH PRIORITY/g) || []).length,
      mediumPriority: (content.match(/- \[ \] \*\*.*?\*\* - ⚡ MEDIUM PRIORITY/g) || []).length,
      lowPriority: (content.match(/- \[ \] \*\*.*?\*\* - 🌟 LOW PRIORITY/g) || []).length,
    };

    const reportFile = path.join(__dirname, '..', 'todo-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`📊 Progress report generated: ${reportFile}`);
    return report;
  }

  // Quick add from command line
  quickAdd() {
    const args = process.argv.slice(3);
    if (args.length < 2) {
      console.log('Usage: node todo-manager.js add <category> <task> [priority]');
      console.log('Example: node todo-manager.js add "UI/UX TASKS" "Implement dark mode" high');
      return;
    }

    const [category, ...taskParts] = args;
    const task = taskParts.slice(0, -1).join(' ');
    const priority = taskParts[taskParts.length - 1] || 'medium';

    this.addTask(category, task, priority);
  }

  // Quick complete from command line
  quickComplete() {
    const taskDescription = process.argv.slice(3).join(' ');
    if (!taskDescription) {
      console.log('Usage: node todo-manager.js complete <task description>');
      return;
    }

    this.completeTask(taskDescription);
  }

  // Quick search from command line
  quickSearch() {
    const keyword = process.argv.slice(3).join(' ');
    if (!keyword) {
      console.log('Usage: node todo-manager.js search <keyword>');
      return;
    }

    this.searchTasks(keyword);
  }
}

// CLI Interface
const todoManager = new GlobalTodoManager();
const command = process.argv[2];

switch (command) {
  case 'status':
    todoManager.showStatus();
    break;
  case 'add':
    todoManager.quickAdd();
    break;
  case 'complete':
    todoManager.quickComplete();
    break;
  case 'search':
    todoManager.quickSearch();
    break;
  case 'report':
    todoManager.generateReport();
    break;
  case 'backup':
    todoManager.createBackup();
    break;
  default:
    console.log(`
🚀 PAWFECTMATCH GLOBAL TODO MANAGER

Usage: node scripts/todo-manager.js <command> [options]

Commands:
  status                    Show current todo status
  add <category> <task>     Add new task to category
  complete <task>           Mark task as complete
  search <keyword>          Search for tasks
  report                    Generate progress report
  backup                    Create backup of todo file

Examples:
  node scripts/todo-manager.js status
  node scripts/todo-manager.js add "UI/UX TASKS" "Implement dark mode" high
  node scripts/todo-manager.js complete "Implement dark mode"
  node scripts/todo-manager.js search "dark mode"
  node scripts/todo-manager.js report
    `);
}

module.exports = GlobalTodoManager;
