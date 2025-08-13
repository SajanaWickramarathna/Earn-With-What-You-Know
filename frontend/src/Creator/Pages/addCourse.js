// src/pages/AddCourse.js
import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Container,
  Typography,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { api } from "../../api"; // your axios instance
import { useNavigate } from "react-router-dom";

const AddCourse = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: 0,
    language: "English",
    teaser_url: "",
    thumbnail_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Fetch logged-in user
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    fetchUserData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (files.length === 0) return;

    const file = files[0];
    try {
      setLoading(true);
      // Here you can implement real file upload API
      // For now, use local URL preview
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, [name]: url }));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "File upload failed", severity: "error" });
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData) {
      setSnackbar({ open: true, message: "User data not loaded", severity: "error" });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        "/courses",
        { ...formData }, // creator is set in backend via JWT
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({ open: true, message: "Course added successfully", severity: "success" });
      setLoading(false);
      navigate(`/creator/courses/${response.data.course_id}`);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Failed to add course",
        severity: "error",
      });
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" sx={{ mb: 3, mt: 3 }}>
        Add New Course
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField label="Title" name="title" value={formData.title} onChange={handleChange} required />
        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={4}
        />
        <TextField label="Category" name="category" value={formData.category} onChange={handleChange} required />
        <TextField label="Price" name="price" type="number" value={formData.price} onChange={handleChange} />
        <TextField select label="Language" name="language" value={formData.language} onChange={handleChange}>
          {["Sinhala", "Tamil", "English"].map((lang) => (
            <MenuItem key={lang} value={lang}>
              {lang}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" component="label">
          Upload Teaser Video
          <input type="file" hidden name="teaser_url" onChange={handleFileChange} />
        </Button>
        {formData.teaser_url && <Typography>Teaser uploaded</Typography>}

        <Button variant="contained" component="label">
          Upload Thumbnail
          <input type="file" hidden name="thumbnail_url" onChange={handleFileChange} />
        </Button>
        {formData.thumbnail_url && (
          <img src={formData.thumbnail_url} alt="Thumbnail" style={{ width: 150, marginTop: 10 }} />
        )}

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Saving..." : "Add Course"}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddCourse;
