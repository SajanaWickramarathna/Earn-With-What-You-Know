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
    <Container>
      <Typography variant="h4" gutterBottom>
        Manage Courses
      </Typography>

      {/* Status Filter */}
      <Box mb={3}>
        <Typography variant="subtitle1">Status Filter</Typography>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </Select>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : courses.length === 0 ? (
        <Typography>No courses found.</Typography>
      ) : (
        <Grid container spacing={2}>
          {courses.map((course) => (
            <Grid item xs={12} md={6} key={course.course_id}>
              <Card sx={{ display: "flex", height: 180 }}>
                {/* Thumbnail */}
                <CardMedia
                  component="img"
                  image={course.thumbnail_url}
                  alt={course.title}
                  sx={{ width: 180 }}
                />
                <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <CardContent>
                    <Typography variant="h6">{course.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {course.description?.slice(0, 80)}...
                    </Typography>
                    <Typography variant="body2">
                      Status: {course.status}
                    </Typography>
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
