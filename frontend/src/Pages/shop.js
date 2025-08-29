// frontend/src/pages/Shop.js
import React, { useEffect, useState } from "react";
import { Container, Grid, Card, CardMedia, CardContent, Typography, Button, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
import Nav from "../components/navigation";
const Shop = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get("http://localhost:3001/api/courses"); // public approved courses
        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!courses.length) {
    return (
      <Container sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h5">No courses available at the moment.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 5 }}>
        <Nav/>
      <Typography variant="h4" gutterBottom>
        All Courses
      </Typography>
      <Grid container spacing={4}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.course_id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              {course.thumbnail_url && (
                <CardMedia
                  component="img"
                  height="180"
                  image={course.thumbnail_url}
                  alt={course.title}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6">
                  {course.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Language: {course.language} | Lessons: {course.lessons?.length || 0}
                </Typography>
                <Typography variant="body1" color="primary">
                  Rs. {course.price}
                </Typography>
              </CardContent>
              <CardContent>
                <Button
                  component={Link}
                  to={`/course/${course.course_id}`}
                  variant="contained"
                  fullWidth
                >
                  View Course
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Shop;
