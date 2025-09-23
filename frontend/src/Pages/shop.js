// frontend/src/pages/Shop.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Box,
  Chip,
  CardActions,
  Rating,
  Paper,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import Nav from "../components/navigation";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { styled } from "@mui/system";
import { api } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCart } from "../context/CartContext";

// Custom theme
const theme = createTheme({
  palette: {
    primary: { main: "#4a90e2" },
    secondary: { main: "#50e3c2" },
    background: { default: "#f4f7f9" },
  },
  typography: {
    fontFamily: ["Poppins", "sans-serif"].join(","),
    h3: { fontWeight: 700 },
    h5: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 12px 36px rgba(0,0,0,0.12)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
  },
});

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  textAlign: "center",
  marginBottom: theme.spacing(6),
  padding: theme.spacing(8, 2),
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 30%, #a4d3ff 90%)`,
  color: "white",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
}));

const FilterBar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(4),
  display: "flex",
  gap: theme.spacing(2),
  flexWrap: "wrap",
  alignItems: "center",
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
}));

const CourseCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  "& .MuiCardMedia-root": {
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  "& .MuiCardContent-root": { padding: theme.spacing(2), flexGrow: 1 },
  "& .MuiCardActions-root": { padding: theme.spacing(2) },
}));

const Shop = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");

  const { fetchCartCount } = useCart();
  const token = localStorage.getItem("token");

  const categoryOptions = [
    "Cooking & Food Skills",
    "Music & Instruments",
    "Handicrafts & Creative Skills",
    "Languages & Communication",
    "Technology & Digital Skills",
    "Repair & Technical Skills",
    "Health & Fitness",
    "Entrepreneurship & Business",
  ];

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get("http://localhost:3001/api/courses");
        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
        toast.error("Failed to fetch courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Add to cart handler
  const handleAddToCart = async (course_id) => {
    if (!token) {
      toast.warning("Please log in to add courses to cart.");
      return;
    }

    api
      .post(
        "/cart/addtocart",
        { course_id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        toast.success("Course added to cart!");
        fetchCartCount(); // Refresh cart count
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to add to cart.");
        console.error(err);
      });
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? course.category === categoryFilter : true;
    const matchesLanguage = languageFilter ? course.language === languageFilter : true;
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 15 }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: "100vh" }}>
        <Container sx={{ py: 4 }}>
          <Nav />

          {/* ToastContainer */}
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />

          {/* Hero Section */}
          <HeroSection>
            <Typography variant="h3" fontWeight="bold">
              Explore Our Courses 🚀
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1, maxWidth: "600px" }}>
              Learn new skills from passionate experts and expand your knowledge
              with our high-quality courses.
            </Typography>
          </HeroSection>

          {/* Filters */}
          <FilterBar elevation={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <Select fullWidth value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} displayEmpty>
              <MenuItem value="">All Categories</MenuItem>
              {categoryOptions.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
            <Select fullWidth value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} displayEmpty>
              <MenuItem value="">All Languages</MenuItem>
              <MenuItem value="English">English</MenuItem>
              <MenuItem value="Sinhala">Sinhala</MenuItem>
              <MenuItem value="Tamil">Tamil</MenuItem>
            </Select>
          </FilterBar>

          {/* Courses */}
          {filteredCourses.length === 0 ? (
            <Box sx={{ mt: 10, textAlign: "center", py: 8 }}>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                😔 No courses match your filters.
              </Typography>
              <Typography color="text.secondary">Try adjusting your search or filter options.</Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {filteredCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.course_id}>
                  <CourseCard>
                    {course.thumbnail_url && <CardMedia component="img" image={course.thumbnail_url} alt={course.title} />}
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography variant="h6" component="div" fontWeight="bold" noWrap>
                          {course.title}
                        </Typography>
                        {course.rating && <Rating value={course.rating} readOnly precision={0.5} size="small" />}
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        {course.category && (
                          <Chip
                            label={course.category}
                            size="small"
                            sx={{ backgroundColor: theme.palette.secondary.light, color: theme.palette.secondary.dark }}
                          />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Lessons: {course.lessons?.length || 0}
                        </Typography>
                      </Box>

                      <Typography variant="body1" color="primary" fontWeight="bold" sx={{ mt: 2 }}>
                        Rs. {course.price}
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ gap: 1, flexDirection: "column" }}>
                      <Button component={Link} to={`/course/${course.course_id}`} variant="outlined" fullWidth>
                        View Course
                      </Button>
                      <Button
                        variant="contained"
                        disabled={!token}
                        onClick={() => handleAddToCart(course.course_id)}
                        fullWidth
                      >
                        {token ? "Add to Cart" : "Login to Add"}
                      </Button>
                    </CardActions>
                  </CourseCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Shop;
