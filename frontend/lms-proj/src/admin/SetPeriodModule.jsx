import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";

function SetPeriodModule() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { id } = useParams(); // Note: if this is for a batch period, 'id' might be a batchId
    const isEditMode = !!id;
    const token = localStorage.getItem("authToken");

    // --- Fixed State Management (Matching the form fields) ---
    const [formData, setFormData] = useState({
        batch: "",
        mod1_start: "", mod1_end: "",
        mod2_start: "", mod2_end: "",
        mod3_start: "", mod3_end: "",
        mod4_start: "", mod4_end: "",
    });

    const [isLoadingData, setIsLoadingData] = useState(isEditMode);
    const [batches, setBatches] = useState([]);

    // --- AUTH CHECK ---
    useEffect(() => {
        if (!token) return navigate("/");
        try {
            const decoded = jwtDecode(token);
            if (!decoded.roles?.includes("Admin")) navigate("/access-denied");
        } catch {
            localStorage.removeItem("authToken");
            navigate("/login");
        }
    }, [token, navigate]);

    // --- FETCH BATCHES ---
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/batches/dropdown", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();

                // IMPORTANT: Ensure data is an array before setting state
                if (Array.isArray(data)) {
                    setBatches(data);
                } else {
                    console.error("API Error or non-array data:", data);
                    setBatches([]);
                }
            } catch (err) {
                console.error("Batch fetch error:", err);
                setBatches([]);
            }
        };
        fetchBatches();
    }, [token]);

    useEffect(() => {
        if (isEditMode) {
            const fetchExistingData = async () => {
                try {
                    // 1. Get the curriculum_id from this specific quarter
                    const res = await fetch(`http://localhost:5000/api/quarters/single/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const currentQuarter = await res.json();

                    if (currentQuarter && currentQuarter.curriculum_id) {
                        // 2. Fetch all modules for that batch/curriculum
                        const allRes = await fetch(`http://localhost:5000/api/quarters/batch/${currentQuarter.curriculum_id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const modules = await allRes.json();

                        // 3. Map the array back to your flat mod1_start...mod4_end state
                        const updatedData = { batch: currentQuarter.curriculum_id };
                        modules.forEach((m) => {
                            const match = m.name.match(/\d+/);
                            if (match) {
                                const num = match[0];
                                // split('T')[0] ensures 2024-01-01T00:00:00 becomes 2024-01-01 for the input
                                updatedData[`mod${num}_start`] = m.start_date?.split('T')[0] || "";
                                updatedData[`mod${num}_end`] = m.end_date?.split('T')[0] || "";
                            }
                        });

                        setFormData(prev => ({ ...prev, ...updatedData }));
                    }
                } catch (err) {
                    console.error("Fetch Edit Data Error:", err);
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchExistingData();
        }
    }, [id, isEditMode, token]);

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. PRE-SUBMIT VALIDATION
        if (!formData.batch || formData.batch.length < 30) {
            alert(t("module_period.select_valid_batch"));
            return;
        }

        const url = isEditMode
            ? `http://localhost:5000/api/quarters/update/${userId}`
            : "http://localhost:5000/api/quarters/set-periods";

        // 2. CLEAN PAYLOAD: Backend specifically expects 'batch' as the curriculum_id
        const payload = {
            batch: formData.batch,
            mod1_start: formData.mod1_start,
            mod1_end: formData.mod1_end,
            mod2_start: formData.mod2_start,
            mod2_end: formData.mod2_end,
            mod3_start: formData.mod3_start,
            mod3_end: formData.mod3_end,
            mod4_start: formData.mod4_start,
            mod4_end: formData.mod4_end
        };

        console.log("Submitting Payload:", payload);

        try {
            const response = await fetch(url, {
                method: isEditMode ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Server rejected the request");
            }

            alert(t("module_period.saved_successfully"));
            navigate("/admin/module-management");
        } catch (err) {
            console.error("Submit Error:", err);
            alert(t("module_period.save_failed") + ": " + err.message);
        }
    };

    const formTitle = isEditMode ? "Edit Module Period" : "Set Module Period";
    const submitButtonText = isEditMode ? "Save Changes" : "Set Module Period";

    if (isEditMode && isLoadingData) {
        return (
            <div style={styles.page}>
                <div style={styles.card}><h3 style={styles.title}>Loading...</h3></div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h3 style={styles.title}>{formTitle}</h3>
                <h5 className="mb-4 text-center" style={{ fontWeight: 1000, color: "#555" }}>
                    {t("module_period.module_period_information")}
                </h5>

                <form onSubmit={handleSubmit}>
                    {/* Batch Dropdown Fix */}
                    <div className="row mb-3">
                        <div className="col">
                            <div className="row">
                                <label className="col-sm-3 col-form-label">{t("module_period.batch")}</label>
                                <div className="col-sm-9">
                                    <select
                                        className="form-select"
                                        name="batch"
                                        value={formData.batch}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">{t("module_period.select_batch")}</option>

                                        {Array.isArray(batches) && batches.map((b) => {
                                            const idToUse = b.curriculum_id || b.batch_id;

                                            // LOGIC: Disable if batch is full, UNLESS we are currently editing this specific batch
                                            const isCurrentlySelected = formData.batch === idToUse;
                                            const isDisabled = b.isFull && !isCurrentlySelected;

                                            return (
                                                <option
                                                    key={b.batch_id}
                                                    value={idToUse}
                                                    disabled={isDisabled}
                                                    style={isDisabled ? { color: '#a0a0a0', backgroundColor: '#f8f9fa' } : {}}
                                                >
                                                    {b.name} {b.location} {isDisabled ? t("module_period.modules_already_set") : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="col"></div>
                    </div>

                    {/* Module 1 */}
                    <div className="row mb-3">
                        <label className="col-sm-12 col-form-label" style={styles.label}>{t("module_period.module")} 1</label>
                        <div className="col">
                            <div className="row">
                                <label className="col-sm-3 col-form-label" style={styles.label}>{t("module_period.start_date")}</label>
                                <div className="col-sm-9">
                                    <input type="date" className="form-control" name="mod1_start" value={formData.mod1_start} onChange={handleChange} onClick={(e) => e.target.showPicker()} required />
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row">
                                <label className="col-sm-3 col-form-label" style={styles.label}>{t("module_period.end_date")}</label>
                                <div className="col-sm-9">
                                    <input type="date" className="form-control" name="mod1_end" value={formData.mod1_end} onChange={handleChange} onClick={(e) => e.target.showPicker()} required />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Module 2 */}
                    <div className="row mb-3">
                        <label className="col-sm-12 col-form-label" style={styles.label}>{t("module_period.module")} 2</label>
                        <div className="col">
                            <div className="row">
                                <label className="col-sm-3 col-form-label" style={styles.label}> {t("module_period.start_date")}</label>
                                <div className="col-sm-9">
                                    <input type="date" className="form-control" name="mod2_start" value={formData.mod2_start} onChange={handleChange} onClick={(e) => e.target.showPicker()} required />
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row">
                                <label className="col-sm-3 col-form-label" style={styles.label}>{t("module_period.end_date")}</label>
                                <div className="col-sm-9">
                                    <input type="date" className="form-control" name="mod2_end" value={formData.mod2_end} onChange={handleChange} onClick={(e) => e.target.showPicker()} required />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Module 3 */}
                    <div className="row mb-3">
                        <label className="col-sm-12 col-form-label" style={styles.label}>{t("module_period.module")} 3</label>
                        <div className="col">
                            <div className="row">
                                <label className="col-sm-3 col-form-label" style={styles.label}> {t("module_period.start_date")}</label>
                                <div className="col-sm-9">
                                    <input type="date" className="form-control" name="mod3_start" value={formData.mod3_start} onChange={handleChange} onClick={(e) => e.target.showPicker()} required />
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row">
                                <label className="col-sm-3 col-form-label" style={styles.label}>{t("module_period.end_date")}</label>
                                <div className="col-sm-9">
                                    <input type="date" className="form-control" name="mod3_end" value={formData.mod3_end} onChange={handleChange} onClick={(e) => e.target.showPicker()} required />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Module 4 */}
                    <div className="row mb-3">
                        <label className="col-sm-12 col-form-label" style={styles.label}>{t("module_period.module")} 4</label>
                        <div className="col">
                            <div className="row">
                                <label className="col-sm-3 col-form-label" style={styles.label}>{t("module_period.start_date")}</label>
                                <div className="col-sm-9">
                                    <input type="date" className="form-control" name="mod4_start" value={formData.mod4_start} onChange={handleChange} onClick={(e) => e.target.showPicker()} required />
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="row">
                                <label className="col-sm-3 col-form-label" style={styles.label}>{t("module_period.end_date")}</label>
                                <div className="col-sm-9">
                                    <input type="date" className="form-control" name="mod4_end" value={formData.mod4_end} onChange={handleChange} onClick={(e) => e.target.showPicker()} required />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mb-3 mt-4 d-flex justify-content-center">
                        <button type="submit" className="btn btn-primary rounded-pill me-2" style={styles.btn}>
                            {submitButtonText}
                        </button>
                        <button type="button" className="btn btn-outline-primary rounded-pill" style={styles.btn} onClick={() => navigate("/admin/module-management")}>
                            Cancel
                        </button>
                    </div>
                </form>
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
        maxWidth: "1000px",
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

export default SetPeriodModule;