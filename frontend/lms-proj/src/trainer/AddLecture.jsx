import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AddLecture() {
  const { course_id, module_id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

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

  const [loading, setLoading] = useState(false);

  // State fields
  const [description, setDescription] = useState("");
  const [resources, setResources] = useState([null]); // multiple resource files

  // Add a new resource field (max 5)
  const handleAddResource = () => {
    if (resources.length >= 5) {
      alert("Maximum of 5 resources allowed");
      return;
    }
    setResources([null, ...resources]);
  };

  // Update a file in a resource slot
  const handleResourceChange = (index, file) => {
    const updated = [...resources];
    updated[index] = file;
    setResources(updated);
  };

  // Step 1: Create lecture metadata
  const handleLectureSubmit = async () => {
    const title = document.getElementById("lecture-title").value.trim();

    if (!title) return alert("Lecture title is required");

    setLoading(true);
    try {
      const res = await fetch("/api/lectures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          module_id,
          course_id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create lecture`);
      }

      const data = await res.json();
      alert(data.message);
      return data;
    } catch (err) {
      console.error("Add Lecture Error:", err);
      alert(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Upload resources (if any)
  const uploadResources = async (lecture_id) => {
    const formData = new FormData();
    resources.forEach((file) => {
      if (file) formData.append("files", file);
    });
    formData.append("lecture_id", lecture_id);

    const res = await fetch("/api/lectures/resource", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to upload resources");
    }
  };

  // Combined handler
  const handleSubmitAll = async (e) => {
    e.preventDefault();

    setLoading(true); // start loading
    try {
      // Step 1: create lecture metadata
      const lectureData = await handleLectureSubmit();
      if (!lectureData) throw new Error("Lecture creation failed");

      // Step 2: upload resources if any
      if (resources.length > 0) {
        try {
          await uploadResources(lectureData.lecture.lecture_id);
        } catch (err) {
          console.error("Resource Upload Error:", err);
          alert(err.message || "Failed to upload resources");
          return; // stop further execution if upload fails
        }
      }

      // Step 3: navigate back to lecture list
      navigate(`/trainer/${course_id}/modules/${module_id}/lectures`, {
        replace: true,
      });
    } catch (err) {
      console.error("Add Lecture Error:", err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "800px" }}>
      <h3>Add Lecture</h3>
      <form onSubmit={handleSubmitAll}>
        {/* Title */}
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input id="lecture-title" type="text" className="form-control" />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Resources Section */}
        <div className="mb-3">
          <label className="form-label">Resources (PDF, video, images)</label>

          {resources.map((res, index) => {
            const isFirst = index === resources.length - 1; // the original first field is now last in array
            return (
              <div key={index} className="d-flex align-items-center mb-2">
                <input
                  type="file"
                  className="form-control me-2"
                  onChange={(e) =>
                    handleResourceChange(index, e.target.files[0])
                  }
                />

                {isFirst ? (
                  // ADD button only on the original first field
                  <button
                    type="button"
                    className="btn btn-secondary p-1"
                    onClick={handleAddResource}
                    disabled={resources.length >= 5}
                  >
                    ADD
                  </button>
                ) : (
                  // REMOVE button for newly added fields
                  <button
                    type="button"
                    className="btn btn-danger p-1"
                    onClick={() => {
                      const updated = [...resources];
                      updated.splice(index, 1);
                      setResources(updated);
                    }}
                  >
                    REMOVE
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Adding..." : "Add Lecture"}
        </button>

        <button
          type="button"
          className="btn btn-outline-primary rounded-pill ms-2"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
