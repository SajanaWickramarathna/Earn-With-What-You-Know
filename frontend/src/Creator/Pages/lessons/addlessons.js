
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
  Grid,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../api";

const AddLesson = () => {
  const { courseId } = useParams(); // course_id from URL
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [formData, setFormData] = useState({
    title: "",
    video_url: "",
    duration: "",
    price: 0,
    order: 0,
    is_preview: false,
  });

  const [videoFile, setVideoFile] = useState(null);

  // Fetch course and lessons
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(res.data);
        setLessons(res.data.lessons || []);
      } catch (err) {
        console.error(err);
        setSnackbar({ open: true, message: "Failed to load course", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVideoChange = (e) => {
    if (e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let video_url = formData.video_url;

      // Upload video if a file is selected
      if (videoFile) {
        const fd = new FormData();
        fd.append("video", videoFile);

        const res = await api.post(`/lessons/upload-video/${courseId}`, fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });

        video_url = res.data.video_url;
      }

      // Create lesson
      const lessonRes = await api.post(
        "/lessons",
        { ...formData, course_id: Number(courseId), video_url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLessons((prev) => [...prev, lessonRes.data]);
      setFormData({ title: "", video_url: "", duration: "", price: 0, order: 0, is_preview: false });
      setVideoFile(null);

      setSnackbar({ open: true, message: "Lesson added successfully", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to add lesson", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add Lessons for "{course.title}"
      </Typography>

      {/* Add Lesson Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField label="Lesson Title" name="title" value={formData.title} onChange={handleChange} required />
        <TextField
          label="Video URL (optional if uploading)"
          name="video_url"
          value={formData.video_url}
          onChange={handleChange}
        />
        <Button variant="contained" component="label">
          Upload Video
          <input type="file" hidden accept="video/*" onChange={handleVideoChange} />
        </Button>
        {videoFile && <Typography>Selected Video: {videoFile.name}</Typography>}
        <TextField
          label="Duration (seconds)"
          name="duration"
          type="number"
          value={formData.duration}
          onChange={handleChange}
        />
        <TextField label="Price" name="price" type="number" value={formData.price} onChange={handleChange} />
        <TextField label="Order" name="order" type="number" value={formData.order} onChange={handleChange} />
        <FormControlLabel
          control={<Checkbox checked={formData.is_preview} onChange={handleChange} name="is_preview" />}
          label="Mark as Preview"
        />
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? "Saving..." : "Add Lesson"}
        </Button>
      </Box>

      {/* Existing Lessons */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Existing Lessons
        </Typography>
        {lessons.length === 0 && <Typography>No lessons yet.</Typography>}
        <Grid container spacing={2}>
          {lessons.map((lesson) => (
            <Grid item xs={12} md={6} key={lesson.lesson_id}>
              <Box sx={{ p: 2, boxShadow: 2, borderRadius: 1 }}>
                <Typography variant="subtitle1">{lesson.title}</Typography>
                {lesson.video_url && (
                  <video src={lesson.video_url} controls width="100%" style={{ borderRadius: 4 }} />
                )}
                <Typography variant="body2">
                  Duration: {lesson.duration}s | Price: {lesson.price} | Order: {lesson.order} |{" "}
                  {lesson.is_preview ? "Preview" : "Full"}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Snackbar */}
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

export default AddLesson;
