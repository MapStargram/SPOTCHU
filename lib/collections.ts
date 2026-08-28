// 저장 시트 커밋용 멤버십 diff — 초기 소속(initial) 대비 현재 선택(selected)에서
// 새로 추가/제거할 컬렉션 id를 계산한다. (spec §인수조건: 다대다 추가·제거)
export function diffMembership(initial: string[], selected: Set<string>) {
  const base = new Set(initial);
  return {
    added: [...selected].filter((id) => !base.has(id)),
    removed: initial.filter((id) => !selected.has(id)),
  };
}
