import axios from "axios";
import { useEffect, useState } from "react";
import { api2 } from "../../FirebaseConfig";
import { toast } from "react-toastify";

const TemplateManager = () => {
  const partnerId = localStorage.getItem("partnerId");
  const [templates, setTemplates] = useState([]);

  const variablesByCategory = {
    common: [
      "{customeruserid}",
      "{customername}",
      "{customermobile}",
      "{customeremail}",
      "{customeraddress}",
      "{companyname}",
      "{companyaddress}",
      "{companyemail}",
      "{companymobile}",
    ],
    plan: [
      "{planname}",
      "{planamount}",
      "{dueamount}",
      "{discount}",
      "{receiptno}",
      "{planperiod}",
      "{paymentmode}",
    ],
    ticket: [
      "{ticketconcern}",
      "{ticketassignto}",
      "{ticketassigntomobile}",
      "{ticketcreatedate}",
      "{ticketassigndate_time}",
      "{happycode}",
    ],
    renewal: [
      "{planname}",
      "{planamount}",
      "{dueamount}",
      "{activationdate}",
      "{expirationdate}",
    ],
      emp_ticket: [
      "{ticketconcern}",
      "{ticketassignto}",
      "{ticketassigntomobile}",
      "{ticketcreatedate}",
      "{ticketassigndate_time}",
      "{description}"
    ],

          reassign_ticket: [
      "{ticketconcern}",
      "{ticketassignto}",
      "{ticketassigntomobile}",
      "{ticketcreatedate}",
      "{ticketassigndate_time}",
    ],
  };
  const [formData, setFormData] = useState({
    category: "",
    messagetype: "WhatsApp",
    messagecontent: "",
    sendInvoice: false,
  });
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const categories = ["Payment Collection", "Renewal", "Welcome", "Ticket", "Ticket Employee", "Ticket ReAssign"];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "category" && value !== "Payment Collection"
        ? { sendInvoice: false }
        : {}),
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

    const newText =
      formData.messagecontent.substring(0, start) +
      variable +
      formData.messagecontent.substring(end);

    setFormData({
      ...formData,
      messagecontent: newText,
    });
  };

  const getVariablesForCategory = () => {
    let vars = [...variablesByCategory.common]; // Always show customer/company variables

    if (formData.category === "Payment Collection") {
      vars = [...vars, ...variablesByCategory.plan];
    }
    if (formData.category === "Ticket") {
      vars = [...vars, ...variablesByCategory.ticket];
    }

    if (formData.category === "Renewal") {
      vars = [...vars, ...variablesByCategory.renewal];
    }
        if (formData.category === "Ticket Employee") {
      vars = [...vars, ...variablesByCategory.emp_ticket];
    }
    return vars;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.category || !formData.messagecontent.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    console.log(editingId);

    if (editingId) {
      const data = {
        messagetype: formData.messagetype,
        messagecontent: formData.messagecontent,
        sendInvoice: formData.sendInvoice,
      };
      // Update existing template
      try {
        const resposne = await axios.put(
          api2 + "/utility/template/" + editingId + "?partnerId=" + partnerId,
          data
        );
        console.log(resposne.data);

        setTemplates((prev) =>
          prev.map((template) =>
            template._id === editingId
              ? {
                  ...template,
                  messagetype: formData.messagetype,
                  messagecontent: formData.messagecontent.trim(),
                  sendInvoice:
                    formData.category === "Payment Collection"
                      ? formData.sendInvoice
                      : null,
                }
              : template
          )
        );
        setEditingId(null);
        setFormData({
          category: "",
          messagetype: "WhatsApp",
          messagecontent: "",
          sendInvoice: false,
        });
      } catch (e) {
        console.log(e);
      }
    } else {
      // Check if template for this category and message type combination already exists
      const existingTemplate = templates.find(
        (template) =>
          template.category === formData.category &&
          template.messagetype === formData.messagetype
      );
      if (existingTemplate) {
        setError(
          `A ${formData.messagetype} template for "${formData.category}" category already exists. Only one template per category per message type is allowed.`
        );
        return;
      }

      // Create new template
      const data = {
        id: Date.now(),
        category: formData.category,
        messagetype: formData.messagetype,
        messagecontent: formData.messagecontent.trim(),
        sendInvoice:
          formData.category === "Payment Collection"
            ? formData.sendInvoice
            : null,
        partnerId,
      };
      try {
        const resposne = await axios.post(
          api2 + "/utility/template?partnerId=" + partnerId,
          data
        );
        if (resposne.status !== 200)
          return toast.error("Failed to Add Template");

        toast.success(`${data.category} added`, { autoClose: 2000 });
        setTemplates((prev) => [...prev, data]);
        // Reset form
        setFormData({
          category: "",
          messagetype: "WhatsApp",
          messagecontent: "",
          sendInvoice: false,
        });
      } catch (e) {
        console.log(e);
      }
    }

    setError("");
  };

  const editTemplate = (template) => {
    setFormData({
      category: template.category,
      messagetype: template.messagetype,
      messagecontent: template.messagecontent,
      sendInvoice: template.sendInvoice || false,
    });
    setEditingId(template._id);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      category: "",
      messagetype: "WhatsApp",
      messagecontent: "",
      sendInvoice: false,
    });
    setError("");
  };

  const deleteTemplate = async (id) => {
    try {
      const response = await axios.delete(
        api2 + "/utility/template/" + id + "?partnerId=" + partnerId
      );
      if (response.status !== 200)
        return toast.error("Failed to Delete Template", { autoClose: 2000 });

      setTemplates((prev) => prev.filter((template) => template._id !== id));
      fetchTemplates();
      toast.success("Template Deleted Succesfully", { autoClose: 2000 });
    } catch (e) {
      console.log(e);
    }
  };

  const getAvailableCategories = () => {
    return categories;
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(
        api2 + "/utility/template?partnerId=" + partnerId
      );
      setTemplates(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <>
      <div className="py-5 mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header */}
            <div className="text-center mb-5">
              <h1 className="display-5 fw-bold text-primary">
                Communication Template Manager
              </h1>
            </div>

            <div className="d-flex flex-row">
              {/* Template Creation Form */}
              <div className="card shadow-sm col-md">
                <div className="card-header bg-primary text-white">
                  <h3 className="card-title mb-0">
                    {editingId ? "Edit Template" : "Create New Template"}
                  </h3>
                </div>
                <div className="card-body">
                  {/* Category Dropdown */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      disabled={editingId !== null}
                      className={`form-select ${editingId ? "bg-light" : ""}`}
                    >
                      <option value="">Select a category</option>
                      {getAvailableCategories().map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message Type Radio */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Message Type <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex gap-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="messagetype"
                          value="WhatsApp"
                          checked={formData.messagetype === "WhatsApp"}
                          onChange={(e) =>
                            handleInputChange("messagetype", e.target.value)
                          }
                        />
                        <label className="form-check-label">WhatsApp</label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="messagetype"
                          value="Email"
                          checked={formData.messagetype === "Email"}
                          onChange={(e) =>
                            handleInputChange("messagetype", e.target.value)
                          }
                        />
                        <label className="form-check-label">Email</label>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    {getVariablesForCategory().map((v) => (
                      <span
                        key={v}
                        draggable
                        onDragStart={(e) => handleDragStart(e, v)}
                        style={{
                          padding: "8px 12px",
                          margin: "5px",
                          background: "#d1e7ff",
                          border: "1px solid #007bff",
                          borderRadius: "6px",
                          cursor: "grab",
                          display: "inline-block",
                        }}
                      >
                        {v}
                      </span>
                    ))}
                  </div>

                  {/* Message Content */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Message Content <span className="text-danger">*</span>
                    </label>
                    <textarea
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      value={formData.messagecontent}
                      onChange={(e) =>
                        handleInputChange("messagecontent", e.target.value)
                      }
                      placeholder="Enter your message template..."
                      rows={10}
                      className="form-control"
                    />
                  </div>

                  {/* Conditional Checkbox for Payment Collection */}
                  {formData.category === "Payment Collection" && (
                    <div className="mb-4">
                      <div className="card bg-light">
                        <div className="card-body py-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.sendInvoice}
                              onChange={(e) =>
                                handleInputChange(
                                  "sendInvoice",
                                  e.target.checked
                                )
                              }
                            />
                            <label className="form-check-label fw-semibold">
                              Also send invoice along with the message
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error}
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={false}
                      className="btn btn-primary flex-grow-1"
                    >
                      {editingId ? "Update Template" : "Create Template"}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="btn btn-outline-secondary"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Templates List */}
              <div className="card shadow-sm col-md">
                <div className="card-header bg-success text-white">
                  <h3 className="card-title mb-0">Created Templates</h3>
                </div>
                <div className="card-body">
                  {templates.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <i className="bi bi-inbox display-1 text-muted"></i>
                      <p className="mt-3">
                        No templates created yet. Create your first template
                        above.
                      </p>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {templates.map((template) => (
                        <div key={template._id} className="col-12">
                          <div className="card border-start border-4 border-primary">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="d-flex flex-wrap gap-2">
                                  <span className="badge bg-primary fs-6">
                                    {template.category}
                                  </span>
                                  <span className="badge bg-success fs-6">
                                    {template.messagetype}
                                  </span>
                                  {template.sendInvoice !== null && (
                                    <span
                                      className={`badge fs-6 ${
                                        template.sendInvoice
                                          ? "bg-warning text-dark"
                                          : "bg-secondary"
                                      }`}
                                    >
                                      Invoice:{" "}
                                      {template.sendInvoice ? "Yes" : "No"}
                                    </span>
                                  )}
                                </div>
                                <div className="d-flex gap-2">
                                  <button
                                    onClick={() => editTemplate(template)}
                                    className="btn btn-outline-primary btn-sm"
                                  >
                                    <i className="bi bi-pencil me-1"></i>
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteTemplate(template._id)}
                                    className="btn btn-outline-danger btn-sm"
                                  >
                                    <i className="bi bi-trash me-1"></i>
                                    Delete
                                  </button>
                                </div>
                              </div>

                              <div className="bg-light p-3 rounded">
                                <h6 className="text-muted mb-2">
                                  Message Content:
                                </h6>
                                <p
                                  className="mb-0"
                                  style={{ whiteSpace: "pre-wrap" }}
                                >
                                  {template.messagecontent}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplateManager;
