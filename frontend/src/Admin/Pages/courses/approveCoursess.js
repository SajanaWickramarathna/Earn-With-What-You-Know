// src/pages/AdminPendingCourses.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as PreviewIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { api } from "../../../api";

const AdminPendingCourses = () => {
  const token = localStorage.getItem("token");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [rejectDialog, setRejectDialog] = useState({
    open: false,
    courseId: null,
    reason: "",
  });
  const [previewDialog, setPreviewDialog] = useState({
    open: false,
    url: "",
    type: "",
  });

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      const res = await api.get("/courses/admin/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to load courses",
        severity: "error",
      });
      setLoading(false);
    }
  };

  const handleApprove = async (course_id) => {
    setActionLoading((prev) => ({ ...prev, [course_id]: true }));
    try {
      await api.patch(
        `/courses/${course_id}/status`,
        { status: "approved" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSnackbar({
        open: true,
        message: "Course approved successfully",
        severity: "success",
      });
      fetchPendingCourses();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to approve course",
        severity: "error",
      });
    }
    setActionLoading((prev) => ({ ...prev, [course_id]: false }));
  };

  const handleReject = async () => {
    const { courseId, reason } = rejectDialog;
    if (!reason) {
      setSnackbar({
        open: true,
        message: "Please provide a rejection reason",
        severity: "warning",
      });
      return;
    }

    setActionLoading((prev) => ({ ...prev, [courseId]: true }));
    try {
      await api.patch(
        `/courses/${courseId}/status`,
        { status: "rejected", rejection_reason: reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSnackbar({ open: true, message: "Course rejected", severity: "info" });
      fetchPendingCourses();
      setRejectDialog({ open: false, courseId: null, reason: "" });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to reject course",
        severity: "error",
      });
    }
    setActionLoading((prev) => ({ ...prev, [courseId]: false }));
  };

  const handlePreviewOpen = (url, type) => {
    setPreviewDialog({ open: true, url, type });
  };

  const handlePreviewClose = () => {
    setPreviewDialog({ open: false, url: "", type: "" });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          textAlign: "center",
          fontWeight: "bold",
          color: "primary.main",
        }}
      >
        Pending Courses Approval
      </Typography>

      {courses.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 10 }}>
          <Typography variant="h6" color="text.secondary">
            No pending courses available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            All courses have been reviewed and processed
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} md={6} lg={4} key={course.course_id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
                display: "flex",
                flexDirection: "column",
                height: "100%",
                background: "linear-gradient(to bottom, #ffffff, #f8f9fa)",
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", mb: 2, color: "primary.dark" }}
                >
                  {course.title}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 2,
                    flexDirection: isMobile ? "column" : "row",
                  }}
                >
                  {course.thumbnail_url && (
                    <Box sx={{ flex: 1, position: "relative" }}>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mb: 1, fontWeight: "medium" }}
                      >
                        Thumbnail
                      </Typography>
                      <Box
                        sx={{
                          width: "100%",
                          height: 300,
                          overflow: "hidden",
                          borderRadius: 2,
                          cursor: "pointer",
                          boxShadow: 2,
                        }}
                        onClick={() =>
                          handlePreviewOpen(course.thumbnail_url, "image")
                        }
                      >
                        <CardMedia
                          component="img"
                          image={course.thumbnail_url}
                          alt={course.title}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.3s",
                            "&:hover": { transform: "scale(1.05)" },
                          }}
                        />
                        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                          <IconButton
                            size="small"
                            sx={{
                              backgroundColor: "rgba(255,255,255,0.8)",
                              "&:hover": {
                                backgroundColor: "rgba(255,255,255,1)",
                              },
                            }}
                          >
                            <PreviewIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {course.teaser_url && (
                    <Box sx={{ flex: 1, position: "relative" }}>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mb: 1, fontWeight: "medium" }}
                      >
                        Teaser Video
                      </Typography>
                      <Box
                        sx={{
                          width: "100%",
                          height: 300,
                          overflow: "hidden",
                          borderRadius: 2,
                          cursor: "pointer",
                          boxShadow: 2,
                        }}
                        onClick={() =>
                          handlePreviewOpen(course.teaser_url, "video")
                        }
                      >
                        <video
                          width="100%"
                          height="100%"
                          style={{ objectFit: "cover" }}
                        >
                          <source src={course.teaser_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                          <IconButton
                            size="small"
                            sx={{
                              backgroundColor: "rgba(255,255,255,0.8)",
                              "&:hover": {
                                backgroundColor: "rgba(255,255,255,1)",
                              },
                            }}
                          >
                            <PreviewIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {course.description.length > 120
                    ? course.description.slice(0, 120) + "..."
                    : course.description}
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  <Chip
                    label={`$${course.price}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={course.language}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                  <Chip
                    label={`Category: ${course.category}`} // <-- Added category chip
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`Creator: ${course.creator_id}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </CardContent>

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  p: 2,
                  justifyContent: "flex-end",
                  borderTop: 1,
                  borderColor: "divider",
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  startIcon={
                    actionLoading[course.course_id] ? (
                      <CircularProgress size={16} />
                    ) : (
                      <ApproveIcon />
                    )
                  }
                  onClick={() => handleApprove(course.course_id)}
                  disabled={actionLoading[course.course_id]}
                  sx={{ borderRadius: 2 }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={() =>
                    setRejectDialog({
                      open: true,
                      courseId: course.course_id,
                      reason: "",
                    })
                  }
                  disabled={actionLoading[course.course_id]}
                  sx={{ borderRadius: 2 }}
                >
                  Reject
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog.open}
        onClose={() =>
          setRejectDialog({ open: false, courseId: null, reason: "" })
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "error.light", color: "white" }}>
          Reject Course
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this course. This feedback
            will be sent to the course creator.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={rejectDialog.reason}
            onChange={(e) =>
              setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setRejectDialog({ open: false, courseId: null, reason: "" })
            }
          >
            Cancel
          </Button>
          <Button color="error" onClick={handleReject} variant="contained">
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={handlePreviewClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {previewDialog.type === "image"
            ? "Thumbnail Preview"
            : "Teaser Video Preview"}
          <IconButton onClick={handlePreviewClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          {previewDialog.type === "image" ? (
            <img
              src={previewDialog.url}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <video
              controls
              autoPlay
              style={{ width: "100%", maxHeight: "400px" }}
            >
              <source src={previewDialog.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPendingCourses;
