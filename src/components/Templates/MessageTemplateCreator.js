import { useEffect, useState } from "react";
import { API } from "../../FirebaseConfig";
import { toast } from "react-toastify";
import { 
  FiMessageSquare, FiMail, FiPlus, FiEdit3, FiTrash2, 
  FiHash, FiDatabase, FiFileText, FiXCircle, FiCheckCircle 
} from "react-icons/fi"; // Professional icons

const TemplateManager = () => {
  const partnerId = localStorage.getItem("partnerId");
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    messagetype: "WhatsApp",
    messagecontent: "",
    sendInvoice: false,
  });

  const categories = ["Payment Collection", "Renewal", "Welcome", "Ticket", "Ticket Employee", "Ticket ReAssign"];

  const variablesByCategory = {
    common: ["{customeruserid}", "{customername}", "{customermobile}", "{customeremail}", "{customeraddress}", "{companyname}", "{companyaddress}", "{companyemail}", "{companymobile}"],
    plan: ["{planname}", "{planamount}", "{dueamount}", "{discount}", "{receiptno}", "{planperiod}", "{paymentmode}"],
    ticket: ["{ticketconcern}", "{ticketassignto}", "{ticketassigntomobile}", "{ticketcreatedate}", "{ticketassigndate_time}", "{happycode}"],
    renewal: ["{planname}", "{planamount}", "{dueamount}", "{activationdate}", "{expirationdate}"],
    emp_ticket: ["{ticketconcern}", "{ticketassignto}", "{ticketassigntomobile}", "{ticketcreatedate}", "{ticketassigndate_time}", "{description}"],
    reassign_ticket: ["{ticketconcern}", "{ticketassignto}", "{ticketassigntomobile}", "{ticketcreatedate}", "{ticketassigndate_time}"],
  };

  // Logic remains identical to original
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "category" && value !== "Payment Collection" ? { sendInvoice: false } : {}),
    }));
    if (error) setError("");
  };

  const handleDragStart = (e, variable) => {
    e.dataTransfer.setData("text/plain", variable);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const variable = e.dataTransfer.getData("text/plain");
    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = formData.messagecontent.substring(0, start) + variable + formData.messagecontent.substring(end);
    setFormData({ ...formData, messagecontent: newText });
  };

  const getVariablesForCategory = () => {
    let vars = [...variablesByCategory.common];
    if (formData.category === "Payment Collection") vars = [...vars, ...variablesByCategory.plan];
    if (formData.category === "Ticket") vars = [...vars, ...variablesByCategory.ticket];
    if (formData.category === "Renewal") vars = [...vars, ...variablesByCategory.renewal];
    if (formData.category === "Ticket Employee") vars = [...vars, ...variablesByCategory.emp_ticket];
    if (formData.category === "Ticket ReAssign") vars = [...vars, ...variablesByCategory.reassign_ticket];
    return vars;
  };

  const fetchTemplates = async () => {
    try {
      const response = await API.get(`/utility/template?partnerId=${partnerId}`);
      setTemplates(response.data);
    } catch (e) { console.log(e); }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleSubmit = async () => {
    if (!formData.category || !formData.messagecontent.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (editingId) {
      const data = { messagetype: formData.messagetype, messagecontent: formData.messagecontent, sendInvoice: formData.sendInvoice };
      try {
        await API.put(`/utility/template/${editingId}?partnerId=${partnerId}`, data);
        toast.success("Template Updated");
        setEditingId(null);
        cancelEdit();
        fetchTemplates();
      } catch (e) { console.log(e); }
    } else {
      const existingTemplate = templates.find(t => t.category === formData.category && t.messagetype === formData.messagetype);
      if (existingTemplate) {
        setError(`A ${formData.messagetype} template for "${formData.category}" already exists.`);
        return;
      }

      const data = {
        id: Date.now(),
        category: formData.category,
        messagetype: formData.messagetype,
        messagecontent: formData.messagecontent.trim(),
        sendInvoice: formData.category === "Payment Collection" ? formData.sendInvoice : null,
        partnerId,
      };
      try {
        const res = await API.post(`/utility/template?partnerId=${partnerId}`, data);
        if (res.status === 200) {
          toast.success(`${data.category} added`);
          fetchTemplates();
          cancelEdit();
        }
      } catch (e) { console.log(e); }
    }
  };

  const deleteTemplate = async (id) => {
    if(!window.confirm("Delete this template?")) return;
    try {
      await API.delete(`/utility/template/${id}?partnerId=${partnerId}`);
      toast.success("Template Deleted");
      fetchTemplates();
    } catch (e) { console.log(e); }
  };

  const editTemplate = (template) => {
    setFormData({
      category: template.category,
      messagetype: template.messagetype,
      messagecontent: template.messagecontent,
      sendInvoice: template.sendInvoice || false,
    });
    setEditingId(template._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ category: "", messagetype: "WhatsApp", messagecontent: "", sendInvoice: false });
    setError("");
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold text-dark m-0">Template Engine</h2>
            <p className="text-muted small">Configure automated communication triggers</p>
          </div>
          <div className="d-flex gap-2">
            <span className="badge bg-white text-dark border p-2 px-3 shadow-sm d-flex align-items-center">
              <FiDatabase className="me-2 text-primary" /> {templates.length} Active Templates
            </span>
          </div>
        </div>

        <div className="row g-4">
          {/* Designer Canvas (Left) */}
          <div className="col-xl-5 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-dark p-3 px-4 d-flex align-items-center justify-content-between">
                <h5 className="text-white m-0 fw-bold">
                  {editingId ? <><FiEdit3 className="me-2 text-warning"/> Edit Designer</> : <><FiPlus className="me-2 text-success"/> New Design</>}
                </h5>
                {editingId && <button onClick={cancelEdit} className="btn btn-sm btn-outline-light border-0"><FiXCircle /></button>}
              </div>
              
              <div className="card-body p-4">
                {/* Category Selection */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-uppercase text-muted">Trigger Category</label>
                  <select
                    className={`form-select border-0 bg-light p-3 shadow-none fw-bold ${editingId ? 'opacity-75' : ''}`}
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    disabled={editingId !== null}
                  >
                    <option value="">Choose a trigger...</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Message Type Selector */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-uppercase text-muted">Delivery Channel</label>
                  <div className="d-flex gap-2">
                    {["WhatsApp", "Email"].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleInputChange("messagetype", type)}
                        className={`btn flex-fill p-2 fw-bold border-0 transition-all ${formData.messagetype === type ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                      >
                        {type === "WhatsApp" ? <FiMessageSquare className="me-2"/> : <FiMail className="me-2"/>} {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Variable Bank */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-uppercase text-muted d-flex justify-content-between">
                    <span>Data Placeholders</span>
                    <span className="text-lowercase fw-normal">Drag to editor</span>
                  </label>
                  <div className="bg-light p-3 rounded-3 d-flex flex-wrap gap-2 border" style={{maxHeight: '150px', overflowY: 'auto'}}>
                    {getVariablesForCategory().length > 0 ? (
                      getVariablesForCategory().map((v) => (
                        <div
                          key={v}
                          draggable
                          onDragStart={(e) => handleDragStart(e, v)}
                          className="variable-pill"
                        >
                          <FiHash className="me-1 opacity-50" /> {v.replace('{', '').replace('}', '')}
                        </div>
                      ))
                    ) : <span className="text-muted small italic">Select a category to see variables</span>}
                  </div>
                </div>

                {/* Editor */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-uppercase text-muted">Message Content</label>
                  <textarea
                    className="form-control border-0 bg-light p-3 shadow-none"
                    rows={8}
                    value={formData.messagecontent}
                    onChange={(e) => handleInputChange("messagecontent", e.target.value)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    placeholder="Type your message here or drag variables..."
                    style={{ fontSize: '0.95rem', lineHeight: '1.6' }}
                  />
                </div>

                {formData.category === "Payment Collection" && (
                  <div className="form-check form-switch bg-primary-subtle p-3 rounded-3 ps-5 mb-4 border border-primary-subtle">
                    <input 
                      className="form-check-input ms-n4" 
                      type="checkbox" 
                      checked={formData.sendInvoice}
                      onChange={(e) => handleInputChange("sendInvoice", e.target.checked)}
                    />
                    <label className="form-check-label fw-bold text-primary small">Attach PDF Invoice automatically</label>
                  </div>
                )}

                {error && <div className="alert alert-danger border-0 small py-2 d-flex align-items-center"><FiXCircle className="me-2"/> {error}</div>}

                <button onClick={handleSubmit} className={`btn btn-lg w-100 fw-bold shadow-sm ${editingId ? 'btn-warning' : 'btn-primary'}`}>
                  {editingId ? <><FiCheckCircle className="me-2"/> Update Template</> : <><FiPlus className="me-2"/> Create Template</>}
                </button>
              </div>
            </div>
          </div>

          {/* Template List (Right) */}
          <div className="col-xl-7 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-white border-0 p-4">
                <h5 className="fw-bold m-0"><FiFileText className="me-2 text-success"/> Template Library</h5>
              </div>
              <div className="card-body p-0">
                {templates.length === 0 ? (
                  <div className="text-center py-5 opacity-50">
                    <FiDatabase size={48} className="mb-3"/>
                    <p>No templates found in your library.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="bg-light small text-muted text-uppercase">
                        <tr>
                          <th className="ps-4 py-3 border-0">Event Category</th>
                          <th className="py-3 border-0">Channel</th>
                          <th className="py-3 border-0">Invoice</th>
                          <th className="pe-4 py-3 border-0 text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {templates.map((t) => (
                          <tr key={t._id}>
                            <td className="ps-4 py-3 fw-bold">{t.category}</td>
                            <td>
                              {t.messagetype === "WhatsApp" ? 
                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2">
                                  <FiMessageSquare className="me-1"/> WhatsApp
                                </span> : 
                                <span className="badge bg-info-subtle text-info border border-info-subtle px-2">
                                  <FiMail className="me-1"/> Email
                                </span>
                              }
                            </td>
                            <td>
                              {t.sendInvoice ? 
                                <span className="text-success small fw-bold"><FiCheckCircle className="me-1"/> Yes</span> : 
                                <span className="text-muted small">N/A</span>
                              }
                            </td>
                            <td className="pe-4 py-3 text-end">
                              <div className="btn-group shadow-sm rounded-2 overflow-hidden">
                                <button onClick={() => editTemplate(t)} className="btn btn-white btn-sm border text-primary">
                                  <FiEdit3 />
                                </button>
                                <button onClick={() => deleteTemplate(t._id)} className="btn btn-white btn-sm border text-danger">
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .variable-pill {
          background: #fff;
          border: 1px solid #dee2e6;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #495057;
          cursor: grab;
          display: flex;
          align-items: center;
          transition: all 0.2s;
          user-select: none;
        }
        .variable-pill:hover {
          border-color: #0d6efd;
          color: #0d6efd;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }
        .variable-pill:active { cursor: grabbing; }
        .bg-primary-subtle { background-color: #e7f0ff !important; }
        .bg-success-subtle { background-color: #e6fcf5 !important; }
        .bg-info-subtle { background-color: #e7f5ff !important; }
        .transition-all { transition: all 0.3s ease; }
        .form-switch .form-check-input { width: 3em; cursor: pointer; }
        .table > :not(caption) > * > * { border-bottom-width: 1px; border-color: #f1f1f1; }
        @media (max-width: 768px) {
          .display-5 { font-size: 1.8rem; }
          .container-fluid { padding: 10px !important; }
        }
      `}</style>
    </div>
  );
};

export default TemplateManager;