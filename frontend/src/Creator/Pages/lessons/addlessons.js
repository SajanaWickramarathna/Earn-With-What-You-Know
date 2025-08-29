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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../api";

const MAX_LESSONS = 5;
const MAX_DURATION = 5400; // 1.5 hours in seconds

const AddLessonPage = () => {
  const { courseId } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 0,
    order: 0,
    is_preview: false,
  });
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(res.data);

        const existingLessons = res.data.lessons || [];
        setLessons(existingLessons);

        // Auto-set next lesson order
        setFormData((prev) => ({ ...prev, order: existingLessons.length + 1 }));

        // If max lessons reached, warn user
        if (existingLessons.length >= MAX_LESSONS) {
          setSnackbar({
            open: true,
            message: "Maximum of 5 lessons allowed for this course.",
            severity: "warning",
          });
        }
      } catch (err) {
        console.error("Error fetching course:", err.response || err);
        setSnackbar({
          open: true,
          message: "Failed to load course",
          severity: "error",
        });
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
    if (e.target.files.length === 0) return;
    const file = e.target.files[0];

    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";
    videoEl.onloadedmetadata = () => {
      URL.revokeObjectURL(videoEl.src);
      const duration = Math.floor(videoEl.duration);

      if (duration > MAX_DURATION) {
        setSnackbar({
          open: true,
          message: "Video cannot exceed 1 hour 30 minutes.",
          severity: "error",
        });
        setVideoFile(null);
        setFormData((prev) => ({ ...prev, duration: 0 }));
      } else {
        setVideoFile(file);
        setFormData((prev) => ({ ...prev, duration }));
      }
    };
    videoEl.src = URL.createObjectURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (lessons.length >= MAX_LESSONS) {
      setSnackbar({
        open: true,
        message: "Cannot add more than 5 lessons",
        severity: "error",
      });
      return;
    }
    if (!videoFile) {
      setSnackbar({
        open: true,
        message: "Please select a video file",
        severity: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("video", videoFile);

      const uploadRes = await api.post(
        `/lessons/upload-video/${courseId}`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const video_url = uploadRes.data.video_url;
      if (!video_url) throw new Error("Video URL not returned from upload");

      await api.post(
        "/lessons",
        { ...formData, course_id: Number(courseId), video_url },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate(`/creator-dashboard/course/${courseId}/view-lessons`);
    } catch (err) {
      console.error("Error adding lesson:", err.response || err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to add lesson",
        severity: "error",
      });
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
    <Container sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>
        Add Lessons for "{course.title}"
      </Typography>
      <Button
        variant="outlined"
        onClick={() => navigate("/creator-dashboard/lessons")}
        sx={{ mb: 2 }}
      >
        Back to Lessons
      </Button>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Lesson Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <TextField
          label="Lesson Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={3}
          required
        />

        <Button variant="contained" component="label">
          Upload Lesson Video
          <input
            type="file"
            hidden
            accept="video/*"
            onChange={handleVideoChange}
          />
        </Button>
        {videoFile && <Typography>Selected Video: {videoFile.name}</Typography>}

        <TextField
          label="Duration (seconds)"
          name="duration"
          type="number"
          value={formData.duration}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Order"
          name="order"
          type="number"
          value={formData.order}
          onChange={handleChange}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={saving || lessons.length >= MAX_LESSONS}
        >
          {saving ? "Saving..." : "Add Lesson"}
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

export default AddLessonPage;
