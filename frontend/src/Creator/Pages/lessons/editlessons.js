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
  Grid,
  Paper,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../api";

const EditLesson = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [lesson, setLesson] = useState({
    title: "",
    description: "",
    duration: "",
    order: "",
    is_preview: false,
    video_url: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const res = await api.get(`/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLesson(res.data);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to load lesson",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLesson((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVideoChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  try {
    let video_url = lesson.video_url;

    // 1️⃣ Upload video if a new one is selected
    if (videoFile) {
      const formData = new FormData();
      formData.append("video", videoFile);
      const uploadRes = await api.post(`/lessons/upload-video/${courseId}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      video_url = uploadRes.data.video_url;
    }

    // 2️⃣ Update lesson with video_url and other fields
    await api.put(`/lessons/${lessonId}`, {
      ...lesson,
      video_url,
    }, { headers: { Authorization: `Bearer ${token}` } });

    setSnackbar({ open: true, message: "Lesson updated successfully", severity: "success" });
    navigate(`/creator-dashboard/course/${courseId}/view-lessons`);
  } catch (err) {
    console.error(err);
    setSnackbar({
      open: true,
      message: err.response?.data?.message || "Failed to update lesson",
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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Edit Lesson</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(`/creator-dashboard/course/${courseId}/Manage-lesson`)}
        >
          Back to Lessons
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                name="title"
                value={lesson.title}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={lesson.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Duration (seconds)"
                name="duration"
                type="number"
                value={lesson.duration}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>


            <Grid item xs={12} md={4}>
              <TextField
                label="Order"
                name="order"
                type="number"
                value={lesson.order}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Current Video:
              </Typography>
              {lesson.video_url ? (
                <video
                  src={lesson.video_url}
                  controls
                  style={{ width: "100%", maxHeight: 300, borderRadius: 8 }}
                />
              ) : (
                <Typography>No video uploaded yet</Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" component="label">
                Upload New Video
                <input type="file" accept="video/*" hidden onChange={handleVideoChange} />
              </Button>
              {videoFile && <Typography sx={{ mt: 1 }}>{videoFile.name}</Typography>}
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                fullWidth
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

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

export default EditLesson;
