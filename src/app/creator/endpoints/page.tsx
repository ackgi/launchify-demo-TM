// src/app/creator/endpoints/page.tsx
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import AllEndpointsClient from "./AllEndpointsClient";

/** 汎用: 候補キーから最初に存在する値を name に正規化 */
const normalizeName = (row: Record<string, any>, keys: string[]) => {
  for (const k of keys) {
    if (k in row && row[k] != null) return String(row[k]);
  }
  return null;
};

/** 汎用: 欠けていたら fromKeys の値を toKey にコピーして補完 */
const ensureField = <T extends Record<string, any>>(
  row: T,
  toKey: string,
  fromKeys: string[]
): T => {
  if (row[toKey] == null) {
    for (const k of fromKeys) {
      if (k in row && row[k] != null) {
        (row as any)[toKey] = row[k];
        break;
      }
    }
  }
  return row;
};

/** 配列データだけ抽出（無ければ []） */
const pickArray = (res: unknown): any[] => {
  const data = (res as any)?.data;
  return Array.isArray(data) ? data : [];
};

/** 実エラー文言だけ取り出す（無ければ undefined） */
const pickErrorMsg = (res: unknown): string | undefined =>
  (res as any)?.error?.message ? String((res as any).error.message) : undefined;

export default async function Page() {
  // 1) Clerk 認証
  const { getToken, userId } = await auth();
  if (!userId) return <div className="p-6">Unauthorized</div>;

  // 2) JWT 付き Supabase（RLS 有効）
  const jwt = await getToken({ template: "supabase" });
  const supabase = createServerClient(jwt ?? "");

  // 3) まずは全カラム取得（スキーマ差異を吸収するため）
  const [endpointsRes, groupsRes, productsRes] = await Promise.all([
    supabase.from("api_endpoints").select("*").order("created_at", { ascending: false }),
    supabase.from("api_endpoint_groups").select("*"),
    supabase.from("api_products").select("*"),
  ]);

  const errors = [pickErrorMsg(endpointsRes), pickErrorMsg(groupsRes), pickErrorMsg(productsRes)].filter(
    Boolean
  ) as string[];
  if (errors.length) {
    return (
      <div className="p-6 text-red-500">
        Failed to load data.
        <pre className="mt-2 text-sm whitespace-pre-wrap">{JSON.stringify(errors, null, 2)}</pre>
      </div>
    );
  }

  // 4) データ取り出し
  const endpointsRaw = pickArray(endpointsRes);
  const groupsRaw = pickArray(groupsRes);
  const productsRaw = pickArray(productsRes);

  // 5) UI が期待するキーへ正規化
  //    - name:   name / endpoint_name / title / label などを吸収
  //    - path:   path / endpoint_path / route / url_path を吸収
  //    - method: method / http_method / verb
  //    - status: status / endpoint_status / state
  const endpoints = endpointsRaw.map((r) => {
    const row = { ...r };

    // name
    row.name = normalizeName(row, ["name", "endpoint_name", "title", "label"]);

    // path / method / status
    ensureField(row, "path", ["path", "endpoint_path", "route", "url_path"]);
    ensureField(row, "method", ["method", "http_method", "verb"]);
    ensureField(row, "status", ["status", "endpoint_status", "state"]);

    // product_id / group_id の別名吸収
    ensureField(row, "product_id", ["product_id", "api_product_id", "product"]);
    ensureField(row, "group_id", ["group_id", "api_endpoint_group_id", "group"]);

    return row;
  });

  const groups = groupsRaw.map((r) => {
    const row = { ...r };
    row.name = normalizeName(row, ["name", "group_name", "title", "label"]);
    return row;
  });

  const products = productsRaw.map((r) => {
    const row = { ...r };
    row.name = normalizeName(row, ["name", "product_name", "title", "label"]);
    return row;
  });

  // 6) クライアントへ
  return (
    <AllEndpointsClient
      endpoints={endpoints as any}
      groups={groups as any}
      products={products as any}
    />
  );
}
