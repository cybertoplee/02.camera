/**
 * EGDesk User Data Configuration
 * Generated at: 2026-05-14T10:03:52.591Z
 *
 * This file contains type-safe definitions for your EGDesk tables.
 */

export const EGDESK_CONFIG = {
  apiUrl: 'http://localhost:8080',
  apiKey: 'a67ddc0f-7e2b-4997-9a0b-9667a74c89d0',
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
    name: 'student_classes',
    displayName: '반 관리',
    rowCount: 4,
    columnCount: 2,
    columns: ['id', 'name']
  } as TableDefinition,
  table2: {
    name: 'payment_records',
    displayName: '수납 기록',
    rowCount: 0,
    columnCount: 6,
    columns: ['id', 'student_id', 'amount', 'payment_date', 'depositor_name', 'status']
  } as TableDefinition,
  table3: {
    name: 'attendance_logs',
    displayName: '출결 기록',
    rowCount: 0,
    columnCount: 5,
    columns: ['id', 'student_id', 'timestamp', 'type', 'status']
  } as TableDefinition,
  table4: {
    name: 'students',
    displayName: '학생 명단',
    rowCount: 1,
    columnCount: 10,
    columns: ['id', 'name', 'parent_name', 'parent_phone', 'birth_date', 'rank', 'memo', 'face_vector', 'profile_image', 'class_id']
  } as TableDefinition,
  table5: {
    name: 'classes',
    displayName: '수업 정보',
    rowCount: 0,
    columnCount: 4,
    columns: ['id', 'name', 'start_time', 'end_time']
  } as TableDefinition,
  table6: {
    name: 'custom_fields',
    displayName: '사용자 정의 항목',
    rowCount: 0,
    columnCount: 3,
    columns: ['id', 'field_name', 'display_name']
  } as TableDefinition,
  table7: {
    name: 'test_like',
    displayName: 'Test Table',
    rowCount: 1,
    columnCount: 2,
    columns: ['id', 'val']
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
  table1: 'student_classes',
  table2: 'payment_records',
  table3: 'attendance_logs',
  table4: 'students',
  table5: 'classes',
  table6: 'custom_fields',
  table7: 'test_like'
} as const;
