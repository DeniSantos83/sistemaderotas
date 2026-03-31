import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  MapPin,
  User,
  Wrench,
  Eye,
  FileText,
  CheckCircle2,
  Pencil,
  ShieldCheck,
  Package,
  Route as RouteIcon,
  AlertTriangle,
} from "lucide-react";
import { fetchRecordById } from "../services/recordsService";
import {
  formatRecordDateTime,
  getRecordEquipmentLabel,
  getRecordLocationLabel,
  getRecordResponsibleLabel,
  getRecordStatusLabel,
  getRecordTypeLabel,
} from "../Utils/recordsFormatters";

function InfoItem({ label, value }) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value || "-"}</strong>
    </div>
  );
}

function SectionCard({ title, icon: Icon, description, children }) {
  return (
    <section style={styles.sectionCard}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionIcon}>
          <Icon size={18} />
        </div>
        <div>
          <h3 style={styles.sectionTitle}>{title}</h3>
          {description ? (
            <p style={styles.sectionDescription}>{description}</p>
          ) : null}
        </div>
      </div>
      <div style={styles.sectionContent}>{children}</div>
    </section>
  );
}

function getStatusTone(statusLabel) {
  const label = String(statusLabel || "").toLowerCase();

  if (label.includes("cancel")) return { ...styles.badgeBase, ...styles.badgeDanger };
  if (label.includes("conclu") || label.includes("final")) return { ...styles.badgeBase, ...styles.badgeSuccess };
  return { ...styles.badgeBase, ...styles.badgeInfo };
}

