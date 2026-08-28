"use client";

import { Component, type ReactNode } from "react";

// 자식 렌더 중 예외를 잡아 fallback으로 대체. 외부 통합(예: Google Maps) 실패가
// 라우트 전체를 흰 화면으로 무너뜨리지 않도록 격리한다.
export class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
