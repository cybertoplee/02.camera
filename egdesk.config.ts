/**
 * EGDesk User Data Configuration
 * Generated at: 2026-06-16T11:14:29.803Z
 *
 * This file contains type-safe definitions for your EGDesk tables.
 */

export const EGDESK_CONFIG = {
  apiUrl: 'http://localhost:8080',
  apiKey: '7e708c6b-333b-4442-a13c-6bfe50f3389b',
} as const;

export interface TableDefinition {
  name: string;
  displayName: string;
  description?: string;
  /** Omitted or unknown until synced / counted */
  rowCount?: number;
  columnCount: number;
  columns: string[];
}

export const TABLES = {
  table1: {
    name: 'classes',
    displayName: '수업 정보',
    rowCount: 0,
    columnCount: 4,
    columns: ['id', 'name', 'start_time', 'end_time']
  } as TableDefinition,
  table2: {
    name: 'students',
    displayName: '학생 명단',
    rowCount: 0,
    columnCount: 13,
    columns: ['id', 'name', 'parent_name', 'parent_phone', 'birth_date', 'rank', 'memo', 'face_vector', 'profile_image', 'class_id', 'status', 'receive_sms_in', 'receive_sms_out']
  } as TableDefinition,
  table3: {
    name: 'attendance_logs',
    displayName: '출결 기록',
    rowCount: 0,
    columnCount: 6,
    columns: ['id', 'student_id', 'timestamp', 'type', 'status', 'sms_status']
  } as TableDefinition,
  table4: {
    name: 'payment_records',
    displayName: '수납 기록',
    rowCount: 0,
    columnCount: 6,
    columns: ['id', 'student_id', 'amount', 'payment_date', 'depositor_name', 'status']
  } as TableDefinition,
  table5: {
    name: 'student_classes',
    displayName: '반 관리',
    rowCount: 0,
    columnCount: 2,
    columns: ['id', 'name']
  } as TableDefinition,
  table6: {
    name: 'custom_fields',
    displayName: '사용자 정의 필드',
    rowCount: 0,
    columnCount: 3,
    columns: ['id', 'field_name', 'display_name']
  } as TableDefinition,
  table7: {
    name: 'tkd_system_settings',
    displayName: '태권도 시스템 설정',
    rowCount: 0,
    columnCount: 3,
    columns: ['id', 'key', 'value']
  } as TableDefinition,
  table8: {
    name: 'tkd_usage_logs',
    displayName: '사용량 통계 로그',
    rowCount: 0,
    columnCount: 4,
    columns: ['id', 'type', 'timestamp', 'student_id']
  } as TableDefinition,
  table9: {
    name: 'cctv_records',
    displayName: 'CCTV 녹화 기록',
    rowCount: 0,
    columnCount: 5,
    columns: ['id', 'date', 'filename', 'size', 'url']
  } as TableDefinition,
  table10: {
    name: 'cctv_events',
    displayName: 'CCTV 이상 감지',
    rowCount: 0,
    columnCount: 5,
    columns: ['id', 'timestamp', 'type', 'snapshot', 'video_url']
  } as TableDefinition,
  table11: {
    name: 'user_data_files',
    displayName: 'user_data_files',
    rowCount: 0,
    columnCount: 15,
    columns: ['id', 'table_id', 'row_id', 'column_name', 'filename', 'mime_type', 'size_bytes', 'storage_type', 'file_data', 'file_path', 'is_compressed', 'compression_type', 'original_size', 'created_at', 'updated_at']
  } as TableDefinition,
  table12: {
    name: 'sync_configurations',
    displayName: 'sync_configurations',
    rowCount: 0,
    columnCount: 24,
    columns: ['id', 'script_folder_path', 'script_name', 'folder_name', 'target_table_id', 'header_row', 'skip_bottom_rows', 'sheet_index', 'column_mappings', 'applied_splits', 'file_action', 'enabled', 'auto_sync_enabled', 'unique_key_columns', 'duplicate_action', 'last_sync_at', 'last_sync_status', 'last_sync_rows_imported', 'last_sync_rows_skipped', 'last_sync_duplicates', 'last_sync_error', 'created_at', 'updated_at', 'source']
  } as TableDefinition,
  table13: {
    name: 'sync_activity_log',
    displayName: 'sync_activity_log',
    rowCount: 0,
    columnCount: 12,
    columns: ['id', 'config_id', 'file_name', 'file_path', 'status', 'rows_imported', 'rows_skipped', 'duplicates_skipped', 'error_message', 'started_at', 'completed_at', 'duration_ms']
  } as TableDefinition,
  table14: {
    name: 'user_feedbacks',
    displayName: '사용자 피드백 및 버그 제보',
    rowCount: 0,
    columnCount: 6,
    columns: ['id', 'user_prompt', 'detected_type', 'current_url', 'resolved_status', 'created_at']
  } as TableDefinition
} as const;


// Main table (first table by default)
export const MAIN_TABLE = TABLES.table1;


// Helper to get table by name
export function getTableByName(tableName: string): TableDefinition | undefined {
  return Object.values(TABLES).find(t => t.name === tableName);
}

// Export table names for easy access
export const TABLE_NAMES = {
  table1: 'classes',
  table2: 'students',
  table3: 'attendance_logs',
  table4: 'payment_records',
  table5: 'student_classes',
  table6: 'custom_fields',
  table7: 'tkd_system_settings',
  table8: 'tkd_usage_logs',
  table9: 'cctv_records',
  table10: 'cctv_events',
  table11: 'user_data_files',
  table12: 'sync_configurations',
  table13: 'sync_activity_log',
  table14: 'user_feedbacks'
} as const;
