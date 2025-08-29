// frontend/src/pages/AdminCoursesPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
  Chip,
} from "@mui/material";
import { api } from "../../../api"; 

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState(""); // filter
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/admin/all?status=${status}`);
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [status]);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Manage Courses
      </Typography>

      {/* Status Filter */}
      <Box mb={3} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="subtitle1">Status Filter:</Typography>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          displayEmpty
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </Select>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : courses.length === 0 ? (
        <Typography>No courses found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} md={6} key={course.course_id}>
              <Card sx={{ display: "flex", height: 180, borderRadius: 3, boxShadow: 3 }}>
                {/* Thumbnail */}
                {course.thumbnail_url ? (
                  <CardMedia
                    component="img"
                    image={course.thumbnail_url}
                    alt={course.title}
                    sx={{ width: 180, objectFit: "cover" }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 180,
                      height: "100%",
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

                <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {course.description?.slice(0, 80)}...
                    </Typography>

                    {/* Status & Category */}
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
                      <Chip label={`Status: ${course.status}`} size="small" color="info" />
                      {course.category && (
                        <Chip label={`Category: ${course.category}`} size="small" color="primary" />
                      )}
                      <Chip label={`Language: ${course.language}`} size="small" color="secondary" />
                    </Box>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AdminCoursesPage;