export default function RecordDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadRecord() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchRecordById(id);
      setRecord(data);
    } catch (err) {
      setErrorMessage(err.message || "Não foi possível carregar o registro.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecord();
  }, [id]);

  const summary = useMemo(() => {
    if (!record) {
      return {
        type: "-",
        status: "-",
        route: "-",
      };
    }

    return {
      type: getRecordTypeLabel(record),
      status: getRecordStatusLabel(record),
      route: record.route?.name || record.route_id || "Sem rota",
    };
  }, [record]);

  if (loading) {
    return (
      <div style={styles.page}>
        <section style={styles.panelCard}>
          <div style={styles.emptyPanel}>Carregando registro...</div>
        </section>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={styles.page}>
        <section style={styles.panelCard}>
          <div style={styles.errorBox}>
            <AlertTriangle size={18} />
            <span>{errorMessage}</span>
          </div>
          <div style={styles.formActions}>
            <button style={styles.ghostButton} onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
              <span>Voltar</span>
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (!record) {
    return (
      <div style={styles.page}>
        <section style={styles.panelCard}>
          <div style={styles.emptyPanel}>Registro não encontrado.</div>
        </section>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <section style={styles.heroCard}>
        <div style={styles.heroGlowA} />
        <div style={styles.heroGlowB} />

        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <Eye size={15} />
            <span>Visualização operacional</span>
          </div>

          <h1 style={styles.heroTitle}>Detalhes do registro</h1>

          <p style={styles.heroText}>
            Consulte as informações completas do registro operacional com visão
            premium, organizada por contexto, envolvidos, equipamento,
            manutenção e observações.
          </p>

          <div style={styles.heroMetrics}>
            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Tipo</span>
              <strong style={styles.heroMetricValue}>{summary.type}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Status</span>
              <strong style={styles.heroMetricValue}>{summary.status}</strong>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroMetricItem}>
              <span style={styles.heroMetricLabel}>Rota</span>
              <strong style={styles.heroMetricValue}>{summary.route}</strong>
            </div>
          </div>
        </div>

        <div style={styles.heroActions}>
          <button style={styles.ghostButton} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </button>

          <Link to={`/registros/${id}/editar`} style={styles.primaryButton}>
            <Pencil size={18} />
            <span>Editar registro</span>
          </Link>
        </div>
      </section>

      <section style={styles.statsGrid}>
        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Tipo do registro</p>
              <h3 style={styles.statValue}>{summary.type}</h3>
            </div>
            <div style={styles.statIcon}>
              <FileText size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Natureza operacional cadastrada</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Status</p>
              <h3 style={styles.statValue}>{summary.status}</h3>
            </div>
            <div style={styles.statIcon}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Situação atual do fluxo</p>
        </article>

        <article style={styles.statCard}>
          <div style={styles.statCardTop}>
            <div>
              <p style={styles.statTitle}>Manutenção</p>
              <h3 style={styles.statValue}>
                {record.maintenance_confirmation ? "Confirmada" : "Pendente"}
              </h3>
            </div>
            <div style={styles.statIcon}>
              <Wrench size={20} />
            </div>
          </div>
          <p style={styles.statDetail}>Controle técnico do equipamento</p>
        </article>
      </section>

      <section style={styles.panelCard}>
        <div style={styles.panelHeader}>
          <div>
            <p style={styles.sectionKicker}>Painel detalhado</p>
            <h3 style={styles.panelTitle}>Resumo completo do registro</h3>
            <p style={styles.panelText}>
              As informações abaixo estão organizadas para facilitar consulta,
              rastreabilidade e auditoria do processo.
            </p>
          </div>
        </div>

        <div style={styles.detailsLayout}>
          <div style={styles.mainColumn}>
            <SectionCard
              title="Identificação"
              icon={ClipboardList}
              description="Dados principais do registro operacional."
            >
              <div style={styles.infoGrid}>
                <InfoItem label="APP" value={record.app_number} />
                <InfoItem label="Chamado" value={record.call_number} />
                <InfoItem label="GRP" value={record.grp_number} />
                <InfoItem label="Data/Hora" value={formatRecordDateTime(record.occurred_at)} />
                <InfoItem label="Tipo" value={getRecordTypeLabel(record)} />
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Status</span>
                  <div>
                    <span style={getStatusTone(getRecordStatusLabel(record))}>
                      {getRecordStatusLabel(record)}
                    </span>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Rota e contexto operacional"
              icon={RouteIcon}
              description="Informações relacionadas à operação e ao responsável."
            >
              <div style={styles.infoGrid}>
                <InfoItem label="Rota" value={record.route?.name || record.route_id || "-"} />
                <InfoItem
                  label="Responsável da rota"
                  value={
                    record.route_responsible?.name ||
                    record.route_responsible_manual_name ||
                    "-"
                  }
                />
                <InfoItem
                  label="Matrícula do responsável"
                  value={record.route_responsible_manual_registration}
                />
                <InfoItem label="QR Code" value={record.qr_code_read} />
              </div>
            </SectionCard>

            <SectionCard
              title="Local / Setor / Equipamento"
              icon={Package}
              description="Patrimônio e localização vinculados ao registro."
            >
              <div style={styles.infoGrid}>
                <InfoItem label="Equipamento" value={getRecordEquipmentLabel(record)} />
                <InfoItem label="Local" value={getRecordLocationLabel(record)} />
                <InfoItem label="Setor" value={record.sector?.name || record.sector_manual} />
                <InfoItem label="Tombamento" value={record.tombamento_manual} />
                <InfoItem label="Equipamento manual" value={record.equipment_manual} />
                <InfoItem label="Local manual" value={record.location_manual} />
                <InfoItem label="Setor manual" value={record.sector_manual} />
              </div>
            </SectionCard>

            <SectionCard
              title="Envolvidos"
              icon={User}
              description="Remetente, recebedor e responsáveis operacionais."
            >
              <div style={styles.infoGrid}>
                <InfoItem label="Responsável consolidado" value={getRecordResponsibleLabel(record)} />
                <InfoItem
                  label="Remetente"
                  value={record.sender_employee?.name || record.sender_manual_name}
                />
                <InfoItem
                  label="Matrícula do remetente"
                  value={record.sender_manual_registration}
                />
                <InfoItem
                  label="Recebedor"
                  value={record.receiver_employee?.name || record.receiver_manual_name}
                />
                <InfoItem
                  label="Matrícula do recebedor"
                  value={record.receiver_manual_registration}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Manutenção"
              icon={Wrench}
              description="Confirmação técnica e rastreabilidade do processo."
            >
              <div style={styles.infoGrid}>
                <InfoItem
                  label="Confirmada"
                  value={record.maintenance_confirmation ? "Sim" : "Não"}
                />
                <InfoItem
                  label="Confirmado em"
                  value={formatRecordDateTime(record.maintenance_confirmed_at)}
                />
                <InfoItem
                  label="Confirmado por"
                  value={record.maintenance_confirmed_by}
                />
                <InfoItem
                  label="Assinatura de manutenção"
                  value={record.maintenance_signature_path}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Observações e controle"
              icon={ShieldCheck}
              description="Notas complementares e possíveis justificativas."
            >
              <div style={styles.notesBox}>
                <strong style={styles.notesTitle}>Observações</strong>
                <p style={styles.notesText}>
                  {record.observations || "Nenhuma observação informada."}
                </p>
              </div>

              {String(record.status || "").toLowerCase().includes("cancel") ? (
                <div style={styles.notesBox}>
                  <strong style={styles.notesTitle}>Motivo de cancelamento</strong>
                  <p style={styles.notesText}>
                    {record.cancellation_reason || "Sem motivo informado."}
                  </p>
                </div>
              ) : null}
            </SectionCard>
          </div>

          <aside style={styles.sideColumn}>
            <article style={styles.previewPanel}>
              <div style={styles.previewHeader}>
                <div style={styles.previewIcon}>
                  <ClipboardList size={22} />
                </div>

                <div>
                  <h4 style={styles.previewName}>{record.app_number || "Sem APP"}</h4>
                  <p style={styles.previewSub}>{getRecordTypeLabel(record)}</p>
                </div>
              </div>

              <div style={styles.previewChips}>
                <span style={getStatusTone(getRecordStatusLabel(record))}>
                  {getRecordStatusLabel(record)}
                </span>
                <span style={styles.subtleChip}>
                  {record.route?.name || "Sem rota"}
                </span>
              </div>
            </article>

            <article style={styles.quickCard}>
              <div style={styles.quickCardHeader}>
                <div style={styles.quickCardIcon}>
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 style={styles.quickCardTitle}>Resumo rápido</h4>
                  <p style={styles.quickCardText}>
                    Visão compacta para conferência imediata.
                  </p>
                </div>
              </div>

              <div style={styles.quickInfoList}>
                <div style={styles.quickInfoItem}>
                  <span style={styles.quickInfoLabel}>Equipamento</span>
                  <span style={styles.quickInfoValue}>
                    {getRecordEquipmentLabel(record)}
                  </span>
                </div>

                <div style={styles.quickInfoItem}>
                  <span style={styles.quickInfoLabel}>Local</span>
                  <span style={styles.quickInfoValue}>
                    {getRecordLocationLabel(record)}
                  </span>
                </div>

                <div style={styles.quickInfoItem}>
                  <span style={styles.quickInfoLabel}>Recebedor</span>
                  <span style={styles.quickInfoValue}>
                    {record.receiver_employee?.name || record.receiver_manual_name || "-"}
                  </span>
                </div>

                <div style={styles.quickInfoItem}>
                  <span style={styles.quickInfoLabel}>Remetente</span>
                  <span style={styles.quickInfoValue}>
                    {record.sender_employee?.name || record.sender_manual_name || "-"}
                  </span>
                </div>
              </div>
            </article>
          </aside>
        </div>

        <div style={styles.formActions}>
          <button style={styles.ghostButton} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </button>

          <Link to={`/registros/${id}/editar`} style={styles.primaryButton}>
            <Pencil size={18} />
            <span>Editar registro</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
    paddingBottom: "8px",
    color: "#fff",
  },

  heroCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "26px",
    padding: "32px",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    background:
      "linear-gradient(135deg, #17233f 0%, #1a2646 45%, #0f172a 100%)",
    boxShadow: "0 22px 55px rgba(15, 23, 42, 0.22)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "28px",
    color: "#ffffff",
  },

  heroGlowA: {
    position: "absolute",
    top: "-80px",
    right: "-40px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(34, 197, 94, 0.08)",
    filter: "blur(30px)",
    pointerEvents: "none",
  },

  heroGlowB: {
    position: "absolute",
    bottom: "-90px",
    left: "-30px",
    width: "240px",
    height: "240px",
    borderRadius: "999px",
    background: "rgba(59, 130, 246, 0.12)",
    filter: "blur(32px)",
    pointerEvents: "none",
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "820px",
  },

  heroBadge: {
    width: "fit-content",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#e2e8f0",
    fontSize: "0.82rem",
    fontWeight: "700",
    letterSpacing: "0.02em",
  },

  heroTitle: {
    margin: 0,
    color: "#ffffff",
    letterSpacing: "-0.03em",
    fontSize: "52px",
    lineHeight: 1.05,
  },

  heroText: {
    margin: 0,
    maxWidth: "720px",
    color: "rgba(226,232,240,0.82)",
    lineHeight: 1.7,
    fontSize: "1rem",
  },

  heroMetrics: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "18px",
    marginTop: "12px",
  },

  heroMetricItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  heroMetricLabel: {
    fontSize: "0.76rem",
    color: "rgba(148,163,184,0.95)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontWeight: 700,
  },

  heroMetricValue: {
    fontSize: "1rem",
    color: "#ffffff",
    fontWeight: 800,
  },

  heroDivider: {
    width: "1px",
    height: "34px",
    background: "rgba(255,255,255,0.16)",
  },

  heroActions: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "flex-start",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
    border: "1px solid rgba(34,197,94,0.22)",
    fontWeight: 800,
    boxShadow: "0 16px 32px rgba(34,197,94,0.18)",
    cursor: "pointer",
  },

  ghostButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
    alignItems: "stretch",
  },

  statCard: {
    borderRadius: "24px",
    padding: "18px",
    background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 16px 36px rgba(15,23,42,0.18)",
    color: "#ffffff",
  },

  statCardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "18px",
  },

  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.16)",
    color: "#22c55e",
    flexShrink: 0,
  },

  statTitle: {
    margin: "0 0 6px",
    fontSize: "0.82rem",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
  },

  statValue: {
    margin: 0,
    fontSize: "1.3rem",
    color: "#ffffff",
    letterSpacing: "-0.03em",
  },

  statDetail: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.92rem",
  },

  panelCard: {
    borderRadius: "26px",
    background: "linear-gradient(135deg, #17233f 0%, #10192f 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
    padding: "26px",
    color: "#ffffff",
  },

  panelHeader: {
    gap: "20px",
    marginBottom: "22px",
  },

  sectionKicker: {
    margin: "0 0 8px",
    fontSize: "0.78rem",
    fontWeight: 800,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#22c55e",
  },

  panelTitle: {
    margin: "0 0 6px",
    fontSize: "1.35rem",
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "-0.02em",
  },

  panelText: {
    margin: 0,
    color: "rgba(148,163,184,0.92)",
    lineHeight: 1.55,
  },

  detailsLayout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.65fr) minmax(320px, 0.9fr)",
    gap: "22px",
    alignItems: "start",
  },

  mainColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  sideColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  sectionCard: {
    borderRadius: "22px",
    padding: "20px",
    background: "rgba(15,23,42,0.38)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
  },

  sectionIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(59,130,246,0.10)",
    border: "1px solid rgba(59,130,246,0.18)",
    color: "#60a5fa",
    flexShrink: 0,
  },

  sectionTitle: {
    margin: "0 0 4px",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: 800,
  },

  sectionDescription: {
    margin: 0,
    color: "#94a3b8",
    lineHeight: 1.5,
    fontSize: "0.9rem",
  },

  sectionContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },

  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.05)",
  },

  infoLabel: {
    color: "#94a3b8",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 700,
  },

  infoValue: {
    color: "#ffffff",
    fontSize: "0.95rem",
    fontWeight: 700,
    lineHeight: 1.45,
  },

  previewPanel: {
    borderRadius: "22px",
    padding: "20px",
    background: "rgba(9,15,28,0.42)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  previewHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  previewIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
    color: "#ffffff",
    boxShadow: "0 14px 28px rgba(37,99,235,0.22)",
    flexShrink: 0,
  },

  previewName: {
    margin: "0 0 4px",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: 800,
  },

  previewSub: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "0.9rem",
  },

  previewChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  quickCard: {
    borderRadius: "22px",
    padding: "20px",
    background: "rgba(15,23,42,0.38)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  quickCardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
  },

  quickCardIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(59,130,246,0.10)",
    border: "1px solid rgba(59,130,246,0.18)",
    color: "#60a5fa",
    flexShrink: 0,
  },

  quickCardTitle: {
    margin: "0 0 4px",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: 800,
  },

  quickCardText: {
    margin: 0,
    color: "#94a3b8",
    lineHeight: 1.5,
    fontSize: "0.9rem",
  },

  quickInfoList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  quickInfoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.05)",
  },

  quickInfoLabel: {
    color: "#94a3b8",
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 700,
  },

  quickInfoValue: {
    color: "#e2e8f0",
    fontSize: "0.9rem",
    fontWeight: 600,
    lineHeight: 1.4,
    wordBreak: "break-word",
  },

  notesBox: {
    padding: "16px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.05)",
  },

  notesTitle: {
    display: "block",
    marginBottom: "8px",
    color: "#ffffff",
    fontSize: "0.95rem",
  },

  notesText: {
    margin: 0,
    color: "#cbd5e1",
    lineHeight: 1.7,
    fontSize: "0.92rem",
  },

  badgeBase: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "0.76rem",
    fontWeight: 800,
    border: "1px solid transparent",
    whiteSpace: "nowrap",
  },

  badgeSuccess: {
    background: "rgba(34,197,94,0.12)",
    color: "#4ade80",
    borderColor: "rgba(34,197,94,0.18)",
  },

  badgeDanger: {
    background: "rgba(239,68,68,0.12)",
    color: "#f87171",
    borderColor: "rgba(239,68,68,0.18)",
  },

  badgeInfo: {
    background: "rgba(59,130,246,0.12)",
    color: "#60a5fa",
    borderColor: "rgba(59,130,246,0.18)",
  },

  subtleChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#94a3b8",
    fontSize: "0.82rem",
    fontWeight: 600,
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    borderRadius: "16px",
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.18)",
    color: "#fecaca",
    fontWeight: 700,
  },

  emptyPanel: {
    minHeight: "220px",
    display: "grid",
    placeItems: "center",
    color: "#94a3b8",
    fontWeight: 600,
    borderRadius: "18px",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "22px",
  },
};