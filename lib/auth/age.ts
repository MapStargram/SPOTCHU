// 만 나이 가입 게이트: 만 14세 미만 가입 불가(prd §23, 한국 위치정보법 대응).
// 순수 함수로 분리해 테스트 가능하게 두고, 이메일·소셜 가입 서버액션이 공유한다(규칙 단일 지점).
// 출생연도만으로 계산 → 생일 미도래를 무시하는 보수적 근사(연도 차). 가입 정책상 충분.
export const MIN_SIGNUP_AGE = 14;

export function meetsMinAge(
  birthYear: number,
  minAge = MIN_SIGNUP_AGE,
  now = new Date(),
): boolean {
  return now.getFullYear() - birthYear >= minAge;
}
