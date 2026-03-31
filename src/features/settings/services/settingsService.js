import { supabase } from "../../../lib/supabase";

export const INITIAL_SETTINGS = {
  geral: {
    nomeSistema: "Sistema Web de Rotas",
    nomeInstituicao: "Tribunal de Justiça",
    sigla: "TJ",
    emailSuporte: "suporte@instituicao.gov.br",
    telefoneSuporte: "(79) 99999-9999",
    mensagemBoasVindas: "Bem-vindo ao sistema de gestão operacional.",
  },
  operacao: {
    permitirEdicaoRegistroConcluido: false,
    exigirAssinaturaRecebimento: true,
    exigirConfirmacaoEntrega: true,
    permitirCancelamentoRegistro: true,
    prazoPadraoAlertaMinutos: "30",
    tempoSincronizacaoMobileMinutos: "5",
  },
  notificacoes: {
    notificarNovoRegistro: true,
    notificarRotaAtrasada: true,
    notificarFalhaSincronizacao: true,
    notificarEquipamentoSemDestino: true,
    notificarPendenciaConfirmacao: true,
    canalPainelWeb: true,
    canalEmail: false,
    canalPushMobile: true,
  },
  seguranca: {
    encerrarSessaoPorInatividade: true,
    tempoInatividadeMinutos: "30",
    exigirSenhaForte: true,
    permitirUmUsuarioPorDispositivo: false,
  },
  mobile: {
    permitirRegistrosOffline: true,
    exigirInternetParaFinalizarRota: false,
    enviarLocalizacaoAoRegistrar: true,
    exigirAtualizacaoMinimaApp: false,
    versaoMinimaApp: "1.0.0",
  },
  aparencia: {
    tema: "escuro",
    corPrimaria: "#22c55e",
    corSecundaria: "#3b82f6",
    logoUrl: "",
  },
};

export function mergeSettingsWithDefaults(dbSettings) {
  return {
    geral: {
      ...INITIAL_SETTINGS.geral,
      ...(dbSettings?.general_settings || {}),
    },
    operacao: {
      ...INITIAL_SETTINGS.operacao,
      ...(dbSettings?.operation_settings || {}),
    },
    notificacoes: {
      ...INITIAL_SETTINGS.notificacoes,
      ...(dbSettings?.notification_settings || {}),
    },
    seguranca: {
      ...INITIAL_SETTINGS.seguranca,
      ...(dbSettings?.security_settings || {}),
    },
    mobile: {
      ...INITIAL_SETTINGS.mobile,
      ...(dbSettings?.mobile_settings || {}),
    },
    aparencia: {
      ...INITIAL_SETTINGS.aparencia,
      ...(dbSettings?.appearance_settings || {}),
    },
  };
}

export function mapFormToDatabasePayload(form, userId = null) {
  return {
    general_settings: form.geral,
    operation_settings: form.operacao,
    notification_settings: form.notificacoes,
    security_settings: form.seguranca,
    mobile_settings: form.mobile,
    appearance_settings: form.aparencia,
    updated_at: new Date().toISOString(),
    updated_by: userId,
  };
}

export async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user?.id ?? null;
}

export async function fetchLatestSettingsRecord() {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createInitialSettingsIfMissing() {
  const userId = await getCurrentUserId();

  const payload = {
    general_settings: INITIAL_SETTINGS.geral,
    operation_settings: INITIAL_SETTINGS.operacao,
    notification_settings: INITIAL_SETTINGS.notificacoes,
    security_settings: INITIAL_SETTINGS.seguranca,
    mobile_settings: INITIAL_SETTINGS.mobile,
    appearance_settings: INITIAL_SETTINGS.aparencia,
    updated_by: userId,
  };

  const { data, error } = await supabase
    .from("settings")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function getOrCreateSettings() {
  const existing = await fetchLatestSettingsRecord();

  if (existing) {
    return {
      record: existing,
      form: mergeSettingsWithDefaults(existing),
    };
  }

  const created = await createInitialSettingsIfMissing();

  return {
    record: created,
    form: mergeSettingsWithDefaults(created),
  };
}

export async function saveSettings(settingsId, form) {
  const userId = await getCurrentUserId();
  const payload = mapFormToDatabasePayload(form, userId);

  if (settingsId) {
    const { error } = await supabase
      .from("settings")
      .update(payload)
      .eq("id", settingsId);

    if (error) throw error;

    return {
      id: settingsId,
      ...payload,
    };
  }

  const { data, error } = await supabase
    .from("settings")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
export async function createSetting(form) {
  return saveSettings(null, form);
}

export async function getSettingById(id) {
  const { record } = await getOrCreateSettings();
  return record;
}

export async function updateSetting(id, form) {
  return saveSettings(id, form);
}