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
  CircularProgress,
} from "@mui/material";
import { api } from "../../../api"; // your axios instance
import { useNavigate } from "react-router-dom";

const AddCourse = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: 0,
    language: "English",
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [teaserFile, setTeaserFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [teaserPreview, setTeaserPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection (preview only)
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length === 0) return;
    const file = files[0];

    if (name === "thumbnail") {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    } else if (name === "teaser") {
      setTeaserFile(file);
      setTeaserPreview(URL.createObjectURL(file));
    }
  };

  // Upload a file to server
  const uploadFile = async (file, courseId, type) => {
    const formDataFile = new FormData();
    formDataFile.append(type === "thumbnail" ? "thumbnail" : "teaser", file);

    const res = await api.post(`/courses/upload-${type}/${courseId}`, formDataFile, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    });

    return type === "thumbnail" ? res.data.thumbnail_url : res.data.teaser_url;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Step 1: create course without files
    const res = await api.post("/courses", {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: formData.price,
      language: formData.language
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const newCourseId = res.data.course_id;

    // Step 2: upload thumbnail
    if (thumbnailFile) {
      const fd = new FormData();
      fd.append("thumbnail", thumbnailFile);

      await api.post(`/courses/upload-thumbnail/${newCourseId}`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
    }

    // Step 3: upload teaser
    if (teaserFile) {
      const fd = new FormData();
      fd.append("teaser", teaserFile);

      await api.post(`/courses/upload-teaser/${newCourseId}`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
    }

    setSnackbar({ open: true, message: "Course added successfully", severity: "success" });
    setLoading(false);
    navigate("/creator-dashboard/my-courses");
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
          <input type="file" hidden name="teaser" onChange={handleFileChange} />
        </Button>
        {teaserPreview && <Typography>Teaser selected: {teaserFile.name}</Typography>}

        <Button variant="contained" component="label">
          Upload Thumbnail
          <input type="file" hidden name="thumbnail" onChange={handleFileChange} />
        </Button>
        {thumbnailPreview && <img src={thumbnailPreview} alt="Thumbnail" style={{ width: 150, marginTop: 10 }} />}

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Add Course"}
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
