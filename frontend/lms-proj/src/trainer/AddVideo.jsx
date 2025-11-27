import React from "react";
import "./AddPowerpoint.css";

function AddVideo() {
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h3 style={styles.title}>Add Video</h3>
                <form>
                    {/* Upload File */}
                    <div className="mb-3 row">
                        <label htmlFor="uploadFile" className="col-sm-2 col-form-label">Upload File</label>
                        <div className="col-sm-8">
                            <input type="file" className="form-control" id="uploadFile" />
                        </div>
                    </div>

                    {/* File Title */}
                    <div className="mb-3 row">
                        <label htmlFor="fileTitle" className="col-sm-2 col-form-label">File Title</label>
                        <div className="col-sm-8">
                            <input type="text" className="form-control" id="fileTitle" placeholder="Enter File Title" />
                        </div>
                    </div>

                    {/* File Description */}
                    <div className="mb-3 row">
                        <label htmlFor="fileDescription" className="col-sm-2 col-form-label">File Description</label>
                        <div className="col-sm-8">
                            <textarea class="text" className="form-control" id="fileDescription" placeholder="Enter File Description" />
                        </div>
                    </div>

                    {/* Additional Options */}
                    <fieldset className="mb-3 row">
                        <legend className="col-form-label col-sm-2 pt-0">Additional</legend>
                        <div className="col-sm-10">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="trainerToggle" defaultChecked />
                                <label className="form-check-label" htmlFor="trainerToggle">
                                    Trainer Can activate or deactivate file
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
                    <div className="col-sm-9">
                        <button type="submit" className="btn btn-primary rounded-pill me-2" style={styles.btn}>
                            Add Video
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
        minHeight: "100vh",
        width: "100vw",
        padding: "40px 20px",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: "10px",
        padding: "30px 40px",
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
    },
    btn: {
        minWidth: "200px",
        padding: "10px 16px",
        fontWeight: 500,
        borderRadius: "6px",
    },

    
};

export default AddVideo;
