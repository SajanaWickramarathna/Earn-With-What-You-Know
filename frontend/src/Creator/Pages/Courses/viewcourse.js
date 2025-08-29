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
  Grid,
  Chip,
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
  }, [id, token]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  if (!course)
    return (
      <Typography variant="h6" sx={{ mt: 4, textAlign: "center" }}>
        Course not found
      </Typography>
    );

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      {/* Course Title */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", textAlign: "center", mb: 4 }}
      >
        {course.title}
      </Typography>

      {/* Media Section */}
      <Grid container spacing={4} sx={{ mb: 4 }} alignItems="stretch">
        {course.thumbnail_url && (
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                width: "100%",
                height: { xs: 250, md: 300 },
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: 4,
              }}
            >
              <CardMedia
                component="img"
                image={course.thumbnail_url}
                alt={course.title}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Card>
          </Grid>
        )}

        {course.teaser_url && (
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                width: "100%",
                height: { xs: 250, md: 300 },
                borderRadius: 3,
                p: 1,
                boxShadow: 4,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
                Teaser Video
              </Typography>
              <Box
                component="video"
                src={course.teaser_url}
                controls
                sx={{
                  width: "100%",
                  height: "calc(100% - 40px)",
                  borderRadius: 2,
                  objectFit: "cover",
                }}
              />
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Course Description */}
      <Card sx={{ p: 4, mb: 4, borderRadius: 2, boxShadow: 4 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          Description
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {course.description}
        </Typography>

        <Grid container spacing={2}>
          <Grid item>
            <Chip label={`Price: $${course.price}`} color="primary" />
          </Grid>
          <Grid item>
            <Chip label={`Language: ${course.language}`} color="secondary" />
          </Grid>
          <Grid item>
            <Chip label={`Category: ${course.category}`} color="default" />
          </Grid>
          <Grid item>
            <Chip label={`Purchases: ${course.purchase_count}`} color="success" />
          </Grid>
          <Grid item>
            <Chip label={`Rating: ${course.average_rating}`} color="info" />
          </Grid>
          <Grid item>
            <Chip label={`Reviews: ${course.review_count}`} color="warning" />
          </Grid>
        </Grid>
      </Card>

      {/* Snackbar for errors */}
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
