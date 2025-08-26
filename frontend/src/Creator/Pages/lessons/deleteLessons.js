import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../api";

const ViewLesson = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [courseName, setCourseName] = useState("");
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchCourseAndLessons();
  }, [courseId]);

  const fetchCourseAndLessons = async () => {
    try {
      const courseRes = await api.get(`/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourseName(courseRes.data.title);

      const lessonsRes = await api.get(`/lessons/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLessons(lessonsRes.data);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to load data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;

    try {
      await api.delete(`/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLessons((prev) => prev.filter((l) => l.lesson_id !== lessonId));
      setSnackbar({
        open: true,
        message: "Lesson deleted",
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to delete lesson",
        severity: "error",
      });
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );

  const handleBack = () => navigate("/creator-dashboard/lessons");

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
        Back to Lessons
      </Button>

      {lessons.length === 0 && <Typography>No lessons found.</Typography>}

      <Grid container spacing={3}>
        {lessons.map((lesson) => (
          <Grid item xs={12} md={6} key={lesson.lesson_id}>
            <Card sx={{ p: 1 }}>
              {lesson.video_url && (
                <CardMedia
                  component="video"
                  src={lesson.video_url}
                  controls
                  sx={{ borderRadius: 2, height: 200 }}
                />
              )}
              <CardContent>
                <Typography variant="h6">{lesson.title}</Typography>
                <Typography variant="body2">
                  Duration: {lesson.duration}s | Price: {lesson.price} | Order:{" "}
                  {lesson.order} 
                </Typography>

                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(lesson.lesson_id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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

export default ViewLesson;
