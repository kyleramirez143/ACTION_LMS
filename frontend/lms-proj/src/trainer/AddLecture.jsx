import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FileText, X } from "lucide-react"; // Import for resource management icons

// NOTE: This component handles both /trainer/:course_id/modules/:module_id/create 
// and /trainer/edit-lecture/:course_id/modules/:module_id/:lecture_id
export default function LectureForm() {
  const navigate = useNavigate();
  // Get course_id and module_id (always present), and lecture_id (optional for 'Add')
  const { course_id, module_id, lecture_id } = useParams();
  const isEditMode = !!lecture_id; // Check if we are in Edit mode
  const token = localStorage.getItem("authToken");

  // --- State Fields ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Resource Management States
  const [existingResources, setExistingResources] = useState([]);
  const [newResources, setNewResources] = useState([null]); // Array of File objects/nulls
  const [resourcesToDelete, setResourcesToDelete] = useState([]);

  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- AUTH CHECK ---
  useEffect(() => {
    if (!token) return navigate("/");

    try {
      const decoded = jwtDecode(token);
      const roles = decoded.roles || [];
      if (!roles.includes("Trainer")) navigate("/access-denied");
    } catch (err) {
      localStorage.removeItem("authToken");
      navigate("/login");
    }
  }, [token, navigate]);

  // ================================
  // FETCH LECTURE DATA FOR EDIT MODE
  // ================================
  useEffect(() => {
    if (isEditMode) {
      const fetchLectureData = async () => {
        setLoading(true);
        try {
          // API Call: GET /api/lectures/:lecture_id
          const res = await fetch(`/api/lectures/id/${lecture_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          });
          const result = await res.json();

          if (res.ok && result.lecture) {
            setTitle(result.lecture.title || "");
            setDescription(result.lecture.description || "");
            setExistingResources(result.lecture.resources || []);
          } else {
            alert(result.error || "Lecture not found or an error occurred.");
            navigate(`/trainer/${course_id}/modules/${module_id}/lectures`); // Redirect on error
          }
        } catch (err) {
          console.error("Failed to fetch lecture data:", err);
          alert("Failed to load lecture data.");
        } finally {
          setLoading(false);
        }
      };
      fetchLectureData();
    } else {
      setLoading(false); // Not in edit mode, no data to fetch
    }
  }, [isEditMode, lecture_id, course_id, module_id, navigate, token]);


  // ================================
  // RESOURCE MANAGEMENT HANDLERS
  // ================================

  // Add a new resource file field (max total 5 resources/slots)
  const handleAddNewResourceField = () => {
    if (existingResources.length + newResources.filter(f => f !== undefined).length >= 5) {
      alert("Maximum of 5 resources allowed per lecture.");
      return;
    }
    setNewResources([...newResources, null]);
  };

  // Update a new file in a resource slot
  const handleNewResourceChange = (index, file) => {
    const updated = [...newResources];
    updated[index] = file;
    setNewResources(updated);
  };

  // Remove an unused new resource field
  const handleRemoveNewResourceField = (index) => {
    const updated = [...newResources];
    updated.splice(index, 1);
    setNewResources(updated);
  };

  // Mark an existing resource for deletion
  const handleDeleteExistingResource = (resourceId) => {
    if (window.confirm("Are you sure you want to permanently delete this resource file?")) {
      setResourcesToDelete(prev => [...prev, resourceId]);
      setExistingResources(prev => prev.filter(res => res.resource_id !== resourceId));
    }
  };


  // ================================
  // SUBMISSION API HANDLERS (STEPS)
  // ================================

  // 1. Create/Update Lecture Metadata
  const handleLectureMetadata = async (dataToSubmit) => {
    const method = isEditMode ? "PUT" : "POST";
    const apiEndpoint = isEditMode
      ? `/api/lectures/${lecture_id}` // Endpoint for PUT (update)
      : `/api/lectures`;           // Endpoint for POST (create)

    try {
      const res = await fetch(apiEndpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSubmit),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${isEditMode ? "update" : "create"} lecture`);
      }
      return data; // Returns the newly created lecture ID if POST
    } catch (err) {
      console.error("Metadata API Error:", err);
      alert(err.message);
      throw err;
    }
  };

  // 2. Delete marked resources
  const deleteResources = async () => {
    if (resourcesToDelete.length === 0) return;

    try {
      // API Call: DELETE /api/lectures/resource/delete
      const res = await fetch("/api/lectures/resource/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resource_ids: resourcesToDelete,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete old resources");
      }
      console.log("Old resources deleted successfully.");
    } catch (err) {
      console.error("Delete Resources Error:", err);
      alert(err.message);
      // Re-throw to stop subsequent steps if deletion is critical
      throw err;
    }
  };

  // 3. Upload NEW resources
  const uploadNewResources = async (targetLectureId) => {
    const filesToUpload = newResources.filter(file => file instanceof File);
    if (filesToUpload.length === 0) return;

    const formData = new FormData();
    filesToUpload.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("lecture_id", targetLectureId);

    try {
      // API Call: POST /api/lectures/resource
      const res = await fetch("/api/lectures/resource", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload new resources");
      }
      alert("New resources uploaded successfully.");
    } catch (err) {
      console.error("Resource Upload Error:", err);
      alert(err.message);
      throw err;
    }
  };


  // ================================
  // COMBINED SUBMIT HANDLER
  // ================================
  const handleSubmitAll = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Lecture title is required");

    setIsSubmitting(true);
    let targetLectureId = lecture_id;

    try {
      // STEP 1: Handle Metadata (Create or Update)
      const metadataPayload = {
        title: title.trim(),
        description,
        module_id,
      };

      const metadataResult = await handleLectureMetadata(metadataPayload);

      // If creating a new lecture, get the new ID for resource upload
      if (!isEditMode) {
        targetLectureId = metadataResult.lecture.lecture_id;
      }

      // STEP 2: Delete old resources (only applies to Edit mode, but harmless in Add)
      if (isEditMode) {
        await deleteResources();
      }

      // STEP 3: Upload new resources (Applies to both Add and Edit)
      await uploadNewResources(targetLectureId);

      // Final: navigate back to module lectures page
      alert(`Lecture ${isEditMode ? "updated" : "created"} successfully!`);
      navigate(`/trainer/${course_id}/modules/${module_id}/lectures`);

    } catch (err) {
      console.error("Submission Error:", err);
      // Alert is handled in step-specific functions
    } finally {
      setIsSubmitting(false);
    }
  };


  // ================================
  // HANDLE DELETE (EDIT MODE ONLY)
  // ================================
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete the lecture: ${title}? This action cannot be undone.`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      // API Call: DELETE /api/lectures/:lecture_id (Needs to be implemented in backend)
      const res = await fetch(`/api/lectures/${lecture_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Lecture deleted successfully!");
        navigate(`/trainer/${course_id}/modules/${module_id}/lectures`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete lecture.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Something went wrong during deletion.");
    } finally {
      setIsSubmitting(false);
    }
  };


  // ================================
  // HANDLE CANCEL
  // ================================
  const handleCancel = () => {
    navigate(`/trainer/${course_id}/modules/${module_id}/lectures`);
  };


  if (loading) {
    return <p className="text-center py-5">Loading lecture data...</p>;
  }


  // ================================
  // RENDER
  // ================================
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h3 style={styles.title}>
          {isEditMode ? `Edit Lecture` : "Add New Lecture"}
        </h3>
        {/* <h6 className="text-muted mb-4">Module ID: {module_id}</h6> */}

        <form onSubmit={handleSubmitAll}>

          {/* Lecture Title */}
          <div className="mb-3">
            <label className="form-label">Lecture Title</label>
            <input
              type="text"
              className="form-control"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Lecture Description */}
          <div className="mb-3">
            <label className="form-label">Lecture Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            ></textarea>
          </div>

          {/* --- RESOURCES SECTION --- */}
          <div className="mb-4 pt-3 border-top">
            <label className="form-label d-block fw-bold">Manage Resources (Max 5 Files)</label>

            {/* Existing Resources List */}
            {existingResources.length > 0 && (
              <div className="card p-3 mb-3 bg-light">
                <h6 className="card-title text-muted small">Existing Files:</h6>
                {existingResources.map(res => (
                  <div key={res.resource_id} className="d-flex justify-content-between align-items-center mb-1 py-1 border-bottom">
                    <a href={`${window.location.origin}/uploads/lectures/${res.file_url}`} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center text-truncate me-2">
                      <FileText size={16} className="me-2 text-primary" />
                      {res.file_url}
                    </a>
                    <button
                      type="button"
                      className="btn btn-sm text-danger p-0"
                      onClick={() => handleDeleteExistingResource(res.resource_id)}
                      disabled={isSubmitting}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <h6 className="mt-3 small fw-bold">Upload New Files:</h6>

            {/* New Resources Input Fields */}
            {newResources.map((res, index) => {
              const isLast = index === newResources.length - 1;
              return (
                <div key={index} className="d-flex align-items-center mb-2">
                  <input
                    type="file"
                    className="form-control form-control-sm me-2"
                    onChange={(e) => handleNewResourceChange(index, e.target.files[0])}
                    disabled={isSubmitting || existingResources.length + newResources.filter(f => f instanceof File).length >= 5}
                  />

                  {/* Add/Remove Button Logic */}
                  {isLast && newResources[index] !== null ? (
                    // If a file is selected in the last slot, show Add
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleAddNewResourceField}
                      disabled={isSubmitting || existingResources.length + newResources.filter(f => f instanceof File).length >= 5}
                      style={{ minWidth: '60px' }}
                    >
                      Add
                    </button>
                  ) : isLast ? (
                    // If the last slot is empty, show Add only if not maxed out
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleAddNewResourceField}
                      disabled={isSubmitting || existingResources.length + newResources.filter(f => f instanceof File).length >= 5}
                      style={{ minWidth: '60px' }}
                    >
                      Add
                    </button>
                  ) : (
                    // For all other slots, show Remove
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemoveNewResourceField(index)}
                      disabled={isSubmitting}
                      style={{ minWidth: '60px' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>


          {/* Action Buttons */}
          <div className="d-flex justify-content-end pt-4 border-top">
            {isEditMode && (
              <button
                type="button"
                className="btn btn-danger rounded-pill me-auto"
                style={styles.btn}
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                Delete
              </button>
            )}

            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill me-2"
              style={styles.btn}
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary rounded-pill"
              style={styles.btn}
              disabled={isSubmitting || (!isEditMode && !title.trim())}
            >
              {isSubmitting
                ? "Processing..."
                : isEditMode
                  ? "Update Lecture"
                  : "Create Lecture"
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// Keeping the styles separate for clarity
const styles = {
  page: {
    backgroundColor: "#F8F9FA", // Light background for the page
    minHeight: "100vh",
    padding: "30px 30px",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "10px",
    padding: "40px",
    maxWidth: "800px",
    margin: "0 auto",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.10)", // Softer shadow
  },
  title: {
    fontWeight: 600,
    marginBottom: "10px",
    color: "#343A40",
  },
  btn: {
    minWidth: "160px",
    padding: "10px 16px",
    fontWeight: 600,
  },
};