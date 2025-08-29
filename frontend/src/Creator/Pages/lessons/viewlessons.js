import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../api";

const ViewLessonsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [lessons, setLessons] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourseTitle(res.data.title);
        setLessons(res.data.lessons || []);
      } catch (err) {
        console.error(err);
        setSnackbar({
          open: true,
          message: err.response?.data?.message || "Failed to fetch lessons",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [courseId, token]);

  const handleBack = () => navigate("/creator-dashboard/lessons");

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
        Back to Lessons
      </Button>

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Lessons for "{courseTitle}"
      </Typography>

      {lessons.length === 0 ? (
        <Typography>No lessons found for this course.</Typography>
      ) : (
        <Grid container spacing={3}>
          {lessons.map((lesson) => (
            <Grid item xs={12} sm={6} md={4} key={lesson.lesson_id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {lesson.video_url && (
                  <video
                    src={lesson.video_url}
                    controls
                    width="100%"
                    style={{ borderRadius: 4, maxHeight: 200 }}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {lesson.title}
                    {lesson.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {lesson.description}
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {lesson.duration}s
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Order: {lesson.order}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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

export default ViewLessonsPage;
