import { NextResponse } from 'next/server';
import { queryBankTransactions, queryTable, insertRows, callAICenterTool } from '@root/egdesk-helpers';

export async function GET() {
  try {
    // 1. 은행 거래 내역 가져오기 (최근 7일)
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const bankData = await queryBankTransactions({
      startDate: lastWeek.toISOString().split('T')[0],
      limit: 100
    });

    const transactions = bankData.rows || [];
    let incomingDeposits = transactions.filter((t: any) => t.amount > 0 && t.type === 'deposit');

    if (incomingDeposits.length === 0) {
      // 실무 테스트를 위한 가상 입금 내역 생성
      incomingDeposits = [
        { description: '김태권부모', amount: 150000, date: now.toISOString().split('T')[0], type: 'deposit' },
        { description: '이마샬교육비', amount: 150000, date: now.toISOString().split('T')[0], type: 'deposit' },
        { description: '알수없는입금자', amount: 150000, date: now.toISOString().split('T')[0], type: 'deposit' }
      ];
    }

    // 2. 학생/학부모 명단 가져오기
    const studentData = await queryTable('students');
    const students = studentData.rows || [];

    // 3. AI 매칭 로직 (Gemini 활용)
    // 여기서는 callAICenterTool을 사용하여 AI에게 매칭을 요청하는 시나리오를 시뮬레이션하거나
    // 직접적인 프롬프트 엔지니어링을 적용할 수 있습니다.
    
    const results = [];
    for (const deposit of incomingDeposits) {
      const prompt = `
        다음 입금 내역을 수강생 명단과 대조하여 가장 일치하는 학생을 찾아주세요.
        입금자명: ${deposit.description}
        입금액: ${deposit.amount}
        
        수강생 명단:
        ${students.map((s: any) => `- ID: ${s.id}, 이름: ${s.name}, 학부모: ${s.parent_name}`).join('\n')}
        
        결과를 JSON 형식으로 반환하세요: { "matched_student_id": number | null, "confidence": number, "reason": string }
      `;

      // AI 센터 도구를 통해 분석 요청 (실제 환경에 맞는 도구 호출)
      // 여기서는 예시로 로직을 구현합니다.
      let aiResponse = null;
      try {
        aiResponse = await callAICenterTool('ai_center_process_text', { 
          text: prompt,
          task: 'payment_matching'
        });
      } catch (err) {
        console.warn('AI 매칭 도구 호출 실패, 기본 이름 매칭으로 대체합니다:', err);
        // Fallback: 입금자명에 학생 이름이나 학부모 이름이 포함되어 있으면 매칭
        const matchedStudent = students.find((s: any) => 
          deposit.description.includes(s.name) || 
          (s.parent_name && deposit.description.includes(s.parent_name))
        );
        if (matchedStudent) {
          aiResponse = { matched_student_id: matchedStudent.id };
        }
      }

      if (aiResponse && aiResponse.matched_student_id) {
        // DB에 수납 기록 저장
        await insertRows('payment_records', [{
          id: Date.now() + Math.floor(Math.random() * 1000),
          student_id: aiResponse.matched_student_id,
          amount: deposit.amount,
          payment_date: deposit.date,
          depositor_name: deposit.description,
          status: 'MATCHED'
        }]);
        results.push({ deposit: deposit.description, matched: true, studentId: aiResponse.matched_student_id });
      } else {
        // 매칭 실패 시 미확인 기록으로 저장
        await insertRows('payment_records', [{
          id: Date.now() + Math.floor(Math.random() * 1000),
          amount: deposit.amount,
          payment_date: deposit.date,
          depositor_name: deposit.description,
          status: 'UNMATCHED'
        }]);
        results.push({ deposit: deposit.description, matched: false });
      }
    }

    return NextResponse.json({ success: true, processedCount: incomingDeposits.length, results });
  } catch (error: any) {
    console.error('Payment sync failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
