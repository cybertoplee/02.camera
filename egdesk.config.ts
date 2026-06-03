/**
 * EGDesk User Data Configuration
 * Generated at: 2026-06-03T10:03:29.653Z
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
    name: 'coupons',
    displayName: '할인 쿠폰 관리',
    rowCount: 11,
    columnCount: 8,
    columns: ['id', 'code', 'name', 'discount_type', 'discount_value', 'min_order_amount', 'status', 'created_at']
  } as TableDefinition,
  table2: {
    name: 'sync_activity_log',
    displayName: 'sync_activity_log',
    description: 'Imported from camera.sql',
    rowCount: 0,
    columnCount: 12,
    columns: ['id', 'config_id', 'file_name', 'file_path', 'status', 'rows_imported', 'rows_skipped', 'duplicates_skipped', 'error_message', 'started_at', 'completed_at', 'duration_ms']
  } as TableDefinition,
  table3: {
    name: 'sync_configurations',
    displayName: 'sync_configurations',
    description: 'Imported from camera.sql',
    rowCount: 0,
    columnCount: 24,
    columns: ['id', 'script_folder_path', 'script_name', 'folder_name', 'target_table_id', 'header_row', 'skip_bottom_rows', 'sheet_index', 'column_mappings', 'applied_splits', 'file_action', 'enabled', 'auto_sync_enabled', 'unique_key_columns', 'duplicate_action', 'last_sync_at', 'last_sync_status', 'last_sync_rows_imported', 'last_sync_rows_skipped', 'last_sync_duplicates', 'last_sync_error', 'created_at', 'updated_at', 'source']
  } as TableDefinition,
  table4: {
    name: 'user_data_files',
    displayName: 'user_data_files',
    description: 'Imported from camera.sql',
    rowCount: 0,
    columnCount: 15,
    columns: ['id', 'table_id', 'row_id', 'column_name', 'filename', 'mime_type', 'size_bytes', 'storage_type', 'file_data', 'file_path', 'is_compressed', 'compression_type', 'original_size', 'created_at', 'updated_at']
  } as TableDefinition,
  table5: {
    name: 'inventory_logs',
    displayName: '재고 변동 이력',
    rowCount: 0,
    columnCount: 10,
    columns: ['id', 'itemId', 'itemName', 'itemType', 'changeType', 'quantity', 'price', 'operator', 'note', 'createdAt']
  } as TableDefinition,
  table6: {
    name: 'inventory_items',
    displayName: '재고 품목',
    rowCount: 0,
    columnCount: 11,
    columns: ['id', 'type', 'name', 'category', 'price', 'partner', 'stock', 'safeStock', 'location', 'description', 'createdAt']
  } as TableDefinition,
  table7: {
    name: 'naver_blog_marketing_settings',
    displayName: '네이버 블로그 마케팅 설정',
    rowCount: 1,
    columnCount: 8,
    columns: ['id', 'is_autopilot', 'autopilot_interval', 'autopilot_time', 'tone_style', 'naver_blog_id', 'api_client_id', 'api_client_secret']
  } as TableDefinition,
  table8: {
    name: 'crm_naver_blog_posts',
    displayName: '네이버 블로그 포스팅 이력 및 예약',
    rowCount: 0,
    columnCount: 13,
    columns: ['id', 'product_id', 'status', 'title', 'content', 'target_keywords', 'image_url', 'sub_image_url', 'scheduled_at', 'posted_at', 'error_message', 'views_count', 'likes_count']
  } as TableDefinition,
  table9: {
    name: 'instagram_marketing_settings',
    displayName: '인스타그램 마케팅 설정',
    rowCount: 1,
    columnCount: 7,
    columns: ['id', 'is_autopilot', 'autopilot_interval', 'autopilot_time', 'tone_style', 'instagram_username', 'access_token']
  } as TableDefinition,
  table10: {
    name: 'crm_instagram_posts',
    displayName: '인스타그램 포스팅 이력 및 예약',
    rowCount: 0,
    columnCount: 10,
    columns: ['id', 'product_id', 'status', 'content', 'image_url', 'scheduled_at', 'posted_at', 'error_message', 'likes_count', 'comments_count']
  } as TableDefinition,
  table11: {
    name: 'crm_operators',
    displayName: '운영자 권한 관리',
    rowCount: 4,
    columnCount: 6,
    columns: ['id', 'username', 'password_hash', 'name', 'role', 'created_at']
  } as TableDefinition,
  table12: {
    name: 'system_settings',
    displayName: '시스템 설정',
    rowCount: 2,
    columnCount: 3,
    columns: ['id', 'key', 'value']
  } as TableDefinition,
  table13: {
    name: 'crm_deliveries',
    displayName: '배송 내역',
    rowCount: 1,
    columnCount: 8,
    columns: ['id', 'customer_name', 'customer_phone', 'address', 'courier', 'tracking_number', 'status', 'order_id']
  } as TableDefinition,
  table14: {
    name: 'crm_reservations',
    displayName: '예약 내역',
    rowCount: 1,
    columnCount: 7,
    columns: ['id', 'customer_name', 'customer_phone', 'service_name', 'reservation_date', 'reservation_time', 'status']
  } as TableDefinition,
  table15: {
    name: 'crm_payments',
    displayName: '결제 내역',
    rowCount: 1,
    columnCount: 7,
    columns: ['id', 'customer_name', 'payment_method', 'amount', 'payment_date', 'status', 'order_id']
  } as TableDefinition,
  table16: {
    name: 'crm_orders',
    displayName: '주문 내역',
    rowCount: 1,
    columnCount: 13,
    columns: ['id', 'customer_name', 'customer_phone', 'product_name', 'quantity', 'total_price', 'delivery_method', 'shipping_address', 'tracking_number', 'attachment_url', 'customer_memo', 'order_date', 'status']
  } as TableDefinition,
  table17: {
    name: 'crm_transactions',
    displayName: '거래 내역',
    rowCount: 1,
    columnCount: 8,
    columns: ['id', 'customer_name', 'customer_phone', 'product_name', 'amount', 'order_date', 'status', 'order_id']
  } as TableDefinition,
  table18: {
    name: 'products',
    displayName: '광고 상품',
    rowCount: 2,
    columnCount: 10,
    columns: ['id', 'name', 'price', 'url', 'description', 'main_image_url', 'detail_image_url', 'available_methods', 'category', 'menu_category']
  } as TableDefinition,
  table19: {
    name: 'ad_templates',
    displayName: '광고 템플릿',
    rowCount: 0,
    columnCount: 5,
    columns: ['id', 'name', 'header', 'footer', 'opt_out']
  } as TableDefinition,
  table20: {
    name: 'message_logs',
    displayName: '발송 내역',
    rowCount: 22,
    columnCount: 6,
    columns: ['id', 'customer_id', 'phone', 'message', 'status', 'created_at']
  } as TableDefinition,
  table21: {
    name: 'message_templates',
    displayName: '문자 템플릿',
    rowCount: 0,
    columnCount: 3,
    columns: ['id', 'title', 'content']
  } as TableDefinition,
  table22: {
    name: 'crm_customers',
    displayName: '고객 명단',
    rowCount: 9,
    columnCount: 10,
    columns: ['id', 'name', 'phone', 'tags', 'memo', 'address', 'shipping_address', 'recipient_name', 'recipient_phone', 'created_at']
  } as TableDefinition,
  table23: {
    name: 'tkd_system_settings',
    displayName: '태권도 시스템 설정',
    rowCount: 5,
    columnCount: 3,
    columns: ['id', 'key', 'value']
  } as TableDefinition,
  table24: {
    name: 'custom_fields',
    displayName: '사용자 정의 필드',
    rowCount: 0,
    columnCount: 3,
    columns: ['id', 'field_name', 'display_name']
  } as TableDefinition,
  table25: {
    name: 'student_classes',
    displayName: '반 관리',
    rowCount: 4,
    columnCount: 2,
    columns: ['id', 'name']
  } as TableDefinition,
  table26: {
    name: 'payment_records',
    displayName: '수납 기록',
    rowCount: 0,
    columnCount: 6,
    columns: ['id', 'student_id', 'amount', 'payment_date', 'depositor_name', 'status']
  } as TableDefinition,
  table27: {
    name: 'attendance_logs',
    displayName: '출결 기록',
    rowCount: 24,
    columnCount: 6,
    columns: ['id', 'student_id', 'timestamp', 'type', 'status', 'sms_status']
  } as TableDefinition,
  table28: {
    name: 'students',
    displayName: '학생 명단',
    rowCount: 7,
    columnCount: 10,
    columns: ['id', 'name', 'parent_name', 'parent_phone', 'birth_date', 'rank', 'memo', 'face_vector', 'profile_image', 'class_id']
  } as TableDefinition,
  table29: {
    name: 'classes',
    displayName: '수업 정보',
    rowCount: 0,
    columnCount: 4,
    columns: ['id', 'name', 'start_time', 'end_time']
  } as TableDefinition,
  table30: {
    name: 'tkd_usage_logs',
    displayName: '사용량 통계 로그',
    rowCount: 3,
    columnCount: 4,
    columns: ['id', 'type', 'timestamp', 'student_id']
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
  table1: 'coupons',
  table2: 'sync_activity_log',
  table3: 'sync_configurations',
  table4: 'user_data_files',
  table5: 'inventory_logs',
  table6: 'inventory_items',
  table7: 'naver_blog_marketing_settings',
  table8: 'crm_naver_blog_posts',
  table9: 'instagram_marketing_settings',
  table10: 'crm_instagram_posts',
  table11: 'crm_operators',
  table12: 'system_settings',
  table13: 'crm_deliveries',
  table14: 'crm_reservations',
  table15: 'crm_payments',
  table16: 'crm_orders',
  table17: 'crm_transactions',
  table18: 'products',
  table19: 'ad_templates',
  table20: 'message_logs',
  table21: 'message_templates',
  table22: 'crm_customers',
  table23: 'tkd_system_settings',
  table24: 'custom_fields',
  table25: 'student_classes',
  table26: 'payment_records',
  table27: 'attendance_logs',
  table28: 'students',
  table29: 'classes',
  table30: 'tkd_usage_logs'
} as const;
