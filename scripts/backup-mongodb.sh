#!/bin/bash

################################################################################
# MongoDB Backup Script for PawfectMatch
# 
# Features:
# - Creates compressed MongoDB dumps
# - Maintains last N days of backups
# - Optional S3 upload
# - Logging and error handling
#
# Usage: ./scripts/backup-mongodb.sh
################################################################################

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups/mongodb}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="pawfectmatch_backup_${DATE}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

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

# Load environment variables
if [ -f "$(dirname "$0")/../server/.env" ]; then
    source "$(dirname "$0")/../server/.env"
    log_info "Loaded environment variables"
else
    log_error ".env file not found"
    exit 1
fi

# Check if mongodump is installed
if ! command -v mongodump &> /dev/null; then
    log_error "mongodump is not installed. Please install MongoDB Database Tools."
    log_error "Visit: https://www.mongodb.com/try/download/database-tools"
    exit 1
fi

# Create backup directory
mkdir -p "${BACKUP_DIR}"

log_info "======================================================================"
log_info "MongoDB Backup Started"
log_info "======================================================================"
log_info "Date: $(date)"
log_info "Backup directory: ${BACKUP_DIR}"
log_info "Backup name: ${BACKUP_NAME}"
log_info ""

# Perform backup
log_info "Creating MongoDB dump..."

if mongodump --uri="${MONGODB_URI}" --out="${BACKUP_PATH}" --gzip; then
    log_info "✅ MongoDB dump created successfully"
    
    # Get backup size
    BACKUP_SIZE=$(du -sh "${BACKUP_PATH}" | cut -f1)
    log_info "Backup size: ${BACKUP_SIZE}"
else
    log_error "❌ MongoDB dump failed"
    exit 1
fi

# Create compressed archive
log_info "Creating compressed archive..."
cd "${BACKUP_DIR}" || exit 1

if tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"; then
    log_info "✅ Archive created: ${BACKUP_NAME}.tar.gz"
    
    # Remove uncompressed backup
    rm -rf "${BACKUP_NAME}"
    
    ARCHIVE_SIZE=$(du -sh "${BACKUP_NAME}.tar.gz" | cut -f1)
    log_info "Archive size: ${ARCHIVE_SIZE}"
else
    log_error "❌ Archive creation failed"
    exit 1
fi

# Upload to S3 (if configured)
if [ -n "${AWS_S3_BUCKET}" ] && command -v aws &> /dev/null; then
    log_info "Uploading to S3..."
    
    S3_PATH="s3://${AWS_S3_BUCKET}/mongodb-backups/${BACKUP_NAME}.tar.gz"
    
    if aws s3 cp "${BACKUP_NAME}.tar.gz" "${S3_PATH}"; then
        log_info "✅ Uploaded to S3: ${S3_PATH}"
    else
        log_warn "⚠️  S3 upload failed (continuing anyway)"
    fi
else
    log_warn "S3 upload skipped (AWS_S3_BUCKET not configured or aws CLI not installed)"
fi

# Clean up old backups
log_info "Cleaning up old backups (keeping last ${RETENTION_DAYS} days)..."

DELETED_COUNT=0
for backup in $(find "${BACKUP_DIR}" -name "pawfectmatch_backup_*.tar.gz" -type f -mtime +${RETENTION_DAYS}); do
    log_info "Deleting old backup: $(basename "$backup")"
    rm -f "$backup"
    ((DELETED_COUNT++))
done

if [ ${DELETED_COUNT} -gt 0 ]; then
    log_info "Deleted ${DELETED_COUNT} old backup(s)"
else
    log_info "No old backups to delete"
fi

# List current backups
log_info ""
log_info "Current backups:"
ls -lh "${BACKUP_DIR}"/pawfectmatch_backup_*.tar.gz 2>/dev/null | awk '{print "  " $9, "(" $5 ")"}'

log_info ""
log_info "======================================================================"
log_info "Backup completed successfully!"
log_info "======================================================================"
log_info "Backup file: ${BACKUP_NAME}.tar.gz"
log_info "Location: ${BACKUP_DIR}"

exit 0

