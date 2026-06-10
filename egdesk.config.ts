/**
 * EGDesk User Data Configuration
 * Generated at: 2026-06-10T08:13:30.749Z
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
    name: 'tkd_usage_logs',
    displayName: '사용량 통계 로그',
    rowCount: 0,
    columnCount: 4,
    columns: ['id', 'type', 'timestamp', 'student_id']
  } as TableDefinition,
  table2: {
    name: 'tkd_system_settings',
    displayName: '태권도 시스템 설정',
    rowCount: 5,
    columnCount: 3,
    columns: ['id', 'key', 'value']
  } as TableDefinition,
  table3: {
    name: 'custom_fields',
    displayName: '사용자 정의 필드',
    rowCount: 0,
    columnCount: 3,
    columns: ['id', 'field_name', 'display_name']
  } as TableDefinition,
  table4: {
    name: 'student_classes',
    displayName: '반 관리',
    rowCount: 4,
    columnCount: 2,
    columns: ['id', 'name']
  } as TableDefinition,
  table5: {
    name: 'payment_records',
    displayName: '수납 기록',
    rowCount: 15,
    columnCount: 6,
    columns: ['id', 'student_id', 'amount', 'payment_date', 'depositor_name', 'status']
  } as TableDefinition,
  table6: {
    name: 'attendance_logs',
    displayName: '출결 기록',
    rowCount: 0,
    columnCount: 6,
    columns: ['id', 'student_id', 'timestamp', 'type', 'status', 'sms_status']
  } as TableDefinition,
  table7: {
    name: 'students',
    displayName: '학생 명단',
    rowCount: 3,
    columnCount: 13,
    columns: ['id', 'name', 'parent_name', 'parent_phone', 'birth_date', 'rank', 'memo', 'face_vector', 'profile_image', 'class_id', 'status', 'receive_sms_in', 'receive_sms_out']
  } as TableDefinition,
  table8: {
    name: 'classes',
    displayName: '수업 정보',
    rowCount: 0,
    columnCount: 4,
    columns: ['id', 'name', 'start_time', 'end_time']
  } as TableDefinition,
  table9: {
    name: 'cctv_events',
    displayName: 'CCTV 이벤트 로그',
    rowCount: 0,
    columnCount: 5,
    columns: ['id', 'timestamp', 'type', 'snapshot', 'video_url']
  } as TableDefinition,
  table10: {
    name: 'cctv_records',
    displayName: 'CCTV 녹화 기록',
    rowCount: 2,
    columnCount: 5,
    columns: ['id', 'date', 'filename', 'size', 'url']
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
  table1: 'tkd_usage_logs',
  table2: 'tkd_system_settings',
  table3: 'custom_fields',
  table4: 'student_classes',
  table5: 'payment_records',
  table6: 'attendance_logs',
  table7: 'students',
  table8: 'classes',
  table9: 'cctv_events',
  table10: 'cctv_records'
} as const;
