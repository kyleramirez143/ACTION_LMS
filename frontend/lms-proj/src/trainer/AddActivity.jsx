import React from "react";
import "./AddResource.css";

function AddActivity({ courseId, module }) {
    async function handleSubmit(e) {
        e.preventDefault();
        const file = document.getElementById("uploadFile").files[0];
        const title = document.getElementById("fileTitle").value;
        const description = document.getElementById("fileDescription").value;

        if (!file) return alert("Please upload a file");
        if (!courseId || !module?.module_id) return alert("Course or Module not selected");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("module_id", module.module_id);
        formData.append("course_id", courseId);
        formData.append("content_type", "activity");

        const token = localStorage.getItem("token");

        try {
            const res = await fetch("/api/lectures", {
                method: "POST",
                headers: { ...(token && { Authorization: `Bearer ${token}` }) },
                body: formData,
            });

            const data = await res.json();
            if (res.ok) alert("Activity added successfully!");
            else alert(data.error || "Failed to upload");
        } catch (err) {
            console.error(err);
            alert("Error adding activity");
        }
    }


    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h3 style={styles.title}>Add Activity</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3 row">
                        <label htmlFor="uploadFile" className="col-12 col-sm-2 col-form-label">Upload File</label>
                        <div className="col-12 col-sm-8">
                            <input type="file" className="form-control" id="uploadFile" />
                        </div>
                    </div>

                    {/* File Title */}
                    <div className="mb-3 row">
                        <label htmlFor="fileTitle" className="col-12 col-sm-2 col-form-label">Add Instructions</label>
                        <div className="col-12 col-sm-8">
                            <textarea class="text" className="form-control" id="fileTitle" placeholder="Enter File Title" />
                        </div>
                    </div>

                    {/* File Description */}
                    <div className="mb-3 row">
                        <label htmlFor="fileDescription" className="col-12 col-sm-2 col-form-label">Activity Title</label>
                        <div className="col-12 col-sm-8">
                            <input type="text" className="form-control" id="fileDescription" placeholder="Enter File Description" />
                        </div>
                    </div>

                    {/* Setting Deadline */}
                    <div className="mb-3 row">
                        <label htmlFor="deadline" className="col-12 col-sm-2 col-form-label">Set Deadline</label>
                        <div className="col-12 col-sm-8">
                            <input type="datetime-local" className="form-control" id="deadline" />
                        </div>
                    </div>

                    {/* Additional Options */}
                    <fieldset className="mb-3 row">
                        <legend className="col-12 col-sm-2 col-form-label pt-0">Additional</legend>
                        <div className="col-12 col-sm-10">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="trainerToggle" defaultChecked />
                                <label className="form-check-label" htmlFor="trainerToggle">
                                    The activity is close once the Deadline.
                                </label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="canDownload" />
                                <label className="form-check-label" htmlFor="canDownload">
                                    Can add Feedback once Graded.mm
                                </label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="canDownload" />
                                <label className="form-check-label" htmlFor="canDownload">
                                    Show Score
                                </label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="canDownload" />
                                <label className="form-check-label" htmlFor="canDownload">
                                    Can Download File
                                </label>
                            </div>
                        </div>
                    </fieldset>
                </form>

                {/* Action Buttons */}
                <div className="mb-3 row">
                    <div className="col-12 col-sm-9">
                        <button type="submit" className="btn btn-primary rounded-pill me-2" style={styles.btn}>
                            Add Activity
                        </button>
                        <button type="button" className="btn btn-outline-primary rounded-pill me-2" style={styles.btn}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        backgroundColor: "#FFFFFF",
        // minHeight: "100vh",
        width: "100vw",
        padding: "30px 30px",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: "10px",
        padding: "40px 40px",
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.20)",
    },
    title: {
        fontWeight: 600,
        marginBottom: "30px",
        fontSize: "1.5rem",
        color: "#333",
        fontFamily: "Poppins, sans-serif",
    },
    btn: {
        minWidth: "200px",
        padding: "10px 16px",
        fontWeight: 600,
        borderRadius: "6px",
        fontFamily: "Poppins, sans-serif",
    },
};

export default AddActivity;
