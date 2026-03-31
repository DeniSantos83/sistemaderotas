import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { fetchNotificationById, updateNotification } from "../services/notificationsService";
import { supabase } from "../../../lib/supabase";

const initialForm = {
  user_id: "",
  title: "",
  message: "",
  notification_type: "info",
  read: false,
  related_record_id: "",
};

export default function NotificationEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);

        const [
          notificationData,
          { data: usersData, error: usersError },
          { data: recordsData, error: recordsError },
        ] = await Promise.all([
          fetchNotificationById(id),
          supabase.from("profiles").select("id, full_name, email").order("full_name"),
          supabase.from("records").select("id, app_number").order("created_at", { ascending: false }).limit(200),
        ]);

        if (usersError) throw usersError;
        if (recordsError) throw recordsError;

        setUsers(usersData || []);
        setRecords(recordsData || []);

        setForm({
          user_id: notificationData.user_id || "",
          title: notificationData.title || "",
          message: notificationData.message || "",
          notification_type: notificationData.notification_type || "info",
          read: !!notificationData.read,
          related_record_id: notificationData.related_record_id || "",
        });
      } catch (err) {
        setError(err.message || "Não foi possível carregar a notificação.");
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [id]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((old) => ({
      ...old,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Informe o título da notificação.");
      return;
    }

    if (!form.message.trim()) {
      setError("Informe a mensagem da notificação.");
      return;
    }

    try {
      setSubmitting(true);
      await updateNotification(id, form);
      navigate("/notificacoes");
    } catch (err) {
      setError(err.message || "Não foi possível salvar as alterações.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="panel-card">Carregando notificação...</div>;
  }

  return (
    <div className="form-page">
      <section className="panel-card">
        <div className="form-header">
          <div>
            <p className="hero-kicker">Edição de aviso</p>
            <h1 className="form-title">Editar notificação</h1>
            <p className="form-subtitle">
              Atualize o conteúdo, o tipo e o vínculo da notificação.
            </p>
          </div>

          <Link to="/notificacoes" className="secondary-link-button">
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="premium-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Usuário</label>
              <select
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
              >
                <option value="">Selecione</option>
                {users.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.full_name || item.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo</label>
              <select
                name="notification_type"
                value={form.notification_type}
                onChange={handleChange}
              >
                <option value="info">Informação</option>
                <option value="warning">Aviso</option>
                <option value="success">Sucesso</option>
                <option value="error">Erro</option>
              </select>
            </div>

            <div className="form-group form-group-full">
              <label>Título</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group form-group-full">
              <label>Mensagem</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            <div className="form-group form-group-full">
              <label>Registro vinculado</label>
              <select
                name="related_record_id"
                value={form.related_record_id}
                onChange={handleChange}
              >
                <option value="">Nenhum</option>
                {records.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.app_number || item.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-checkbox">
              <input
                id="read"
                type="checkbox"
                name="read"
                checked={form.read}
                onChange={handleChange}
              />
              <label htmlFor="read">Marcar como lida</label>
            </div>
          </div>

          {error ? <div className="auth-error-box">{error}</div> : null}

          <div className="form-actions">
            <Link to="/notificacoes" className="secondary-link-button">
              Cancelar
            </Link>

            <button
              type="submit"
              className="primary-link-button"
              disabled={submitting}
            >
              <Save size={16} />
              <span>{submitting ? "Salvando..." : "Salvar alterações"}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}