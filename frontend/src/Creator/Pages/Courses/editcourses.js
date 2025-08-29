// src/pages/EditCourse.js
import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardMedia,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../api";

const categories = [
  "Cooking & Food Skills",
  "Music & Instruments",
  "Handicrafts & Creative Skills",
  "Languages & Communication",
  "Technology & Digital Skills",
  "Repair & Technical Skills",
  "Health & Fitness",
  "Entrepreneurship & Business",
];

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: "",
    language: "",
    category: "",
    thumbnail_url: "",
    teaser_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [teaserFile, setTeaserFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [teaserPreview, setTeaserPreview] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse(res.data);
      setThumbnailPreview(res.data.thumbnail_url || "");
      setTeaserPreview(res.data.teaser_url || "");
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

  const handleChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length === 0) return;
    const file = files[0];

    if (name === "thumbnail") {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    } else if (name === "teaser") {
      setTeaserFile(file);
      setTeaserPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update course details
      await api.put(
        `/courses/${id}`,
        {
          title: course.title,
          description: course.description,
          price: course.price,
          language: course.language,
          category: course.category,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Upload new thumbnail if selected
      if (thumbnailFile) {
        const fd = new FormData();
        fd.append("thumbnail", thumbnailFile);
        await api.post(`/courses/upload-thumbnail/${id}`, fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Upload new teaser if selected
      if (teaserFile) {
        const fd = new FormData();
        fd.append("teaser", teaserFile);
        await api.post(`/courses/upload-teaser/${id}`, fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setSnackbar({
        open: true,
        message: "Course updated successfully",
        severity: "success",
      });

      navigate("/creator-dashboard/my-courses");
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to update course",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Course
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          component="form"
          sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}
          onSubmit={handleSubmit}
        >
          {/* Title, Description, Price, Language */}
          <TextField
            label="Title"
            name="title"
            value={course.title}
            onChange={handleChange}
            required
          />
          <TextField
            label="Description"
            name="description"
            value={course.description}
            onChange={handleChange}
            multiline
            rows={4}
            required
          />
          <TextField
            label="Price"
            name="price"
            type="number"
            value={course.price}
            onChange={handleChange}
            required
          />
          <TextField
            label="Language"
            name="language"
            value={course.language}
            onChange={handleChange}
            select
            required
          >
            {["English", "Sinhala", "Tamil"].map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang}
              </MenuItem>
            ))}
          </TextField>

          {/* Category */}
          <TextField
            label="Category"
            name="category"
            value={course.category}
            onChange={handleChange}
            select
            required
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          {/* Thumbnail */}
          <Box>
            <Typography sx={{ mb: 1 }}>Thumbnail</Typography>
            {thumbnailPreview && (
              <Card sx={{ mb: 1, width: 200, height: 120, overflow: "hidden" }}>
                <CardMedia
                  component="img"
                  src={thumbnailPreview}
                  alt="Thumbnail"
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Card>
            )}
            <Button variant="contained" component="label">
              Change Thumbnail
              <input
                type="file"
                hidden
                name="thumbnail"
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
          </Box>

          {/* Teaser Video */}
          <Box>
            <Typography sx={{ mb: 1 }}>Teaser Video</Typography>
            {teaserPreview && (
              <Card sx={{ mb: 1, width: "100%", height: 250 }}>
                <Box
                  component="video"
                  src={teaserPreview}
                  controls
                  sx={{ width: "100%", height: "100%", borderRadius: 1 }}
                />
              </Card>
            )}
            <Button variant="contained" component="label">
              Change Teaser
              <input
                type="file"
                hidden
                name="teaser"
                accept="video/*"
                onChange={handleFileChange}
              />
            </Button>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Course"}
          </Button>
        </Box>
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

export default EditCourse;
