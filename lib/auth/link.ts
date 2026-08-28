// 계정 잠금 방지: 로그인 수단(소셜 Account 수 + 비밀번호 유무)이 2개 이상일 때만 하나를 해제할 수 있다.
// 순수 함수로 분리해 테스트 가능하게 둔다(서버액션 disconnectProvider에서 사용).
export function canDisconnect(
  accountCount: number,
  hasPassword: boolean,
): boolean {
  return accountCount + (hasPassword ? 1 : 0) > 1;
}
