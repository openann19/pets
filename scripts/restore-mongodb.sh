#!/bin/bash

################################################################################
# MongoDB Restore Script for PawfectMatch
# 
# Usage: 
#   ./scripts/restore-mongodb.sh <backup_file>
#   ./scripts/restore-mongodb.sh pawfectmatch_backup_20251003_120000.tar.gz
################################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check arguments
if [ -z "$1" ]; then
    log_error "Usage: $0 <backup_file>"
    log_error "Example: $0 pawfectmatch_backup_20251003_120000.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"
BACKUP_DIR="${BACKUP_DIR:-/backups/mongodb}"
TEMP_DIR="/tmp/mongodb_restore_$$"

# Load environment variables
if [ -f "$(dirname "$0")/../server/.env" ]; then
    source "$(dirname "$0")/../server/.env"
    log_info "Loaded environment variables"
else
    log_error ".env file not found"
    exit 1
fi

# Check if mongorestore is installed
if ! command -v mongorestore &> /dev/null; then
    log_error "mongorestore is not installed. Please install MongoDB Database Tools."
    log_error "Visit: https://www.mongodb.com/try/download/database-tools"
    exit 1
fi

# Find backup file
if [ -f "${BACKUP_FILE}" ]; then
    BACKUP_PATH="${BACKUP_FILE}"
elif [ -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
    BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
else
    log_error "Backup file not found: ${BACKUP_FILE}"
    log_error "Looked in:"
    log_error "  - ${BACKUP_FILE}"
    log_error "  - ${BACKUP_DIR}/${BACKUP_FILE}"
    exit 1
fi

log_info "======================================================================"
log_info "MongoDB Restore Started"
log_info "======================================================================"
log_info "Date: $(date)"
log_info "Backup file: ${BACKUP_PATH}"
log_info ""

# Confirmation prompt (safety check)
log_warn "⚠️  WARNING: This will REPLACE the current database!"
log_warn "Database: ${MONGODB_URI}"
read -p "Are you sure you want to continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    log_info "Restore cancelled"
    exit 0
fi

# Create temporary directory
mkdir -p "${TEMP_DIR}"

# Extract backup
log_info "Extracting backup archive..."
if tar -xzf "${BACKUP_PATH}" -C "${TEMP_DIR}"; then
    log_info "✅ Archive extracted"
else
    log_error "❌ Failed to extract archive"
    rm -rf "${TEMP_DIR}"
    exit 1
fi

# Find the backup directory
BACKUP_DATA_DIR=$(find "${TEMP_DIR}" -type d -name "pawfectmatch*" | head -1)

if [ -z "${BACKUP_DATA_DIR}" ]; then
    log_error "Backup data directory not found in archive"
    rm -rf "${TEMP_DIR}"
    exit 1
fi

# Perform restore
log_info "Restoring MongoDB from backup..."
log_info "This may take a few minutes..."

if mongorestore --uri="${MONGODB_URI}" --gzip --drop "${BACKUP_DATA_DIR}"; then
    log_info "✅ MongoDB restored successfully"
else
    log_error "❌ MongoDB restore failed"
    rm -rf "${TEMP_DIR}"
    exit 1
fi

# Cleanup
log_info "Cleaning up temporary files..."
rm -rf "${TEMP_DIR}"

log_info ""
log_info "======================================================================"
log_info "Restore completed successfully!"
log_info "======================================================================"

exit 0

