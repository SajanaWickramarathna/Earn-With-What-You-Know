// src/pages/creator/EditCourse.js
import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../api";

const EditCourse = () => {
  const { id } = useParams(); // course_id from URL
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: "",
    language: "",
    thumbnail_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line
  }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse({
        title: res.data.title || "",
        description: res.data.description || "",
        price: res.data.price || "",
        language: res.data.language || "",
        thumbnail_url: res.data.thumbnail_url || "",
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to load course",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/courses/${id}`, course, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: "Course updated successfully",
        severity: "success",
      });
      navigate("/creator-dashboard/my-courses");
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to update course",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Course
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          component="form"
          sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
          onSubmit={handleSubmit}
        >
          <TextField
            label="Title"
            name="title"
            value={course.title}
            onChange={handleChange}
            required
          />
          <TextField
            label="Description"
            name="description"
            value={course.description}
            onChange={handleChange}
            multiline
            rows={4}
            required
          />
          <TextField
            label="Price"
            name="price"
            type="number"
            value={course.price}
            onChange={handleChange}
            required
          />
          <TextField
            label="Language"
            name="language"
            value={course.language}
            onChange={handleChange}
            select
            required
          >
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="Sinhala">Sinhala</MenuItem>
            <MenuItem value="Tamil">Tamil</MenuItem>
          </TextField>
          <TextField
            label="Thumbnail URL"
            name="thumbnail_url"
            value={course.thumbnail_url}
            onChange={handleChange}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Course"}
          </Button>
        </Box>
      )}

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

export default EditCourse;
