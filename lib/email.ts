import { Resend } from "resend";

// 이메일 발송(인증·비밀번호 재설정). Resend 무료 티어. RESEND_API_KEY 미설정 시 발송 스킵.
const FROM = process.env.EMAIL_FROM ?? "SPOTCHU <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

async function send(
  to: string,
  subject: string,
  heading: string,
  url: string,
  cta: string,
) {
  // 개발 환경에선 링크를 서버 콘솔에 남겨 메일 없이도 플로우 확인 가능(프로덕션 제외).
  if (process.env.NODE_ENV !== "production")
    console.info(`[email] ${subject} → ${to}\n  ${url}`);

  const resend = client();
  if (!resend) return; // 키 미설정: 발송 스킵(위 dev 로그로 확인).

  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
    <h2>${heading}</h2>
    <p>아래 버튼을 눌러 진행하세요. 링크는 1시간 후 만료됩니다.</p>
    <p><a href="${url}" style="display:inline-block;background:#03C75A;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">${cta}</a></p>
    <p style="color:#888;font-size:12px">본인이 요청하지 않았다면 이 메일을 무시하세요.</p>
  </div>`;
  // best-effort: 발송 실패가 가입/재설정 요청 자체를 깨뜨리지 않게 한다(사용자는 재요청 가능).
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error(`[email] 발송 실패(${subject} → ${to}):`, err);
  }
}

export function sendVerifyEmail(to: string, rawToken: string) {
  const url = `${APP_URL}/verify-email?token=${rawToken}`;
  return send(
    to,
    "[SPOTCHU] 이메일 인증",
    "이메일 인증",
    url,
    "이메일 인증하기",
  );
}

export function sendResetEmail(to: string, rawToken: string) {
  const url = `${APP_URL}/reset-password?token=${rawToken}`;
  return send(
    to,
    "[SPOTCHU] 비밀번호 재설정",
    "비밀번호 재설정",
    url,
    "비밀번호 재설정",
  );
}
