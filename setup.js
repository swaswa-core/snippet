// This script helps with the initial setup process
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

/**
 * Execute a command and return its output
 */
function executeCommand(command) {
    try {
        return execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Failed to execute command: ${command}`);
        throw error;
    }
}

/**
 * Check if a file exists
 */
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

/**
 * Main setup process
 */
async function setup() {
    console.log(`\n${colors.cyan}=== Snippet Manager Setup ===${colors.reset}\n`);

    // Check if .env file exists
    if (!fileExists('.env')) {
        console.log(`${colors.yellow}Creating .env file...${colors.reset}`);
        fs.writeFileSync('.env', 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/octavix_db?schema=public"');
        console.log(`${colors.green}✓ .env file created${colors.reset}`);
    } else {
        console.log(`${colors.green}✓ .env file already exists${colors.reset}`);
    }

    // Install dependencies
    console.log(`\n${colors.yellow}Installing dependencies...${colors.reset}`);
    executeCommand('npm install --legacy-peer-deps');
    console.log(`${colors.green}✓ Dependencies installed${colors.reset}`);

    // Check if Docker is running
    console.log(`\n${colors.yellow}Checking Docker status...${colors.reset}`);
    try {
        executeCommand('docker info > /dev/null 2>&1');
        console.log(`${colors.green}✓ Docker is running${colors.reset}`);

        // Start the PostgreSQL container
        console.log(`\n${colors.yellow}Starting PostgreSQL containers...${colors.reset}`);
        executeCommand('docker-compose up -d');
        console.log(`${colors.green}✓ PostgreSQL containers started${colors.reset}`);

        // Wait for PostgreSQL to be ready
        console.log(`\n${colors.yellow}Waiting for PostgreSQL to be ready...${colors.reset}`);
        // Sleep for 5 seconds to ensure PostgreSQL is running
        await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (error) {
        console.log(`${colors.magenta}⚠ Docker check failed. Please make sure Docker is running.${colors.reset}`);
        console.log(`${colors.magenta}⚠ You can manually start the PostgreSQL container with: docker-compose up -d${colors.reset}`);
    }

    // Generate Prisma client
    console.log(`\n${colors.yellow}Generating Prisma client...${colors.reset}`);
    executeCommand('npx prisma generate');
    console.log(`${colors.green}✓ Prisma client generated${colors.reset}`);

    // Deploy database schema
    console.log(`\n${colors.yellow}Deploying database schema...${colors.reset}`);
    try {
        executeCommand('npx prisma db push');
        console.log(`${colors.green}✓ Database schema deployed${colors.reset}`);
    } catch (error) {
        console.log(`${colors.magenta}⚠ Database schema deployment failed.${colors.reset}`);
        console.log(`${colors.magenta}⚠ Please make sure PostgreSQL is running and accessible.${colors.reset}`);
    }

    console.log(`\n${colors.cyan}Setup completed! Start the application with: npm run dev${colors.reset}\n`);
}

// Run the setup process
setup().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
});