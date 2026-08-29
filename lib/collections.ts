// 컬렉션 열람 권한(rules §데이터·권한): 공식·LINK는 누구나, PRIVATE는 소유자만.
// GUEST(userId 없음)는 공식·LINK만. 접근제어 경로라 순수 함수로 분리해 테스트한다.
export function canViewCollection(
  row: { isOfficial: boolean; visibility: string; ownerId: string },
  userId?: string,
): boolean {
  const isOwner = !!userId && row.ownerId === userId;
  return row.isOfficial || row.visibility === "LINK" || isOwner;
}

// 저장 시트 커밋용 멤버십 diff — 초기 소속(initial) 대비 현재 선택(selected)에서
// 새로 추가/제거할 컬렉션 id를 계산한다. (spec §인수조건: 다대다 추가·제거)
export function diffMembership(initial: string[], selected: Set<string>) {
  const base = new Set(initial);
  return {
    added: [...selected].filter((id) => !base.has(id)),
    removed: initial.filter((id) => !selected.has(id)),
  };
}
