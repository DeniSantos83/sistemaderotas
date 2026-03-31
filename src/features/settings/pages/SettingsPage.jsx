import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  TimerReset,
  XCircle,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

const TABS = [
  { id: "overview", label: "Visão geral", icon: Settings2 },
  { id: "geral", label: "Geral", icon: Building2 },
  { id: "operacao", label: "Operação", icon: TimerReset },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "seguranca", label: "Segurança", icon: ShieldCheck },
  { id: "mobile", label: "Mobile", icon: Smartphone },
  { id: "aparencia", label: "Aparência", icon: Palette },
];

const INITIAL_STATE = {
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

function mergeSettingsWithDefaults(dbSettings) {
  return {
    geral: {
      ...INITIAL_STATE.geral,
      ...(dbSettings?.general_settings || {}),
    },
    operacao: {
      ...INITIAL_STATE.operacao,
      ...(dbSettings?.operation_settings || {}),
    },
    notificacoes: {
      ...INITIAL_STATE.notificacoes,
      ...(dbSettings?.notification_settings || {}),
    },
    seguranca: {
      ...INITIAL_STATE.seguranca,
      ...(dbSettings?.security_settings || {}),
    },
    mobile: {
      ...INITIAL_STATE.mobile,
      ...(dbSettings?.mobile_settings || {}),
    },
    aparencia: {
      ...INITIAL_STATE.aparencia,
      ...(dbSettings?.appearance_settings || {}),
    },
  };
}

function TogglePill({ checked }) {
  return (
    <span
      style={{
        ...styles.togglePill,
        background: checked
          ? "rgba(34, 197, 94, 0.14)"
          : "rgba(148, 163, 184, 0.10)",
        borderColor: checked
          ? "rgba(34, 197, 94, 0.28)"
          : "rgba(148, 163, 184, 0.16)",
        color: checked ? "#bbf7d0" : "#cbd5e1",
      }}
    >
      {checked ? "Ativado" : "Desativado"}
    </span>
  );
}

function SummaryCard({ title, value, description, icon: Icon, glow = "green" }) {
  const glowMap = {
    green: "rgba(34, 197, 94, 0.22)",
    blue: "rgba(59, 130, 246, 0.22)",
    amber: "rgba(245, 158, 11, 0.22)",
    purple: "rgba(168, 85, 247, 0.22)",
  };

  return (
    <div style={styles.summaryCard}>
      <div
        style={{
          ...styles.summaryIconWrap,
          boxShadow: `0 0 0 6px ${glowMap[glow] || glowMap.green}`,
        }}
      >
        <Icon size={18} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={styles.summaryLabel}>{title}</p>
        <h3 style={styles.summaryValue}>{value}</h3>
        <p style={styles.summaryDescription}>{description}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span
        style={{
          ...styles.infoValue,
          fontFamily: mono
            ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
            : styles.infoValue.fontFamily,
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function SectionPreview({ title, description, icon: Icon, items, actionTo }) {
  return (
    <section style={styles.sectionCard}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionIconWrap}>
          <Icon size={18} />
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={styles.sectionTitle}>{title}</h3>
          <p style={styles.sectionDescription}>{description}</p>
        </div>

        <Link to={actionTo} style={styles.inlineActionButton}>
          <Pencil size={15} />
          <span>Editar</span>
        </Link>
      </div>

      <div style={styles.infoList}>
        {items.map((item) => (
          <InfoRow
            key={item.label}
            label={item.label}
            value={item.value}
            mono={item.mono}
          />
        ))}
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [form, setForm] = useState(INITIAL_STATE);
  const [settingsId, setSettingsId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");

  async function loadSettings({ silent = false } = {}) {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setForm(INITIAL_STATE);
        setSettingsId(null);
      } else {
        setSettingsId(data.id);
        setForm(mergeSettingsWithDefaults(data));
      }
    } catch (err) {
      setErrorMessage(err.message || "Não foi possível carregar as configurações.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const stats = useMemo(() => {
    const notificationFlags = Object.values(form.notificacoes).filter(Boolean).length;
    const securityFlags = Object.values(form.seguranca).filter(Boolean).length;
    const mobileFlags = Object.values(form.mobile).filter(Boolean).length;

    return {
      notificationFlags,
      securityFlags,
      mobileFlags,
    };
  }, [form]);

  const filteredTabs = useMemo(() => {
    if (!search.trim()) return TABS;

    const term = search.toLowerCase();
    return TABS.filter((tab) => tab.label.toLowerCase().includes(term));
  }, [search]);

  const currentTabLabel =
    TABS.find((item) => item.id === activeTab)?.label || "Configurações";

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingCard}>
          <p style={styles.loadingKicker}>Configurações</p>
          <h2 style={styles.loadingTitle}>Carregando painel premium...</h2>
          <p style={styles.loadingText}>
            Aguarde enquanto buscamos os parâmetros do sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.heroCard}>
        <div style={styles.heroGlowOne} />
        <div style={styles.heroGlowTwo} />

        <div style={styles.heroContent}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={styles.kicker}>Administração avançada</p>
            <h1 style={styles.title}>Configurações do Sistema</h1>
            <p style={styles.subtitle}>
              Central premium para governar identidade visual, operação,
              segurança, notificações e comportamento do app mobile.
            </p>

            <div style={styles.heroBadges}>
              <span style={styles.heroBadge}>
                <CheckCircle2 size={14} />
                <span>CRUD premium</span>
              </span>
              <span style={styles.heroBadge}>
                <Settings2 size={14} />
                <span>Configuração centralizada</span>
              </span>
              <span style={styles.heroBadge}>
                <ShieldCheck size={14} />
                <span>Governança operacional</span>
              </span>
            </div>
          </div>

          <div style={styles.heroActions}>
            <button
              type="button"
              onClick={() => loadSettings({ silent: true })}
              style={styles.secondaryButton}
              disabled={refreshing}
            >
              <RefreshCw size={16} />
              <span>{refreshing ? "Atualizando..." : "Atualizar"}</span>
            </button>

            <Link
              to={settingsId ? `/configuracoes/${settingsId}/editar` : "/configuracoes/nova"}
              style={styles.primaryButton}
            >
              {settingsId ? <Pencil size={16} /> : <Plus size={16} />}
              <span>{settingsId ? "Editar configuração" : "Nova configuração"}</span>
            </Link>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div style={styles.errorBox}>
          <XCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div style={styles.summaryGrid}>
        <SummaryCard
          title="Registro principal"
          value={settingsId ? "Configurado" : "Não criado"}
          description="Situação atual da configuração central do sistema."
          icon={Settings2}
          glow="green"
        />
        <SummaryCard
          title="Notificações ativas"
          value={`${stats.notificationFlags} parâmetros`}
          description="Quantidade de chaves booleanas habilitadas em notificações."
          icon={Bell}
          glow="blue"
        />
        <SummaryCard
          title="Segurança habilitada"
          value={`${stats.securityFlags} proteções`}
          description="Controles de sessão e autenticação atualmente ligados."
          icon={ShieldCheck}
          glow="amber"
        />
        <SummaryCard
          title="Mobile operacional"
          value={`${stats.mobileFlags} regras`}
          description="Parâmetros do app e sincronização configurados."
          icon={Smartphone}
          glow="purple"
        />
      </div>

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarTop}>
            <div style={styles.searchWrap}>
              <Search size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar área..."
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.navList}>
            {filteredTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...styles.tabButton,
                    background: isActive
                      ? "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(59,130,246,0.12))"
                      : "rgba(255,255,255,0.02)",
                    borderColor: isActive
                      ? "rgba(34, 197, 94, 0.30)"
                      : "rgba(148, 163, 184, 0.10)",
                    color: isActive ? "#f8fafc" : "#cbd5e1",
                  }}
                >
                  <div style={styles.tabButtonLeft}>
                    <div
                      style={{
                        ...styles.tabIconWrap,
                        background: isActive
                          ? "rgba(255,255,255,0.12)"
                          : "rgba(148,163,184,0.08)",
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <span>{tab.label}</span>
                  </div>

                  <ChevronRight size={16} />
                </button>
              );
            })}
          </div>
        </aside>

        <main style={styles.main}>
          <div style={styles.mobileCurrentTab}>{currentTabLabel}</div>

          {activeTab === "overview" && (
            <div style={styles.sectionsStack}>
              <SectionPreview
                title="Dados gerais"
                description="Resumo institucional e identidade textual do sistema."
                icon={Building2}
                actionTo={settingsId ? `/configuracoes/${settingsId}/editar` : "/configuracoes/nova"}
                items={[
                  { label: "Nome do sistema", value: form.geral.nomeSistema },
                  { label: "Instituição", value: form.geral.nomeInstituicao },
                  { label: "Sigla", value: form.geral.sigla, mono: true },
                  { label: "Email de suporte", value: form.geral.emailSuporte },
                ]}
              />

              <SectionPreview
                title="Operação"
                description="Principais políticas que impactam o fluxo operacional."
                icon={TimerReset}
                actionTo={settingsId ? `/configuracoes/${settingsId}/editar` : "/configuracoes/nova"}
                items={[
                  {
                    label: "Editar registro concluído",
                    value: (
                      <TogglePill
                        checked={form.operacao.permitirEdicaoRegistroConcluido}
                      />
                    ),
                  },
                  {
                    label: "Exigir assinatura",
                    value: (
                      <TogglePill
                        checked={form.operacao.exigirAssinaturaRecebimento}
                      />
                    ),
                  },
                  {
                    label: "Prazo padrão",
                    value: `${form.operacao.prazoPadraoAlertaMinutos} min`,
                  },
                  {
                    label: "Sincronização mobile",
                    value: `${form.operacao.tempoSincronizacaoMobileMinutos} min`,
                  },
                ]}
              />

              <SectionPreview
                title="Aparência"
                description="Tema, cores e identidade visual do sistema."
                icon={Palette}
                actionTo={settingsId ? `/configuracoes/${settingsId}/editar` : "/configuracoes/nova"}
                items={[
                  { label: "Tema", value: form.aparencia.tema },
                  { label: "Cor primária", value: form.aparencia.corPrimaria, mono: true },
                  { label: "Cor secundária", value: form.aparencia.corSecundaria, mono: true },
                  { label: "URL da logo", value: form.aparencia.logoUrl || "Não informada" },
                ]}
              />
            </div>
          )}

          {activeTab === "geral" && (
            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIconWrap}>
                  <Building2 size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.sectionTitle}>Configurações gerais</h3>
                  <p style={styles.sectionDescription}>
                    Dados institucionais principais usados na plataforma.
                  </p>
                </div>

                <Link
                  to={settingsId ? `/configuracoes/${settingsId}/editar` : "/configuracoes/nova"}
                  style={styles.inlineActionButton}
                >
                  <Pencil size={15} />
                  <span>Editar</span>
                </Link>
              </div>

              <div style={styles.infoList}>
                <InfoRow label="Nome do sistema" value={form.geral.nomeSistema} />
                <InfoRow label="Instituição" value={form.geral.nomeInstituicao} />
                <InfoRow label="Sigla" value={form.geral.sigla} mono />
                <InfoRow label="Email de suporte" value={form.geral.emailSuporte} />
                <InfoRow
                  label="Telefone de suporte"
                  value={form.geral.telefoneSuporte}
                />
                <InfoRow
                  label="Mensagem de boas-vindas"
                  value={form.geral.mensagemBoasVindas}
                />
              </div>
            </section>
          )}

          {activeTab === "operacao" && (
            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIconWrap}>
                  <TimerReset size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.sectionTitle}>Parâmetros operacionais</h3>
                  <p style={styles.sectionDescription}>
                    Regras que governam edição, confirmação, cancelamento e tempos.
                  </p>
                </div>

                <Link
                  to={settingsId ? `/configuracoes/${settingsId}/editar` : "/configuracoes/nova"}
                  style={styles.inlineActionButton}
                >
                  <Pencil size={15} />
                  <span>Editar</span>
                </Link>
              </div>

              <div style={styles.infoList}>
                <InfoRow
                  label="Permitir edição de registro concluído"
                  value={
                    <TogglePill
                      checked={form.operacao.permitirEdicaoRegistroConcluido}
                    />
                  }
                />
                <InfoRow
                  label="Exigir assinatura no recebimento"
                  value={
                    <TogglePill
                      checked={form.operacao.exigirAssinaturaRecebimento}
                    />
                  }
                />
                <InfoRow
                  label="Exigir confirmação de entrega"
                  value={
                    <TogglePill
                      checked={form.operacao.exigirConfirmacaoEntrega}
                    />
                  }
                />
                <InfoRow
                  label="Permitir cancelamento"
                  value={
                    <TogglePill
                      checked={form.operacao.permitirCancelamentoRegistro}
                    />
                  }
                />
                <InfoRow
                  label="Prazo padrão de alerta"
                  value={`${form.operacao.prazoPadraoAlertaMinutos} minutos`}
                />
                <InfoRow
                  label="Sincronização mobile"
                  value={`${form.operacao.tempoSincronizacaoMobileMinutos} minutos`}
                />
              </div>
            </section>
          )}

          {activeTab === "notificacoes" && (
            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIconWrap}>
                  <Bell size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.sectionTitle}>Central de notificações</h3>
                  <p style={styles.sectionDescription}>
                    Eventos monitorados e canais de entrega configurados.
                  </p>
                </div>

                <Link
                  to={settingsId ? `/configuracoes/${settingsId}/editar` : "/configuracoes/nova"}
                  style={styles.inlineActionButton}
                >
                  <Pencil size={15} />
                  <span>Editar</span>
                </Link>
              </div>

              <div style={styles.infoList}>
                <InfoRow
                  label="Notificar novo registro"
                  value={<TogglePill checked={form.notificacoes.notificarNovoRegistro} />}
                />
                <InfoRow
                  label="Notificar rota atrasada"
                  value={<TogglePill checked={form.notificacoes.notificarRotaAtrasada} />}
                />
                <InfoRow
                  label="Falha de sincronização"
                  value={
                    <TogglePill checked={form.notificacoes.notificarFalhaSincronizacao} />
                  }
                />
                <InfoRow
                  label="Equipamento sem destino"
                  value={
                    <TogglePill
                      checked={form.notificacoes.notificarEquipamentoSemDestino}
                    />
                  }
                />
                <InfoRow
                  label="Pendência de confirmação"
                  value={
                    <TogglePill
                      checked={form.notificacoes.notificarPendenciaConfirmacao}
                    />
                  }
                />
                <InfoRow
                  label="Canal painel web"
                  value={<TogglePill checked={form.notificacoes.canalPainelWeb} />}
                />
                <InfoRow
                  label="Canal email"
                  value={<TogglePill checked={form.notificacoes.canalEmail} />}
                />
                <InfoRow
                  label="Canal push mobile"
                  value={<TogglePill checked={form.notificacoes.canalPushMobile} />}
                />
              </div>
            </section>
          )}

          {activeTab === "seguranca" && (
            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIconWrap}>
                  <ShieldCheck size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.sectionTitle}>Segurança de acesso</h3>
                  <p style={styles.sectionDescription}>
                    Regras de sessão, inatividade e autenticação.
                  </p>
                </div>

                <Link
                  to={settingsId ? `/configuracoes/${settingsId}/editar` : "/configuracoes/nova"}
                  style={styles.inlineActionButton}
                >
                  <Pencil size={15} />
                  <span>Editar</span>
                </Link>
              </div>

              <div style={styles.infoList}>
                <InfoRow
                  label="Encerrar sessão por inatividade"
                  value={
                    <TogglePill
                      checked={form.seguranca.encerrarSessaoPorInatividade}
                    />
                  }
                />
                <InfoRow
                  label="Tempo de inatividade"
                  value={`${form.seguranca.tempoInatividadeMinutos} minutos`}
                />
                <InfoRow
                  label="Exigir senha forte"
                  value={<TogglePill checked={form.seguranca.exigirSenhaForte} />}
                />
                <InfoRow
                  label="Um usuário por dispositivo"
                  value={
                    <TogglePill
                      checked={form.seguranca.permitirUmUsuarioPorDispositivo}
                    />
                  }
                />
              </div>
            </section>
          )}

          {activeTab === "mobile" && (
            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIconWrap}>
                  <Smartphone size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.sectionTitle}>Integração com app mobile</h3>
                  <p style={styles.sectionDescription}>
                    Parâmetros para uso offline, sincronização e versão mínima.
                  </p>
                </div>

                <Link
                  to={settingsId ? `/configuracoes/${settingsId}/editar` : "/configuracoes/nova"}
                  style={styles.inlineActionButton}
                >
                  <Pencil size={15} />
                  <span>Editar</span>
                </Link>
              </div>

              <div style={styles.infoList}>
                <InfoRow
                  label="Permitir registros offline"
                  value={<TogglePill checked={form.mobile.permitirRegistrosOffline} />}
                />
                <InfoRow
                  label="Exigir internet para finalizar rota"
                  value={
                    <TogglePill checked={form.mobile.exigirInternetParaFinalizarRota} />
                  }
                />
                <InfoRow
                  label="Enviar localização ao registrar"
                  value={<TogglePill checked={form.mobile.enviarLocalizacaoAoRegistrar} />}
                />
                <InfoRow
                  label="Exigir atualização mínima"
                  value={
                    <TogglePill checked={form.mobile.exigirAtualizacaoMinimaApp} />
                  }
                />
                <InfoRow
                  label="Versão mínima do app"
                  value={form.mobile.versaoMinimaApp}
                  mono
                />
              </div>
            </section>
          )}

          {activeTab === "aparencia" && (
            <section style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionIconWrap}>
                  <Palette size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.sectionTitle}>Identidade visual</h3>
                  <p style={styles.sectionDescription}>
                    Tema, paleta e logo do sistema em uma visão executiva.
                  </p>
                </div>

                <Link
                  to={settingsId ? `/configuracoes/${settingsId}/editar` : "/configuracoes/nova"}
                  style={styles.inlineActionButton}
                >
                  <Pencil size={15} />
                  <span>Editar</span>
                </Link>
              </div>

              <div style={styles.appearanceGrid}>
                <div style={styles.colorPreviewCard}>
                  <div style={styles.colorPreviewHeader}>
                    <span style={styles.colorPreviewLabel}>Tema</span>
                    <span style={styles.themePill}>{form.aparencia.tema}</span>
                  </div>

                  <div style={styles.colorSwatches}>
                    <div>
                      <p style={styles.swatchLabel}>Primária</p>
                      <div
                        style={{
                          ...styles.swatch,
                          background: form.aparencia.corPrimaria,
                        }}
                      />
                      <span style={styles.swatchCode}>
                        {form.aparencia.corPrimaria}
                      </span>
                    </div>

                    <div>
                      <p style={styles.swatchLabel}>Secundária</p>
                      <div
                        style={{
                          ...styles.swatch,
                          background: form.aparencia.corSecundaria,
                        }}
                      />
                      <span style={styles.swatchCode}>
                        {form.aparencia.corSecundaria}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={styles.logoPreviewCard}>
                  <p style={styles.logoPreviewTitle}>Logo do sistema</p>
                  {form.aparencia.logoUrl ? (
                    <img
                      src={form.aparencia.logoUrl}
                      alt="Logo do sistema"
                      style={styles.logoPreviewImage}
                    />
                  ) : (
                    <div style={styles.logoEmptyState}>
                      <Palette size={22} />
                      <span>Nenhuma logo configurada</span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          <div style={styles.footerActions}>
            <Link to="/dashboard" style={styles.ghostButton}>
              <ArrowRight size={16} />
              <span>Voltar ao dashboard</span>
            </Link>

            <Link
              to={settingsId ? `/configuracoes/${settingsId}/editar` : "/configuracoes/nova"}
              style={styles.primaryButton}
            >
              <Pencil size={16} />
              <span>{settingsId ? "Abrir edição completa" : "Criar configuração"}</span>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    color: "#f8fafc",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  loadingWrap: {
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingCard: {
    width: "100%",
    maxWidth: "540px",
    padding: "30px",
    borderRadius: "28px",
    background: "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(2,6,23,0.94))",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
  },

  loadingKicker: {
    margin: 0,
    color: "#22c55e",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },

  loadingTitle: {
    margin: "10px 0 8px",
    fontSize: "30px",
    lineHeight: 1.1,
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },

  loadingText: {
    margin: 0,
    color: "#94a3b8",
    lineHeight: 1.7,
    fontSize: "15px",
  },

  heroCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "30px",
    padding: "28px",
    background:
      "radial-gradient(circle at top left, rgba(34,197,94,0.16), transparent 30%), radial-gradient(circle at top right, rgba(59,130,246,0.14), transparent 28%), linear-gradient(180deg, rgba(15,23,42,0.96), rgba(2,6,23,0.96))",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    boxShadow: "0 26px 70px rgba(0,0,0,0.22)",
  },

  heroGlowOne: {
    position: "absolute",
    top: "-90px",
    right: "-70px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(34, 197, 94, 0.18)",
    filter: "blur(40px)",
    pointerEvents: "none",
  },

  heroGlowTwo: {
    position: "absolute",
    bottom: "-80px",
    left: "-60px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(59, 130, 246, 0.16)",
    filter: "blur(40px)",
    pointerEvents: "none",
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    flexWrap: "wrap",
  },

  kicker: {
    margin: 0,
    color: "#86efac",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },

  title: {
    margin: "10px 0 12px",
    fontSize: "36px",
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
    fontWeight: 900,
    color: "#f8fafc",
  },

  subtitle: {
    margin: 0,
    maxWidth: "760px",
    color: "#94a3b8",
    fontSize: "15px",
    lineHeight: 1.75,
  },

  heroBadges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "18px",
  },

  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "36px",
    padding: "0 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    color: "#e2e8f0",
    fontSize: "13px",
    fontWeight: 700,
  },

  heroActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  primaryButton: {
    height: "48px",
    padding: "0 18px",
    borderRadius: "16px",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 46%, #3b82f6 100%)",
    color: "#ffffff",
    fontWeight: 800,
    textDecoration: "none",
    boxShadow: "0 18px 45px rgba(34, 197, 94, 0.22)",
  },

  secondaryButton: {
    height: "48px",
    padding: "0 18px",
    borderRadius: "16px",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.04)",
    color: "#f8fafc",
    fontWeight: 700,
    cursor: "pointer",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    borderRadius: "18px",
    background: "rgba(239, 68, 68, 0.10)",
    border: "1px solid rgba(239, 68, 68, 0.20)",
    color: "#fecaca",
    fontSize: "14px",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
  },

  summaryCard: {
    display: "flex",
    gap: "14px",
    padding: "18px",
    borderRadius: "24px",
    background: "linear-gradient(180deg, rgba(15,23,42,0.94), rgba(2,6,23,0.92))",
    border: "1px solid rgba(148, 163, 184, 0.10)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.16)",
    minWidth: 0,
  },

  summaryIconWrap: {
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.06)",
    color: "#f8fafc",
    flexShrink: 0,
  },

  summaryLabel: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: 700,
  },

  summaryValue: {
    margin: "8px 0 6px",
    color: "#f8fafc",
    fontSize: "24px",
    lineHeight: 1.1,
    fontWeight: 900,
    letterSpacing: "-0.03em",
  },

  summaryDescription: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "300px minmax(0, 1fr)",
    gap: "24px",
    alignItems: "start",
  },

  sidebar: {
    position: "sticky",
    top: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "16px",
    borderRadius: "26px",
    background: "rgba(15, 23, 42, 0.82)",
    border: "1px solid rgba(148, 163, 184, 0.10)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.16)",
    backdropFilter: "blur(16px)",
  },

  sidebarTop: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  searchWrap: {
    height: "46px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 14px",
    borderRadius: "14px",
    background: "rgba(2, 6, 23, 0.72)",
    border: "1px solid rgba(148, 163, 184, 0.10)",
    color: "#94a3b8",
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#f8fafc",
    fontSize: "14px",
  },

  navList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  tabButton: {
    width: "100%",
    minHeight: "54px",
    padding: "0 14px",
    borderRadius: "16px",
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  },

  tabButtonLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },

  tabIconWrap: {
    width: "34px",
    height: "34px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  main: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  mobileCurrentTab: {
    display: "none",
    color: "#cbd5e1",
    fontWeight: 800,
    fontSize: "14px",
  },

  sectionsStack: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  sectionCard: {
    borderRadius: "28px",
    padding: "24px",
    background: "linear-gradient(180deg, rgba(15,23,42,0.95), rgba(2,6,23,0.92))",
    border: "1px solid rgba(148, 163, 184, 0.10)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.16)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  sectionIconWrap: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(34, 197, 94, 0.12)",
    color: "#22c55e",
    flexShrink: 0,
  },

  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.02em",
  },

  sectionDescription: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  inlineActionButton: {
    marginLeft: "auto",
    height: "42px",
    padding: "0 14px",
    borderRadius: "14px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    color: "#f8fafc",
    textDecoration: "none",
    fontWeight: 700,
  },

  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  infoRow: {
    display: "grid",
    gridTemplateColumns: "220px minmax(0, 1fr)",
    gap: "16px",
    alignItems: "center",
    padding: "14px 16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(148, 163, 184, 0.08)",
  },

  infoLabel: {
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: 700,
  },

  infoValue: {
    color: "#f8fafc",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.6,
    wordBreak: "break-word",
  },

  togglePill: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "32px",
    padding: "0 12px",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  appearanceGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "18px",
  },

  colorPreviewCard: {
    padding: "18px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(148, 163, 184, 0.08)",
  },

  colorPreviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
  },

  colorPreviewLabel: {
    color: "#f8fafc",
    fontSize: "15px",
    fontWeight: 800,
  },

  themePill: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "30px",
    padding: "0 10px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.20)",
    color: "#bfdbfe",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  colorSwatches: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },

  swatchLabel: {
    margin: "0 0 10px",
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: 700,
  },

  swatch: {
    width: "100%",
    height: "82px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
  },

  swatchCode: {
    display: "inline-block",
    marginTop: "10px",
    color: "#f8fafc",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.04em",
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },

  logoPreviewCard: {
    padding: "18px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(148, 163, 184, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    minHeight: "100%",
  },

  logoPreviewTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "15px",
    fontWeight: 800,
  },

  logoPreviewImage: {
    width: "100%",
    height: "180px",
    objectFit: "contain",
    borderRadius: "18px",
    background: "rgba(2,6,23,0.82)",
    border: "1px solid rgba(148,163,184,0.10)",
    padding: "16px",
    boxSizing: "border-box",
  },

  logoEmptyState: {
    flex: 1,
    minHeight: "180px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    borderRadius: "18px",
    background: "rgba(2,6,23,0.82)",
    border: "1px dashed rgba(148,163,184,0.18)",
    color: "#94a3b8",
    textAlign: "center",
    padding: "20px",
  },

  footerActions: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },

  ghostButton: {
    height: "46px",
    padding: "0 16px",
    borderRadius: "14px",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(148, 163, 184, 0.10)",
    color: "#f8fafc",
    textDecoration: "none",
    fontWeight: 700,
  },
};