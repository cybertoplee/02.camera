'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { queryTable, aggregateTable, executeSQL } from '@root/egdesk-helpers';
import { Users, CheckCircle2, CreditCard, ClipboardList } from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    unmatchedPayments: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const todayStr = new Date().toLocaleDateString('en-CA');
        const safeQuery = async (table: string, opts: any = {}) => {
          try { return await queryTable(table, opts); } 
          catch (e) { return { total: 0, rows: [] }; }
        };
        const [studentsRes, attendanceRes, paymentsRes] = await Promise.all([
          safeQuery('students', { limit: 1 }),
          safeQuery('attendance_logs', { filters: { timestamp: todayStr }, limit: 1 }),
          safeQuery('payment_records', { filters: { status: 'UNMATCHED' }, limit: 1 })
        ]);
        const [logsRes, studentsListRes] = await Promise.all([
          safeQuery('attendance_logs', { limit: 10, orderBy: 'timestamp', orderDirection: 'DESC' }),
          safeQuery('students')
        ]);
        const logs = logsRes.rows || [];
        const studentsList = studentsListRes.rows || [];
        const studentMap = new Map(studentsList.map((s: any) => [s.id, s.name]));
        const finalLogs = logs.map((log: any) => ({
          ...log,
          student_name: studentMap.get(log.student_id) || `ID: ${log.student_id}`
        }));
        const [attendanceCountRes] = await Promise.all([
          executeSQL(`SELECT COUNT(*) as total FROM attendance_logs WHERE timestamp LIKE '${todayStr}%'`)
        ]);
        setStats({
          totalStudents: studentsListRes.rows?.length || studentsRes.total || 0,
          presentToday: attendanceCountRes.rows?.[0]?.total || 0,
          unmatchedPayments: paymentsRes.rows?.length || paymentsRes.total || 0,
        });
        setRecentLogs(finalLogs);
        try {
          const keyRes = await fetch('./api/settings/ai-key');
          if (keyRes.ok) {
            const keyData = await keyRes.json();
            setHasApiKey(keyData.exists);
          }
        } catch (e) {}
      } catch (err) {
        console.error('전체 데이터 로드 실패:', err);
      }
    };
    fetchData();
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '40px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.05em' }}>도장 운영 현황</h2>
        </div>
        <div style={{ padding: '12px 24px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', fontWeight: 800, fontSize: '14px', color: '#475569' }}>
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </div>
      </header>

      {/* STATS ROW */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {[
          { icon: Users, label: "전체 관원 수", value: stats.totalStudents, unit: "명", color: "#3B82F6", bg: "#EFF6FF" },
          { icon: CheckCircle2, label: "오늘 등원 완료", value: stats.presentToday, unit: "명", color: "#10B981", bg: "#ECFDF5" },
          { icon: CreditCard, label: "확인 필요 수납", value: stats.unmatchedPayments, unit: "건", color: "#F43F5E", bg: "#FFF1F2" },
        ].map((stat, i) => (
          <div key={i} style={{ 
            flex: 1, 
            backgroundColor: '#FFFFFF', 
            padding: '20px 28px', 
            borderRadius: '24px', 
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ 
              width: '44px', 
              height: '44px', 
              backgroundColor: stat.bg, 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#64748B', whiteSpace: 'nowrap' }}>{stat.label}</div>
            <div style={{ marginLeft: 'auto', fontSize: '24px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
              {stat.value}<span style={{ fontSize: '14px', color: '#94A3B8', marginLeft: '4px', fontWeight: 800 }}>{stat.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* LOGS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: 0 }}>실시간 출결 로그</h3>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '32px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <th style={{ padding: '24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>시간</th>
                <th style={{ padding: '24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>이름</th>
                <th style={{ padding: '24px', fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', textAlign: 'right' }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log, i) => (
                <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '24px', color: '#64748B', fontWeight: 700 }}>{new Date(log.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td style={{ padding: '24px', color: '#0F172A', fontWeight: 900, fontSize: '18px' }}>{log.student_name}</td>
                  <td style={{ padding: '24px', textAlign: 'right' }}>
                    <span style={{ 
                      padding: '8px 16px', 
                      borderRadius: '12px', 
                      fontSize: '11px', 
                      fontWeight: 900, 
                      backgroundColor: log.type === 'IN' ? '#0F172A' : '#F1F5F9',
                      color: log.type === 'IN' ? '#FFFFFF' : '#64748B'
                    }}>
                      {log.type === 'IN' ? '등원' : '하원'}
                    </span>
                  </td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>기록이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
