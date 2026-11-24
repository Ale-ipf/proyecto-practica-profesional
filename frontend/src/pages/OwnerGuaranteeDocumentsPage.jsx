import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import DashboardLayout, { DashboardSection } from "../components/DashboardLayout.jsx";
import { OWNER_NAVIGATION } from "../components/dashboardNavigation.js";
import { listarMisPropiedades } from "../api/properties.js";
import {
  eliminarDocumentoGarantia,
  decidirSolicitudAccesoGarantia,
  listarDocumentosGarantia,
  listarSolicitudesAccesoGarantia,
  obtenerDescargaDocumentoGarantia,
  subirDocumentoGarantia,
} from "../api/guarantee-documents.js";
import { useAuth } from "../context/useAuth.js";

const DOCUMENT_TYPES = [
  { id: "title_deed", label: "Escritura o título de propiedad" },
  { id: "domain_report", label: "Informe de dominio" },
  { id: "consent", label: "Consentimiento de titulares" },
];
const documentLabel = (type) => DOCUMENT_TYPES.find((item) => item.id === type)?.label || "Documento";

export default function OwnerGuaranteeDocumentsPage() {
  const { usuario, logout } = useAuth();
  const [properties, setProperties] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [documentType, setDocumentType] = useState("title_deed");
  const [file, setFile] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (usuario?.role !== "owner") return;
    listarMisPropiedades()
      .then(({ properties: owned = [] }) => {
        setProperties(owned);
        setSelectedId(String(owned[0]?.id || ""));
      })
      .catch((requestError) => setError(requestError.message || "No pudimos cargar tus propiedades."))
      .finally(() => setLoading(false));
  }, [usuario?.role]);

  useEffect(() => {
    if (!selectedId) { setDocuments([]); return; }
    setRequests([]);
    setLoading(true);
    listarDocumentosGarantia(selectedId)
      .then(({ documents: saved = [] }) => setDocuments(saved))
      .catch((requestError) => setError(requestError.message || "No pudimos cargar los documentos."))
      .finally(() => setLoading(false));
    listarSolicitudesAccesoGarantia(selectedId)
      .then(({ requests: saved = [] }) => setRequests(saved))
      .catch((requestError) => setError(requestError.message || "No pudimos cargar las solicitudes."));
  }, [selectedId]);

  const selectedProperty = useMemo(
    () => properties.find((property) => String(property.id) === selectedId),
    [properties, selectedId],
  );

  if (!usuario) return <Navigate to="/login-and-registration" replace />;
  if (usuario.role !== "owner") return <Navigate to="/panel-estudiante" replace />;

  const refreshDocuments = async () => {
    const result = await listarDocumentosGarantia(selectedId);
    setDocuments(result.documents || []);
  };

  const refreshRequests = async () => {
    const result = await listarSolicitudesAccesoGarantia(selectedId);
    setRequests(result.requests || []);
  };

  const decideRequest = async (request, status) => {
    setWorking(true); setError(""); setMessage("");
    try {
      const result = await decidirSolicitudAccesoGarantia(selectedId, request.id, status);
      await refreshRequests();
      setMessage(result.message);
    } catch (requestError) { setError(requestError.message || "No pudimos responder la solicitud."); }
    finally { setWorking(false); }
  };

  const saveDocument = async (event) => {
    event.preventDefault();
    if (!file || !authorized) return;
    const form = event.currentTarget;
    setWorking(true); setError(""); setMessage("");
    try {
      await subirDocumentoGarantia(selectedId, documentType, file);
      await refreshDocuments();
      await refreshRequests();
      setFile(null); form.reset(); setAuthorized(false);
      setMessage("Documento guardado y accesos anteriores revocados por seguridad.");
    } catch (requestError) {
      setError(requestError.message || "No pudimos guardar el documento.");
    } finally { setWorking(false); }
  };

  const download = async (document) => {
    try {
      const result = await obtenerDescargaDocumentoGarantia(selectedId, document.id);
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (requestError) { setError(requestError.message || "No pudimos abrir el documento."); }
  };

  const removeDocument = async (document) => {
    if (!window.confirm(`¿Eliminar “${document.originalName}”?`)) return;
    setWorking(true); setError("");
    try {
      await eliminarDocumentoGarantia(selectedId, document.id);
      await refreshDocuments(); await refreshRequests(); setMessage("Documento eliminado.");
    } catch (requestError) { setError(requestError.message || "No pudimos eliminar el documento."); }
    finally { setWorking(false); }
  };

  return (
    <DashboardLayout user={usuario} roleLabel="Cuenta de propietario" navigation={OWNER_NAVIGATION} activeKey="guarantees" onLogout={logout}>
      <DashboardSection eyebrow="DOCUMENTACIÓN PRIVADA" title="Garantía propietaria" description="Cargá por propiedad la documentación que quieras tener lista para compartir con estudiantes interesados. Los archivos no son públicos y todavía no se comparten automáticamente.">
        {error && <p className="guarantee-message is-error" role="alert">{error}</p>}
        {message && <p className="guarantee-message" role="status">{message}</p>}
        {loading && properties.length === 0 ? <p>Cargando tus propiedades…</p> : properties.length === 0 ? (
          <div className="guarantee-empty"><h3>Primero publicá una propiedad</h3><p>La documentación se organiza por inmueble.</p></div>
        ) : (
          <div className="guarantee-manager">
            <label className="guarantee-property-select">Propiedad
              <select value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setError(""); setMessage(""); }}>
                {properties.map((property) => <option key={property.id} value={property.id}>{property.title}</option>)}
              </select>
            </label>
            <div className="guarantee-privacy-note">Los documentos quedan en almacenamiento privado. Confirmá que tenés autorización para cargar y compartir cualquier documento que incluya datos de otras personas.</div>
            <form className="guarantee-upload-form" onSubmit={saveDocument}>
              <h3>Agregar o reemplazar un documento</h3>
              <label>Tipo de documento
                <select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
                  {DOCUMENT_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <label>Archivo (PDF, JPG o PNG; máximo 12 MB)
                <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setFile(event.target.files?.[0] || null)} required />
              </label>
              <label className="guarantee-consent">
                <input type="checkbox" checked={authorized} onChange={(event) => setAuthorized(event.target.checked)} required />
                <span>Confirmo que puedo cargar este documento y autorizar su uso para gestionar la garantía de esta propiedad.</span>
              </label>
              <button className="button button-primary" type="submit" disabled={working || !file || !authorized}>{working ? "Guardando…" : "Guardar documento"}</button>
            </form>
            <section className="guarantee-document-list" aria-labelledby="guarantee-document-list-title">
              <h3 id="guarantee-document-list-title">Documentos guardados{selectedProperty ? ` · ${selectedProperty.title}` : ""}</h3>
              {loading ? <p>Cargando documentos…</p> : documents.length === 0 ? <p className="muted">Todavía no cargaste documentos para esta propiedad.</p> : (
                <ul>{documents.map((document) => (
                  <li key={document.id}>
                    <div><strong>{documentLabel(document.documentType)}</strong><span>{document.originalName} · {new Date(document.createdAt).toLocaleDateString("es-AR")}</span></div>
                    <div className="guarantee-document-actions">
                      <button type="button" className="button button-accent" onClick={() => download(document)} disabled={working}>Abrir</button>
                      <button type="button" className="button button-outline-danger" onClick={() => removeDocument(document)} disabled={working}>Eliminar</button>
                    </div>
                  </li>
                ))}</ul>
              )}
            </section>
            <section className="guarantee-document-list" aria-labelledby="guarantee-requests-title">
              <h3 id="guarantee-requests-title">Solicitudes para ver la garantía</h3>
              {requests.length === 0 ? <p className="muted">Todavía no hay solicitudes.</p> : (
                <ul>{requests.map((request) => (
                  <li key={request.id}>
                    <div>
                      <strong>{request.student?.name || "Estudiante"} · {request.status === "pending" ? "Pendiente" : request.status === "approved" ? "Aprobada" : request.status === "rejected" ? "Rechazada" : request.status === "revoked" ? "Revocada" : "Vencida"}</strong>
                      <span>{request.student?.email || ""}{request.expiresAt && request.status === "approved" ? ` · acceso hasta ${new Date(request.expiresAt).toLocaleString("es-AR")}` : ""}</span>
                    </div>
                    {request.status === "pending" && <div className="guarantee-document-actions">
                      <button type="button" className="button button-primary" onClick={() => decideRequest(request, "approved")} disabled={working}>Compartir por 24 h</button>
                      <button type="button" className="button button-outline-danger" onClick={() => decideRequest(request, "rejected")} disabled={working}>Rechazar</button>
                    </div>}
                    {request.status === "approved" && <div className="guarantee-document-actions">
                      <button type="button" className="button button-outline-danger" onClick={() => decideRequest(request, "revoked")} disabled={working}>Revocar acceso</button>
                    </div>}
                  </li>
                ))}</ul>
              )}
            </section>
          </div>
        )}
      </DashboardSection>
    </DashboardLayout>
  );
}
