import React from 'react';
import { executeSQL, queryTable } from '@root/egdesk-helpers';
import ClientAttendanceLogs from './ClientAttendanceLogs';

import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function MobileAttendancePage() {
  noStore();
  let formattedLogs = [];
  let allStudents = [];
  let error = null;

  try {
    const classesRes = await queryTable('student_classes');
    const cmap: Record<number, string> = {};
    if (classesRes && classesRes.rows) {
      classesRes.rows.forEach((cls: any) => {
        cmap[cls.id] = cls.name;
      });
    }

    const studentsRes = await queryTable('students');
    allStudents = studentsRes?.rows || [];
    const studentMap = new Map<number, any>(allStudents.map((s: any) => [s.id, s]));

    const today = new Date();
    // Use local time instead of UTC to avoid timezone issues.
    // For Korea, UTC+9.
    const tzOffset = 9 * 60 * 60000;
    const localDate = new Date(today.getTime() + tzOffset);
    const todayStr = `${localDate.getUTCFullYear()}-${String(localDate.getUTCMonth() + 1).padStart(2, '0')}-${String(localDate.getUTCDate()).padStart(2, '0')}`;

    const logsRes = await executeSQL(`
      SELECT * FROM attendance_logs 
      WHERE timestamp LIKE '${todayStr}%' 
      ORDER BY id DESC
    `);

    formattedLogs = (logsRes?.rows || []).map((log: any) => {
      const student = studentMap.get(log.student_id);
      return {
        ...log,
        student_name: student?.name || `ID: ${log.student_id}`,
        class_name: student ? (cmap[student.class_id] || '') : '',
        parent_phone: student?.parent_phone || ''
      };
    });

    if (!logsRes?.rows) {
      console.error('DEBUG: logsRes.rows is undefined! logsRes is:', logsRes);
      error = '디버그: logsRes.rows가 없습니다.';
    }

  } catch (err: any) {
    console.error('Failed to fetch attendance logs for mobile page:', err);
    error = '데이터를 불러오는 중 오류가 발생했습니다.';
  }

  return <ClientAttendanceLogs initialLogs={formattedLogs} allStudents={allStudents} error={error} />;
}
