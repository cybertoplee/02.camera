/**
 * EGDesk User Data Configuration
 * Generated at: 2026-05-19T12:13:38.541Z
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
    name: 'platform_master_db',
    displayName: 'DB보험설계사 문제은행 플랫폼',
    rowCount: 401,
    columnCount: 23,
    columns: ['id', 'license_id', 'license_name', 'total_questions', 'time_limit_min', 'pass_score', 'subject_id', 'part_name', 'subject_title', 'exam_id', 'round_number', 'exam_type', 'question_id', 'question_num', 'passage_text', 'question_text', 'option_1', 'option_2', 'option_3', 'option_4', 'correct_answer', 'explanation', 'difficulty']
  } as TableDefinition,
  table2: {
    name: 'user_db',
    displayName: 'MEM보험설계사 문제은행 플랫폼',
    rowCount: 21,
    columnCount: 9,
    columns: ['id', 'user_id', 'password', 'name', 'email', 'phone', 'role', 'score1', 'created_at']
  } as TableDefinition,
  table3: {
    name: 'tax_payroll_ledger',
    displayName: 'DB금계산서TAXAI',
    rowCount: 2,
    columnCount: 12,
    columns: ['id', '데이터ID', '성명', '부서', '지급액_과세', '지급액_비과세', '국민연금', '건강보험', '고용보험', '소득세', '지방소득세', '실수령액']
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
  table1: 'platform_master_db',
  table2: 'user_db',
  table3: 'tax_payroll_ledger'
} as const;
