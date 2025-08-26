import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api";

const ManageCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses/my-courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to load courses",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = (id) =>
    navigate(`/creator-dashboard/course/${id}/add-lesson`);
  const handleEdit = (id) => navigate(`/creator-dashboard/course/${id}/Manage-lesson`);

  const handleViewLessons = (id) =>
    navigate(`/creator-dashboard/course/${id}/view-lessons`);

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Manage My Courses
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : courses.length === 0 ? (
        <Typography>No courses found. Create your first course!</Typography>
      ) : (
        <Grid container spacing={4}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.course_id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
                }}
              >
                {course.thumbnail_url ? (
                  <CardMedia
                    component="img"
                    height="180"
                    image={course.thumbnail_url}
                    alt={course.title}
                    sx={{
                      objectFit: "cover",
                      width: "100%",
                      maxHeight: 180,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 180,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      bgcolor: "grey.200",
                      color: "grey.600",
                    }}
                  >
                    No Thumbnail
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    {course.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {course.description?.substring(0, 80)}...
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Price: ${course.price} | Language: {course.language}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAddLesson(course.course_id)}
                      sx={{ flexGrow: 1 }}
                    >
                      Add Lessons
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleEdit(course.course_id)}
                      sx={{ flexGrow: 1 }}
                    >
                      Manage Lessons
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="info"
                      onClick={() => handleViewLessons(course.course_id)}
                      sx={{ flexGrow: 1 }}
                    >
                      View Lessons
                    </Button>
                  </Box>
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

export default ManageCoursesPage;
