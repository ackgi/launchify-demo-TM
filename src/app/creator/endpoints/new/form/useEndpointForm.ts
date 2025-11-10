// src/app/creator/endpoints/new/form/useEndpointForm.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { EndpointFormData, TestResult } from "../types";
import {
  createEndpointAction,
  createGroupAction,
  testEndpointAction,
  // ★ 追加：編集（更新）用アクション
  updateEndpointAction,
} from "../actions";

type SaveMode = "save" | "save-and-open" | "save-and-add";

/** New / Edit 兼用（Plan 紐づけ版） */
export function useEndpointForm(
  presetGroupId: string,
  plans: any[],
  availableGroups: any[],
  initialData?: any
) {
  const router = useRouter();

  // -------- state --------
  const [pending, setPending] = useState(false);
  const [currentStep, setCurrentStep] = useState(2); // ← 最初から全入力可
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [testResult, setTestResult] = useState<TestResult>(null);

  // 初期値（編集時は initialData を反映）
  const initialForm: EndpointFormData = {
    planId: initialData?.plan_id ?? "",
    groupId: (presetGroupId || initialData?.group_id || "") as string,
    endpoint_name: initialData?.endpoint_name ?? initialData?.name ?? "",
    path: initialData?.path ?? "",
    method: initialData?.method ?? "GET",
    status: initialData?.status ?? "draft",
    isPrimary: Boolean(initialData?.is_primary),
    description: initialData?.description ?? "",
    inputSchema: initialData?.input_schema ? JSON.stringify(initialData.input_schema, null, 2) : "",
    outputSchema: initialData?.output_schema ? JSON.stringify(initialData.output_schema, null, 2) : "",
    visibility: initialData?.visibility ?? "catalog",
  };

  const [formData, setFormData] = useState<EndpointFormData>(initialForm);

  // 編集時に initialData が到着したらフォームへ一度だけ反映
  useEffect(() => {
    setFormData(initialForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetGroupId, JSON.stringify(initialData)]);

  // セッター（型安全）
  const set = useCallback(
    <K extends keyof EndpointFormData>(key: K, value: EndpointFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // -------- derived --------
  const selectedPlan = useMemo(() => {
    if (!formData.planId) return undefined;
    return plans.find((p) => p.id === formData.planId);
  }, [formData.planId, plans]);

  const planGroups = useMemo(() => {
    if (!selectedPlan) return [];
    return availableGroups.filter((g) => g.plan_id === selectedPlan.id);
  }, [availableGroups, selectedPlan]);

  const selectedGroup = useMemo(() => {
    if (!formData.groupId) return undefined;
    return availableGroups.find((g) => g.id === formData.groupId);
  }, [availableGroups, formData.groupId]);

  const getFullUrl = useCallback(() => {
    const base =
      (selectedPlan as any)?.executionUrl ??
      (selectedPlan as any)?.service_endpoint_url ??
      "";
    if (!base || !formData.path) return "";
    return `${base}${formData.path}`;
  }, [selectedPlan, formData.path]);

  // -------- actions --------

  /** グループ作成（Plan 必須） */
  const createGroup = useCallback(async () => {
    const name = newGroupName.trim();
    if (!name) return;

    const pid: string = formData.planId ?? "";
    if (!pid) {
      setErrors({ groupId: ["Select a plan first"] });
      return;
    }

    setPending(true);
    setErrors({});
    try {
      const res = await createGroupAction(pid, name);
      if (!res.ok) {
        setErrors({ form: [res.message ?? "Failed to create group"] });
        return;
      }
      set("groupId", res.id as string);
      setShowNewGroupModal(false);
      setNewGroupName("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }, [formData.planId, newGroupName, router, set]);

  /** 疎通テスト */
  const testEndpoint = useCallback(async () => {
    const base =
      (selectedPlan as any)?.executionUrl ??
      (selectedPlan as any)?.service_endpoint_url ??
      "";

    if (!base || !formData.path) {
      setTestResult(null);
      return;
    }

    setPending(true);
    setTestResult(null);
    try {
      const res = await testEndpointAction(base, formData.path, formData.method);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({
        success: false,
        status: 500,
        latency: 0,
        response: e?.message ?? "Request failed",
      });
    } finally {
      setPending(false);
    }
  }, [formData.method, formData.path, selectedPlan]);

  /** 保存（新規⇔編集を切替） */
  const save = useCallback(
    async (mode: SaveMode) => {
      setPending(true);
      setErrors({});
      try {
        const payload: EndpointFormData = {
          ...formData,
          planId: formData.planId ?? "",
          groupId: formData.groupId ?? "",
          endpoint_name: formData.endpoint_name ?? "",
          path: formData.path ?? "",
          description: formData.description ?? "",
          inputSchema: formData.inputSchema ?? "",
          outputSchema: formData.outputSchema ?? "",
          status: formData.status ?? "draft",
        };

        // ★ 分岐：編集なら update、なければ create
        let res: any;
        if (initialData?.id) {
          // 既存レコードの更新
          // updateEndpointAction の引数はプロジェクト実装に合わせてください
          res = await updateEndpointAction(initialData.id as string, payload);
        } else {
          // 新規作成
          res = await createEndpointAction(payload);
        }

        if (!("ok" in res) || !res.ok) {
          const fieldErrors = (res as any).fieldErrors ?? {};
          const message = (res as any).message ? { form: [(res as any).message] } : {};
          setErrors({ ...fieldErrors, ...message });
          return;
        }

        if (!initialData?.id && mode === "save-and-add") {
          // 新規作成時のみ：追加入力のためにフォームをリセット
          setFormData((prev) => ({
            ...prev,
            endpoint_name: "",
            path: "",
            description: "",
            inputSchema: "",
            outputSchema: "",
            isPrimary: false,
            status: "draft",
          }));
          router.refresh();
          return;
        }

        if (!initialData?.id && mode === "save-and-open") {
          if (formData.groupId) {
            router.push(`/creator/groups/${encodeURIComponent(formData.groupId)}/endpoints`);
          } else {
            router.push("/creator/endpoints");
          }
          return;
        }

        // 既定：一覧へ戻す（編集時も新規時もここに落とせばOK）
        router.push("/creator/endpoints");
      } finally {
        setPending(false);
      }
    },
    [formData, router, initialData?.id]
  );

  return {
    // state
    pending,
    currentStep,
    setCurrentStep,
    showAdvanced,
    setShowAdvanced,
    showNewGroupModal,
    setShowNewGroupModal,
    newGroupName,
    setNewGroupName,
    errors,
    testResult,
    formData,
    set,
    selectedPlan,
    selectedGroup,
    planGroups,
    // 互換: 一部 UI が productGroups を読んでいても動く
    productGroups: planGroups,
    getFullUrl,
    // actions
    createGroup,
    testEndpoint,
    save,
  };
}
