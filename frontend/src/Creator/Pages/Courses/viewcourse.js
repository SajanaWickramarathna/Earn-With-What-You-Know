// src/pages/creator/Courses/viewcourse.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { api } from "../../../api";

const ViewCourse = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(res.data);
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
    fetchCourse();
  }, [id]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );

  if (!course)
    return (
      <Typography variant="h6" sx={{ mt: 4 }}>
        Course not found
      </Typography>
    );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {course.title}
      </Typography>

      {course.thumbnail_url && (
        <Card sx={{ maxWidth: 600, mb: 2 }}>
          <CardMedia
            component="img"
            height="300"
            image={course.thumbnail_url}
            alt={course.title}
          />
        </Card>
      )}

      <Typography variant="body1" gutterBottom>
        {course.description}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Price: {course.price} | Language: {course.language}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Purchase Count: {course.purchase_count} | Average Rating:{" "}
        {course.average_rating} | Reviews: {course.review_count}
      </Typography>

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

export default ViewCourse;
