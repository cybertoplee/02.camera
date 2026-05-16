'use client';

import React, { useState, useEffect } from 'react';
import { queryTable } from '@root/egdesk-helpers';
import { Search, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function MobileStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await queryTable('students', { orderBy: 'id', orderDirection: 'DESC' });
      setStudents(res.rows || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s => 
    s.name.includes(searchTerm) || 
    (s.parent_phone && s.parent_phone.includes(searchTerm))
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pt-safe">
      <header className="bg-white px-5 py-4 sticky top-0 z-10 shadow-sm border-b border-slate-100 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">관원 관리</h1>
          <Link href="/admin/students/register" className="p-2 bg-blue-50 text-blue-600 rounded-full">
            <UserPlus size={20} />
          </Link>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="이름 또는 연락처 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100/50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </header>

      <div className="p-4 flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold text-sm">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-bold text-sm">관원이 없습니다.</div>
        ) : (
          filtered.map((student) => (
            <div key={student.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.98] transition-transform">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex-shrink-0 overflow-hidden relative">
                {student.profile_image ? (
                  <img src={student.profile_image} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xl">
                    {student.name.charAt(0)}
                  </div>
                )}
                {student.face_vector && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <h2 className="text-lg font-black text-slate-900 truncate">{student.name}</h2>
                  <span className="text-xs font-bold text-blue-500">{student.rank || '일반'}</span>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {student.receive_sms_in === 'true' && (
                    <span className="inline-flex items-center justify-center bg-blue-50 border border-blue-200 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-md tracking-tight whitespace-nowrap">
                      등원 알림
                    </span>
                  )}
                  {student.receive_sms_out === 'true' && (
                    <span className="inline-flex items-center justify-center bg-orange-50 border border-orange-200 text-orange-600 text-[9px] font-black px-2 py-0.5 rounded-md tracking-tight whitespace-nowrap">
                      하원 알림
                    </span>
                  )}
                </div>
              </div>
              
              {/* 모바일에서는 간단한 수정 모달이나 상세 페이지로 이동할 수 있도록 Link 사용 */}
              <Link href={`/admin/students`} className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                상세
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
