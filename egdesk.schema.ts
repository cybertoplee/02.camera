/**
 * egdesk.schema.ts — committed seed schema
 *
 * COMMIT THIS FILE TO GIT.
 *
 * When someone opens this project in their EGDesk, these tables are created
 * automatically in their dev database on first server start.
 *
 * Unlike egdesk.config.ts (auto-generated, gitignored), this file is the
 * portable source of truth for your app's database structure.
 *
 * Edit this file when you add/remove tables or columns. Do NOT edit
 * egdesk.config.ts — EGDesk regenerates it from the live database.
 */

export const TABLES = {
  user_feedbacks: {
    name: 'user_feedbacks',
    displayName: '사용자 피드백 및 버그 제보',
    columns: ['user_prompt', 'detected_type', 'current_url', 'resolved_status', 'created_at'],
    columnCount: 5,
    rowCount: 0,
  },
  sync_activity_log: {
    name: 'sync_activity_log',
    displayName: 'sync_activity_log',
    columns: ['config_id', 'file_name', 'file_path', 'status', 'rows_imported', 'rows_skipped', 'duplicates_skipped', 'error_message', 'started_at', 'completed_at', 'duration_ms'],
    columnCount: 11,
    rowCount: 0,
  },
  sync_configurations: {
    name: 'sync_configurations',
    displayName: 'sync_configurations',
    columns: ['script_folder_path', 'script_name', 'folder_name', 'target_table_id', 'header_row', 'skip_bottom_rows', 'sheet_index', 'column_mappings', 'applied_splits', 'file_action', 'enabled', 'auto_sync_enabled', 'unique_key_columns', 'duplicate_action', 'last_sync_at', 'last_sync_status', 'last_sync_rows_imported', 'last_sync_rows_skipped', 'last_sync_duplicates', 'last_sync_error', 'created_at', 'updated_at', 'source'],
    columnCount: 23,
    rowCount: 0,
  },
  user_data_files: {
    name: 'user_data_files',
    displayName: 'user_data_files',
    columns: ['table_id', 'row_id', 'column_name', 'filename', 'mime_type', 'size_bytes', 'storage_type', 'file_data', 'file_path', 'is_compressed', 'compression_type', 'original_size', 'created_at', 'updated_at'],
    columnCount: 14,
    rowCount: 0,
  },
  cctv_events: {
    name: 'cctv_events',
    displayName: 'CCTV 이상 감지',
    columns: ['timestamp', 'type', 'snapshot', 'video_url'],
    columnCount: 4,
    rowCount: 0,
  },
  cctv_records: {
    name: 'cctv_records',
    displayName: 'CCTV 녹화 기록',
    columns: ['date', 'filename', 'size', 'url'],
    columnCount: 4,
    rowCount: 0,
  },
  tkd_usage_logs: {
    name: 'tkd_usage_logs',
    displayName: '사용량 통계 로그',
    columns: ['type', 'timestamp', 'student_id'],
    columnCount: 3,
    rowCount: 0,
  },
  tkd_system_settings: {
    name: 'tkd_system_settings',
    displayName: '태권도 시스템 설정',
    columns: ['key', 'value'],
    columnCount: 2,
    rowCount: 0,
  },
  custom_fields: {
    name: 'custom_fields',
    displayName: '사용자 정의 필드',
    columns: ['field_name', 'display_name'],
    columnCount: 2,
    rowCount: 0,
  },
  student_classes: {
    name: 'student_classes',
    displayName: '반 관리',
    columns: ['name'],
    columnCount: 1,
    rowCount: 0,
  },
  payment_records: {
    name: 'payment_records',
    displayName: '수납 기록',
    columns: ['student_id', 'amount', 'payment_date', 'depositor_name', 'status'],
    columnCount: 5,
    rowCount: 0,
  },
  attendance_logs: {
    name: 'attendance_logs',
    displayName: '출결 기록',
    columns: ['student_id', 'timestamp', 'type', 'status', 'sms_status'],
    columnCount: 5,
    rowCount: 0,
  },
  students: {
    name: 'students',
    displayName: '학생 명단',
    columns: ['name', 'parent_name', 'parent_phone', 'birth_date', 'rank', 'memo', 'face_vector', 'profile_image', 'class_id', 'status', 'receive_sms_in', 'receive_sms_out'],
    columnCount: 12,
    rowCount: 0,
  },
  classes: {
    name: 'classes',
    displayName: '수업 정보',
    columns: ['name', 'start_time', 'end_time'],
    columnCount: 3,
    rowCount: 0,
  }
} as const;

export type TableName = keyof typeof TABLES;
export const TABLE_NAMES = Object.keys(TABLES) as TableName[];
