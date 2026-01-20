import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FileText, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LectureForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { course_id, module_id, lecture_id } = useParams();
  const isEditMode = !!lecture_id;
  const token = localStorage.getItem("authToken");

  // --- State ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [existingResources, setExistingResources] = useState([]);
  const [resourcesToDelete, setResourcesToDelete] = useState([]);
  const [newResources, setNewResources] = useState([{ type: "PDF", value: null }]);
  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const RESOURCE_TYPES = ["PDF", "Video", "Image", "Link"];


  // --- Auth Check ---
  useEffect(() => {
    if (!token) return navigate("/");

    try {
      const decoded = jwtDecode(token);
      const roles = decoded.roles || [];
      if (!roles.includes("Trainer")) navigate("/access-denied");
    } catch {
      localStorage.removeItem("authToken");
      navigate("/login");
    }
  }, [token, navigate]);

  const [formData, setFormData] = useState({
    start_date: "",
    end_date: ""
  });


  // --- Fetch Lecture Data for Edit ---
  useEffect(() => {
    if (!isEditMode) return setLoading(false);

    const fetchLectureData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/lectures/id/${lecture_id}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const result = await res.json();

        if (res.ok && result.lecture) {
          setTitle(result.lecture.title || "");
          setDescription(result.lecture.description || "");
          setExistingResources(result.lecture.resources || []);

          // --- Pre-fill start & end dates ---
          setFormData({
            start_date: result.lecture.start_date ? result.lecture.start_date.split("T")[0] : "",
            end_date: result.lecture.end_date ? result.lecture.end_date.split("T")[0] : ""
          });
        } else {
          alert(t("lecture.not_found"));
          navigate(`/${course_id}/modules/${module_id}/lectures`);
        }
      } catch (err) {
        console.error(err);
        alert(t("lecture.failed_load"));
      } finally {
        setLoading(false);
      }
    };

    fetchLectureData();
  }, [isEditMode, lecture_id, course_id, module_id, navigate, token]);
  // --- Resource Handlers ---
  const handleAddNewResourceField = () => {
    if (existingResources.length + newResources.length >= 5) {
      alert(t("lecture.max_resources"));
      return;
    }
    setNewResources([...newResources, { type: "PDF", value: null }]);
  };

  const handleResourceTypeChange = (index, type) => {
    const updated = [...newResources];
    updated[index].type = type;
    updated[index].value = null;
    setNewResources(updated);
  };

  const handleResourceValueChange = (index, value) => {
    const updated = [...newResources];
    updated[index].value = value;
    setNewResources(updated);
  };

  const handleRemoveResourceField = (index) => {
    const updated = [...newResources];
    updated.splice(index, 1);
    setNewResources(updated);
  };

  const handleDeleteExistingResource = (resourceId) => {
    if (window.confirm(t("resource.confirm_delete"))) {
      setResourcesToDelete(prev => [...prev, resourceId]);
      setExistingResources(prev => prev.filter(res => res.resource_id !== resourceId));
    }
  };

  // --- Submission Handlers ---
  const handleLectureMetadata = async (dataToSubmit) => {
    const method = isEditMode ? "PUT" : "POST";
    const apiEndpoint = isEditMode ? `/api/lectures/${lecture_id}` : `/api/lectures`;

    try {
      const res = await fetch(apiEndpoint, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(dataToSubmit),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit lecture metadata");
      return data;
    } catch (err) {
      console.error(err);
      alert(err.message);
      throw err;
    }
  };

  const deleteResources = async () => {
    if (resourcesToDelete.length === 0) return;

    try {
      const res = await fetch("/api/lectures/resource/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resource_ids: resourcesToDelete }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete old resources");
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
      throw err;
    }
  };

  const uploadNewResources = async (targetLectureId) => {
    // Separate files and links
    const filesToUpload = newResources.filter(r => r.value instanceof File);
    const linksToSubmit = newResources
      .filter(r => r.type === "Link" && r.value)
      .map(r => r.value);

    // Only proceed if there are files or links to upload
    if (filesToUpload.length === 0 && linksToSubmit.length === 0) return;

    const formData = new FormData();
    formData.append("lecture_id", targetLectureId);

    // Append files
    filesToUpload.forEach(file => formData.append("files", file.value));

    // Append links (stringify array)
    if (linksToSubmit.length > 0) {
      formData.append("links", JSON.stringify(linksToSubmit));
    }

    try {
      const res = await fetch("/api/lectures/resource", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` }, // Let fetch set Content-Type
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload lecture resources");
      }

      // Optionally, you can return the uploaded resources if backend responds with them
      const result = await res.json();
      return result;
    } catch (err) {
      console.error(err);
      alert(err.message);
      throw err;
    }
  };


  const handleSubmitAll = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert(t("lecture.title_required"));

    setIsSubmitting(true);
    let targetLectureId = lecture_id;

    try {
      // 1️⃣ Prepare lecture metadata
      const metadataPayload = {
        title: title.trim(),
        description,
        module_id,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      // 2️⃣ Save lecture metadata (create or update)
      const metadataResult = await handleLectureMetadata(metadataPayload);
      if (!isEditMode) targetLectureId = metadataResult.lecture.lecture_id;

      // 3️⃣ Delete selected existing resources (only in edit mode)
      if (isEditMode && resourcesToDelete.length > 0) {
        await deleteResources();
        // Update frontend state
        setExistingResources(prev =>
          prev.filter(res => !resourcesToDelete.includes(res.resource_id))
        );
        setResourcesToDelete([]); // clear deleted IDs
      }

      // 4️⃣ Upload new resources
      const uploaded = await uploadNewResources(targetLectureId);

      // 5️⃣ Update frontend state with newly uploaded resources
      if (uploaded?.resources && uploaded.resources.length > 0) {
        setExistingResources(prev => [...prev, ...uploaded.resources]);
      }

      // 6️⃣ Reset new resources form fields
      setNewResources([{ type: "PDF", value: null }]);

      const action = isEditMode ? t("lecture.update_btn") : t("lecture.create_btn");
      alert(t("lecture.success_message", { action }));

      navigate(`/${course_id}/modules/${module_id}/lectures`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to submit lecture.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  // --- Delete Lecture ---
  const handleDelete = async () => {
    if (window.confirm(t("lecture.confirm_delete", { title }))) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/lectures/${lecture_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert(t("lecture.deleted_success"));
        navigate(`/${course_id}/modules/${module_id}/lectures`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete lecture.");
      }
    } catch (err) {
      console.error(err);
      alert(t("module.delete_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/${course_id}/modules/${module_id}/lectures`);
  };

  if (loading) return <p className="text-center py-5">{t("lecture.loading")}</p>; // 🔹 translated

  // --- Render ---
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h3 style={styles.title}>{isEditMode ? t("lecture.edit_title") : t("lecture.add_title")}</h3>
        <form onSubmit={handleSubmitAll}>
          {/* Lecture Title */}
          <div className="mb-3">
            <label className="form-label">{t("lecture.label_title")}</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Lecture Description */}
          <div className="mb-3">
            <label className="form-label">{t("lecture.label_description")}</label>
            <textarea
              className="form-control"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            ></textarea>
          </div>

          <div className="row mb-3">
            <div className="col">
              <label className="col-sm-3 col-form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                onClick={(e) => e.target.showPicker()}
              />
            </div>

            <div className="col">
              <label className="col-sm-3 col-form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                onClick={(e) => e.target.showPicker()}
              />
            </div>
          </div>

          {/* --- RESOURCES SECTION --- */}
          <div className="mb-4 pt-3 border-top">
            <label className="form-label d-block fw-bold">{t("lecture.resources_title")}</label>
            {/* Existing Resources */}
            {existingResources.length > 0 && (
              <div className="card p-3 mb-3 bg-light">
                <h6 className="card-title text-muted small">{t("resource.existing")}</h6>
                {existingResources.map(res => (
                  <div key={res.resource_id} className="d-flex justify-content-between align-items-center mb-1 py-1 border-bottom">
                    <a href={`${window.location.origin}/uploads/lectures/${res.file_url}`} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center text-truncate me-2">
                      <FileText size={16} className="me-2 text-primary" />
                      {res.file_url}
                    </a>
                    <button type="button" className="btn btn-sm text-danger p-0" onClick={() => handleDeleteExistingResource(res.resource_id)} disabled={isSubmitting}>
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <h6 className="mt-3 small fw-bold">{t("resource.add_new")}</h6>
            {newResources.map((res, index) => {
              const isLast = index === newResources.length - 1;
              return (
                <div key={index} className="d-flex align-items-center mb-2 gap-2">
                  {/* Resource Type Selector */}
                  <select className="form-select form-select-sm" value={res.type} onChange={(e) => handleResourceTypeChange(index, e.target.value)} disabled={isSubmitting} style={{ maxWidth: '120px' }}>
                    {RESOURCE_TYPES.map(type => (<option key={type} value={type}>{type}</option>))}
                  </select>

                  {/* Dynamic Input */}
                  {res.type === "Link" ? (
                    <input type="text" className="form-control form-control-sm" placeholder={t("resource.enter_url")} value={res.value || ""} onChange={(e) => handleResourceValueChange(index, e.target.value)} disabled={isSubmitting} />
                  ) : (
                    <input type="file" className="form-control form-control-sm" onChange={(e) => handleResourceValueChange(index, e.target.files[0])} disabled={isSubmitting} />
                  )}

                  {/* Add/Remove Button */}
                  {isLast ? (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddNewResourceField} disabled={isSubmitting || existingResources.length + newResources.length >= 5}>{t("resource.add")}</button>
                  ) : (
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveResourceField(index)} disabled={isSubmitting}>{t("resource.remove")}</button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end pt-4 border-top">
            {isEditMode && (
              <button type="button" className="btn btn-danger rounded-pill me-auto" style={styles.btn} onClick={handleDelete} disabled={isSubmitting}>{t("lecture.delete")}</button>
            )}
            <button type="button" className="btn btn-outline-secondary rounded-pill me-2" style={styles.btn} onClick={handleCancel} disabled={isSubmitting}>{t("lecture.cancel")}</button>
            <button type="submit" className="btn btn-primary rounded-pill" style={styles.btn} disabled={isSubmitting || (!isEditMode && !title.trim())}>
              {isSubmitting ? t("lecture.processing") : isEditMode ? t("lecture.update_btn") : t("lecture.create_btn")}
            </button>
          </div>
        </form >
      </div >
    </div >
  );
}

// --- Styles ---
const styles = {
  page: { backgroundColor: "#F8F9FA", minHeight: "100vh", padding: "30px" },
  card: { backgroundColor: "#FFF", borderRadius: "10px", padding: "40px", maxWidth: "800px", margin: "0 auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  title: { fontWeight: 600, marginBottom: "10px", color: "#343A40" },
  btn: { minWidth: "160px", padding: "10px 16px", fontWeight: 600 },
};