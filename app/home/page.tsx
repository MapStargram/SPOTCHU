import { redirect } from "next/navigation";

// /home 인덱스는 도시 선택으로 보낸다(도시 컨텍스트 필요). 실제 홈은 /home/[city].
export default function HomeIndex() {
  redirect("/city");
}
